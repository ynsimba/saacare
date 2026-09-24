import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, WifiOff, Pencil, Crosshair } from "lucide-react";
import Seo from "../../lib/Seo";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import TripMap from "../../components/tracking/TripMap";
import TripStatusPanel from "../../components/tracking/TripStatusPanel";
import { api } from "../../lib/api";
import { subscribeToMission } from "../../lib/realtime";
import { SkeletonPage } from "../../components/ui/Skeleton";

/**
 * Suivi de l'arrivée du prestataire, côté client (§8).
 *
 * Au chargement, l'état complet est récupéré (dernière position connue, statut
 * de la mission, suivi actif ou non), puis les mises à jour arrivent par le
 * transport temps réel disponible — WebSocket si configuré, sinon interrogation
 * espacée. Un rechargement de page repart donc toujours d'un état juste (§11).
 */
export default function ClientOrderTracking() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const channel = useRef(null);

  const fetcher = useCallback(() => api.orderTracking(id), [id]);

  useEffect(() => {
    let cancelled = false;

    channel.current = subscribeToMission({
      orderId: Number(id),
      fetcher,
      onUpdate: (payload) => {
        if (cancelled) return;
        setData(payload.item);
        setError("");
      },
      onStatus: ({ connected, error: err }) => {
        if (cancelled) return;
        setOffline(!connected);
        if (!connected && err?.status === 404) setError("Cette mission est introuvable.");
      },
    });

    return () => {
      cancelled = true;
      channel.current?.close();
    };
  }, [fetcher, id]);

  if (error) {
    return (
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <p className="text-sm text-coral-800" role="alert">{error}</p>
        <Button to="/client/reservations?statut=en_cours" variant="outline" size="sm" className="mt-4">
          Retour aux réservations
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <SkeletonPage label="Chargement du suivi" />
      </div>
    );
  }

  const { order, trip, destination, provider, path = [] } = data;
  const providerName = provider?.fullName || provider?.metier || "Votre prestataire";

  return (
    <>
      <Seo title={`Suivi ${order.reference}`} path={`/client/commandes/${id}/suivi`} noindex />

      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-ink-900/8 bg-white p-5 sm:p-6">
          <Link
            to="/client/reservations?statut=en_cours"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900/60 transition-colors hover:text-ink-900"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Mes réservations
          </Link>

          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-semibold text-teal-700">{order.reference}</p>
              <h1 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                {trip?.isActive ? `${providerName} arrive` : "Suivi de la mission"}
              </h1>
              <p className="mt-1 text-sm text-ink-900/60">
                {order.metier || order.domain} · {order.commune}
              </p>
            </div>
            {provider?.phone && (
              <Button href={`tel:${provider.phone}`} variant="outline" size="sm">
                <Phone className="size-4" aria-hidden="true" />
                Appeler
              </Button>
            )}
          </div>
        </div>

        <TripStatusPanel trip={trip} />

        {offline && (
          <p className="flex items-start gap-2 rounded-xl border border-gold-500/30 bg-gold-100/60 px-4 py-3 text-sm text-ink-900" role="status">
            <WifiOff className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden="true" />
            Connexion interrompue. Les informations affichées datent de la dernière mise à jour reçue ; la reprise est
            automatique dès que le réseau revient.
          </p>
        )}

        {trip?.position ? (
          <TripMap
            position={trip.position}
            destination={destination}
            path={path}
            className="h-[22rem] w-full sm:h-[28rem]"
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-ink-900/15 bg-white px-6 py-12 text-center">
            <MapPin className="mx-auto size-8 text-navy-500" aria-hidden="true" />
            <p className="mt-3 font-display text-base font-bold text-ink-900">
              {trip?.isActive ? "En attente de la première position" : "Aucun trajet en cours"}
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-900/70">
              {trip?.isActive
                ? "Le prestataire vient de démarrer. La carte s’affichera dès la première position GPS reçue."
                : "La carte s’ouvrira ici dès que le prestataire prendra la route vers vous."}
            </p>
          </div>
        )}

        <DestinationCard
          orderId={id}
          destination={destination}
          editing={editingAddress}
          onEdit={() => setEditingAddress(true)}
          onCancel={() => setEditingAddress(false)}
          onSaved={(item) => {
            setData(item);
            setEditingAddress(false);
            channel.current?.refreshNow();
          }}
        />
      </div>
    </>
  );
}

/**
 * Point d'intervention : sans coordonnées, ni l'itinéraire ni l'heure d'arrivée
 * ne peuvent être calculés — le client peut donc les préciser lui-même.
 */
function DestinationCard({ orderId, destination, editing, onEdit, onCancel, onSaved }) {
  const [address, setAddress] = useState(destination.address || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState({
    latitude: destination.latitude ?? null,
    longitude: destination.longitude ?? null,
  });

  const useMyPosition = () => {
    if (!navigator.geolocation) {
      setError("Ce navigateur ne fournit pas de position.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("Position indisponible. Saisissez l’adresse à la place.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api.updateOrderAddress(orderId, {
        address,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      onSaved(data.item);
    } catch (err) {
      setError(err.message || "L’adresse n’a pas pu être enregistrée.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold text-ink-900">Point d’intervention</h2>
          <p className="mt-1 text-sm text-ink-900/70">
            {destination.address || `Commune de ${destination.commune}`}
          </p>
          {!destination.isGeolocated && (
            <p className="mt-1 text-sm text-gold-800">
              Ajoutez vos coordonnées pour obtenir la distance et l’heure d’arrivée estimée.
            </p>
          )}
        </div>
        {!editing && (
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="size-4" aria-hidden="true" />
            Modifier
          </Button>
        )}
      </div>

      {editing && (
        <form onSubmit={save} className="mt-4 flex flex-col gap-3">
          <Field
            label="Adresse ou point de repère"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Avenue, numéro, repère connu…"
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={useMyPosition} disabled={locating}>
              <Crosshair className="size-4" aria-hidden="true" />
              {locating ? "Localisation…" : "Utiliser ma position actuelle"}
            </Button>
            {coords.latitude != null && (
              <span className="text-sm text-ink-900/60">
                {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
              </span>
            )}
          </div>

          {error && (
            <p className="rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={busy}>
              Enregistrer
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
