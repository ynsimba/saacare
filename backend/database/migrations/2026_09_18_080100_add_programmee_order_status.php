<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Documente / normalise le statut « programmée » des réservations.
 * Les commandes confirmées avec date souhaitée passent en `programmee`.
 */
return new class extends Migration
{
    public function up(): void
    {
        // nouvelle | confirmee | programmee | en_cours | terminee | annulee
        DB::table('orders')
            ->where('status', 'confirmee')
            ->whereNotNull('desired_date')
            ->update(['status' => 'programmee']);
    }

    public function down(): void
    {
        DB::table('orders')
            ->where('status', 'programmee')
            ->update(['status' => 'confirmee']);
    }
};
