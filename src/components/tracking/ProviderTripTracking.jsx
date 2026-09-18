import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import useGeolocationTracker, { GPS_ERROR } from "../../hooks/useGeolocationTracker";
import { api } from "../../lib/api";

/**
 * Garde le GPS actif pour tout l’espace prestataire dès qu’un trajet
 * « en route » existe — pas besoin de rester sur la page Missions.
 */
const ProviderTripTrackingContext = createContext(null);

export function useProviderTripTracking() {
  return useContext(ProviderTripTrackingContext);
}

export function ProviderTripTrackingProvider({ children }) {
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [sendError, setSendError] = useState("");
  const [lastTrackingItem, setLastTrackingItem] = useState(null);
  const activeOrderRef = useRef(null);
  activeOrderRef.current = activeOrderId;

  const sendPosition = useCallback(async (position) => {
    const orderId = activeOrderRef.current;
    if (!orderId) return;
    try {
      const data = await api.pushTripLocation(orderId, position);
      setSendError("");
      if (data?.item) setLastTrackingItem({ orderId, item: data.item });
    } catch (err) {
      setSendError(err.message || "Position non transmise. Nouvelle tentative au prochain point GPS.");
    }
  }, []);

  const gps = useGeolocationTracker({ onPosition: sendPosition });
  const { start: startGps, stop: stopGps, isTracking, state } = gps;

  const syncActiveTrip = useCallback(async () => {
    try {
      const data = await api.prestataireMissions();
      const active = (data.items || []).find((m) => m.trip?.isActive);
      const nextId = active?.order?.id ?? null;
      setActiveOrderId(nextId);
      if (!nextId) setLastTrackingItem(null);
      return { orderId: nextId, items: data.items || [] };
    } catch {
      return { orderId: activeOrderRef.current, items: null };
    }
  }, []);

  // Démarre / coupe le GPS selon le trajet actif.
  useEffect(() => {
    if (activeOrderId) {
      if (!isTracking && state !== GPS_ERROR) startGps();
      return undefined;
    }
    if (isTracking) stopGps();
    return undefined;
  }, [activeOrderId, isTracking, state, startGps, stopGps]);

  // Sync au montage, au focus, et périodiquement (reprise après fermeture PWA).
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await syncActiveTrip();
    };
    run();
    const timer = window.setInterval(run, 20000);
    const onFocus = () => run();
    const onVisibility = () => {
      if (document.visibilityState === "visible") run();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [syncActiveTrip]);

  const setActiveOrder = useCallback(
    (orderId) => {
      setActiveOrderId(orderId);
      activeOrderRef.current = orderId;
      if (orderId) startGps();
      else {
        stopGps();
        setLastTrackingItem(null);
      }
    },
    [startGps, stopGps],
  );

  const value = useMemo(
    () => ({
      gps,
      activeOrderId,
      sendError,
      setSendError,
      setActiveOrder,
      syncActiveTrip,
      refreshGps: startGps,
      lastTrackingItem,
    }),
    [gps, activeOrderId, sendError, setActiveOrder, syncActiveTrip, startGps, lastTrackingItem],
  );

  return <ProviderTripTrackingContext.Provider value={value}>{children}</ProviderTripTrackingContext.Provider>;
}
