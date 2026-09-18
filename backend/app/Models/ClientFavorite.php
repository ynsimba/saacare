<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'type',
    'target',
])]
class ClientFavorite extends Model
{
    public const TYPE_PROVIDER = 'provider';

    public const TYPE_SERVICE = 'service';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
