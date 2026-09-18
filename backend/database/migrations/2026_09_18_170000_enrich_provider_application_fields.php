<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('provider_profiles', function (Blueprint $table) {
            $table->string('last_name')->default('');
            $table->string('middle_name')->default('');
            $table->string('first_name')->default('');
            $table->string('marital_status', 32)->default('');
            $table->string('birth_place')->default('');
            $table->date('birth_date')->nullable();
            $table->string('religion', 64)->default('');
            $table->string('id_type', 32)->default('');
            $table->date('id_issued_at')->nullable();
            $table->date('id_expires_at')->nullable();
            $table->string('emergency_name')->default('');
            $table->string('emergency_phone', 50)->default('');
            $table->string('emergency_relation', 32)->default('');
            $table->json('application_documents')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('provider_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'last_name',
                'middle_name',
                'first_name',
                'marital_status',
                'birth_place',
                'birth_date',
                'religion',
                'id_type',
                'id_issued_at',
                'id_expires_at',
                'emergency_name',
                'emergency_phone',
                'emergency_relation',
                'application_documents',
            ]);
        });
    }
};
