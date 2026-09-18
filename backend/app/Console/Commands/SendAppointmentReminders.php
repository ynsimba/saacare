<?php

namespace App\Console\Commands;

use App\Mail\AppointmentReminderMail;
use App\Models\Appointment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendAppointmentReminders extends Command
{
    protected $signature = 'saacare:send-appointment-reminders {--dry-run : Afficher sans envoyer}';

    protected $description = 'Envoie les rappels e-mail des rendez-vous à échéance.';

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');
        $now = now();

        $due = Appointment::with('creator')
            ->where('reminder_enabled', true)
            ->whereNull('reminder_sent_at')
            ->whereNotNull('remind_at')
            ->where('remind_at', '<=', $now)
            ->where('starts_at', '>=', $now->copy()->subHour())
            ->orderBy('remind_at')
            ->limit(100)
            ->get();

        $sent = 0;

        foreach ($due as $appointment) {
            $recipients = collect([
                $appointment->creator?->email,
                $appointment->attendee_email ?: null,
            ])
                ->filter(fn ($email) => filled($email))
                ->unique()
                ->values();

            if ($recipients->isEmpty()) {
                $this->warn("RDV #{$appointment->id} : aucun destinataire.");
                if (! $dry) {
                    $appointment->forceFill(['reminder_sent_at' => $now])->save();
                }
                continue;
            }

            $this->line(sprintf(
                'RDV #%d « %s » → %s',
                $appointment->id,
                $appointment->title,
                $recipients->implode(', ')
            ));

            if ($dry) {
                continue;
            }

            foreach ($recipients as $email) {
                Mail::to($email)->send(new AppointmentReminderMail($appointment));
            }

            $appointment->forceFill(['reminder_sent_at' => $now])->save();
            $sent++;
        }

        $this->info(sprintf(
            '%d rappel(s) traité(s)%s.',
            $dry ? $due->count() : $sent,
            $dry ? ' [simulation]' : ''
        ));

        return self::SUCCESS;
    }
}
