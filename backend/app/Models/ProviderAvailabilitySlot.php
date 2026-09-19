<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'provider_profile_id',
    'weekday',
    'start_time',
    'end_time',
    'is_available',
])]
class ProviderAvailabilitySlot extends Model
{
    protected function casts(): array
    {
        return [
            'weekday' => 'integer',
            'is_available' => 'boolean',
        ];
    }

    public function providerProfile(): BelongsTo
    {
        return $this->belongsTo(ProviderProfile::class);
    }
}
