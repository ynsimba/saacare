<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'reference',
    'company',
    'contact_name',
    'email',
    'phone',
    'need_type',
    'duration',
    'location',
    'start_date',
    'message',
    'positions',
    'status',
])]
class QuoteRequest extends Model
{
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'positions' => 'array',
        ];
    }
}
