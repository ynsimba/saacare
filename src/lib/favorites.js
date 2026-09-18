import { api } from "./api";

const PROVIDERS_KEY = "saacare_favorites_providers";
const SERVICES_KEY = "saacare_favorites_services";

function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function getFavoriteProviderRefs() {
  return readList(PROVIDERS_KEY);
}

export function getFavoriteServiceSlugs() {
  return readList(SERVICES_KEY);
}

export function isFavoriteProvider(reference) {
  return getFavoriteProviderRefs().includes(reference);
}

export function isFavoriteService(slug) {
  return getFavoriteServiceSlugs().includes(slug);
}

/** Charge les favoris depuis l’API (avec cache local). */
export async function loadFavorites() {
  try {
    const data = await api.clientFavorites();
    const providers = Array.isArray(data.providers) ? data.providers : [];
    const services = Array.isArray(data.services) ? data.services : [];
    writeList(PROVIDERS_KEY, providers);
    writeList(SERVICES_KEY, services);
    return { providers, services };
  } catch {
    return {
      providers: getFavoriteProviderRefs(),
      services: getFavoriteServiceSlugs(),
    };
  }
}

export async function toggleFavoriteProvider(reference) {
  try {
    const data = await api.toggleClientFavorite({ type: "provider", target: reference });
    const providers = Array.isArray(data.providers) ? data.providers : [];
    writeList(PROVIDERS_KEY, providers);
    if (Array.isArray(data.services)) writeList(SERVICES_KEY, data.services);
    return providers;
  } catch {
    const list = getFavoriteProviderRefs();
    const next = list.includes(reference) ? list.filter((r) => r !== reference) : [...list, reference];
    writeList(PROVIDERS_KEY, next);
    return next;
  }
}

export async function toggleFavoriteService(slug) {
  try {
    const data = await api.toggleClientFavorite({ type: "service", target: slug });
    const services = Array.isArray(data.services) ? data.services : [];
    writeList(SERVICES_KEY, services);
    if (Array.isArray(data.providers)) writeList(PROVIDERS_KEY, data.providers);
    return services;
  } catch {
    const list = getFavoriteServiceSlugs();
    const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
    writeList(SERVICES_KEY, next);
    return next;
  }
}

export async function removeFavoriteProvider(reference) {
  const list = getFavoriteProviderRefs();
  if (!list.includes(reference)) return list;
  return toggleFavoriteProvider(reference);
}

export async function removeFavoriteService(slug) {
  const list = getFavoriteServiceSlugs();
  if (!list.includes(slug)) return list;
  return toggleFavoriteService(slug);
}
