<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Autorisations des canaux privés de suivi de mission (routes/channels.php).
        // Chargées ici plutôt que via withRouting(channels:) : l'authentification
        // du front passe par un jeton Sanctum, pas par la session web.
        require base_path('routes/channels.php');
    }
}
