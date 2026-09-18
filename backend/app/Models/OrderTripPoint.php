<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Historique court d'un trajet : sert au tracé sur la carte, puis est purgé.
 * Pas d'horodatage Eloquent — `recorded_at` (horloge de l'appareil) suffit.
 */
#[Fillable([
    'order_trip_id',
    'latitude',
    'longitude',
    'accuracy',
    'heading',
    'speed',
    'recorded_at',
])]
class OrderTripPoint extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
            'latitude' => 'float',
            'longitude' => 'float',
            'speed' => 'float',
        ];
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(OrderTrip::class, 'order_trip_id');
    }
}
