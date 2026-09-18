<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Appointment $appointment) {}

    public function envelope(): Envelope
    {
        $when = $this->appointment->starts_at?->timezone(config('app.timezone'))->format('d/m/Y H:i');

        return new Envelope(
            subject: 'Rappel rendez-vous SaaCare — '.$this->appointment->title.($when ? " ($when)" : ''),
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    private function buildHtml(): string
    {
        $a = $this->appointment;
        $tz = config('app.timezone');
        $starts = $a->starts_at?->timezone($tz)->format('l d/m/Y à H:i');
        $ends = $a->ends_at?->timezone($tz)->format('H:i');
        $title = e($a->title);
        $location = e($a->location ?: '—');
        $notes = nl2br(e($a->notes ?: '—'));
        $attendee = e(trim(($a->attendee_name ?: '').' '.($a->attendee_email ?: '')) ?: '—');
        $minutes = (int) $a->remind_minutes_before;
        $whenLabel = $ends ? "{$starts} – {$ends}" : (string) $starts;

        return <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>Rappel rendez-vous</title></head>
<body style="font-family:Georgia,serif;background:#f4f6f5;color:#1d1f24;padding:24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <tr><td style="padding:28px 28px 8px;">
      <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;">SaaCare · Rappel</p>
      <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;">{$title}</h1>
    </td></tr>
    <tr><td style="padding:8px 28px 28px;">
      <p style="margin:0 0 12px;font-size:15px;">Vous avez un rendez-vous dans environ <strong>{$minutes} min</strong>.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef7f2;border-radius:12px;">
        <tr><td style="padding:16px;">
          <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Quand</p>
          <p style="margin:0 0 14px;font-size:15px;font-weight:600;">{$whenLabel}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Lieu</p>
          <p style="margin:0 0 14px;font-size:15px;">{$location}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Participant</p>
          <p style="margin:0 0 14px;font-size:15px;">{$attendee}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Notes</p>
          <p style="margin:0;font-size:15px;">{$notes}</p>
        </td></tr>
      </table>
      <p style="margin:18px 0 0;font-size:12px;color:#9ca3af;">Cet e-mail a été envoyé automatiquement par SaaCare.</p>
    </td></tr>
  </table>
</body>
</html>
HTML;
    }
}
