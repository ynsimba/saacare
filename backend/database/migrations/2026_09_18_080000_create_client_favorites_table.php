<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Favoris client : prestataires (référence) et services / pôles (slug).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 16); // provider | service
            $table->string('target', 64); // référence prestataire ou slug de pôle
            $table->timestamps();

            $table->unique(['user_id', 'type', 'target']);
            $table->index(['user_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_favorites');
    }
};
