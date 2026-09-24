import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, MapPinned } from "lucide-react";
import { hasMapsKey, loadGoogleMaps } from "../../lib/googleMaps";

/**
 * Carte de suivi : marqueur prestataire, marqueur destination, tracé du trajet.
 *
 * Deux principes d'ergonomie :
 *   - le marqueur GLISSE vers la nouvelle position au lieu de sauter ;
 *   - la caméra n'est recadrée qu'au premier affichage, ou si le prestataire
 *     sort du cadre — la carte ne bouge pas sous les doigts du client.
 *
 * Sans clé Google Maps, le composant affiche un repli lisible plutôt qu'une
 * zone vide : la fonctionnalité reste utilisable.
 */

const ANIMATION_MS = 900;

/** Style clair et sobre : la carte reste un fond, pas le sujet. */
const MAP_STYLE = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#ddecf0" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f7f4f0" }] },
];

function symbol(maps, color) {
  return {
    path: maps.SymbolPath.CIRCLE,
    scale: 9,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 3,
  };
}

export default function TripMap({ position, destination, path = [], className = "" }) {
  const container = useRef(null);
  const map = useRef(null);
  const providerMarker = useRef(null);
  const destinationMarker = useRef(null);
  const line = useRef(null);
  const animation = useRef(null);
  const framed = useRef(false);
  const [error, setError] = useState(hasMapsKey() ? null : "missing-key");

  // --- Initialisation (une seule fois) ---
  useEffect(() => {
    if (!hasMapsKey() || map.current) return undefined;
    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !container.current) return;
        const center = position ?? destination ?? { latitude: -4.325, longitude: 15.322 };

        map.current = new maps.Map(container.current, {
          center: { lat: center.latitude, lng: center.longitude },
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          styles: MAP_STYLE,
        });

        if (destination?.latitude != null) {
          destinationMarker.current = new maps.Marker({
            map: map.current,
            position: { lat: destination.latitude, lng: destination.longitude },
            icon: symbol(maps, "#ee5518"),
            title: "Point d’intervention",
          });
        }

        line.current = new maps.Polyline({
          map: map.current,
          path: [],
          strokeColor: "#01433d",
          strokeOpacity: 0.85,
          strokeWeight: 4,
        });
      })
      .catch(() => {
        if (!cancelled) setError("load-failed");
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(animation.current);
    };
  }, [destination, position]);

  // --- Position du prestataire : glissement, pas de saut ---
  useEffect(() => {
    const maps = window.google?.maps;
    if (!maps || !map.current || !position) return undefined;

    const target = new maps.LatLng(position.latitude, position.longitude);

    if (!providerMarker.current) {
      providerMarker.current = new maps.Marker({
        map: map.current,
        position: target,
        icon: symbol(maps, "#01433d"),
        title: "Prestataire",
        zIndex: 10,
      });
    } else {
      const from = providerMarker.current.getPosition();
      const start = performance.now();
      cancelAnimationFrame(animation.current);

      const step = (now) => {
        const t = Math.min(1, (now - start) / ANIMATION_MS);
        // Interpolation adoucie : le marqueur démarre et s'arrête en souplesse.
        const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        providerMarker.current.setPosition(
          new maps.LatLng(
            from.lat() + (target.lat() - from.lat()) * eased,
            from.lng() + (target.lng() - from.lng()) * eased,
          ),
        );
        if (t < 1) animation.current = requestAnimationFrame(step);
      };
      animation.current = requestAnimationFrame(step);
    }

    // Cadrage initial sur les deux points, puis on laisse la main au client.
    if (!framed.current) {
      framed.current = true;
      if (destination?.latitude != null) {
        const bounds = new maps.LatLngBounds();
        bounds.extend(target);
        bounds.extend(new maps.LatLng(destination.latitude, destination.longitude));
        map.current.fitBounds(bounds, 64);
      } else {
        map.current.setCenter(target);
      }
    } else if (!map.current.getBounds()?.contains(target)) {
      // Le prestataire est sorti du cadre : recentrage doux, sans changer le zoom.
      map.current.panTo(target);
    }

    return () => cancelAnimationFrame(animation.current);
  }, [position, destination]);

  // --- Tracé parcouru ---
  useEffect(() => {
    if (!line.current || !window.google?.maps) return;
    line.current.setPath(path.map((p) => ({ lat: p.latitude, lng: p.longitude })));
  }, [path]);

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-900/15 bg-paper-100 px-6 py-12 text-center ${className}`}
      >
        <MapPinned className="size-8 text-navy-500" aria-hidden="true" />
        <p className="font-display text-base font-bold text-ink-900">
          {error === "missing-key" ? "Carte indisponible" : "Carte momentanément indisponible"}
        </p>
        <p className="max-w-sm text-sm text-ink-900/70">
          {error === "missing-key"
            ? "Ajoutez VITE_GOOGLE_MAPS_API_KEY au build de la PWA pour afficher Google Maps. Le suivi GPS (distance, ETA, coordonnées) fonctionne déjà sans carte."
            : "Google Maps n’a pas répondu. Le suivi continue : distance et arrivée estimée restent à jour."}
        </p>
        <dl className="mt-1 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {position && (
            <div className="inline-flex items-center gap-1.5 text-ink-900/80">
              <Navigation className="size-4 text-teal-600" aria-hidden="true" />
              <dt className="sr-only">Position du prestataire</dt>
              <dd>
                {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
              </dd>
            </div>
          )}
          {destination?.address && (
            <div className="inline-flex items-center gap-1.5 text-ink-900/80">
              <MapPin className="size-4 text-coral-600" aria-hidden="true" />
              <dt className="sr-only">Destination</dt>
              <dd>{destination.address}</dd>
            </div>
          )}
        </dl>
      </div>
    );
  }

  return (
    <div
      ref={container}
      role="application"
      aria-label="Carte de suivi du prestataire"
      className={`overflow-hidden rounded-2xl border border-ink-900/8 bg-paper-200 ${className}`}
    />
  );
}
