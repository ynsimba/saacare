<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactMessageMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'subject' => ['required', 'string', 'max:190'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $recipients = config('contact.recipients', []);
        if ($recipients === []) {
            return response()->json(['error' => 'Aucun destinataire contact configuré.'], 500);
        }

        $requestId = (string) ($request->headers->get('X-Request-Id') ?: Str::uuid());
        $smtpReady = filled(config('mail.mailers.smtp.host'))
            && filled(config('mail.mailers.smtp.username'))
            && filled(config('mail.mailers.smtp.password'));

        // En local uniquement : journal Laravel sans SMTP (jamais en production).
        if (! $smtpReady) {
            if (! app()->environment('local', 'testing')) {
                Log::warning('Contact mail unavailable: SMTP not configured', [
                    'request_id' => $requestId,
                ]);

                return response()->json([
                    'error' => 'Impossible d’envoyer le message pour le moment. Réessayez ou écrivez-nous directement.',
                ], 503);
            }

            Mail::mailer('log')->to($recipients)->send(new ContactMessageMail([
                'name' => trim($data['name']),
                'email' => trim($data['email']),
                'subject' => trim($data['subject']),
                'message' => trim($data['message']),
            ]));

            return response()->json([
                'ok' => true,
                'message' => 'Message envoyé.',
                'requestId' => $requestId,
            ]);
        }

        try {
            Mail::mailer('smtp')->to($recipients)->send(new ContactMessageMail([
                'name' => trim($data['name']),
                'email' => trim($data['email']),
                'subject' => trim($data['subject']),
                'message' => trim($data['message']),
            ]));
        } catch (Throwable $e) {
            Log::error('Contact mail failed', [
                'request_id' => $requestId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Impossible d’envoyer le message pour le moment. Réessayez ou écrivez-nous directement.',
                'requestId' => $requestId,
            ], 503);
        }

        return response()->json([
            'ok' => true,
            'message' => 'Message envoyé.',
            'requestId' => $requestId,
        ]);
    }
}
