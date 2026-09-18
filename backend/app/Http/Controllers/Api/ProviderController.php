<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProviderProfile;
use App\Support\PublicProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProviderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ProviderProfile::with('user')->where('status', 'approved');

        if ($domaine = $request->query('domaine') ?: $request->query('domain')) {
            $query->where('domain', $domaine);
        }

        if ($commune = $request->query('commune')) {
            $query->where(function ($q) use ($commune) {
                $q->whereJsonContains('zones', $commune)
                    ->orWhereHas('user', fn ($u) => $u->where('commune', $commune));
            });
        }

        $items = $query->latest('id')->get()->map(
            fn (ProviderProfile $p) => PublicProvider::serialize($p, true)
        );

        return response()->json(['items' => $items]);
    }

    public function show(string $reference): JsonResponse
    {
        $profile = ProviderProfile::with('user')
            ->where('status', 'approved')
            ->whereRaw('LOWER(reference) = ?', [strtolower($reference)])
            ->firstOrFail();

        return response()->json(['item' => PublicProvider::serialize($profile, true)]);
    }

    public function verify(Request $request): JsonResponse
    {
        $seal = strtoupper(trim((string) $request->query('seal', '')));
        if ($seal === '') {
            return response()->json(['error' => 'Indiquez un numéro de sceau.'], 422);
        }

        $profile = ProviderProfile::with('user')
            ->where('status', 'approved')
            ->whereRaw('UPPER(seal) = ?', [$seal])
            ->first();

        if (! $profile) {
            return response()->json(['item' => null, 'valid' => false]);
        }

        return response()->json([
            'valid' => true,
            'item' => PublicProvider::serialize($profile, true),
        ]);
    }
}
