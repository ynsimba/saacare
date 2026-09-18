<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('provider_profiles', function (Blueprint $table) {
            $table->string('reference', 32)->nullable()->unique()->after('user_id');
            $table->string('seal', 32)->nullable()->unique()->after('reference');
            $table->string('initials', 8)->default('')->after('metier');
            $table->string('gender', 8)->default('')->after('initials');
            $table->string('level', 32)->default('Vérifié')->after('gender');
            $table->decimal('rating', 3, 1)->default(0)->after('level');
            $table->unsignedInteger('reviews')->default(0)->after('rating');
            $table->unsignedInteger('experience')->default(0)->after('reviews');
            $table->json('languages')->nullable()->after('experience');
            $table->json('price')->nullable()->after('languages');
            $table->string('availability', 32)->default('planning')->after('price');
            $table->json('slots')->nullable()->after('availability');
            $table->json('licence')->nullable()->after('slots');
            $table->json('skills')->nullable()->after('licence');
            $table->json('trainings')->nullable()->after('skills');
            $table->unsignedInteger('missions')->default(0)->after('trainings');
            $table->unsignedInteger('hours')->default(0)->after('missions');
            $table->string('since', 16)->default('')->after('hours');
            $table->string('verified_at', 16)->default('')->after('since');
            $table->string('next_check', 16)->default('')->after('verified_at');
            $table->json('reviews_list')->nullable()->after('next_check');
            $table->index('domain');
        });
    }

    public function down(): void
    {
        Schema::table('provider_profiles', function (Blueprint $table) {
            $table->dropIndex(['domain']);
            $table->dropColumn([
                'reference',
                'seal',
                'initials',
                'gender',
                'level',
                'rating',
                'reviews',
                'experience',
                'languages',
                'price',
                'availability',
                'slots',
                'licence',
                'skills',
                'trainings',
                'missions',
                'hours',
                'since',
                'verified_at',
                'next_check',
                'reviews_list',
            ]);
        });
    }
};
