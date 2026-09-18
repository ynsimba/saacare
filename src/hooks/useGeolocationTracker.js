import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Suivi GPS du prestataire pendant un trajet (cahier des charges §4.4).
 *
 * Règles :
 *   - `watchPosition` démarre via `start()` (appelé automatiquement dès qu’un
 *     trajet est actif dans l’espace prestataire) ;
 *   - toutes les micro-variations ne partent pas au serveur : il faut soit un
 *     déplacement significatif, soit l'intervalle minimum écoulé ;
 *   - l'arrêt libère la montre GPS : aucune position n'est lue hors trajet.
 *
 * Le hook ne connaît pas l'API : `onPosition` reçoit une position prête à envoyer,
 * ce qui le rend réutilisable pour un autre écran.
 */

export const GPS_IDLE = "idle";
export const GPS_REQUESTING = "requesting";
export const GPS_ACTIVE = "active";
export const GPS_ERROR = "error";

const ERRORS = {
  1: {
    code: "denied",
    message: "Localisation refusée. Activez-la pour que le client puisse suivre votre arrivée.",
    hint: "Autorisez la localisation dans les réglages du navigateur, puis réessayez.",
  },
  2: {
    code: "unavailable",
    message: "Position indisponible. Le signal GPS ne parvient pas jusqu’à votre appareil.",
    hint: "Sortez d’un sous-sol ou d’un parking, puis réessayez.",
  },
  3: {
    code: "timeout",
    message: "Le GPS met trop de temps à répondre.",
    hint: "Vérifiez que la localisation est activée sur l’appareil, puis réessayez.",
  },
};

const UNSUPPORTED = {
  code: "unsupported",
  message: "Cet appareil ou ce navigateur ne fournit pas de position GPS.",
  hint: "Ouvrez SaaCare depuis un navigateur récent sur votre téléphone.",
};

/** Distance en mètres entre deux points (formule de haversine). */
export function distanceMeters(a, b) {
  if (!a || !b) return Infinity;
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export default function useGeolocationTracker({
  onPosition,
  minInterval = 8000,
  minDistance = 25,
  maxAccuracy = 250,
} = {}) {
  const [state, setState] = useState(GPS_IDLE);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [sentAt, setSentAt] = useState(null);

  const watchId = useRef(null);
  const lastSent = useRef({ at: 0, position: null });
  const handler = useRef(onPosition);
  handler.current = onPosition;

  const stop = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    lastSent.current = { at: 0, position: null };
    setState(GPS_IDLE);
  }, []);

  const start = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError(UNSUPPORTED);
      setState(GPS_ERROR);
      return false;
    }
    if (watchId.current !== null) return true;

    setError(null);
    setState(GPS_REQUESTING);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const next = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
          heading: Number.isFinite(pos.coords.heading) ? pos.coords.heading : null,
          speed: Number.isFinite(pos.coords.speed) && pos.coords.speed >= 0 ? pos.coords.speed : null,
          recordedAt: new Date(pos.timestamp).toISOString(),
        };

        setPosition(next);
        setState(GPS_ACTIVE);
        setError(null);

        // Une position trop imprécise est affichée mais jamais transmise.
        if (next.accuracy != null && next.accuracy > maxAccuracy) return;

        const elapsed = Date.now() - lastSent.current.at;
        const moved = distanceMeters(lastSent.current.position, next);
        if (lastSent.current.position && elapsed < minInterval && moved < minDistance) return;

        lastSent.current = { at: Date.now(), position: next };
        setSentAt(new Date().toISOString());
        handler.current?.(next);
      },
      (err) => {
        setError(ERRORS[err.code] ?? { code: "unknown", message: err.message, hint: "" });
        setState(GPS_ERROR);
        // Une erreur ponctuelle (timeout, tunnel) ne coupe pas la montre GPS :
        // le navigateur rappellera le callback dès que le signal revient.
        if (err.code === 1) stop();
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );

    return true;
  }, [maxAccuracy, minDistance, minInterval, stop]);

  // Filet de sécurité : la montre GPS ne survit jamais au démontage de l'écran.
  useEffect(() => stop, [stop]);

  return {
    state,
    isTracking: state === GPS_ACTIVE || state === GPS_REQUESTING,
    position,
    error,
    sentAt,
    start,
    stop,
    retry: start,
  };
}
