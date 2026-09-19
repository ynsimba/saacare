<?php

use Illuminate\Support\Facades\Route;

/**
 * Racine de api.saacare.com : pas de page Blade en prod.
 * Les routes métier sont sous /api/* (routes/api.php).
 */
Route::get('/', function () {
    return response()->json([
        'service' => 'saacare-api',
        'ok' => true,
        'docs' => url('/api/health'),
        'frontend' => rtrim((string) env('FRONTEND_URL', 'https://app.saacare.com'), '/'),
    ]);
});

Route::fallback(function () {
    return response()->json(['error' => 'Route introuvable.'], 404);
});
