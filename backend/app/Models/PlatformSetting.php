<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

#[Fillable(['key', 'value'])]
class PlatformSetting extends Model
{
    public static function get(string $key, ?string $default = null): ?string
    {
        $all = static::allCached();

        return array_key_exists($key, $all) ? $all[$key] : $default;
    }

    public static function set(string $key, ?string $value): void
    {
        static::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
        Cache::forget('platform_settings');
    }

    /**
     * @param  array<string, string|null>  $pairs
     */
    public static function setMany(array $pairs): void
    {
        foreach ($pairs as $key => $value) {
            static::query()->updateOrCreate(
                ['key' => (string) $key],
                ['value' => $value !== null ? (string) $value : null]
            );
        }
        Cache::forget('platform_settings');
    }

    /**
     * @return array<string, string|null>
     */
    public static function allCached(): array
    {
        return Cache::remember('platform_settings', 300, function () {
            return static::query()->pluck('value', 'key')->all();
        });
    }

    /**
     * Instructions Mobile Money pour les réponses paiement.
     *
     * @return array{mobileMoneyNumber: string, supportPhone: string, supportEmail: string, companyName: string}
     */
    public static function paymentInstructions(): array
    {
        return [
            'mobileMoneyNumber' => (string) (static::get('mobile_money_number') ?? ''),
            'supportPhone' => (string) (static::get('support_phone') ?? ''),
            'supportEmail' => (string) (static::get('support_email') ?? ''),
            'companyName' => (string) (static::get('company_name') ?? 'SaaCare'),
        ];
    }
}
