<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Hygiène des données de suivi GPS : trajets abandonnés et positions obsolètes.
Schedule::command('saacare:purge-trips')->hourly();

// Rappels e-mail des rendez-vous admin (agenda).
Schedule::command('saacare:send-appointment-reminders')->everyFiveMinutes();
