<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Trajet d'un prestataire vers le point d'intervention d'une mission.
 * Le partage de position n'existe que tant que `status` vaut `en_route`.
 */
#[Fillable([
    'order_id',
    'provider_profile_id',
    'status',
    'started_at',
    'arrived_at',
    'ended_at',
    'last_latitude',
    'last_longitude',
    'last_accuracy',
    'last_heading',
    'last_speed',
    'last_position_at',
    'points_count',
    'distance_meters',
    'eta_seconds',
    'route_source',
    'route_from_latitude',
    'route_from_longitude',
    'route_computed_at',
])]
class OrderTrip extends Model
{
    public const STATUS_EN_ROUTE = 'en_route';

    public const STATUS_ARRIVE = 'arrive';

    public const STATUS_ANNULE = 'annule';

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'arrived_at' => 'datetime',
            'ended_at' => 'datetime',
            'last_position_at' => 'datetime',
            'route_computed_at' => 'datetime',
            'last_latitude' => 'float',
            'last_longitude' => 'float',
            'last_speed' => 'float',
            'route_from_latitude' => 'float',
            'route_from_longitude' => 'float',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function providerProfile(): BelongsTo
    {
        return $this->belongsTo(ProviderProfile::class);
    }

    public function points(): HasMany
    {
        return $this->hasMany(OrderTripPoint::class);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_EN_ROUTE;
    }

    public function hasPosition(): bool
    {
        return $this->last_latitude !== null && $this->last_longitude !== null;
    }

    /**
     * Une position plus ancienne que ce délai n'est plus du temps réel :
     * l'interface doit alors parler de « dernière position connue ».
     */
    public function isStale(): bool
    {
        if (! $this->last_position_at) {
            return true;
        }

        return $this->last_position_at->diffInSeconds(now()) > (int) config('tracking.stale_after', 60);
    }
}
