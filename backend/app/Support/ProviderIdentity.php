<?php

namespace App\Support;

use App\Models\ProviderProfile;
use Illuminate\Support\Str;

class ProviderIdentity
{
    /** @var array<string, string> */
    private const DOMAIN_PREFIX = [
        'kids-care' => 'KC',
        'wale' => 'WL',
        'home' => 'HM',
        'driver' => 'DR',
    ];

    /**
     * Assigne référence SaaCare + sceau SaaTrust si absents (profils créés
     * sans identité, ou approuvés avant cette logique).
     */
    public static function ensure(ProviderProfile $profile): ProviderProfile
    {
        $dirty = false;

        if (! filled($profile->reference)) {
            $profile->reference = self::uniqueReference($profile);
            $dirty = true;
        }

        if (! filled($profile->seal) && $profile->status === 'approved') {
            $profile->seal = self::uniqueSeal($profile);
            $dirty = true;
        }

        if ($dirty) {
            if (! filled($profile->verified_at) && $profile->status === 'approved') {
                $profile->verified_at = now()->format('m/Y');
            }
            if (! filled($profile->next_check) && $profile->status === 'approved') {
                $profile->next_check = now()->addYear()->format('m/Y');
            }
            if (! filled($profile->level)) {
                $profile->level = 'Vérifié';
            }
            $profile->save();
        }

        return $profile;
    }

    public static function uniqueReference(ProviderProfile $profile): string
    {
        $prefix = self::DOMAIN_PREFIX[$profile->domain] ?? 'SC';
        $base = sprintf('SAA-%s-%04d', $prefix, max(1, (int) $profile->id));

        if (! ProviderProfile::query()->where('reference', $base)->where('id', '!=', $profile->id)->exists()) {
            return $base;
        }

        do {
            $candidate = sprintf('SAA-%s-%s', $prefix, strtoupper(Str::random(4)));
        } while (ProviderProfile::query()->where('reference', $candidate)->exists());

        return $candidate;
    }

    public static function uniqueSeal(ProviderProfile $profile): string
    {
        $year = now()->format('y');
        $base = sprintf('ST-%s-%04d', $year, max(1, (int) $profile->id));

        if (! ProviderProfile::query()->where('seal', $base)->where('id', '!=', $profile->id)->exists()) {
            return $base;
        }

        do {
            $candidate = sprintf('ST-%s-%s', $year, strtoupper(Str::random(4)));
        } while (ProviderProfile::query()->where('seal', $candidate)->exists());

        return $candidate;
    }
}
