<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeadNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array{type: string, reference: string, subject: string, replyEmail?: string, replyName?: string, rows: array<string, string>}  $payload
     */
    public function __construct(public array $payload) {}

    public function envelope(): Envelope
    {
        $type = trim((string) ($this->payload['type'] ?? 'Lead'));
        $reference = trim((string) ($this->payload['reference'] ?? ''));
        $subject = trim((string) ($this->payload['subject'] ?? $type));

        $replyTo = [];
        $replyEmail = trim((string) ($this->payload['replyEmail'] ?? ''));
        if ($replyEmail !== '' && filter_var($replyEmail, FILTER_VALIDATE_EMAIL)) {
            $replyName = trim((string) ($this->payload['replyName'] ?? ''));
            $replyTo[] = new Address($replyEmail, $replyName !== '' ? $replyName : null);
        }

        return new Envelope(
            subject: "SaaCare · {$type}".($reference !== '' ? " {$reference}" : '')." — {$subject}",
            replyTo: $replyTo,
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
        $type = e($this->payload['type'] ?? 'Lead');
        $reference = e($this->payload['reference'] ?? '');
        $subject = e($this->payload['subject'] ?? '');
        $rows = $this->payload['rows'] ?? [];

        $rowsHtml = '';
        foreach ($rows as $label => $value) {
            $labelEsc = e((string) $label);
            $valueEsc = nl2br(e((string) $value));
            $rowsHtml .= <<<HTML
          <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">{$labelEsc}</p>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.55;">{$valueEsc}</p>
HTML;
        }

        return <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>{$type} SaaCare</title></head>
<body style="font-family:Georgia,serif;background:#f4f6f5;color:#1d1f24;padding:24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <tr><td style="padding:28px 28px 8px;">
      <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;">SaaCare · {$type}</p>
      <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;">{$subject}</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#0f766e;font-family:ui-monospace,monospace;">{$reference}</p>
    </td></tr>
    <tr><td style="padding:8px 28px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef7f2;border-radius:12px;">
        <tr><td style="padding:16px;">
{$rowsHtml}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
    }
}
