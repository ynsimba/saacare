<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('notes')->nullable();
            $table->string('location')->default('');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->string('attendee_name')->default('');
            $table->string('attendee_email')->default('');
            $table->boolean('reminder_enabled')->default(true);
            $table->unsignedInteger('remind_minutes_before')->default(60);
            $table->timestamp('remind_at')->nullable();
            $table->timestamp('reminder_sent_at')->nullable();
            $table->timestamps();

            $table->index(['starts_at']);
            $table->index(['remind_at', 'reminder_sent_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
