<?php

$frontend = (string) env('FRONTEND_URL', 'http://localhost:5173');
$origins = array_values(array_filter(array_map('trim', explode(',', $frontend))));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $origins ?: ['http://localhost:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
