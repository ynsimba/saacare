import { useCallback, useEffect, useState } from "react";
import {
  Navigation,
  MapPin,
  Phone,
  CalendarDays,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Seo from "../../lib/Seo";
import Button from "../../components/ui/Button";
import TripStatusPanel from "../../components/tracking/TripStatusPanel";
import { useProviderTripTracking } from "../../components/tracking/ProviderTripTracking";
import { GPS_ACTIVE, GPS_ERROR, GPS_REQUESTING } from "../../hooks/useGeolocationTracker";
import { api } from "../../lib/api";
import { formatFreshness } from "../../lib/tripFormat";
import { SkeletonList } from "../../components/ui/Skeleton";

/**
 * Missions du prestataire et suivi de trajet (§7).
 *
 * Dès qu’un trajet est actif, le GPS démarre automatiquement (et reste actif
 * dans tout l’espace prestataire) pour le suivi temps réel côté client / admin.
 */

const ORDER_STATUS = {
  nouvelle: { label: "Nouvelle", className: "bg-gold-100 text-gold-800" },
  proposee: { label: "À accepter", className: "bg-gold-100 text-gold-800" },
  confirmee: { label: "Confirmée", className: "bg-sky/80 text-navy-800" },
  programmee: { label: "Programmée", className: "bg-sky/80 text-navy-800" },
  en_cours: { label: "En cours", className: "bg-teal-50 text-teal-800" },
  terminee: { label: "Terminée", className: "bg-ink-900/10 text-ink-900" },
  annulee: { label: "Annulée", className: "bg-coral-100 text-coral-800" },
};

export default function PrestataireMissions() {
  const tracking = useProviderTripTracking();
  const gps = tracking?.gps;
  const { setActiveOrder, syncActiveTrip, sendError, setSendError, refreshGps, lastTrackingItem } = tracking || {};

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const activeOrderId = tracking?.activeOrderId ?? items.find((m) => m.trip?.isActive)?.order?.id ?? null;

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      try {
        const data = await api.prestataireMissions();
        const list = data.items || [];
        setItems(list);
        setError("");
        const active = list.find((m) => m.trip?.isActive);
        if (active?.order?.id) setActiveOrder?.(active.order.id);
        return list;
      } catch (err) {
        setError(err.message || "Impossible de charger vos missions.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [setActiveOrder],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onResponse = () => load({ silent: true });
    window.addEventListener("saacare:mission-response", onResponse);
    return () => window.removeEventListener("saacare:mission-response", onResponse);
  }, [load]);

  // Met à jour le panneau trajet dès qu’une position est transmise.
  useEffect(() => {
    if (!lastTrackingItem?.orderId || !lastTrackingItem?.item) return;
    setItems((list) =>
      list.map((m) =>
        m.order?.id === lastTrackingItem.orderId
          ? { ...m, trip: lastTrackingItem.item.trip ?? m.trip }
          : m,
      ),
    );
  }, [lastTrackingItem]);

  const startTrip = async (orderId) => {
    setBusy(orderId);
    setSendError?.("");
    try {
      const data = await api.startTrip(orderId);
      setItems((list) => list.map((m) => (m.order?.id === orderId ? data.item : m)));
      setActiveOrder?.(orderId);
    } catch (err) {
      setError(err.message || "Le trajet n’a pas pu démarrer.");
    } finally {
      setBusy(null);
    }
  };

  const arrive = async (orderId) => {
    setBusy(orderId);
    try {
      setActiveOrder?.(null);
      const data = await api.tripArrived(orderId);
      setItems((list) => list.map((m) => (m.order?.id === orderId ? data.item : m)));
      setSendError?.("");
      await syncActiveTrip?.();
    } catch (err) {
      setError(err.message || "L’arrivée n’a pas pu être enregistrée.");
      await syncActiveTrip?.();
    } finally {
      setBusy(null);
    }
  };

  const cancelTrip = async (orderId) => {
    setBusy(orderId);
    try {
      setActiveOrder?.(null);
      await api.cancelTrip(orderId);
      await load({ silent: true });
      await syncActiveTrip?.();
    } catch (err) {
      setError(err.message || "Le trajet n’a pas pu être interrompu.");
    } finally {
      setBusy(null);
    }
  };

  const acceptOffer = async (orderId) => {
    setBusy(orderId);
    try {
      await api.acceptMission(orderId);
      await load({ silent: true });
    } catch (err) {
      setError(err.message || "Impossible d’accepter cette course.");
    } finally {
      setBusy(null);
    }
  };

  const refuseOffer = async (orderId) => {
    setBusy(orderId);
    try {
      await api.refuseMission(orderId);
      await load({ silent: true });
    } catch (err) {
      setError(err.message || "Impossible de refuser cette course.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Seo title="Missions" path="/prestataire/missions" noindex />

      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Espace prestataire</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-ink-900">Mes missions</h1>
            <p className="mt-2 text-sm text-ink-900/60">
              Pendant un trajet, votre position est partagée en continu pour le suivi en temps réel.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => load({ silent: true })}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Actualiser
          </Button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <SkeletonList rows={3} className="mt-6" label="Chargement de vos missions" />
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {items.map((mission) => (
              <MissionCard
                key={mission.order.id}
                mission={mission}
                gps={gps}
                busy={busy === mission.order.id}
                blocked={Boolean(activeOrderId) && activeOrderId !== mission.order.id}
                sendError={sendError}
                onStart={() => startTrip(mission.order.id)}
                onArrive={() => arrive(mission.order.id)}
                onCancel={() => cancelTrip(mission.order.id)}
                onAccept={() => acceptOffer(mission.order.id)}
                onRefuse={() => refuseOffer(mission.order.id)}
                onRetryGps={refreshGps}
              />
            ))}
            {!items.length && !error && (
              <li className="rounded-xl border border-dashed border-ink-900/15 px-4 py-10 text-center text-sm text-ink-900/50">
                Aucune mission ne vous est affectée pour le moment.
              </li>
            )}
          </ul>
        )}
      </div>
    </>
  );
}

function MissionCard({ mission, gps, busy, blocked, sendError, onStart, onArrive, onCancel, onAccept, onRefuse, onRetryGps }) {
  const { order, destination, trip, client, need, desiredDate, trackingAllowed, needsResponse, amount } = mission;
  const status = ORDER_STATUS[order.status] ?? { label: order.status, className: "bg-paper-200 text-ink-900" };
  const isActive = Boolean(trip?.isActive);
  const arrived = trip?.status === "arrive";
  const awaitingResponse = Boolean(needsResponse) || order.status === "proposee";

  const mapsQuery = destination.isGeolocated
    ? `${destination.latitude},${destination.longitude}`
    : [destination.address, destination.commune, "Kinshasa"].filter(Boolean).join(", ");

  return (
    <li className="rounded-xl border border-ink-900/8 bg-paper-100/50 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold text-teal-700">{order.reference}</p>
          <p className="mt-1 font-display text-base font-bold text-ink-900">
            {order.metier || order.domain} · {order.commune}
          </p>
          {need && <p className="mt-1 text-sm text-ink-900/65">{need}</p>}

          <dl className="mt-3 flex flex-col gap-1.5 text-sm text-ink-900/75">
            <div className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-teal-600" aria-hidden="true" />
              <dt className="sr-only">Adresse</dt>
              <dd>
                {destination.address || `Commune de ${destination.commune}`}
                {!destination.isGeolocated && (
                  <span className="ml-1 text-xs text-ink-900/50">(coordonnées non fournies par le client)</span>
                )}
              </dd>
            </div>
            {client?.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="size-4 shrink-0 text-teal-600" aria-hidden="true" />
                <dt className="sr-only">Téléphone du client</dt>
                <dd>
                  <a href={`tel:${client.phone}`} className="font-medium text-teal-700 hover:underline">
                    {client.phone}
                  </a>
                  {client.fullName && <span className="text-ink-900/60"> · {client.fullName}</span>}
                </dd>
              </div>
            )}
            {desiredDate && (
              <div className="flex items-center gap-1.5">
                <CalendarDays className="size-4 shrink-0 text-teal-600" aria-hidden="true" />
                <dt className="sr-only">Date souhaitée</dt>
                <dd>{new Date(desiredDate).toLocaleDateString("fr-FR", { dateStyle: "long" })}</dd>
              </div>
            )}
          </dl>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery)}`}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:underline"
          >
            Ouvrir l’itinéraire
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </div>

        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${status.className}`}>
          {status.label}
        </span>
      </div>

      {(isActive || arrived) && <TripStatusPanel trip={trip} className="mt-4" />}

      {isActive && gps && (
        <div className="mt-3 rounded-xl border border-ink-900/8 bg-white px-4 py-3">
          <p className="flex items-center gap-2 font-display text-sm font-bold text-ink-900">
            <ShieldCheck className="size-4 text-teal-600" aria-hidden="true" />
            Géolocalisation active
          </p>
          <p className="mt-1 text-sm text-ink-900/70">
            Votre position est transmise en continu. Le client et SaaCare voient vos mouvements en temps réel.
          </p>

          <p className="mt-3 flex items-start gap-2 rounded-lg bg-gold-100/60 px-3 py-2 text-sm text-ink-900">
            <Smartphone className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden="true" />
            Gardez SaaCare ouvert (ou en arrière-plan autorisé) pour un suivi fluide pendant le trajet.
          </p>

          <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-wide text-ink-900/45">État GPS</dt>
              <dd className={gps.state === GPS_ACTIVE ? "font-semibold text-teal-700" : "text-ink-900/70"}>
                {gps.state === GPS_ACTIVE && "Position acquise"}
                {gps.state === GPS_REQUESTING && "Recherche du signal…"}
                {gps.state === GPS_ERROR && "Erreur GPS"}
                {gps.state === "idle" && "Activation…"}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-wide text-ink-900/45">Précision</dt>
              <dd className="text-ink-900/70">
                {gps.position?.accuracy != null ? `± ${Math.round(gps.position.accuracy)} m` : "—"}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-wide text-ink-900/45">Dernière transmission</dt>
              <dd className="text-ink-900/70">
                {gps.sentAt ? formatFreshness(gps.sentAt).replace("Position mise à jour ", "") : "—"}
              </dd>
            </div>
          </dl>

          {gps.error && (
            <div className="mt-3 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2" role="alert">
              <p className="flex items-start gap-2 text-sm text-coral-800">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  {gps.error.message}
                  {gps.error.hint && <span className="mt-0.5 block text-xs opacity-85">{gps.error.hint}</span>}
                </span>
              </p>
              <Button type="button" size="sm" variant="outline" className="mt-2" onClick={onRetryGps || gps.retry}>
                Réessayer
              </Button>
            </div>
          )}

          {sendError && (
            <p className="mt-3 rounded-lg border border-gold-500/30 bg-gold-100/60 px-3 py-2 text-sm text-ink-900" role="status">
              {sendError}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {awaitingResponse && (
          <>
            <Button type="button" disabled={busy} onClick={onAccept} withArrow={false}>
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Accepter{amount ? ` · ${new Intl.NumberFormat("fr-CD", { style: "currency", currency: "CDF", maximumFractionDigits: 0 }).format(amount)}` : ""}
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onRefuse}>
              Refuser
            </Button>
          </>
        )}
        {!awaitingResponse && !isActive && !arrived && trackingAllowed && (
          <Button type="button" disabled={busy || blocked} onClick={onStart} withArrow>
            <Navigation className="size-4" aria-hidden="true" />
            Je me rends chez le client
          </Button>
        )}
        {isActive && (
          <>
            <Button type="button" disabled={busy} onClick={onArrive}>
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Je suis arrivé
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onCancel}>
              Interrompre le trajet
            </Button>
          </>
        )}
        {arrived && (
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Arrivée enregistrée — le partage de position est arrêté.
          </p>
        )}
        {blocked && !isActive && !arrived && !awaitingResponse && (
          <p className="text-sm text-ink-900/55">Terminez d’abord le trajet en cours sur une autre mission.</p>
        )}
        {!awaitingResponse && !trackingAllowed && !arrived && (
          <p className="text-sm text-ink-900/55">Le suivi s’activera dès que SaaCare aura confirmé cette mission.</p>
        )}
      </div>
    </li>
  );
}
