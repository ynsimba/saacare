<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Suivi GPS du trajet d'un prestataire vers le client (cahier des charges §4.4).
 *
 * Deux tables volontairement séparées :
 *   - order_trips       : un trajet par mission, avec la DERNIÈRE position connue.
 *   - order_trip_points : historique court, élagué en continu (config tracking.max_points).
 *
 * Aucune position n'est conservée en dehors d'un trajet : pas de suivi permanent.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Point d'intervention de la mission — le prestataire doit pouvoir s'y rendre.
        Schema::table('orders', function (Blueprint $table) {
            $table->string('address')->nullable()->after('commune');
            $table->decimal('latitude', 10, 7)->nullable()->after('address');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
        });

        Schema::create('order_trips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('provider_profile_id')->constrained()->cascadeOnDelete();
            $table->string('status', 16)->default('en_route'); // en_route|arrive|annule
            $table->timestamp('started_at')->nullable();
            $table->timestamp('arrived_at')->nullable();
            $table->timestamp('ended_at')->nullable();

            // Dernière position connue (écrasée à chaque envoi)
            $table->decimal('last_latitude', 10, 7)->nullable();
            $table->decimal('last_longitude', 10, 7)->nullable();
            $table->unsignedSmallInteger('last_accuracy')->nullable(); // mètres
            $table->unsignedSmallInteger('last_heading')->nullable();  // degrés
            $table->decimal('last_speed', 6, 2)->nullable();           // m/s
            $table->timestamp('last_position_at')->nullable();
            $table->unsignedInteger('points_count')->default(0);

            // Itinéraire mis en cache : jamais recalculé à chaque position reçue
            $table->unsignedInteger('distance_meters')->nullable();
            $table->unsignedInteger('eta_seconds')->nullable();
            $table->string('route_source', 16)->nullable(); // google|estimation
            $table->decimal('route_from_latitude', 10, 7)->nullable();
            $table->decimal('route_from_longitude', 10, 7)->nullable();
            $table->timestamp('route_computed_at')->nullable();

            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index(['status', 'last_position_at']);
        });

        Schema::create('order_trip_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_trip_id')->constrained()->cascadeOnDelete();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->unsignedSmallInteger('accuracy')->nullable();
            $table->unsignedSmallInteger('heading')->nullable();
            $table->decimal('speed', 6, 2)->nullable();
            $table->timestamp('recorded_at');

            $table->index(['order_trip_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_trip_points');
        Schema::dropIfExists('order_trips');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['address', 'latitude', 'longitude']);
        });
    }
};
