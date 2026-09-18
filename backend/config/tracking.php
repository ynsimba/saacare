<?php

/**
 * Suivi GPS des trajets prestataire → client.
 *
 * Tous les seuils sont réglables sans toucher au code : ils protègent MySQL,
 * l'API Google et la batterie du prestataire.
 */
return [
    // Statuts de mission (orders.status) autorisant un trajet suivi.
    'trackable_order_statuses' => ['confirmee', 'programmee', 'en_cours'],

    // Statut appliqué à la mission quand le prestataire déclare son arrivée.
    'status_on_arrival' => 'en_cours',

    // Intervalle minimum entre deux positions ENREGISTRÉES (secondes).
    'min_interval' => (int) env('TRACKING_MIN_INTERVAL', 8),

    // …sauf si le prestataire a bougé d'au moins X mètres depuis le dernier point.
    'min_distance' => (int) env('TRACKING_MIN_DISTANCE', 25),

    // Précision GPS au-delà de laquelle la position est ignorée (mètres).
    'max_accuracy' => (int) env('TRACKING_MAX_ACCURACY', 250),

    // Au-delà de ce délai sans position, l'interface parle de « dernière position connue ».
    'stale_after' => (int) env('TRACKING_STALE_AFTER', 60),

    // Trajet abandonné : clôturé automatiquement par la commande de purge.
    'abandon_after_minutes' => (int) env('TRACKING_ABANDON_AFTER', 180),

    // Historique conservé par trajet (points les plus anciens supprimés au fil de l'eau).
    'max_points' => (int) env('TRACKING_MAX_POINTS', 120),

    // Purge des points GPS des trajets terminés depuis X jours (0 = purge immédiate).
    'retain_points_days' => (int) env('TRACKING_RETAIN_POINTS_DAYS', 2),

    'route' => [
        // Itinéraire recalculé au plus une fois toutes les X secondes…
        'refresh_interval' => (int) env('TRACKING_ROUTE_REFRESH', 45),
        // …ou si le prestataire s'est déplacé d'au moins X mètres depuis le dernier calcul.
        'refresh_distance' => (int) env('TRACKING_ROUTE_DISTANCE', 300),
        // Vitesse moyenne retenue pour l'estimation de secours (km/h, trafic de Kinshasa).
        'fallback_speed_kmh' => (float) env('TRACKING_FALLBACK_SPEED', 18),
        'timeout' => (int) env('TRACKING_ROUTE_TIMEOUT', 6),
    ],
];
