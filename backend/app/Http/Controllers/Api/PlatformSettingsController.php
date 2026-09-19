<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformSettingsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'settings' => PlatformSetting::allCached(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*' => ['nullable', 'string', 'max:2000'],
        ]);

        $allowed = [
            'mobile_money_number',
            'support_email',
            'support_phone',
            'company_name',
        ];

        $pairs = [];
        foreach ($data['settings'] as $key => $value) {
            if (! in_array((string) $key, $allowed, true)) {
                continue;
            }
            $pairs[(string) $key] = $value;
        }

        if ($pairs !== []) {
            PlatformSetting::setMany($pairs);
        }

        return response()->json([
            'settings' => PlatformSetting::allCached(),
            'ok' => true,
        ]);
    }
}
