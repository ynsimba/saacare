<?php

namespace App\Http\Controllers\Api;

use App\Events\TripStatusChanged;
use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\ClientFavorite;
use App\Models\Message;
use App\Models\Order;
use App\Models\OrderTrip;
use App\Models\Payment;
use App\Models\PlatformSetting;
use App\Models\ProviderProfile;
use App\Models\ProviderReview;
use App\Support\PublicProvider;
use App\Support\TripPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ClientModuleController extends Controller
{
    public function servicesCatalog(): JsonResponse
    {
        return response()->json([
            'items' => [
                ['slug' => 'kids-care', 'name' => 'Saa Kids Care', 'tagline' => 'Nounous et gardes d’enfants vérifiées'],
                ['slug' => 'wale', 'name' => 'Saa Walé', 'tagline' => 'Accompagnement post-partum'],
                ['slug' => 'home', 'name' => 'Saa Home', 'tagline' => 'Aide à domicile et corps de métier'],
                ['slug' => 'driver', 'name' => 'Saa Driver', 'tagline' => 'Chauffeurs vérifiés'],
                ['slug' => 'tutora', 'name' => 'Saa Tutora', 'tagline' => 'Répétiteurs'],
                ['slug' => 'assist', 'name' => 'Saa Assist', 'tagline' => 'Accompagnement personnes âgées'],
                ['slug' => 'academy', 'name' => 'Saa Academy', 'tagline' => 'Formation et certification'],
            ],
        ]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'domain' => ['required', 'string', 'max:120'],
            'metier' => ['nullable', 'string', 'max:120'],
            'commune' => ['required', 'string', 'max:120'],
            'frequency' => ['nullable', 'string', 'max:80'],
            'desiredDate' => ['nullable', 'date'],
            'need' => ['required', 'string', 'max:2000'],
            'address' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'providerProfileId' => ['nullable', 'integer', 'exists:provider_profiles,id'],
        ]);

        $client = $request->user();

        if (! empty($data['providerProfileId'])) {
            $profile = ProviderProfile::where('id', $data['providerProfileId'])
                ->where('status', 'approved')
                ->firstOrFail();
        }

        $order = Order::create([
            'reference' => 'CMD-'.strtoupper(Str::random(8)),
            'client_id' => $client->id,
            'provider_profile_id' => $data['providerProfileId'] ?? null,
            'domain' => $data['domain'],
            'metier' => $data['metier'] ?? '',
            'commune' => $data['commune'],
            'address' => $data['address'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'frequency' => $data['frequency'] ?? '',
            'desired_date' => $data['desiredDate'] ?? null,
            'need' => $data['need'],
            'status' => 'nouvelle',
            'amount' => 0,
        ]);

        AppNotification::create([
            'user_id' => $client->id,
            'title' => 'Commande créée',
            'body' => "Votre demande {$order->reference} a été enregistrée. Un chargé de clientèle vous recontacte.",
            'type' => 'order',
            'link' => '/client/commandes',
        ]);

        Message::create([
            'user_id' => $client->id,
            'thread' => 'support',
            'body' => "Nouvelle demande {$order->reference} ({$order->domain}) — {$order->need}",
            'from_staff' => false,
        ]);

        Message::create([
            'user_id' => $client->id,
            'thread' => 'support',
            'body' => 'Merci. L’équipe SaaCare a bien reçu votre demande et revient vers vous sous 24 h ouvrées.',
            'from_staff' => true,
        ]);

        return response()->json(['item' => $this->serializeOrder($order->load('providerProfile.user'))], 201);
    }

    public function orders(Request $request): JsonResponse
    {
        $items = Order::with(['providerProfile.user', 'activeTrip', 'review'])
            ->where('client_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (Order $o) => $this->serializeOrder($o));

        return response()->json(['items' => $items]);
    }

    public function cancelOrder(Request $request, int $id): JsonResponse
    {
        $order = Order::where('client_id', $request->user()->id)->findOrFail($id);
        if (! in_array($order->status, ['nouvelle', 'confirmee', 'programmee'], true)) {
            return response()->json(['error' => 'Cette commande ne peut plus être annulée.'], 400);
        }
        $order->status = 'annulee';
        $order->save();

        // Mission annulée pendant le trajet : le partage de position s'arrête aussitôt.
        $trip = OrderTrip::where('order_id', $order->id)
            ->where('status', OrderTrip::STATUS_EN_ROUTE)
            ->latest('id')
            ->first();

        if ($trip) {
            $trip->forceFill([
                'status' => OrderTrip::STATUS_ANNULE,
                'ended_at' => now(),
            ])->save();

            TripStatusChanged::dispatch($order, $trip);
        }

        return response()->json(['item' => $this->serializeOrder($order->load('providerProfile.user'))]);
    }

    public function providers(Request $request): JsonResponse
    {
        $commune = $request->query('commune');
        $domain = $request->query('domain');

        $query = ProviderProfile::with('user')
            ->where('status', 'approved');

        if ($domain) {
            $query->where('domain', $domain);
        }
        if ($commune) {
            $query->where(function ($q) use ($commune) {
                $q->whereJsonContains('zones', $commune)
                    ->orWhereHas('user', fn ($u) => $u->where('commune', $commune));
            });
        }

        $items = $query->latest()->get()->map(
            fn (ProviderProfile $p) => PublicProvider::serialize($p, true)
        );

        return response()->json(['items' => $items]);
    }

    public function payments(Request $request): JsonResponse
    {
        $items = Payment::with('order')
            ->where('client_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (Payment $p) => $this->serializePayment($p));

        return response()->json(['items' => $items]);
    }

    public function createPayment(Request $request): JsonResponse
    {
        $data = $request->validate([
            'orderId' => ['required', 'integer', 'exists:orders,id'],
            'amount' => ['required', 'integer', 'min:1'],
            'method' => ['required', Rule::in(['mobile_money', 'cash', 'bank'])],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $order = Order::where('client_id', $request->user()->id)->findOrFail($data['orderId']);

        $payment = Payment::create([
            'reference' => 'PAY-'.strtoupper(Str::random(8)),
            'client_id' => $request->user()->id,
            'order_id' => $order->id,
            'amount' => $data['amount'],
            'method' => $data['method'],
            'status' => 'en_attente',
            'note' => $data['note'] ?? '',
        ]);

        AppNotification::create([
            'user_id' => $request->user()->id,
            'title' => 'Paiement enregistré',
            'body' => "Paiement {$payment->reference} en attente de confirmation SaaCare.",
            'type' => 'payment',
            'link' => '/client/paiements',
        ]);

        return response()->json([
            'item' => $this->serializePayment($payment->load('order')),
            'paymentInstructions' => PlatformSetting::paymentInstructions(),
        ], 201);
    }

    public function storeReview(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'body' => ['nullable', 'string', 'max:2000'],
        ]);

        $order = Order::with('providerProfile')
            ->where('client_id', $request->user()->id)
            ->findOrFail($id);

        if ($order->status !== 'terminee') {
            return response()->json(['error' => 'Vous ne pouvez noter qu’une mission terminée.'], 400);
        }

        if (! $order->provider_profile_id) {
            return response()->json(['error' => 'Aucun prestataire associé à cette commande.'], 400);
        }

        if (ProviderReview::query()->where('order_id', $order->id)->exists()) {
            return response()->json(['error' => 'Un avis a déjà été laissé pour cette commande.'], 400);
        }

        $review = ProviderReview::create([
            'provider_profile_id' => $order->provider_profile_id,
            'order_id' => $order->id,
            'client_id' => $request->user()->id,
            'rating' => $data['rating'],
            'body' => isset($data['body']) ? trim($data['body']) : null,
            'author_name' => $request->user()->full_name ?: '',
            'status' => 'published',
        ]);

        $profile = $order->providerProfile;
        if ($profile) {
            $stats = ProviderReview::query()
                ->where('provider_profile_id', $profile->id)
                ->where('status', 'published');
            $profile->reviews = (clone $stats)->count();
            $profile->rating = round((float) (clone $stats)->avg('rating'), 1);
            $profile->save();
        }

        return response()->json([
            'item' => [
                'id' => $review->id,
                'rating' => $review->rating,
                'body' => $review->body ?? '',
                'orderId' => $review->order_id,
                'createdAt' => $review->created_at?->toIso8601String(),
            ],
            'order' => $this->serializeOrder($order->fresh(['providerProfile.user', 'activeTrip', 'review'])),
        ], 201);
    }

    public function messages(Request $request): JsonResponse
    {
        $thread = $request->query('thread', 'support');
        $items = Message::where('user_id', $request->user()->id)
            ->where('thread', $thread)
            ->orderBy('created_at')
            ->get()
            ->map(fn (Message $m) => $this->serializeMessage($m));

        return response()->json(['thread' => $thread, 'items' => $items]);
    }

    public function sendMessage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
            'thread' => ['nullable', 'string', 'max:64'],
        ]);

        $thread = $data['thread'] ?? 'support';

        $message = Message::create([
            'user_id' => $request->user()->id,
            'thread' => $thread,
            'body' => $data['body'],
            'from_staff' => false,
        ]);

        // Auto-accusé de réception support
        if ($thread === 'support') {
            Message::create([
                'user_id' => $request->user()->id,
                'thread' => 'support',
                'body' => 'Message reçu. Un conseiller SaaCare vous répondra dès que possible.',
                'from_staff' => true,
            ]);
        }

        $items = Message::where('user_id', $request->user()->id)
            ->where('thread', $thread)
            ->orderBy('created_at')
            ->get()
            ->map(fn (Message $m) => $this->serializeMessage($m));

        return response()->json(['thread' => $thread, 'items' => $items, 'item' => $this->serializeMessage($message)], 201);
    }

    public function notifications(Request $request): JsonResponse
    {
        $items = AppNotification::where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (AppNotification $n) => $this->serializeNotification($n));

        return response()->json([
            'items' => $items,
            'unread' => AppNotification::where('user_id', $request->user()->id)->whereNull('read_at')->count(),
        ]);
    }

    public function markNotificationRead(Request $request, int $id): JsonResponse
    {
        $n = AppNotification::where('user_id', $request->user()->id)->findOrFail($id);
        $n->read_at = now();
        $n->save();

        return response()->json(['item' => $this->serializeNotification($n)]);
    }

    public function markAllNotificationsRead(Request $request): JsonResponse
    {
        AppNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }

    public function favorites(Request $request): JsonResponse
    {
        $rows = ClientFavorite::where('user_id', $request->user()->id)->get();

        return response()->json([
            'providers' => $rows->where('type', ClientFavorite::TYPE_PROVIDER)->pluck('target')->values(),
            'services' => $rows->where('type', ClientFavorite::TYPE_SERVICE)->pluck('target')->values(),
        ]);
    }

    public function toggleFavorite(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in([ClientFavorite::TYPE_PROVIDER, ClientFavorite::TYPE_SERVICE])],
            'target' => ['required', 'string', 'max:64'],
        ]);

        $existing = ClientFavorite::where('user_id', $request->user()->id)
            ->where('type', $data['type'])
            ->where('target', $data['target'])
            ->first();

        if ($existing) {
            $existing->delete();
            $saved = false;
        } else {
            ClientFavorite::create([
                'user_id' => $request->user()->id,
                'type' => $data['type'],
                'target' => $data['target'],
            ]);
            $saved = true;
        }

        $rows = ClientFavorite::where('user_id', $request->user()->id)->get();

        return response()->json([
            'saved' => $saved,
            'providers' => $rows->where('type', ClientFavorite::TYPE_PROVIDER)->pluck('target')->values(),
            'services' => $rows->where('type', ClientFavorite::TYPE_SERVICE)->pluck('target')->values(),
        ]);
    }

    private function serializeOrder(Order $o): array
    {
        $review = $o->relationLoaded('review') ? $o->review : $o->review()->first();

        return [
            'id' => $o->id,
            'reference' => $o->reference,
            'domain' => $o->domain,
            'metier' => $o->metier,
            'commune' => $o->commune,
            'address' => $o->address ?? '',
            'latitude' => $o->latitude !== null ? (float) $o->latitude : null,
            'longitude' => $o->longitude !== null ? (float) $o->longitude : null,
            'frequency' => $o->frequency,
            'desiredDate' => $o->desired_date?->toDateString(),
            'need' => $o->need,
            'status' => $o->status,
            'amount' => $o->amount,
            'provider' => $o->providerProfile ? [
                'id' => $o->providerProfile->id,
                'metier' => $o->providerProfile->metier,
                'fullName' => $o->providerProfile->user?->full_name,
            ] : null,
            'trip' => TripPayload::trip($o->relationLoaded('activeTrip') ? $o->activeTrip : null),
            'hasReview' => (bool) $review,
            'review' => $review ? [
                'id' => $review->id,
                'rating' => $review->rating,
                'body' => $review->body ?? '',
            ] : null,
            'createdAt' => $o->created_at?->toIso8601String(),
        ];
    }

    private function serializePayment(Payment $p): array
    {
        return [
            'id' => $p->id,
            'reference' => $p->reference,
            'amount' => $p->amount,
            'method' => $p->method,
            'status' => $p->status,
            'note' => $p->note,
            'orderReference' => $p->order?->reference,
            'orderId' => $p->order_id,
            'createdAt' => $p->created_at?->toIso8601String(),
        ];
    }

    private function serializeMessage(Message $m): array
    {
        return [
            'id' => $m->id,
            'thread' => $m->thread,
            'body' => $m->body,
            'fromStaff' => $m->from_staff,
            'createdAt' => $m->created_at?->toIso8601String(),
        ];
    }

    private function serializeNotification(AppNotification $n): array
    {
        return [
            'id' => $n->id,
            'title' => $n->title,
            'body' => $n->body,
            'type' => $n->type,
            'link' => $n->link,
            'readAt' => $n->read_at?->toIso8601String(),
            'createdAt' => $n->created_at?->toIso8601String(),
        ];
    }
}
