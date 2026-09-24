<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
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

        $this->configureRateLimiting();

        if ($this->app->environment('production')) {
            URL::forceScheme('https');

            $root = rtrim((string) config('app.url'), '/');
            if ($root !== '') {
                URL::forceRootUrl($root);
            }
        }
    }

    /**
     * Limites anti-force brute. Les proxys étant tous approuvés (Hostinger),
     * l'IP seule peut être falsifiée via X-Forwarded-For : la connexion est
     * donc aussi bornée par adresse e-mail visée.
     */
    private function configureRateLimiting(): void
    {
        $tooMany = fn (string $message) => fn () => response()->json(['error' => $message], 429);

        RateLimiter::for('login', function (Request $request) use ($tooMany) {
            $email = strtolower((string) $request->input('email'));

            return [
                Limit::perMinute(5)->by('login:email:'.$email)
                    ->response($tooMany('Trop de tentatives de connexion. Réessayez dans une minute.')),
                Limit::perMinute(20)->by('login:ip:'.$request->ip())
                    ->response($tooMany('Trop de tentatives de connexion. Réessayez dans une minute.')),
            ];
        });

        RateLimiter::for('register', fn (Request $request) => Limit::perHour(10)->by('register:'.$request->ip())
            ->response($tooMany('Trop de créations de compte depuis cette connexion. Réessayez plus tard.')));

        RateLimiter::for('sensitive', fn (Request $request) => Limit::perMinute(6)->by('sensitive:'.($request->user()?->id ?: $request->ip()))
            ->response($tooMany('Trop de tentatives. Patientez une minute.')));

        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(180)->by($request->user()?->id ?: $request->ip()));
    }
}
