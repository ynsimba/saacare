<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'reference',
    'seal',
    'status',
    'domain',
    'metier',
    'last_name',
    'middle_name',
    'first_name',
    'initials',
    'gender',
    'marital_status',
    'birth_place',
    'birth_date',
    'religion',
    'id_type',
    'id_issued_at',
    'id_expires_at',
    'emergency_name',
    'emergency_phone',
    'emergency_relation',
    'level',
    'rating',
    'reviews',
    'experience',
    'languages',
    'price',
    'availability',
    'slots',
    'licence',
    'skills',
    'trainings',
    'missions',
    'hours',
    'since',
    'verified_at',
    'next_check',
    'reviews_list',
    'bio',
    'application_documents',
    'zones',
])]
class ProviderProfile extends Model
{
    protected function casts(): array
    {
        return [
            'zones' => 'array',
            'languages' => 'array',
            'price' => 'array',
            'slots' => 'array',
            'licence' => 'array',
            'skills' => 'array',
            'trainings' => 'array',
            'reviews_list' => 'array',
            'application_documents' => 'array',
            'birth_date' => 'date',
            'id_issued_at' => 'date',
            'id_expires_at' => 'date',
            'rating' => 'float',
            'reviews' => 'integer',
            'experience' => 'integer',
            'missions' => 'integer',
            'hours' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
