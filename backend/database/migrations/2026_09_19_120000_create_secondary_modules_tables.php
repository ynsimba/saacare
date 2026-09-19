<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('service');
            $table->string('commune');
            $table->string('frequency')->default('');
            $table->date('desired_date')->nullable();
            $table->date('due_date')->nullable();
            $table->string('first_name');
            $table->string('phone');
            $table->string('email');
            $table->text('address')->nullable();
            $table->text('need');
            $table->string('provider_reference')->nullable();
            $table->string('status', 32)->default('nouvelle');
            $table->string('source', 32)->default('web');
            $table->timestamps();

            $table->index('status');
            $table->index('created_at');
        });

        Schema::create('quote_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('company');
            $table->string('contact_name');
            $table->string('email');
            $table->string('phone');
            $table->string('need_type');
            $table->string('duration')->default('');
            $table->string('location')->default('');
            $table->date('start_date')->nullable();
            $table->text('message')->nullable();
            $table->json('positions')->nullable();
            $table->string('status', 32)->default('nouvelle');
            $table->timestamps();

            $table->index('status');
            $table->index('created_at');
        });

        Schema::create('provider_availability_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_profile_id')->constrained('provider_profiles')->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday'); // 0=dimanche … 6=samedi
            $table->string('start_time', 5);
            $table->string('end_time', 5);
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->unique(
                ['provider_profile_id', 'weekday', 'start_time', 'end_time'],
                'provider_availability_unique'
            );
        });

        Schema::create('provider_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_profile_id')->constrained('provider_profiles')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedTinyInteger('rating'); // 1–5
            $table->text('body')->nullable();
            $table->string('author_name')->default('');
            $table->string('status', 32)->default('published');
            $table->timestamps();

            $table->index(['provider_profile_id', 'status']);
            $table->unique('order_id');
        });

        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        $now = now();
        DB::table('platform_settings')->insert([
            ['key' => 'mobile_money_number', 'value' => '+243816483538', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'support_email', 'value' => 'hello@saacare.com', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'support_phone', 'value' => '+243 816 483 538', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'company_name', 'value' => 'SaaCare', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
        Schema::dropIfExists('provider_reviews');
        Schema::dropIfExists('provider_availability_slots');
        Schema::dropIfExists('quote_requests');
        Schema::dropIfExists('service_requests');
    }
};
