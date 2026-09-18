/**
 * Mise en mots du suivi : distance, arrivée estimée, fraîcheur de la position.
 * Une position ancienne ne doit JAMAIS être présentée comme du temps réel (§9).
 */

/** Une position plus vieille que ce délai n'est plus « en direct ». */
export const STALE_AFTER_SECONDS = 60;

export function formatDistance(meters) {
  if (meters == null) return "—";
  if (meters < 950) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

export function formatEta(seconds) {
  if (seconds == null) return "—";
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `~ ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `~ ${hours} h ${String(rest).padStart(2, "0")}` : `~ ${hours} h`;
}

export function formatArrivalClock(seconds) {
  if (seconds == null) return null;
  const at = new Date(Date.now() + seconds * 1000);
  return at.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function secondsSince(iso) {
  if (!iso) return null;
  const value = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  return Number.isFinite(value) ? Math.max(0, value) : null;
}

export function formatFreshness(iso) {
  const seconds = secondsSince(iso);
  if (seconds == null) return "Aucune position reçue";
  if (seconds < 10) return "Position mise à jour à l’instant";
  if (seconds < 60) return `Position mise à jour il y a ${seconds} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `Position mise à jour il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  return `Position mise à jour il y a ${hours} h`;
}

/** État affichable du suivi, dérivé du trajet renvoyé par l'API. */
export function tripPresentation(trip) {
  if (!trip) return { tone: "idle", title: "Trajet non démarré", detail: "" };

  if (trip.status === "arrive") {
    return { tone: "done", title: "Prestataire arrivé", detail: "Le trajet est terminé." };
  }
  if (trip.status === "annule") {
    return { tone: "cancelled", title: "Trajet interrompu", detail: "Le partage de position a été arrêté." };
  }

  const age = secondsSince(trip.position?.recordedAt);
  if (!trip.position) {
    return {
      tone: "waiting",
      title: "Prestataire en route",
      detail: "En attente de la première position GPS.",
    };
  }
  if (age != null && age > STALE_AFTER_SECONDS) {
    return {
      tone: "stale",
      title: "Signal GPS temporairement interrompu",
      detail: "Dernière position connue affichée ci-dessous.",
    };
  }
  return { tone: "live", title: "Prestataire en route", detail: "Suivi en direct." };
}
