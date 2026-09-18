<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_tariffs', function (Blueprint $table) {
            $table->id();
            $table->string('domain', 64);
            $table->string('service_name');
            $table->string('unit', 32)->default('forfait');
            $table->string('unit_label')->default('');
            $table->string('duration_label')->default('');
            $table->unsignedInteger('amount_min')->default(0);
            $table->unsignedInteger('amount_max')->nullable();
            $table->string('currency', 8)->default('CDF');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['domain', 'is_active']);
            $table->index(['domain', 'service_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_tariffs');
    }
};
