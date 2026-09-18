<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'reference',
    'client_id',
    'provider_profile_id',
    'domain',
    'metier',
    'commune',
    'address',
    'latitude',
    'longitude',
    'frequency',
    'desired_date',
    'need',
    'status',
    'amount',
])]
class Order extends Model
{
    protected function casts(): array
    {
        return [
            'desired_date' => 'date',
            'amount' => 'integer',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function providerProfile(): BelongsTo
    {
        return $this->belongsTo(ProviderProfile::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /** Trajets de suivi GPS rattachés à la mission (§4.4). */
    public function trips(): HasMany
    {
        return $this->hasMany(OrderTrip::class);
    }

    public function activeTrip(): HasOne
    {
        return $this->hasOne(OrderTrip::class)
            ->where('status', OrderTrip::STATUS_EN_ROUTE)
            ->latestOfMany();
    }
}
