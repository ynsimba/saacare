<?php

namespace App\Support;

use App\Models\ProviderProfile;

class PublicProvider
{
    public static function serialize(ProviderProfile $p, bool $detailed = false): array
    {
        $commune = $p->user?->commune ?? '';

        $item = [
            'id' => $p->id,
            'reference' => $p->reference,
            'seal' => $p->seal,
            'domainSlug' => $p->domain,
            'domain' => $p->domain,
            'metier' => $p->metier,
            'initials' => $p->initials ?: mb_substr($p->metier ?: 'S', 0, 1),
            'gender' => $p->gender,
            'commune' => $commune,
            'zones' => $p->zones ?? [],
            'level' => $p->level ?: 'Vérifié',
            'rating' => (float) $p->rating,
            'reviews' => (int) $p->reviews,
            'experience' => (int) $p->experience,
            'languages' => $p->languages ?? [],
            'availability' => $p->availability ?: 'planning',
            'slots' => $p->slots ?? [],
            'licence' => $p->licence ?? [],
            'status' => $p->status,
            'bio' => $p->bio ?? '',
            'fullName' => $p->user?->full_name,
        ];

        if ($detailed) {
            $item['price'] = $p->price;
            $item['skills'] = $p->skills ?? [];
            $item['trainings'] = $p->trainings ?? [];
            $item['missions'] = (int) $p->missions;
            $item['hours'] = (int) $p->hours;
            $item['since'] = $p->since ?? '';
            $item['verifiedAt'] = $p->verified_at ?? '';
            $item['nextCheck'] = $p->next_check ?? '';
            $item['reviewsList'] = $p->reviews_list ?? [];
        }

        return $item;
    }
}
