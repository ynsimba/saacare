<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $query = Appointment::with('creator')->orderBy('starts_at');

        if (! empty($data['from'])) {
            $query->where('starts_at', '>=', Carbon::parse($data['from'])->startOfDay());
        }
        if (! empty($data['to'])) {
            $query->where('starts_at', '<=', Carbon::parse($data['to'])->endOfDay());
        }

        $items = $query->limit(500)->get()->map(fn (Appointment $a) => $a->toAdminArray());

        return response()->json(['items' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'location' => ['nullable', 'string', 'max:255'],
            'startsAt' => ['required', 'date'],
            'endsAt' => ['nullable', 'date', 'after:startsAt'],
            'attendeeName' => ['nullable', 'string', 'max:255'],
            'attendeeEmail' => ['nullable', 'email', 'max:255'],
            'reminderEnabled' => ['sometimes', 'boolean'],
            'remindMinutesBefore' => ['sometimes', 'integer', 'min:0', 'max:10080'],
        ]);

        $appointment = new Appointment([
            'created_by' => $request->user()->id,
            'title' => $data['title'],
            'notes' => $data['notes'] ?? null,
            'location' => $data['location'] ?? '',
            'starts_at' => Carbon::parse($data['startsAt']),
            'ends_at' => isset($data['endsAt']) ? Carbon::parse($data['endsAt']) : null,
            'attendee_name' => $data['attendeeName'] ?? '',
            'attendee_email' => $data['attendeeEmail'] ?? '',
            'reminder_enabled' => $data['reminderEnabled'] ?? true,
            'remind_minutes_before' => $data['remindMinutesBefore'] ?? 60,
        ]);
        $appointment->remind_at = $appointment->computeRemindAt();
        $appointment->save();
        $appointment->load('creator');

        return response()->json(['item' => $appointment->toAdminArray()], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        return response()->json(['ok' => true]);
    }
}
