<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\LeadNotificationMail;
use App\Models\AppNotification;
use App\Models\QuoteRequest;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class PublicLeadController extends Controller
{
    public function storeRequest(Request $request): JsonResponse
    {
        $data = $request->validate([
            'service' => ['required', 'string', 'max:120'],
            'commune' => ['required', 'string', 'max:120'],
            'frequency' => ['nullable', 'string', 'max:80'],
            'date' => ['nullable', 'date'],
            'desiredDate' => ['nullable', 'date'],
            'dueDate' => ['nullable', 'date'],
            'firstName' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:40'],
            'email' => ['required', 'email', 'max:190'],
            'address' => ['nullable', 'string', 'max:2000'],
            'need' => ['required', 'string', 'max:5000'],
            'providerReference' => ['nullable', 'string', 'max:64'],
        ]);

        $desiredDate = $data['desiredDate'] ?? $data['date'] ?? null;

        $item = ServiceRequest::create([
            'reference' => 'REF-'.strtoupper(Str::random(8)),
            'service' => trim($data['service']),
            'commune' => trim($data['commune']),
            'frequency' => trim((string) ($data['frequency'] ?? '')),
            'desired_date' => $desiredDate,
            'due_date' => $data['dueDate'] ?? null,
            'first_name' => trim($data['firstName']),
            'phone' => trim($data['phone']),
            'email' => trim($data['email']),
            'address' => isset($data['address']) ? trim($data['address']) : null,
            'need' => trim($data['need']),
            'provider_reference' => isset($data['providerReference']) ? trim($data['providerReference']) : null,
            'status' => 'nouvelle',
            'source' => 'web',
        ]);

        $this->notifyAdmins(
            'Nouvelle demande de service',
            "{$item->reference} — {$item->service} · {$item->commune} ({$item->first_name})",
            '/admin/demandes'
        );

        $this->sendLeadMail([
            'type' => 'Demande de service',
            'reference' => $item->reference,
            'subject' => $item->service.' · '.$item->commune,
            'replyEmail' => $item->email,
            'replyName' => $item->first_name,
            'rows' => [
                'Service' => $item->service,
                'Commune' => $item->commune,
                'Fréquence' => $item->frequency ?: '—',
                'Date souhaitée' => $item->desired_date?->toDateString() ?? '—',
                'Date d’accouchement' => $item->due_date?->toDateString() ?? '—',
                'Prénom' => $item->first_name,
                'Téléphone' => $item->phone,
                'E-mail' => $item->email,
                'Adresse' => $item->address ?: '—',
                'Besoin' => $item->need,
                'Prestataire' => $item->provider_reference ?: '—',
            ],
        ]);

        return response()->json(['reference' => $item->reference, 'ok' => true], 201);
    }

    public function storeQuote(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company' => ['required', 'string', 'max:190'],
            'contactName' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['required', 'string', 'max:40'],
            'needType' => ['required', 'string', 'max:120'],
            'duration' => ['nullable', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:190'],
            'startDate' => ['nullable', 'date'],
            'message' => ['nullable', 'string', 'max:5000'],
            'positions' => ['nullable', 'array', 'max:40'],
            'positions.*.metier' => ['nullable', 'string', 'max:120'],
            'positions.*.qty' => ['nullable', 'integer', 'min:1', 'max:999'],
        ]);

        $item = QuoteRequest::create([
            'reference' => 'DEV-'.strtoupper(Str::random(8)),
            'company' => trim($data['company']),
            'contact_name' => trim($data['contactName']),
            'email' => trim($data['email']),
            'phone' => trim($data['phone']),
            'need_type' => trim($data['needType']),
            'duration' => trim((string) ($data['duration'] ?? '')),
            'location' => trim((string) ($data['location'] ?? '')),
            'start_date' => $data['startDate'] ?? null,
            'message' => isset($data['message']) ? trim($data['message']) : null,
            'positions' => $data['positions'] ?? [],
            'status' => 'nouvelle',
        ]);

        $this->notifyAdmins(
            'Nouvelle demande de devis',
            "{$item->reference} — {$item->company} ({$item->contact_name})",
            '/admin/devis'
        );

        $positionsText = collect($item->positions ?? [])
            ->filter(fn ($p) => filled($p['metier'] ?? null))
            ->map(fn ($p) => ($p['metier'] ?? '').' × '.($p['qty'] ?? 1))
            ->implode(', ');

        $this->sendLeadMail([
            'type' => 'Demande de devis',
            'reference' => $item->reference,
            'subject' => $item->company.' · '.$item->need_type,
            'replyEmail' => $item->email,
            'replyName' => $item->contact_name,
            'rows' => [
                'Entreprise' => $item->company,
                'Contact' => $item->contact_name,
                'E-mail' => $item->email,
                'Téléphone' => $item->phone,
                'Type de besoin' => $item->need_type,
                'Durée' => $item->duration ?: '—',
                'Lieu' => $item->location ?: '—',
                'Début' => $item->start_date?->toDateString() ?? '—',
                'Postes' => $positionsText !== '' ? $positionsText : '—',
                'Message' => $item->message ?: '—',
            ],
        ]);

        return response()->json(['reference' => $item->reference], 201);
    }

    private function notifyAdmins(string $title, string $body, string $link): void
    {
        $admins = User::query()->where('role', 'admin')->get(['id']);
        foreach ($admins as $admin) {
            AppNotification::create([
                'user_id' => $admin->id,
                'title' => $title,
                'body' => $body,
                'type' => 'lead',
                'link' => $link,
            ]);
        }
    }

    /**
     * @param  array{type: string, reference: string, subject: string, replyEmail?: string, replyName?: string, rows: array<string, string>}  $payload
     */
    private function sendLeadMail(array $payload): void
    {
        $recipients = config('contact.recipients', []);
        if ($recipients === []) {
            return;
        }

        $smtpReady = filled(config('mail.mailers.smtp.host'))
            && filled(config('mail.mailers.smtp.username'))
            && filled(config('mail.mailers.smtp.password'));

        try {
            if (! $smtpReady) {
                if (app()->environment('local', 'testing')) {
                    Mail::mailer('log')->to($recipients)->send(new LeadNotificationMail($payload));
                }

                return;
            }

            Mail::mailer('smtp')->to($recipients)->send(new LeadNotificationMail($payload));
        } catch (Throwable $e) {
            Log::error('Lead notification mail failed', [
                'reference' => $payload['reference'] ?? null,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
