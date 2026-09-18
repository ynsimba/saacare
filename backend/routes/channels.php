<?php

use App\Models\Order;
use Illuminate\Support\Facades\Broadcast;

/**
 * Canal privé de suivi d'une mission.
 *
 * Accès strictement limité au client propriétaire, au prestataire affecté et
 * aux administrateurs : personne d'autre ne peut écouter les positions.
 * L'autorisation est vérifiée côté serveur, jamais côté React.
 */
Broadcast::channel('mission.{orderId}', function ($user, int $orderId) {
    $order = Order::with('providerProfile')->find($orderId);

    if (! $order) {
        return false;
    }

    return match ($user->role) {
        'admin' => true,
        'client' => $order->client_id === $user->id,
        'prestataire' => $order->provider_profile_id !== null
            && $order->providerProfile?->user_id === $user->id,
        default => false,
    };
});
