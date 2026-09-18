<?php

namespace App\Http\Controllers\Api;

use App\Events\ProviderLocationUpdated;
use App\Events\TripStatusChanged;
use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\MissionNote;
use App\Models\Order;
use App\Models\OrderTrip;
use App\Models\OrderTripPoint;
use App\Models\Payment;
use App\Services\RouteEstimator;
use App\Support\TripPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * Suivi GPS d'un trajet prestataire → client.
 *
 * Règles non négociables, toutes vérifiées ici et jamais déléguées au front :
 *   - seul le prestataire AFFECTÉ à la mission publie une position ;
 *   - seul le client PROPRIÉTAIRE de la mission (ou un admin) la consulte ;
 *   - le partage n'existe que pendant un trajet actif, et s'arrête à l'arrivée.
 */
class TrackingController extends Controller
{
    public function __construct(private readonly RouteEstimator $routes) {}

    // ---------------------------------------------------------------- Prestataire

    /** Missions affectées au prestataire connecté. */
    public function missions(Request $request): JsonResponse
    {
        $profile = $this->providerProfile($request);

        $items = Order::with(['client', 'providerProfile.user'])
            ->where('provider_profile_id', $profile->id)
            ->whereNotIn('status', ['annulee'])
            ->latest()
            ->get()
            // Trajet en cours, à défaut le dernier connu : le prestataire voit ainsi
            // qu'une arrivée est déjà enregistrée plutôt qu'un bouton de départ.
            ->map(fn (Order $order) => $this->serializeMission($order, $this->activeTrip($order) ?? $this->lastTrip($order)));

        return response()->json(['items' => $items]);
    }

    /** Détail d'une mission, avec son trajet en cours s'il existe. */
    public function mission(Request $request, int $orderId): JsonResponse
    {
        $order = $this->providerOrder($request, $orderId);

        return response()->json([
            'item' => $this->serializeMission($order, $this->activeTrip($order) ?? $this->lastTrip($order)),
        ]);
    }

    /** « Je me rends chez le client » — démarre le partage de position. */
    public function startTrip(Request $request, int $orderId): JsonResponse
    {
        $order = $this->providerOrder($request, $orderId);
        $profile = $this->providerProfile($request);

        if (! $this->isTrackable($order)) {
            return response()->json([
                'error' => 'Cette mission n’autorise pas le suivi de trajet (statut : '.$order->status.').',
            ], 422);
        }

        // Un prestataire ne conduit que vers une seule mission à la fois.
        $elsewhere = OrderTrip::where('provider_profile_id', $profile->id)
            ->where('status', OrderTrip::STATUS_EN_ROUTE)
            ->where('order_id', '!=', $order->id)
            ->first();

        if ($elsewhere) {
            return response()->json([
                'error' => 'Un trajet est déjà en cours pour une autre mission. Terminez-le avant d’en démarrer un nouveau.',
                'activeOrderId' => $elsewhere->order_id,
            ], 409);
        }

        // Réouverture idempotente : le prestataire a pu fermer puis rouvrir la PWA.
        $trip = $this->activeTrip($order);

        if (! $trip) {
            $trip = OrderTrip::create([
                'order_id' => $order->id,
                'provider_profile_id' => $profile->id,
                'status' => OrderTrip::STATUS_EN_ROUTE,
                'started_at' => now(),
            ]);

            AppNotification::create([
                'user_id' => $order->client_id,
                'title' => 'Votre prestataire est en route',
                'body' => "Le prestataire de la mission {$order->reference} se dirige vers vous. Suivez son arrivée en temps réel.",
                'type' => 'order',
                'link' => "/client/commandes/{$order->id}/suivi",
            ]);

            // Dès le départ : la mission bascule en « en cours » pour le suivi client.
            if ($order->status !== 'en_cours' && $order->status !== 'terminee') {
                $order->status = 'en_cours';
                $order->save();
            }

            TripStatusChanged::dispatch($order, $trip);
        }

        return response()->json(['item' => $this->serializeMission($order->fresh(['client', 'providerProfile.user']), $trip)]);
    }

    /** Position transmise pendant le trajet. */
    public function pushLocation(Request $request, int $orderId): JsonResponse
    {
        $order = $this->providerOrder($request, $orderId);
        $trip = $this->activeTrip($order);

        if (! $trip) {
            return response()->json(['error' => 'Aucun trajet actif pour cette mission.'], 409);
        }

        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'accuracy' => ['nullable', 'numeric', 'min:0', 'max:65535'],
            'heading' => ['nullable', 'numeric', 'between:0,360'],
            'speed' => ['nullable', 'numeric', 'between:0,300'],
            'recordedAt' => ['nullable', 'date'],
        ]);

        $accuracy = $data['accuracy'] !== null ? (int) round($data['accuracy']) : null;
        $maxAccuracy = (int) config('tracking.max_accuracy', 250);

        if ($accuracy !== null && $accuracy > $maxAccuracy) {
            return response()->json([
                'ignored' => true,
                'reason' => 'accuracy',
                'message' => "Position trop imprécise ({$accuracy} m) — elle n’a pas été enregistrée.",
                'item' => TripPayload::tracking($order, $trip, false),
            ], 202);
        }

        $recordedAt = isset($data['recordedAt']) ? Carbon::parse($data['recordedAt']) : now();
        // Une horloge d'appareil déréglée ne doit pas produire de position « dans le futur ».
        if ($recordedAt->greaterThan(now()->addMinute()) || $recordedAt->lessThan(now()->subHours(6))) {
            $recordedAt = now();
        }

        $latitude = (float) $data['latitude'];
        $longitude = (float) $data['longitude'];

        $shouldRecordPoint = $this->shouldRecordPoint($trip, $latitude, $longitude, $recordedAt);

        $trip->forceFill([
            'last_latitude' => $latitude,
            'last_longitude' => $longitude,
            'last_accuracy' => $accuracy,
            'last_heading' => isset($data['heading']) ? (int) round($data['heading']) : null,
            'last_speed' => $data['speed'] ?? null,
            'last_position_at' => $recordedAt,
        ]);

        if ($shouldRecordPoint) {
            OrderTripPoint::create([
                'order_trip_id' => $trip->id,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'accuracy' => $accuracy,
                'heading' => isset($data['heading']) ? (int) round($data['heading']) : null,
                'speed' => $data['speed'] ?? null,
                'recorded_at' => $recordedAt,
            ]);

            $trip->points_count = $trip->points_count + 1;
            $this->prunePoints($trip);
        }

        $this->routes->refresh($trip, $order->latitude, $order->longitude);
        $trip->save();

        if ($shouldRecordPoint) {
            ProviderLocationUpdated::dispatch($order, $trip);
        }

        return response()->json([
            'recorded' => $shouldRecordPoint,
            'item' => TripPayload::tracking($order, $trip, false),
        ]);
    }

    /** « Je suis arrivé » — arrête le partage et fait avancer la mission. */
    public function arrive(Request $request, int $orderId): JsonResponse
    {
        $order = $this->providerOrder($request, $orderId);
        $trip = $this->activeTrip($order);

        if (! $trip) {
            return response()->json(['error' => 'Aucun trajet actif pour cette mission.'], 409);
        }

        $trip->forceFill([
            'status' => OrderTrip::STATUS_ARRIVE,
            'arrived_at' => now(),
            'ended_at' => now(),
        ])->save();

        $next = (string) config('tracking.status_on_arrival', 'en_cours');
        if ($order->status !== $next && $order->status !== 'terminee') {
            $order->status = $next;
            $order->save();
        }

        AppNotification::create([
            'user_id' => $order->client_id,
            'title' => 'Votre prestataire est arrivé',
            'body' => "Le prestataire de la mission {$order->reference} est arrivé sur place.",
            'type' => 'order',
            'link' => "/client/commandes/{$order->id}/suivi",
        ]);

        TripStatusChanged::dispatch($order, $trip);

        return response()->json(['item' => $this->serializeMission($order->fresh(['client', 'providerProfile.user']), $trip)]);
    }

    /** Trajet interrompu par le prestataire (demi-tour, mission reportée…). */
    public function cancelTrip(Request $request, int $orderId): JsonResponse
    {
        $order = $this->providerOrder($request, $orderId);
        $trip = $this->activeTrip($order);

        if (! $trip) {
            return response()->json(['error' => 'Aucun trajet actif pour cette mission.'], 409);
        }

        $this->closeTrip($trip, $order);

        return response()->json(['item' => $this->serializeMission($order, $trip->fresh())]);
    }

    // ---------------------------------------------------------------- Client

    /**
     * État du suivi pour le client propriétaire de la mission.
     * Sert aussi de transport de secours quand aucun WebSocket n'est configuré.
     */
    public function tracking(Request $request, int $orderId): JsonResponse
    {
        $order = Order::with('providerProfile.user')
            ->where('client_id', $request->user()->id)
            ->findOrFail($orderId);

        $trip = $this->activeTrip($order) ?? $this->lastTrip($order);

        return response()->json([
            'item' => TripPayload::tracking($order, $trip),
            'trackingAllowed' => $this->isTrackable($order),
        ]);
    }

    /** Adresse et coordonnées du point d'intervention, définies par le client. */
    public function updateAddress(Request $request, int $orderId): JsonResponse
    {
        $order = Order::with('providerProfile.user')
            ->where('client_id', $request->user()->id)
            ->findOrFail($orderId);

        $data = $request->validate([
            'address' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $order->address = $data['address'] ?? $order->address;
        $order->latitude = array_key_exists('latitude', $data) ? $data['latitude'] : $order->latitude;
        $order->longitude = array_key_exists('longitude', $data) ? $data['longitude'] : $order->longitude;
        $order->save();

        return response()->json(['item' => TripPayload::tracking($order, $this->activeTrip($order))]);
    }

    // ---------------------------------------------------------------- Admin

    /** Missions dont le trajet est en cours — jamais une surveillance permanente. */
    public function activeMissions(): JsonResponse
    {
        $trips = OrderTrip::with(['order.client', 'providerProfile.user'])
            ->where('status', OrderTrip::STATUS_EN_ROUTE)
            ->latest('started_at')
            ->get()
            ->filter(fn (OrderTrip $t) => $t->order !== null)
            ->map(fn (OrderTrip $t) => [
                'orderId' => $t->order->id,
                'reference' => $t->order->reference,
                'orderStatus' => $t->order->status,
                'domain' => $t->order->domain,
                'metier' => $t->order->metier ?: $t->providerProfile?->metier,
                'commune' => $t->order->commune,
                'client' => [
                    'id' => $t->order->client?->id,
                    'fullName' => $t->order->client?->full_name,
                    'phone' => $t->order->client?->phone,
                ],
                'provider' => [
                    'id' => $t->provider_profile_id,
                    'fullName' => $t->providerProfile?->user?->full_name,
                    'phone' => $t->providerProfile?->user?->phone,
                ],
                'trip' => TripPayload::trip($t),
                'destination' => TripPayload::destination($t->order),
            ])
            ->values();

        return response()->json(['items' => $trips, 'serverTime' => now()->toIso8601String()]);
    }

    /** Fiche détail d’une mission pour le back-office (carte, avis, notes). */
    public function adminMission(int $orderId): JsonResponse
    {
        $order = Order::with([
            'client',
            'providerProfile.user',
            'payments',
        ])->findOrFail($orderId);

        $trip = $this->activeTrip($order) ?? $this->lastTrip($order);
        $tracking = TripPayload::tracking($order, $trip, true);

        $profile = $order->providerProfile;
        $reviews = collect($profile?->reviews_list ?? [])->values()->all();

        $notes = MissionNote::with('author')
            ->where('order_id', $order->id)
            ->latest()
            ->get()
            ->map(fn (MissionNote $n) => $n->toAdminArray());

        $payments = $order->payments
            ->sortByDesc('created_at')
            ->values()
            ->map(fn (Payment $p) => [
                'id' => $p->id,
                'reference' => $p->reference,
                'amount' => (int) $p->amount,
                'method' => $p->method,
                'status' => $p->status,
                'createdAt' => $p->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'item' => array_merge($tracking, [
                'client' => [
                    'id' => $order->client?->id,
                    'fullName' => $order->client?->full_name,
                    'email' => $order->client?->email,
                    'phone' => $order->client?->phone,
                    'commune' => $order->client?->commune,
                    'address' => $order->client?->address,
                ],
                'provider' => $profile ? [
                    'id' => $profile->id,
                    'fullName' => $profile->user?->full_name,
                    'email' => $profile->user?->email,
                    'phone' => $profile->user?->phone,
                    'metier' => $profile->metier,
                    'domain' => $profile->domain,
                    'rating' => (float) $profile->rating,
                    'reviewsCount' => (int) $profile->reviews,
                    'level' => $profile->level,
                    'reference' => $profile->reference,
                ] : ($tracking['provider'] ?? null),
                'need' => $order->need,
                'frequency' => $order->frequency,
                'desiredDate' => $order->desired_date?->toDateString(),
                'amount' => (int) ($order->amount ?? 0),
                'createdAt' => $order->created_at?->toIso8601String(),
                'reviews' => $reviews,
                'notes' => $notes,
                'payments' => $payments,
                'trackingAllowed' => $this->isTrackable($order),
            ]),
        ]);
    }

    public function storeMissionNote(Request $request, int $orderId): JsonResponse
    {
        Order::findOrFail($orderId);

        $data = $request->validate([
            'type' => ['required', Rule::in(['observation', 'signalement'])],
            'severity' => ['sometimes', Rule::in(['info', 'warning', 'critical'])],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $note = MissionNote::create([
            'order_id' => $orderId,
            'created_by' => $request->user()->id,
            'type' => $data['type'],
            'severity' => $data['severity'] ?? ($data['type'] === 'signalement' ? 'warning' : 'info'),
            'body' => $data['body'],
        ]);
        $note->load('author');

        return response()->json(['item' => $note->toAdminArray()], 201);
    }

    // ---------------------------------------------------------------- Interne

    private function providerProfile(Request $request)
    {
        $profile = $request->user()->providerProfile;

        abort_if(! $profile, 403, 'Aucun profil prestataire rattaché à ce compte.');
        abort_if($profile->status !== 'approved', 403, 'Votre profil prestataire n’est pas encore validé.');

        return $profile;
    }

    /** Résout une mission en garantissant qu'elle appartient bien au prestataire connecté. */
    private function providerOrder(Request $request, int $orderId): Order
    {
        $profile = $this->providerProfile($request);

        return Order::with(['client', 'providerProfile.user'])
            ->where('provider_profile_id', $profile->id)
            ->findOrFail($orderId);
    }

    private function activeTrip(Order $order): ?OrderTrip
    {
        return OrderTrip::where('order_id', $order->id)
            ->where('status', OrderTrip::STATUS_EN_ROUTE)
            ->latest('id')
            ->first();
    }

    private function lastTrip(Order $order): ?OrderTrip
    {
        return OrderTrip::where('order_id', $order->id)->latest('id')->first();
    }

    private function isTrackable(Order $order): bool
    {
        return $order->provider_profile_id !== null
            && in_array($order->status, (array) config('tracking.trackable_order_statuses', []), true);
    }

    /**
     * Toutes les micro-variations GPS ne méritent pas une ligne en base :
     * un point est conservé si le prestataire a bougé, ou après un délai.
     */
    private function shouldRecordPoint(OrderTrip $trip, float $lat, float $lng, \DateTimeInterface $recordedAt): bool
    {
        if (! $trip->hasPosition() || ! $trip->last_position_at) {
            return true;
        }

        $elapsed = $trip->last_position_at->diffInSeconds($recordedAt, absolute: true);
        if ($elapsed >= (int) config('tracking.min_interval', 8)) {
            return true;
        }

        $moved = RouteEstimator::distanceMeters(
            (float) $trip->last_latitude,
            (float) $trip->last_longitude,
            $lat,
            $lng,
        );

        return $moved >= (int) config('tracking.min_distance', 25);
    }

    /** Conservation minimale : seuls les derniers points du trajet restent. */
    private function prunePoints(OrderTrip $trip): void
    {
        $max = (int) config('tracking.max_points', 120);
        if ($trip->points_count <= $max) {
            return;
        }

        $obsolete = OrderTripPoint::where('order_trip_id', $trip->id)
            ->orderByDesc('recorded_at')
            ->orderByDesc('id')
            ->skip($max)
            ->take(50)
            ->pluck('id');

        if ($obsolete->isNotEmpty()) {
            OrderTripPoint::whereIn('id', $obsolete)->delete();
            $trip->points_count = max(0, $trip->points_count - $obsolete->count());
        }
    }

    public function closeTrip(OrderTrip $trip, Order $order): void
    {
        $trip->forceFill([
            'status' => OrderTrip::STATUS_ANNULE,
            'ended_at' => now(),
        ])->save();

        TripStatusChanged::dispatch($order, $trip);
    }

    private function serializeMission(Order $order, ?OrderTrip $trip): array
    {
        return array_merge(
            TripPayload::tracking($order, $trip, $trip !== null),
            [
                'client' => [
                    'fullName' => $order->client?->full_name,
                    'phone' => $order->client?->phone,
                    'commune' => $order->client?->commune,
                ],
                'need' => $order->need,
                'desiredDate' => $order->desired_date?->toDateString(),
                'frequency' => $order->frequency,
                'trackingAllowed' => $this->isTrackable($order),
            ],
        );
    }
}
