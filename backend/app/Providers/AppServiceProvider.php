<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Autorisations des canaux privés de suivi de mission (routes/channels.php).
        // Chargées ici plutôt que via withRouting(channels:) : l'authentification
        // du front passe par un jeton Sanctum, pas par la session web.
        require base_path('routes/channels.php');

        if ($this->app->environment('production')) {
            URL::forceScheme('https');

            $root = rtrim((string) config('app.url'), '/');
            if ($root !== '') {
                URL::forceRootUrl($root);
            }
        }
    }
}
