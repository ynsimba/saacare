<?php

namespace App\Support;

use App\Models\Order;
use App\Models\OrderTrip;

/**
 * Représentation unique d'un trajet, partagée par le prestataire, le client,
 * l'administration et les événements de diffusion.
 *
 * Ne contient QUE ce qui est nécessaire au suivi : aucune donnée personnelle
 * du prestataire au-delà de ce que le client connaît déjà de sa mission.
 */
class TripPayload
{
    public static function destination(Order $order): array
    {
        return [
            'address' => $order->address ?? '',
            'commune' => $order->commune,
            'latitude' => $order->latitude !== null ? (float) $order->latitude : null,
            'longitude' => $order->longitude !== null ? (float) $order->longitude : null,
            'isGeolocated' => $order->latitude !== null && $order->longitude !== null,
        ];
    }

    public static function trip(?OrderTrip $trip): ?array
    {
        if (! $trip) {
            return null;
        }

        return [
            'id' => $trip->id,
            'status' => $trip->status,
            'isActive' => $trip->isActive(),
            'isStale' => $trip->isActive() && $trip->isStale(),
            'startedAt' => $trip->started_at?->toIso8601String(),
            'arrivedAt' => $trip->arrived_at?->toIso8601String(),
            'endedAt' => $trip->ended_at?->toIso8601String(),
            'position' => $trip->hasPosition() ? [
                'latitude' => (float) $trip->last_latitude,
                'longitude' => (float) $trip->last_longitude,
                'accuracy' => $trip->last_accuracy !== null ? (int) $trip->last_accuracy : null,
                'heading' => $trip->last_heading !== null ? (int) $trip->last_heading : null,
                'speed' => $trip->last_speed !== null ? (float) $trip->last_speed : null,
                'recordedAt' => $trip->last_position_at?->toIso8601String(),
                'ageSeconds' => $trip->last_position_at ? (int) $trip->last_position_at->diffInSeconds(now()) : null,
            ] : null,
            'route' => $trip->distance_meters !== null ? [
                'distanceMeters' => (int) $trip->distance_meters,
                'etaSeconds' => $trip->eta_seconds !== null ? (int) $trip->eta_seconds : null,
                'source' => $trip->route_source,
                'computedAt' => $trip->route_computed_at?->toIso8601String(),
            ] : null,
            'pointsCount' => (int) $trip->points_count,
        ];
    }

    /**
     * Charge utile complète du suivi d'une mission, avec le tracé récent.
     */
    public static function tracking(Order $order, ?OrderTrip $trip, bool $withPath = true): array
    {
        $payload = [
            'order' => [
                'id' => $order->id,
                'reference' => $order->reference,
                'status' => $order->status,
                'domain' => $order->domain,
                'metier' => $order->metier,
                'commune' => $order->commune,
            ],
            'destination' => self::destination($order),
            'trip' => self::trip($trip),
            'provider' => $order->providerProfile ? [
                'id' => $order->providerProfile->id,
                'metier' => $order->providerProfile->metier,
                'fullName' => $order->providerProfile->user?->full_name,
                'phone' => $order->providerProfile->user?->phone,
            ] : null,
            'serverTime' => now()->toIso8601String(),
        ];

        if ($withPath && $trip) {
            $payload['path'] = $trip->points()
                ->orderBy('recorded_at')
                ->get(['latitude', 'longitude', 'recorded_at'])
                ->map(fn ($p) => [
                    'latitude' => (float) $p->latitude,
                    'longitude' => (float) $p->longitude,
                    'recordedAt' => $p->recorded_at?->toIso8601String(),
                ])
                ->all();
        }

        return $payload;
    }
}
