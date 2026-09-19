/**
 * Transport temps réel du suivi de mission.
 *
 * Deux implémentations derrière UNE interface, pour ne jamais dépendre du type
 * d'hébergement :
 *
 *   1. « socket »   — Laravel Echo + Pusher/Reverb/Ably, canal privé `mission.{id}`.
 *                     Nécessite un service WebSocket joignable : Reverb sur VPS,
 *                     ou un service externe. Activé par VITE_REALTIME_DRIVER=socket.
 *   2. « polling »  — interrogation espacée de l'API (défaut). Fonctionne sur un
 *                     hébergement mutualisé Hostinger, où aucun processus
 *                     WebSocket permanent ne peut tourner.
 *
 * Passer de l'un à l'autre est une variable d'environnement, pas une réécriture.
 */

import { getToken } from "./api";

const VISIBLE_INTERVAL = Number(import.meta.env.VITE_TRACKING_POLL_INTERVAL || 5000);
const HIDDEN_INTERVAL = Number(import.meta.env.VITE_TRACKING_POLL_HIDDEN || 20000);
const MAX_BACKOFF = 60000;

export function realtimeDriver() {
  return (import.meta.env.VITE_REALTIME_DRIVER || "polling").toLowerCase();
}

/**
 * Ouvre un flux de suivi pour une mission.
 *
 * @param {object}   options
 * @param {number}   options.orderId
 * @param {Function} options.fetcher   () => Promise<payload> — état complet du suivi
 * @param {Function} options.onUpdate  (payload) => void
 * @param {Function} [options.onStatus] ({ connected, driver, error }) => void
 * @returns {{ close: () => void, refreshNow: () => void }}
 */
export function subscribeToMission({ orderId, fetcher, onUpdate, onStatus }) {
  let closed = false;
  let timer = null;
  let failures = 0;
  let echo = null;

  const report = (status) => onStatus?.({ driver: realtimeDriver(), ...status });

  const pull = async () => {
    if (closed) return;
    try {
      const payload = await fetcher();
      if (closed) return;
      failures = 0;
      report({ connected: true });
      onUpdate(payload);
    } catch (error) {
      if (closed) return;
      failures += 1;
      report({ connected: false, error });
    }
  };

  const scheduleNext = () => {
    if (closed) return;
    const base = document.visibilityState === "hidden" ? HIDDEN_INTERVAL : VISIBLE_INTERVAL;
    // Coupure réseau : on espace les tentatives au lieu de marteler le serveur.
    const delay = failures ? Math.min(base * 2 ** failures, MAX_BACKOFF) : base;
    timer = setTimeout(async () => {
      await pull();
      scheduleNext();
    }, delay);
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      clearTimeout(timer);
      pull().then(scheduleNext);
    }
  };

  const startPolling = () => {
    document.addEventListener("visibilitychange", onVisibility);
    pull().then(scheduleNext);
  };

  const startSocket = async () => {
    try {
      // Spécificateur dynamique : Vite ne tente pas de résoudre le paquet à la
      // compilation, l'application se construit donc sans Echo installé.
      const echoModule = "laravel-echo";
      const pusherModule = "pusher-js";
      const [{ default: Echo }, { default: Pusher }] = await Promise.all([
        import(/* @vite-ignore */ echoModule),
        import(/* @vite-ignore */ pusherModule),
      ]);

      window.Pusher = Pusher;
      echo = new Echo({
        broadcaster: "pusher",
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || "mt1",
        wsHost: import.meta.env.VITE_PUSHER_HOST || undefined,
        wsPort: Number(import.meta.env.VITE_PUSHER_PORT || 443),
        wssPort: Number(import.meta.env.VITE_PUSHER_PORT || 443),
        forceTLS: (import.meta.env.VITE_PUSHER_SCHEME || "https") === "https",
        enabledTransports: ["ws", "wss"],
        authEndpoint: `${String(import.meta.env.VITE_API_BASE || "").replace(/\/$/, "")}/api/broadcasting/auth`,
        auth: { headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/json" } },
      });

      const channel = echo.private(`mission.${orderId}`);
      channel.listen(".provider.location.updated", () => pull());
      channel.listen(".trip.status.changed", () => pull());

      report({ connected: true });
      // Un premier état complet, puis un battement lent en filet de sécurité
      // si une trame WebSocket se perd.
      await pull();
      timer = setInterval(pull, 60000);
      return true;
    } catch (error) {
      report({ connected: false, error });
      return false;
    }
  };

  if (realtimeDriver() === "socket" && import.meta.env.VITE_PUSHER_APP_KEY) {
    startSocket().then((ok) => {
      if (!ok && !closed) startPolling();
    });
  } else {
    startPolling();
  }

  return {
    refreshNow: pull,
    close() {
      closed = true;
      clearTimeout(timer);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      try {
        echo?.leave(`mission.${orderId}`);
        echo?.disconnect();
      } catch {
        /* le transport était déjà fermé */
      }
    },
  };
}
