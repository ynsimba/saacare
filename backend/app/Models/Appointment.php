<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'created_by',
    'title',
    'notes',
    'location',
    'starts_at',
    'ends_at',
    'attendee_name',
    'attendee_email',
    'reminder_enabled',
    'remind_minutes_before',
    'remind_at',
    'reminder_sent_at',
])]
class Appointment extends Model
{
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'remind_at' => 'datetime',
            'reminder_sent_at' => 'datetime',
            'reminder_enabled' => 'boolean',
            'remind_minutes_before' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function computeRemindAt(): ?\Illuminate\Support\Carbon
    {
        if (! $this->reminder_enabled || ! $this->starts_at) {
            return null;
        }

        $minutes = max(0, (int) $this->remind_minutes_before);

        return $this->starts_at->copy()->subMinutes($minutes);
    }

    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'notes' => $this->notes ?? '',
            'location' => $this->location ?? '',
            'startsAt' => $this->starts_at?->toIso8601String(),
            'endsAt' => $this->ends_at?->toIso8601String(),
            'day' => $this->starts_at?->toDateString(),
            'attendeeName' => $this->attendee_name ?? '',
            'attendeeEmail' => $this->attendee_email ?? '',
            'reminderEnabled' => (bool) $this->reminder_enabled,
            'remindMinutesBefore' => (int) $this->remind_minutes_before,
            'remindAt' => $this->remind_at?->toIso8601String(),
            'reminderSentAt' => $this->reminder_sent_at?->toIso8601String(),
            'createdBy' => $this->creator ? [
                'id' => $this->creator->id,
                'fullName' => $this->creator->full_name,
                'email' => $this->creator->email,
            ] : null,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
