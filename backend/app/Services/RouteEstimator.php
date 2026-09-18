<?php

namespace App\Services;

use App\Models\OrderTrip;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Distance restante et heure d'arrivée estimée.
 *
 * Deux sources, dans cet ordre :
 *   1. Google Routes API (clé SERVEUR, jamais envoyée au navigateur) ;
 *   2. estimation locale (distance à vol d'oiseau × facteur de voirie ÷ vitesse moyenne)
 *      quand la clé est absente, que Google répond mal, ou que le quota est atteint.
 *
 * L'itinéraire n'est JAMAIS recalculé à chaque position reçue : voir
 * config('tracking.route.refresh_interval') et refresh_distance.
 */
class RouteEstimator
{
    /** Facteur voirie : un trajet réel est plus long que la ligne droite. */
    private const ROAD_FACTOR = 1.35;

    public static function distanceMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earth = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $earth * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    /**
     * Met à jour distance/ETA du trajet si — et seulement si — c'est nécessaire.
     */
    public function refresh(OrderTrip $trip, ?float $destLat, ?float $destLng): void
    {
        if (! $trip->hasPosition() || $destLat === null || $destLng === null) {
            return;
        }

        if (! $this->shouldRecompute($trip)) {
            return;
        }

        $estimate = $this->compute(
            (float) $trip->last_latitude,
            (float) $trip->last_longitude,
            $destLat,
            $destLng,
        );

        $trip->forceFill([
            'distance_meters' => $estimate['distance_meters'],
            'eta_seconds' => $estimate['eta_seconds'],
            'route_source' => $estimate['source'],
            'route_from_latitude' => $trip->last_latitude,
            'route_from_longitude' => $trip->last_longitude,
            'route_computed_at' => now(),
        ]);
    }

    private function shouldRecompute(OrderTrip $trip): bool
    {
        if (! $trip->route_computed_at || $trip->route_from_latitude === null) {
            return true;
        }

        $interval = (int) config('tracking.route.refresh_interval', 45);
        if ($trip->route_computed_at->diffInSeconds(now()) >= $interval) {
            return true;
        }

        $moved = self::distanceMeters(
            (float) $trip->route_from_latitude,
            (float) $trip->route_from_longitude,
            (float) $trip->last_latitude,
            (float) $trip->last_longitude,
        );

        return $moved >= (int) config('tracking.route.refresh_distance', 300);
    }

    /**
     * @return array{distance_meters:int, eta_seconds:int, source:string}
     */
    public function compute(float $fromLat, float $fromLng, float $toLat, float $toLng): array
    {
        $key = config('services.google.maps_key');

        if (filled($key)) {
            $route = $this->fromGoogle($key, $fromLat, $fromLng, $toLat, $toLng);
            if ($route) {
                return $route;
            }
        }

        return $this->estimate($fromLat, $fromLng, $toLat, $toLng);
    }

    /**
     * @return array{distance_meters:int, eta_seconds:int, source:string}|null
     */
    private function fromGoogle(string $key, float $fromLat, float $fromLng, float $toLat, float $toLng): ?array
    {
        try {
            $response = Http::timeout((int) config('tracking.route.timeout', 6))
                ->withHeaders([
                    'X-Goog-Api-Key' => $key,
                    'X-Goog-FieldMask' => 'routes.duration,routes.distanceMeters',
                ])
                ->post('https://routes.googleapis.com/directions/v2:computeRoutes', [
                    'origin' => ['location' => ['latLng' => ['latitude' => $fromLat, 'longitude' => $fromLng]]],
                    'destination' => ['location' => ['latLng' => ['latitude' => $toLat, 'longitude' => $toLng]]],
                    'travelMode' => 'DRIVE',
                    'routingPreference' => 'TRAFFIC_AWARE',
                    'languageCode' => 'fr-FR',
                    'units' => 'METRIC',
                ]);

            if ($response->failed()) {
                Log::warning('Routes API indisponible', ['status' => $response->status()]);

                return null;
            }

            $route = $response->json('routes.0');
            if (! $route) {
                return null;
            }

            return [
                'distance_meters' => (int) ($route['distanceMeters'] ?? 0),
                'eta_seconds' => (int) rtrim((string) ($route['duration'] ?? '0s'), 's'),
                'source' => 'google',
            ];
        } catch (\Throwable $e) {
            Log::warning('Routes API en erreur', ['message' => $e->getMessage()]);

            return null;
        }
    }

    /**
     * @return array{distance_meters:int, eta_seconds:int, source:string}
     */
    private function estimate(float $fromLat, float $fromLng, float $toLat, float $toLng): array
    {
        $distance = self::distanceMeters($fromLat, $fromLng, $toLat, $toLng) * self::ROAD_FACTOR;
        $speed = max(1.0, (float) config('tracking.route.fallback_speed_kmh', 18)) / 3.6;

        return [
            'distance_meters' => (int) round($distance),
            'eta_seconds' => (int) round($distance / $speed),
            'source' => 'estimation',
        ];
    }
}
