import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarDays, MapPin, Navigation, X } from "lucide-react";
import Seo from "../../lib/Seo";
import Button from "../../components/ui/Button";
import TripMap from "../../components/tracking/TripMap";
import TripStatusPanel from "../../components/tracking/TripStatusPanel";
import { api } from "../../lib/api";
import { subscribeToMission } from "../../lib/realtime";
import { formatEta, tripPresentation } from "../../lib/tripFormat";

/** Filtres métier — mappés sur les statuts API. */
const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "en_attente", label: "En attente", statuses: ["nouvelle"] },
  { key: "confirmees", label: "Confirmées", statuses: ["confirmee"] },
  { key: "programmees", label: "Programmées", statuses: ["programmee"] },
  { key: "en_cours", label: "En cours", statuses: ["en_cours"] },
  { key: "terminees", label: "Terminées", statuses: ["terminee"] },
  { key: "annulees", label: "Annulées", statuses: ["annulee"] },
];

const STATUS_LABEL = {
  nouvelle: "En attente",
  confirmee: "Confirmée",
  programmee: "Programmée",
  en_cours: "En cours",
  terminee: "Terminée",
  annulee: "Annulée",
};

const STATUS_STYLE = {
  nouvelle: "bg-gold-100 text-gold-800",
  confirmee: "bg-sky/80 text-navy-800",
  programmee: "bg-teal-50 text-teal-800",
  en_cours: "bg-teal-50 text-teal-800",
  terminee: "bg-ink-900/10 text-ink-900",
  annulee: "bg-coral-100 text-coral-800",
};

function matchesFilter(order, filter) {
  if (!filter || filter.key === "all") return true;
  if (filter.key === "en_cours") {
    return order.status === "en_cours" || Boolean(order.trip?.isActive);
  }
  return (filter.statuses || []).includes(order.status);
}

/** Carte live intégrée : position du prestataire jusqu’à son arrivée. */
function InlineLiveTrack({ orderId, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const channel = useRef(null);
  const fetcher = useCallback(() => api.orderTracking(orderId), [orderId]);

  useEffect(() => {
    let cancelled = false;
    channel.current = subscribeToMission({
      orderId: Number(orderId),
      fetcher,
      onUpdate: (payload) => {
        if (cancelled) return;
        setData(payload.item);
        setError("");
      },
      onStatus: ({ connected, error: err }) => {
        if (cancelled) return;
        if (!connected && err?.status === 404) setError("Suivi introuvable.");
      },
    });
    return () => {
      cancelled = true;
      channel.current?.close();
    };
  }, [fetcher, orderId]);

  if (error) {
    return (
      <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
        {error}
      </p>
    );
  }

  if (!data) {
    return <p className="mt-4 text-sm text-ink-900/55">Chargement de la carte…</p>;
  }

  const { trip, destination, path = [] } = data;
  const arrived = trip?.status === "arrive";

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-teal-600/20 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-ink-900/8 px-3 py-2.5">
        <p className="text-sm font-semibold text-teal-800">
          {arrived ? "Prestataire arrivé" : "Suivi en direct jusqu’à l’arrivée"}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="grid size-8 place-items-center rounded-lg text-ink-900/45 hover:bg-paper-200 hover:text-ink-900"
          aria-label="Fermer la carte"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="p-3">
        <TripStatusPanel trip={trip} className="!rounded-xl" />
      </div>
      {trip?.position || destination?.isGeolocated ? (
        <TripMap
          position={trip?.position}
          destination={destination}
          path={path}
          className="h-64 w-full sm:h-80"
        />
      ) : (
        <div className="px-4 py-10 text-center">
          <MapPin className="mx-auto size-7 text-navy-500" aria-hidden="true" />
          <p className="mt-2 text-sm text-ink-900/65">En attente de la première position GPS du prestataire.</p>
        </div>
      )}
      <div className="border-t border-ink-900/8 px-3 py-2.5">
        <Button to={`/client/commandes/${orderId}/suivi`} size="sm" variant="outline" className="w-full sm:w-fit">
          Ouvrir le suivi plein écran
        </Button>
      </div>
    </div>
  );
}

export default function ClientReservations() {
  const [params, setParams] = useSearchParams();
  const activeKey = params.get("statut") || "all";
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [trackingId, setTrackingId] = useState(null);

  const load = () =>
    api
      .clientOrders()
      .then((d) => setItems(d.items || []))
      .catch((err) => setError(err.message || "Chargement impossible."));

  useEffect(() => {
    load();
  }, []);

  // Rafraîchir la liste pendant qu’un trajet actif est ouvert.
  useEffect(() => {
    if (!trackingId) return undefined;
    const id = setInterval(() => load(), 20000);
    return () => clearInterval(id);
  }, [trackingId]);

  const activeFilter = FILTERS.find((f) => f.key === activeKey) || FILTERS[0];

  const filtered = useMemo(() => items.filter((o) => matchesFilter(o, activeFilter)), [items, activeFilter]);

  const counts = useMemo(() => {
    const map = { all: items.length };
    for (const f of FILTERS) {
      if (f.key === "all") continue;
      map[f.key] = items.filter((o) => matchesFilter(o, f)).length;
    }
    return map;
  }, [items]);

  const cancel = async (id) => {
    setBusy(id);
    try {
      await api.cancelClientOrder(id);
      await load();
    } catch (err) {
      setError(err.message || "Annulation impossible.");
    } finally {
      setBusy(null);
    }
  };

  const setFilter = (key) => {
    const next = new URLSearchParams(params);
    if (key === "all") next.delete("statut");
    else next.set("statut", key);
    setParams(next, { replace: true });
    setTrackingId(null);
  };

  const canTrack = (o) => Boolean(o.trip?.isActive) || (o.status === "en_cours" && (o.latitude != null || o.address));

  return (
    <>
      <Seo title="Mes réservations" path="/client/reservations" noindex />
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">Mes réservations</h1>
            <p className="mt-2 text-sm text-ink-900/60">Suivi de vos prestations par statut.</p>
          </div>
          <Button to="/prestataires" withArrow>
            Nouvelle réservation
          </Button>
        </div>

        <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Statuts des réservations">
          {FILTERS.map((f) => {
            const active = f.key === activeFilter.key;
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.key)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active ? "bg-teal-600 text-white" : "bg-paper-200 text-ink-900/70 hover:bg-teal-50 hover:text-teal-800"
                }`}
              >
                {f.label}
                <span className={`rounded-full px-1.5 py-0.5 font-mono text-[0.65rem] ${active ? "bg-white/20" : "bg-white text-ink-900/50"}`}>
                  {counts[f.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
            {error}
          </p>
        )}

        <ul className="mt-6 flex flex-col gap-3">
          {filtered.map((o) => {
            const statusKey = o.status;
            const trackable = canTrack(o);
            const isOpen = trackingId === o.id;

            return (
              <li key={o.id} className="rounded-xl border border-ink-900/8 bg-paper-100/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold text-teal-700">{o.reference}</p>
                    <p className="mt-1 font-semibold text-ink-900">
                      {o.metier || o.domain} · {o.commune}
                    </p>
                    <p className="mt-1 text-sm text-ink-900/60">{o.need}</p>
                    {o.desiredDate && (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-900/70">
                        <CalendarDays className="size-4 text-teal-700" aria-hidden="true" />
                        Prévue le {o.desiredDate}
                      </p>
                    )}
                    {o.provider && (
                      <p className="mt-2 text-sm text-ink-900/70">Prestataire : {o.provider.fullName || o.provider.metier}</p>
                    )}
                    {o.trip?.isActive && (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700">
                        <Navigation className="size-4" aria-hidden="true" />
                        {tripPresentation(o.trip).title}
                        {o.trip.route?.etaSeconds != null && (
                          <span className="font-normal text-ink-900/70">· arrivée {formatEta(o.trip.route.etaSeconds)}</span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${STATUS_STYLE[statusKey] || ""}`}>
                      {STATUS_LABEL[statusKey] || o.status}
                    </span>
                    {trackable && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setTrackingId(isOpen ? null : o.id)}
                        aria-expanded={isOpen}
                      >
                        <Navigation className="size-4" aria-hidden="true" />
                        {isOpen ? "Masquer la carte" : o.trip?.isActive ? "Suivre sur la carte" : "Voir le suivi"}
                      </Button>
                    )}
                    {["nouvelle", "confirmee", "programmee"].includes(o.status) && (
                      <Button type="button" size="sm" variant="outline" disabled={busy === o.id} onClick={() => cancel(o.id)}>
                        Annuler
                      </Button>
                    )}
                  </div>
                </div>

                {isOpen && <InlineLiveTrack orderId={o.id} onClose={() => setTrackingId(null)} />}
              </li>
            );
          })}
          {!filtered.length && !error && (
            <li className="rounded-xl border border-dashed border-ink-900/15 px-4 py-10 text-center text-sm text-ink-900/50">
              Aucune réservation {activeFilter.key !== "all" ? `« ${activeFilter.label.toLowerCase()} »` : ""} pour le moment.
              {activeFilter.key === "en_cours" && (
                <>
                  {" "}
                  Le suivi carte apparaît dès que le prestataire démarre son trajet.
                </>
              )}
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
