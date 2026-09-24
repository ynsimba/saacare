<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * En-têtes de sécurité appliqués à toutes les réponses de l'API :
 * pas de reniflage MIME, pas d'encadrement, pas de fuite de Referer,
 * capteurs du navigateur désactivés, HTTPS strict en production.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $headers = $response->headers;
        $headers->set('X-Content-Type-Options', 'nosniff');
        $headers->set('X-Frame-Options', 'DENY');
        $headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $headers->set('Permissions-Policy', 'camera=(), microphone=(), payment=(), usb=()');
        $headers->set('Cross-Origin-Resource-Policy', 'same-site');
        // L'API ne sert que du JSON : aucune ressource active n'y est légitime.
        $headers->set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
        $headers->remove('X-Powered-By');

        if (app()->environment('production') && $request->isSecure()) {
            $headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Les réponses authentifiées ne doivent jamais être mises en cache par un proxy.
        if ($request->bearerToken()) {
            $headers->set('Cache-Control', 'no-store, private');
        }

        return $response;
    }
}
