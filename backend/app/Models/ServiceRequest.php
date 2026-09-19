<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'reference',
    'service',
    'commune',
    'frequency',
    'desired_date',
    'due_date',
    'first_name',
    'phone',
    'email',
    'address',
    'need',
    'provider_reference',
    'status',
    'source',
])]
class ServiceRequest extends Model
{
    protected function casts(): array
    {
        return [
            'desired_date' => 'date',
            'due_date' => 'date',
        ];
    }
}
