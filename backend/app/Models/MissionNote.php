<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'order_id',
    'created_by',
    'type',
    'severity',
    'body',
])]
class MissionNote extends Model
{
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'severity' => $this->severity,
            'body' => $this->body,
            'author' => $this->author ? [
                'id' => $this->author->id,
                'fullName' => $this->author->full_name,
            ] : null,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
