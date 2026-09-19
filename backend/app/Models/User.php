<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'full_name',
    'email',
    'password',
    'google_id',
    'phone',
    'commune',
    'address',
    'role',
    'is_super_admin',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
        ];
    }

    public function providerProfile(): HasOne
    {
        return $this->hasOne(ProviderProfile::class);
    }

    public function ordersAsClient(): HasMany
    {
        return $this->hasMany(Order::class, 'client_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(AppNotification::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'client_id');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(ClientFavorite::class);
    }

    public function toPublicArray(): array
    {
        $data = [
            'id' => $this->id,
            'email' => $this->email,
            'fullName' => $this->full_name,
            'phone' => $this->phone ?? '',
            'commune' => $this->commune ?? '',
            'address' => $this->address ?? '',
            'role' => $this->role,
            'isSuperAdmin' => (bool) $this->is_super_admin,
            'hasPassword' => filled($this->password),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];

        if ($this->role === 'prestataire') {
            $profile = $this->relationLoaded('providerProfile')
                ? $this->providerProfile
                : $this->providerProfile()->first();

            $data['providerStatus'] = $profile?->status ?? 'pending';
            $data['providerProfile'] = $profile ? [
                'id' => $profile->id,
                'status' => $profile->status,
                'domain' => $profile->domain,
                'metier' => $profile->metier,
                'bio' => $profile->bio,
                'zones' => $profile->zones ?? [],
            ] : null;
        }

        return $data;
    }
}
