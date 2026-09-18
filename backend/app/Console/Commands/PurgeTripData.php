<?php

namespace App\Console\Commands;

use App\Events\TripStatusChanged;
use App\Models\OrderTrip;
use App\Models\OrderTripPoint;
use Illuminate\Console\Command;

/**
 * Conservation minimale des données GPS (§13) :
 *   - clôture les trajets manifestement abandonnés (PWA fermée, jamais « arrivé ») ;
 *   - supprime l'historique des positions des trajets terminés.
 *
 * La dernière position d'un trajet clos reste consultable le temps de la rétention,
 * puis disparaît : aucun historique GPS permanent n'est conservé.
 */
class PurgeTripData extends Command
{
    protected $signature = 'saacare:purge-trips {--dry-run : Afficher sans rien supprimer}';

    protected $description = 'Clôture les trajets abandonnés et purge les positions GPS obsolètes.';

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');

        $abandonAfter = (int) config('tracking.abandon_after_minutes', 180);
        $stale = OrderTrip::with('order')
            ->where('status', OrderTrip::STATUS_EN_ROUTE)
            ->where('started_at', '<', now()->subMinutes($abandonAfter))
            ->get();

        foreach ($stale as $trip) {
            $this->line("Trajet #{$trip->id} (mission {$trip->order_id}) abandonné → clôturé.");
            if ($dry) {
                continue;
            }
            $trip->forceFill([
                'status' => OrderTrip::STATUS_ANNULE,
                'ended_at' => now(),
            ])->save();

            if ($trip->order) {
                TripStatusChanged::dispatch($trip->order, $trip);
            }
        }

        $retainDays = (int) config('tracking.retain_points_days', 2);
        $closed = OrderTrip::whereIn('status', [OrderTrip::STATUS_ARRIVE, OrderTrip::STATUS_ANNULE])
            ->where('ended_at', '<', now()->subDays($retainDays))
            ->where('points_count', '>', 0)
            ->pluck('id');

        $deleted = 0;
        if ($closed->isNotEmpty() && ! $dry) {
            $deleted = OrderTripPoint::whereIn('order_trip_id', $closed)->delete();
            OrderTrip::whereIn('id', $closed)->update(['points_count' => 0]);
        }

        $this->info(sprintf(
            '%d trajet(s) clôturé(s), %d position(s) purgée(s)%s.',
            $stale->count(),
            $deleted,
            $dry ? ' [simulation]' : '',
        ));

        return self::SUCCESS;
    }
}
