import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { RefreshCw, Radio, WifiOff, MapPin, Phone } from "lucide-react";
import Seo from "../../lib/Seo";
import { DeskAlert, DeskEmpty, DeskHeading, initials } from "../../components/admin/DeskUI";
import { api } from "../../lib/api";
import { formatDistance, formatEta, formatFreshness, secondsSince, STALE_AFTER_SECONDS } from "../../lib/tripFormat";
import { SkeletonList } from "../../components/ui/Skeleton";

/**
 * Missions actives — supervision (§12).
 *
 * Ne montre QUE les missions dont un trajet est en cours : la localisation est
 * liée à une mission, jamais à une surveillance permanente des prestataires.
 */
const REFRESH_MS = 15000;

export default function AdminMissions() {
  const { query = "" } = useOutletContext() || {};
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api.adminActiveMissions();
      setItems(data.items || []);
      setUpdatedAt(new Date().toISOString());
      setError("");
    } catch (err) {
      setError(err.message || "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Rythme volontairement lent : la supervision n'a pas besoin de la seconde.
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const shown = query
    ? items.filter((m) =>
        [m.reference, m.metier, m.domain, m.client?.fullName, m.provider?.fullName, m.destination?.address, m.destination?.commune]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(query))
      )
    : items;

  return (
    <>
      <Seo title="Missions actives" path="/admin/missions" noindex />

      <DeskHeading
        as="h1"
        count={loading ? null : items.length}
        action={
          <button
            type="button"
            onClick={load}
            className="inline-flex h-14 items-center gap-3 rounded-full bg-white pl-6 pr-2 text-base font-semibold transition-colors hover:bg-desk-mint"
          >
            Actualiser
            <span className="flex size-10 items-center justify-center rounded-full bg-desk-ink text-white">
              <RefreshCw className="size-5" aria-hidden="true" />
            </span>
          </button>
        }
      >
        Missions actives
      </DeskHeading>
      <p className="mt-3 max-w-2xl text-lg text-desk-ink/60">
        Trajets en cours uniquement. Aucune position n’est conservée en dehors d’un déplacement.
      </p>

      {error && (
        <div className="mt-6">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <SkeletonList tone="desk" rows={4} label="Chargement des missions" />
        ) : shown.length === 0 ? (
          <DeskEmpty>{query ? "Aucune mission ne correspond à la recherche." : "Aucun trajet en cours actuellement."}</DeskEmpty>
        ) : (
          <div className="overflow-x-auto rounded-[2.5rem] bg-white p-4 sm:p-6">
            <table className="w-full min-w-[54rem] border-separate border-spacing-y-3 text-left text-base">
              <caption className="sr-only">Missions dont le prestataire est en route</caption>
              <thead>
                <tr className="text-sm font-medium uppercase tracking-wide text-desk-ink/55">
                  <th scope="col" className="px-4 pb-1 font-medium">Mission</th>
                  <th scope="col" className="px-4 pb-1 font-medium">Client</th>
                  <th scope="col" className="px-4 pb-1 font-medium">Prestataire</th>
                  <th scope="col" className="px-4 pb-1 font-medium">Départ</th>
                  <th scope="col" className="px-4 pb-1 font-medium">Reste</th>
                  <th scope="col" className="px-4 pb-1 font-medium">Signal GPS</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((m) => (
                  <Row key={m.orderId} mission={m} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {updatedAt && (
        <p className="mt-5 text-sm text-desk-ink/50" aria-live="polite">
          Tableau actualisé {formatFreshness(updatedAt).replace("Position mise à jour ", "").toLowerCase()}.
        </p>
      )}
    </>
  );
}

function Row({ mission }) {
  const navigate = useNavigate();
  const { trip, client, provider, destination } = mission;
  const age = secondsSince(trip?.position?.recordedAt);
  const stale = age == null || age > STALE_AFTER_SECONDS;
  const cell = "bg-desk-canvas px-4 py-4 align-top transition-colors duration-200 group-hover:bg-desk-mint/55";
  const to = `/admin/missions/${mission.orderId}`;

  return (
    <tr
      className="group cursor-pointer"
      onClick={() => navigate(to)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(to);
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`Ouvrir la mission ${mission.reference}`}
    >
      <td className={`${cell} rounded-l-[1.75rem] pl-6`}>
        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold tracking-wide">{mission.reference}</span>
        <p className="mt-2 text-lg font-semibold">{mission.metier || mission.domain}</p>
        <p className="mt-0.5 inline-flex items-start gap-1.5 text-sm text-desk-ink/60">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {destination.address || destination.commune}
        </p>
      </td>
      <td className={cell}>
        <Person name={client.fullName} phone={client.phone} />
      </td>
      <td className={cell}>
        <Person name={provider.fullName} phone={provider.phone} />
      </td>
      <td className={`${cell} text-lg font-semibold`}>
        {trip?.startedAt
          ? new Date(trip.startedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
          : "—"}
      </td>
      <td className={cell}>
        {trip?.route ? (
          <>
            <span className="text-lg font-semibold">{formatDistance(trip.route.distanceMeters)}</span>
            <span className="block text-sm text-desk-ink/60">{formatEta(trip.route.etaSeconds)}</span>
          </>
        ) : (
          "—"
        )}
      </td>
      <td className={`${cell} rounded-r-[1.75rem] pr-6`}>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            stale ? "bg-desk-butter" : "bg-desk-mint"
          }`}
        >
          {stale ? <WifiOff className="size-4" aria-hidden="true" /> : <Radio className="size-4" aria-hidden="true" />}
          {stale ? "Interrompu" : "En direct"}
        </span>
        <span className="mt-2 block text-sm text-desk-ink/55">{formatFreshness(trip?.position?.recordedAt)}</span>
      </td>
    </tr>
  );
}

function Person({ name, phone }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-desk-lilac text-xs font-bold">
        {initials(name || "")}
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{name || "—"}</p>
        {phone && (
          <a
            href={`tel:${phone}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-desk-ink/65 hover:text-desk-ink hover:underline"
          >
            <Phone className="size-3.5" aria-hidden="true" />
            {phone}
          </a>
        )}
      </div>
    </div>
  );
}
