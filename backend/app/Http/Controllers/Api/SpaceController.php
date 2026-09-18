<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\ClientFavorite;
use App\Models\Message;
use App\Models\Order;
use App\Models\OrderTrip;
use App\Models\Payment;
use App\Models\ProviderProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SpaceController extends Controller
{
    public function clientDashboard(Request $request): JsonResponse
    {
        $uid = $request->user()->id;

        return response()->json([
            'stats' => [
                ['label' => 'Commandes', 'value' => Order::where('client_id', $uid)->count()],
                ['label' => 'Messages', 'value' => Message::where('user_id', $uid)->where('from_staff', true)->count()],
                ['label' => 'Notifications', 'value' => AppNotification::where('user_id', $uid)->whereNull('read_at')->count()],
            ],
            'message' => 'Bienvenue dans votre espace client SaaCare.',
            'user' => $request->user()->toPublicArray(),
        ]);
    }

    public function prestataireDashboard(Request $request): JsonResponse
    {
        $user = $request->user()->load('providerProfile');
        $status = $user->providerProfile?->status ?? 'pending';
        $profileId = $user->providerProfile?->id;

        $missions = $profileId
            ? Order::where('provider_profile_id', $profileId)->whereNotIn('status', ['annulee', 'terminee'])->count()
            : 0;

        // Trajet laissé en cours : la PWA a pu être fermée en route (§11).
        $activeTrip = $profileId
            ? OrderTrip::where('provider_profile_id', $profileId)
                ->where('status', OrderTrip::STATUS_EN_ROUTE)
                ->latest('id')
                ->first()
            : null;

        return response()->json([
            'stats' => [
                ['label' => 'Missions', 'value' => $missions],
                ['label' => 'Gains du mois', 'value' => '—'],
                ['label' => 'Avis', 'value' => (int) ($user->providerProfile?->reviews ?? 0)],
            ],
            'activeTripOrderId' => $activeTrip?->order_id,
            'providerStatus' => $status,
            'message' => match ($status) {
                'approved' => 'Votre dossier est validé. Les missions arriveront ici.',
                'pending' => 'Votre dossier est en cours de validation par SaaCare.',
                'rejected' => 'Votre dossier a été refusé. Contactez le support pour plus d’informations.',
                'suspended' => 'Votre compte prestataire est désactivé.',
                'banned' => 'Votre compte prestataire a été banni.',
                default => 'Statut inconnu.',
            },
            'user' => $user->toPublicArray(),
        ]);
    }

    public function prestataireProfil(Request $request): JsonResponse
    {
        $user = $request->user()->load('providerProfile');

        return response()->json([
            'user' => $user->toPublicArray(),
            'profile' => $user->providerProfile,
        ]);
    }

    public function updatePrestataireProfil(Request $request): JsonResponse
    {
        $data = $request->validate([
            'domain' => ['nullable', 'string', 'max:120'],
            'metier' => ['nullable', 'string', 'max:120'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'zones' => ['nullable', 'array'],
            'zones.*' => ['string', 'max:120'],
        ]);

        $user = $request->user();
        $profile = $user->providerProfile ?? ProviderProfile::create([
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        $profile->update([
            'domain' => $data['domain'] ?? $profile->domain,
            'metier' => $data['metier'] ?? $profile->metier,
            'bio' => $data['bio'] ?? $profile->bio,
            'zones' => $data['zones'] ?? $profile->zones,
        ]);

        $user->load('providerProfile');

        return response()->json([
            'user' => $user->toPublicArray(),
            'profile' => $profile->fresh(),
        ]);
    }

    public function adminDashboard(Request $request): JsonResponse
    {
        return response()->json([
            'stats' => [
                ['label' => 'Clients', 'value' => User::where('role', 'client')->count()],
                ['label' => 'Prestataires', 'value' => User::where('role', 'prestataire')->count()],
                ['label' => 'En attente', 'value' => ProviderProfile::where('status', 'pending')->count()],
                ['label' => 'Approuvés', 'value' => ProviderProfile::where('status', 'approved')->count()],
            ],
            'message' => 'Back-office SaaCare — supervision de la plateforme.',
            'user' => $request->user()->toPublicArray(),
        ]);
    }

    public function adminPrestataires(Request $request): JsonResponse
    {
        $items = ProviderProfile::with('user')
            ->latest()
            ->get()
            ->map(fn (ProviderProfile $p) => $this->serializeProvider($p));

        return response()->json(['items' => $items]);
    }

    public function adminPrestatairesPending(): JsonResponse
    {
        $items = ProviderProfile::with('user')
            ->where('status', 'pending')
            ->latest()
            ->get()
            ->map(fn (ProviderProfile $p) => $this->serializeProvider($p));

        return response()->json(['items' => $items]);
    }

    public function adminPrestataire(int $id): JsonResponse
    {
        $profile = ProviderProfile::with('user')->findOrFail($id);

        return response()->json(['item' => $this->serializeProvider($profile, true)]);
    }

    public function updateProviderStatus(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected', 'suspended', 'pending', 'banned'])],
        ]);

        $profile = ProviderProfile::with('user')->findOrFail($id);
        $profile->status = $data['status'];
        $profile->save();

        return response()->json(['item' => $this->serializeProvider($profile, true)]);
    }

    private function serializeProvider(ProviderProfile $p, bool $detailed = false): array
    {
        $item = [
            'id' => $p->id,
            'status' => $p->status,
            'domain' => $p->domain,
            'metier' => $p->metier,
            'bio' => $p->bio,
            'zones' => $p->zones ?? [],
            'reference' => $p->reference,
            'user' => [
                'id' => $p->user?->id,
                'fullName' => $p->user?->full_name,
                'email' => $p->user?->email,
                'phone' => $p->user?->phone,
                'commune' => $p->user?->commune,
                'address' => $p->user?->address,
                'createdAt' => $p->user?->created_at?->toIso8601String(),
            ],
            'updatedAt' => $p->updated_at?->toIso8601String(),
            'createdAt' => $p->created_at?->toIso8601String(),
        ];

        if ($detailed) {
            $item['seal'] = $p->seal;
            $item['level'] = $p->level;
            $item['rating'] = (float) $p->rating;
            $item['reviews'] = (int) $p->reviews;
            $item['experience'] = (int) $p->experience;
            $item['languages'] = $p->languages ?? [];
            $item['availability'] = $p->availability;
            $item['slots'] = $p->slots ?? [];
            $item['skills'] = $p->skills ?? [];
            $item['trainings'] = $p->trainings ?? [];
            $item['missions'] = (int) $p->missions;
            $item['hours'] = (int) $p->hours;
            $item['since'] = $p->since;
            $item['verifiedAt'] = $p->verified_at;
            $item['nextCheck'] = $p->next_check;
            $item['gender'] = $p->gender;
            $item['price'] = $p->price;
        }

        return $item;
    }

    public function adminClients(): JsonResponse
    {
        $items = User::where('role', 'client')
            ->withCount('ordersAsClient')
            ->latest()
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'fullName' => $u->full_name,
                'email' => $u->email,
                'phone' => $u->phone ?? '',
                'commune' => $u->commune ?? '',
                'address' => $u->address ?? '',
                'ordersCount' => (int) ($u->orders_as_client_count ?? 0),
                'createdAt' => $u->created_at?->toIso8601String(),
            ]);

        return response()->json(['items' => $items]);
    }

    public function adminClient(int $id): JsonResponse
    {
        $user = User::where('role', 'client')->findOrFail($id);
        $orders = Order::with('providerProfile.user')
            ->where('client_id', $user->id)
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (Order $o) => $this->serializeAdminOrder($o));

        return response()->json([
            'item' => [
                'id' => $user->id,
                'fullName' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'commune' => $user->commune ?? '',
                'address' => $user->address ?? '',
                'createdAt' => $user->created_at?->toIso8601String(),
            ],
            'orders' => $orders,
        ]);
    }

    public function adminOrders(): JsonResponse
    {
        $items = Order::with(['client', 'providerProfile.user'])
            ->latest()
            ->get()
            ->map(fn (Order $o) => $this->serializeAdminOrder($o));

        return response()->json(['items' => $items]);
    }

    public function adminOrder(int $id): JsonResponse
    {
        $order = Order::with([
            'client',
            'providerProfile.user',
            'payments',
            'activeTrip',
        ])->findOrFail($id);

        return response()->json([
            'item' => $this->serializeAdminOrder($order, true),
        ]);
    }

    /**
     * Assigne (ou confirme) un prestataire sur une commande.
     * Le client peut déjà avoir choisi un profil : l’admin valide ou change l’affectation.
     */
    public function assignAdminOrder(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'providerProfileId' => ['required', 'integer', 'exists:provider_profiles,id'],
            'status' => ['sometimes', Rule::in(['confirmee', 'programmee', 'en_cours'])],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $order = Order::with(['client', 'providerProfile.user'])->findOrFail($id);

        if (in_array($order->status, ['annulee', 'terminee'], true)) {
            return response()->json(['error' => 'Cette commande est clôturée et ne peut plus être assignée.'], 422);
        }

        $profile = ProviderProfile::with('user')
            ->where('id', $data['providerProfileId'])
            ->where('status', 'approved')
            ->first();

        if (! $profile) {
            return response()->json(['error' => 'Prestataire introuvable ou non approuvé.'], 422);
        }

        $previousId = $order->provider_profile_id;
        $order->provider_profile_id = $profile->id;

        if (isset($data['status'])) {
            $order->status = $data['status'];
        } elseif (in_array($order->status, ['nouvelle', 'confirmee'], true)) {
            $order->status = $order->desired_date ? 'programmee' : 'confirmee';
        }

        $order->save();
        $order->load(['client', 'providerProfile.user']);

        $providerName = $profile->user?->full_name ?: ($profile->metier ?: 'prestataire');

        if ($order->client_id) {
            AppNotification::create([
                'user_id' => $order->client_id,
                'title' => 'Prestataire assigné',
                'body' => "Votre commande {$order->reference} est confiée à {$providerName}.",
                'type' => 'order',
                'link' => '/client/commandes',
            ]);

            if (! empty($data['note'])) {
                Message::create([
                    'user_id' => $order->client_id,
                    'thread' => 'support',
                    'body' => "SaaCare — assignation {$order->reference} : ".$data['note'],
                    'from_staff' => true,
                ]);
            }
        }

        if ($profile->user_id && (int) $previousId !== (int) $profile->id) {
            $missionLabel = $order->metier ?: $order->domain;
            AppNotification::create([
                'user_id' => $profile->user_id,
                'title' => 'Nouvelle mission',
                'body' => "La mission {$order->reference} ({$missionLabel}) vous a été assignée.",
                'type' => 'order',
                'link' => '/prestataire/missions',
            ]);
        }

        return response()->json([
            'item' => $this->serializeAdminOrder($order->fresh(['client', 'providerProfile.user']), true),
            'message' => 'Prestataire assigné avec succès.',
        ]);
    }

    public function adminPayments(): JsonResponse
    {
        $items = Payment::with(['client', 'order'])
            ->latest()
            ->get()
            ->map(fn (Payment $p) => $this->serializeAdminPayment($p));

        return response()->json(['items' => $items]);
    }

    public function createAdminPayment(Request $request): JsonResponse
    {
        $data = $request->validate([
            'clientId' => ['nullable', 'integer', 'exists:users,id'],
            'orderId' => ['nullable', 'integer', 'exists:orders,id'],
            'amount' => ['required', 'integer', 'min:1'],
            'method' => ['required', Rule::in(['mobile_money', 'cash', 'bank', 'carte', 'virement'])],
            'status' => ['sometimes', Rule::in(['en_attente', 'paye', 'echoue', 'rembourse'])],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        if (empty($data['clientId']) && empty($data['orderId'])) {
            return response()->json(['error' => 'Sélectionnez un client ou une commande.'], 422);
        }

        $order = null;
        if (! empty($data['orderId'])) {
            $order = Order::with('client')->findOrFail($data['orderId']);
        }

        $clientId = $data['clientId'] ?? $order?->client_id;
        $client = User::where('role', 'client')->find($clientId);
        if (! $client) {
            return response()->json(['error' => 'Client introuvable.'], 422);
        }

        if ($order && (int) $order->client_id !== (int) $client->id) {
            return response()->json(['error' => 'Cette commande n’appartient pas au client sélectionné.'], 422);
        }

        $status = $data['status'] ?? 'en_attente';

        $payment = Payment::create([
            'reference' => 'PAY-'.strtoupper(Str::random(8)),
            'client_id' => $client->id,
            'order_id' => $order?->id,
            'amount' => $data['amount'],
            'method' => $data['method'],
            'status' => $status,
            'note' => $data['note'] ?? '',
        ]);

        AppNotification::create([
            'user_id' => $client->id,
            'title' => $status === 'paye' ? 'Paiement confirmé' : 'Paiement enregistré',
            'body' => $status === 'paye'
                ? "Votre paiement {$payment->reference} de {$payment->amount} CDF a été confirmé."
                : "Paiement {$payment->reference} enregistré — en attente de confirmation.",
            'type' => 'payment',
            'link' => '/client/paiements',
        ]);

        return response()->json([
            'item' => $this->serializeAdminPayment($payment->load(['client', 'order'])),
        ], 201);
    }

    public function adminReports(): JsonResponse
    {
        $clients = User::where('role', 'client')->count();
        $providers = ProviderProfile::count();
        $pending = ProviderProfile::where('status', 'pending')->count();
        $approved = ProviderProfile::where('status', 'approved')->count();
        $orders = Order::count();
        $ordersOpen = Order::whereNotIn('status', ['annulee', 'terminee'])->count();
        $payments = Payment::count();
        $revenue = (int) Payment::where('status', 'paye')->sum('amount');
        $liveTrips = OrderTrip::where('status', OrderTrip::STATUS_EN_ROUTE)->count();

        $ordersByStatus = Order::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $paymentsByStatus = Payment::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $recentOrders = Order::with(['client', 'providerProfile.user'])
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (Order $o) => $this->serializeAdminOrder($o));

        return response()->json([
            'stats' => [
                ['label' => 'Clients', 'value' => $clients],
                ['label' => 'Prestataires', 'value' => $providers],
                ['label' => 'En attente', 'value' => $pending],
                ['label' => 'Approuvés', 'value' => $approved],
                ['label' => 'Commandes', 'value' => $orders],
                ['label' => 'Commandes ouvertes', 'value' => $ordersOpen],
                ['label' => 'Paiements', 'value' => $payments],
                ['label' => 'CA encaissé (CDF)', 'value' => $revenue],
                ['label' => 'Trajets en direct', 'value' => $liveTrips],
            ],
            'ordersByStatus' => $ordersByStatus,
            'paymentsByStatus' => $paymentsByStatus,
            'recentOrders' => $recentOrders,
        ]);
    }

    private function serializeAdminPayment(Payment $p): array
    {
        return [
            'id' => $p->id,
            'reference' => $p->reference,
            'amount' => (int) $p->amount,
            'method' => $p->method,
            'status' => $p->status,
            'note' => $p->note,
            'orderId' => $p->order_id,
            'orderReference' => $p->order?->reference,
            'client' => [
                'id' => $p->client?->id,
                'fullName' => $p->client?->full_name,
                'email' => $p->client?->email,
            ],
            'createdAt' => $p->created_at?->toIso8601String(),
        ];
    }

    private function serializeAdminOrder(Order $o, bool $detailed = false): array
    {
        $item = [
            'id' => $o->id,
            'reference' => $o->reference,
            'domain' => $o->domain,
            'metier' => $o->metier,
            'commune' => $o->commune,
            'address' => $o->address ?? '',
            'latitude' => $o->latitude !== null ? (float) $o->latitude : null,
            'longitude' => $o->longitude !== null ? (float) $o->longitude : null,
            'frequency' => $o->frequency ?? '',
            'status' => $o->status,
            'amount' => (int) ($o->amount ?? 0),
            'desiredDate' => $o->desired_date?->toDateString(),
            'need' => $o->need,
            'client' => [
                'id' => $o->client?->id,
                'fullName' => $o->client?->full_name,
                'email' => $o->client?->email,
                'phone' => $o->client?->phone,
                'commune' => $o->client?->commune,
                'address' => $o->client?->address,
            ],
            'provider' => $o->providerProfile ? [
                'id' => $o->providerProfile->id,
                'metier' => $o->providerProfile->metier,
                'domain' => $o->providerProfile->domain,
                'fullName' => $o->providerProfile->user?->full_name,
                'email' => $o->providerProfile->user?->email,
                'phone' => $o->providerProfile->user?->phone,
                'reference' => $o->providerProfile->reference,
                'level' => $o->providerProfile->level,
                'rating' => (float) $o->providerProfile->rating,
            ] : null,
            'createdAt' => $o->created_at?->toIso8601String(),
            'updatedAt' => $o->updated_at?->toIso8601String(),
        ];

        if ($detailed) {
            $item['assignable'] = ! in_array($o->status, ['annulee', 'terminee'], true);
            $item['clientPreferredProviders'] = $this->clientPreferredProviders($o);
            $item['suggestedProviders'] = $this->suggestedProvidersForOrder($o);
            $item['isGeolocated'] = $o->latitude !== null && $o->longitude !== null;
            $item['trip'] = $o->activeTrip ? [
                'id' => $o->activeTrip->id,
                'status' => $o->activeTrip->status,
                'startedAt' => $o->activeTrip->started_at?->toIso8601String(),
                'arrivedAt' => $o->activeTrip->arrived_at?->toIso8601String(),
            ] : null;
            $item['payments'] = $o->relationLoaded('payments')
                ? $o->payments->sortByDesc('created_at')->values()->map(fn (Payment $p) => [
                    'id' => $p->id,
                    'reference' => $p->reference,
                    'amount' => (int) $p->amount,
                    'method' => $p->method,
                    'status' => $p->status,
                    'createdAt' => $p->created_at?->toIso8601String(),
                ])->all()
                : [];
            $item['paymentsTotal'] = (int) ($o->relationLoaded('payments')
                ? $o->payments->where('status', 'paye')->sum('amount')
                : 0);
        }

        return $item;
    }

    /** Prestataires favoris du client (références) + éventuel choix déjà sur la commande. */
    private function clientPreferredProviders(Order $order): array
    {
        if (! $order->client_id) {
            return [];
        }

        $targets = ClientFavorite::where('user_id', $order->client_id)
            ->where('type', ClientFavorite::TYPE_PROVIDER)
            ->pluck('target')
            ->filter()
            ->unique()
            ->values();

        $byRef = ProviderProfile::with('user')
            ->where('status', 'approved')
            ->whereIn('reference', $targets)
            ->get()
            ->keyBy('reference');

        $items = [];
        foreach ($targets as $ref) {
            $p = $byRef->get($ref);
            if ($p) {
                $items[] = $this->serializeAssignableProvider($p, true);
            }
        }

        if ($order->providerProfile && $order->providerProfile->status === 'approved') {
            $exists = collect($items)->contains(fn ($i) => (int) $i['id'] === (int) $order->providerProfile->id);
            if (! $exists) {
                array_unshift($items, $this->serializeAssignableProvider($order->providerProfile, true));
            }
        }

        return $items;
    }

    private function suggestedProvidersForOrder(Order $order): array
    {
        $query = ProviderProfile::with('user')
            ->where('status', 'approved')
            ->latest();

        if ($order->domain) {
            $query->where(function ($q) use ($order) {
                $q->where('domain', $order->domain)
                    ->orWhere('metier', 'like', '%'.($order->metier ?: $order->domain).'%');
            });
        }

        return $query->limit(40)
            ->get()
            ->map(fn (ProviderProfile $p) => $this->serializeAssignableProvider($p, false))
            ->values()
            ->all();
    }

    private function serializeAssignableProvider(ProviderProfile $p, bool $preferred): array
    {
        return [
            'id' => $p->id,
            'fullName' => $p->user?->full_name,
            'metier' => $p->metier,
            'domain' => $p->domain,
            'commune' => $p->user?->commune,
            'reference' => $p->reference,
            'rating' => (float) $p->rating,
            'reviews' => (int) $p->reviews,
            'level' => $p->level,
            'preferred' => $preferred,
        ];
    }
}
