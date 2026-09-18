import { useEffect, useState } from "react";
import { Route, Clock, Radio, WifiOff, CheckCircle2, XCircle } from "lucide-react";
import { formatDistance, formatEta, formatArrivalClock, formatFreshness, tripPresentation } from "../../lib/tripFormat";

/**
 * Bandeau d'état du suivi, partagé par le client, le prestataire et l'admin.
 * La fraîcheur se recalcule chaque seconde : le client voit vieillir la donnée
 * plutôt que de croire à tort qu'elle est en direct (§9).
 */

const TONES = {
  live: { className: "border-teal-600/25 bg-teal-50 text-teal-800", icon: Radio },
  waiting: { className: "border-gold-500/25 bg-gold-100/60 text-gold-800", icon: Clock },
  stale: { className: "border-gold-500/40 bg-gold-100 text-gold-800", icon: WifiOff },
  done: { className: "border-teal-600/25 bg-teal-50 text-teal-800", icon: CheckCircle2 },
  cancelled: { className: "border-ink-900/10 bg-paper-200 text-ink-900", icon: XCircle },
  idle: { className: "border-ink-900/10 bg-paper-200 text-ink-900", icon: Clock },
};

export default function TripStatusPanel({ trip, showRoute = true, className = "" }) {
  const [, tick] = useState(0);

  // Fait vieillir l'horodatage à l'écran, sans rappeler le serveur.
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const presentation = tripPresentation(trip);
  const tone = TONES[presentation.tone] ?? TONES.idle;
  const Icon = tone.icon;
  const arrival = formatArrivalClock(trip?.route?.etaSeconds);

  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${tone.className} ${className}`}>
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold">{presentation.title}</p>
          {presentation.detail && <p className="mt-0.5 text-sm opacity-85">{presentation.detail}</p>}

          {showRoute && trip?.route && trip.status === "en_route" && (
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              <div className="inline-flex items-center gap-1.5">
                <Route className="size-4 opacity-70" aria-hidden="true" />
                <dt className="sr-only">Distance restante</dt>
                <dd className="text-sm font-semibold">{formatDistance(trip.route.distanceMeters)}</dd>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Clock className="size-4 opacity-70" aria-hidden="true" />
                <dt className="sr-only">Arrivée estimée</dt>
                <dd className="text-sm font-semibold">
                  {formatEta(trip.route.etaSeconds)}
                  {arrival && <span className="font-normal opacity-75"> (vers {arrival})</span>}
                </dd>
              </div>
            </dl>
          )}

          <p className="mt-2 text-xs opacity-75" aria-live="polite">
            {formatFreshness(trip?.position?.recordedAt)}
            {trip?.route?.source === "estimation" && trip.status === "en_route" && (
              <span> · distance et durée estimées</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
