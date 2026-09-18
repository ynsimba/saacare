<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('provider_profile_id')->nullable()->constrained('provider_profiles')->nullOnDelete();
            $table->string('domain')->default('');
            $table->string('metier')->default('');
            $table->string('commune')->default('');
            $table->string('frequency')->default('');
            $table->date('desired_date')->nullable();
            $table->text('need')->nullable();
            $table->string('status', 32)->default('nouvelle'); // nouvelle|confirmee|programmee|en_cours|terminee|annulee
            $table->unsignedInteger('amount')->default(0); // CDF, 0 = sur devis
            $table->timestamps();

            $table->index(['client_id', 'status']);
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->unsignedInteger('amount')->default(0);
            $table->string('method', 32)->default('mobile_money'); // mobile_money|cash|bank
            $table->string('status', 32)->default('en_attente'); // en_attente|paye|echoue|rembourse
            $table->string('note')->default('');
            $table->timestamps();

            $table->index(['client_id', 'status']);
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('thread', 64)->default('support'); // support | order:{id}
            $table->text('body');
            $table->boolean('from_staff')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'thread']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('type', 32)->default('info');
            $table->string('link')->default('');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('orders');
    }
};
