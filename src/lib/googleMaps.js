/**
 * Chargement à la demande de l'API Google Maps JavaScript.
 *
 * La clé NAVIGATEUR vient de l'environnement (VITE_GOOGLE_MAPS_API_KEY) et doit
 * être restreinte aux domaines SaaCare dans la console Google Cloud. Aucune clé
 * n'est écrite dans le code. Sans clé, l'application reste fonctionnelle : la
 * carte laisse place à un repli textuel (distance, arrivée estimée, adresse).
 */

let loader = null;

export function hasMapsKey() {
  return Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
}

export function loadGoogleMaps() {
  if (typeof window === "undefined") return Promise.reject(new Error("Pas de navigateur."));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loader) return loader;

  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.reject(new Error("Clé Google Maps absente."));

  loader = new Promise((resolve, reject) => {
    const callback = "__saacareMapsReady";
    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}` +
      `&callback=${callback}&language=fr&region=CD&loading=async`;
    script.async = true;
    script.onerror = () => {
      loader = null;
      reject(new Error("Google Maps n’a pas pu être chargé."));
    };
    window[callback] = () => resolve(window.google.maps);
    document.head.appendChild(script);
  });

  return loader;
}
