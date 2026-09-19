<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ProviderAvailabilitySlot;
use App\Models\ProviderProfile;
use App\Models\ProviderReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PrestataireModuleController extends Controller
{
    public function availability(Request $request): JsonResponse
    {
        $profile = $this->requireProfile($request);

        $items = ProviderAvailabilitySlot::query()
            ->where('provider_profile_id', $profile->id)
            ->orderBy('weekday')
            ->orderBy('start_time')
            ->get()
            ->map(fn (ProviderAvailabilitySlot $s) => $this->serializeSlot($s));

        return response()->json(['items' => $items]);
    }

    public function updateAvailability(Request $request): JsonResponse
    {
        $profile = $this->requireProfile($request);

        $data = $request->validate([
            'slots' => ['required', 'array', 'max:56'],
            'slots.*.weekday' => ['required', 'integer', 'between:0,6'],
            'slots.*.startTime' => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
            'slots.*.endTime' => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
            'slots.*.isAvailable' => ['sometimes', 'boolean'],
        ]);

        DB::transaction(function () use ($profile, $data) {
            ProviderAvailabilitySlot::query()
                ->where('provider_profile_id', $profile->id)
                ->delete();

            $seen = [];
            foreach ($data['slots'] as $slot) {
                $key = $slot['weekday'].'|'.$slot['startTime'].'|'.$slot['endTime'];
                if (isset($seen[$key])) {
                    continue;
                }
                $seen[$key] = true;

                ProviderAvailabilitySlot::create([
                    'provider_profile_id' => $profile->id,
                    'weekday' => $slot['weekday'],
                    'start_time' => $slot['startTime'],
                    'end_time' => $slot['endTime'],
                    'is_available' => $slot['isAvailable'] ?? true,
                ]);
            }
        });

        return $this->availability($request);
    }

    public function planning(Request $request): JsonResponse
    {
        $profile = $this->requireProfile($request);

        $items = Order::with(['client'])
            ->where('provider_profile_id', $profile->id)
            ->whereIn('status', ['confirmee', 'programmee', 'en_cours'])
            ->orderByRaw('desired_date is null')
            ->orderBy('desired_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Order $o) => [
                'id' => $o->id,
                'reference' => $o->reference,
                'domain' => $o->domain,
                'metier' => $o->metier,
                'commune' => $o->commune,
                'address' => $o->address ?? '',
                'status' => $o->status,
                'desiredDate' => $o->desired_date?->toDateString(),
                'amount' => $o->amount,
                'client' => [
                    'fullName' => $o->client?->full_name,
                    'phone' => $o->client?->phone ?? '',
                ],
                'need' => $o->need,
            ]);

        return response()->json(['items' => $items]);
    }

    public function gains(Request $request): JsonResponse
    {
        $profile = $this->requireProfile($request);

        $base = Payment::query()
            ->where('status', 'paye')
            ->whereHas('order', fn ($q) => $q->where('provider_profile_id', $profile->id));

        $monthTotal = (clone $base)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->sum('amount');

        $grandTotal = (clone $base)->sum('amount');

        $completedMissions = Order::query()
            ->where('provider_profile_id', $profile->id)
            ->where('status', 'terminee')
            ->count();

        $items = (clone $base)
            ->with('order')
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (Payment $p) => [
                'id' => $p->id,
                'reference' => $p->reference,
                'amount' => $p->amount,
                'method' => $p->method,
                'status' => $p->status,
                'orderReference' => $p->order?->reference,
                'orderId' => $p->order_id,
                'createdAt' => $p->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'summary' => [
                'month' => (int) $monthTotal,
                'total' => (int) $grandTotal,
                'completedMissions' => $completedMissions,
                'monthFormatted' => number_format((int) $monthTotal, 0, ',', ' ').' CDF',
                'totalFormatted' => number_format((int) $grandTotal, 0, ',', ' ').' CDF',
            ],
            'items' => $items,
        ]);
    }

    public function reviews(Request $request): JsonResponse
    {
        $profile = $this->requireProfile($request);

        $items = ProviderReview::query()
            ->where('provider_profile_id', $profile->id)
            ->where('status', 'published')
            ->latest()
            ->get()
            ->map(fn (ProviderReview $r) => $this->serializeReview($r));

        $avg = $items->count()
            ? round($items->avg('rating'), 1)
            : null;

        return response()->json([
            'items' => $items,
            'average' => $avg,
            'count' => $items->count(),
        ]);
    }

    private function requireProfile(Request $request): ProviderProfile
    {
        $profile = $request->user()->providerProfile;
        abort_unless($profile, 404, 'Profil prestataire introuvable.');

        return $profile;
    }

    private function serializeSlot(ProviderAvailabilitySlot $s): array
    {
        return [
            'id' => $s->id,
            'weekday' => $s->weekday,
            'startTime' => $s->start_time,
            'endTime' => $s->end_time,
            'isAvailable' => $s->is_available,
        ];
    }

    private function serializeReview(ProviderReview $r): array
    {
        return [
            'id' => $r->id,
            'rating' => $r->rating,
            'body' => $r->body ?? '',
            'authorName' => $r->author_name ?: 'Client',
            'orderId' => $r->order_id,
            'createdAt' => $r->created_at?->toIso8601String(),
        ];
    }
}
