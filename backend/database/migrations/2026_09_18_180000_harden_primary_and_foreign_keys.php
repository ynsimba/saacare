<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Durcit l’intégrité référentielle :
 *  - FK manquante sessions.user_id → users.id
 *  - index métier pour les requêtes prestataire / statut
 *  - nettoyage des orphelins éventuels avant contrainte
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('sessions') && Schema::hasTable('users')) {
            DB::table('sessions')
                ->whereNotNull('user_id')
                ->whereNotIn('user_id', DB::table('users')->select('id'))
                ->update(['user_id' => null]);

            if (! $this->hasForeignKey('sessions', 'user_id')) {
                Schema::table('sessions', function (Blueprint $table) {
                    $table->foreign('user_id')
                        ->references('id')
                        ->on('users')
                        ->nullOnDelete();
                });
            }
        }

        if (Schema::hasTable('orders') && ! $this->hasIndex('orders', 'orders_provider_profile_id_status_index')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->index(['provider_profile_id', 'status'], 'orders_provider_profile_id_status_index');
            });
        }

        if (Schema::hasTable('order_trips') && ! $this->hasIndex('order_trips', 'order_trips_provider_profile_id_status_index')) {
            Schema::table('order_trips', function (Blueprint $table) {
                $table->index(['provider_profile_id', 'status'], 'order_trips_provider_profile_id_status_index');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('sessions') && $this->hasForeignKey('sessions', 'user_id')) {
            Schema::table('sessions', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        }

        if (Schema::hasTable('orders') && $this->hasIndex('orders', 'orders_provider_profile_id_status_index')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropIndex('orders_provider_profile_id_status_index');
            });
        }

        if (Schema::hasTable('order_trips') && $this->hasIndex('order_trips', 'order_trips_provider_profile_id_status_index')) {
            Schema::table('order_trips', function (Blueprint $table) {
                $table->dropIndex('order_trips_provider_profile_id_status_index');
            });
        }
    }

    private function hasForeignKey(string $table, string $column): bool
    {
        return collect(DB::select(
            'SELECT CONSTRAINT_NAME
             FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = ?
               AND REFERENCED_TABLE_NAME IS NOT NULL',
            [$table, $column]
        ))->isNotEmpty();
    }

    private function hasIndex(string $table, string $indexName): bool
    {
        return collect(DB::select("SHOW INDEX FROM `{$table}`"))
            ->pluck('Key_name')
            ->contains($indexName);
    }
};
