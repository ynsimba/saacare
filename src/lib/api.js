const TOKEN_KEY = "saacare_token";

/** Base API : vide en local (proxy Vite → :8001), `https://api.saacare.com` en prod (PWA sur app.saacare.com). */
export const API_BASE = String(import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

function apiUrl(path) {
  if (!path.startsWith("/")) return `${API_BASE}/${path}`;
  return `${API_BASE}${path}`;
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function clearToken() {
  setToken(null);
}

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = "GET", body, auth = false, headers = {} } = {}) {
  const opts = {
    method,
    headers: {
      Accept: "application/json",
      ...headers,
    },
  };

  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  if (auth) {
    const token = getToken();
    if (token) opts.headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(apiUrl(path), opts);
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!data) {
    throw new ApiError("Le service est momentanément indisponible. Contactez-nous par téléphone ou WhatsApp.", res.status);
  }

  if (!res.ok) {
    const details = data?.details;
    let message = data?.error || data?.message || "Une erreur est survenue.";
    // Laravel peut renvoyer la clé brute (ex. validation.unique) si la locale FR manque.
    if (typeof message === "string" && message.startsWith("validation.")) {
      const firstDetail = details && typeof details === "object"
        ? Object.values(details).flat().find(Boolean)
        : null;
      message = firstDetail && !String(firstDetail).startsWith("validation.")
        ? String(firstDetail)
        : "Vérifiez les informations saisies.";
    }
    if (details && typeof details === "object") {
      const fieldMessages = Object.values(details)
        .flat()
        .filter((m) => m && !String(m).startsWith("validation."));
      if (fieldMessages.length && (!data?.error || String(data.error).startsWith("validation."))) {
        message = fieldMessages[0];
      }
    }
    throw new ApiError(message, res.status, details);
  }

  return data;
}

export const api = {
  health: () => request("/api/health"),
  register: (body) => request("/api/register", { method: "POST", body }),
  login: (body) => request("/api/login", { method: "POST", body }),
  loginGoogle: (body) => request("/api/auth/google", { method: "POST", body }),
  logout: () => request("/api/logout", { method: "POST", auth: true }),
  me: () => request("/api/me", { auth: true }),
  updateProfile: (body) => request("/api/me", { method: "PATCH", body, auth: true }),
  changePassword: (body) => request("/api/me/password", { method: "PATCH", body, auth: true }),

  clientDashboard: () => request("/api/client/dashboard", { auth: true }),
  clientServices: () => request("/api/client/services", { auth: true }),
  clientOrders: () => request("/api/client/orders", { auth: true }),
  createClientOrder: (body) => request("/api/client/orders", { method: "POST", body, auth: true }),
  cancelClientOrder: (id) => request(`/api/client/orders/${id}/cancel`, { method: "PATCH", auth: true }),
  reviewClientOrder: (id, body) => request(`/api/client/orders/${id}/review`, { method: "POST", body, auth: true }),
  // Suivi de trajet — côté client
  orderTracking: (id) => request(`/api/client/orders/${id}/tracking`, { auth: true }),
  updateOrderAddress: (id, body) => request(`/api/client/orders/${id}/address`, { method: "PATCH", body, auth: true }),
  clientProviders: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.commune) qs.set("commune", params.commune);
    if (params.domain) qs.set("domain", params.domain);
    const q = qs.toString();
    return request(`/api/client/providers${q ? `?${q}` : ""}`, { auth: true });
  },
  clientPayments: () => request("/api/client/payments", { auth: true }),
  createClientPayment: (body) => request("/api/client/payments", { method: "POST", body, auth: true }),
  clientMessages: (thread = "support") => request(`/api/client/messages?thread=${encodeURIComponent(thread)}`, { auth: true }),
  sendClientMessage: (body) => request("/api/client/messages", { method: "POST", body, auth: true }),
  clientNotifications: () => request("/api/client/notifications", { auth: true }),
  markNotificationRead: (id) => request(`/api/client/notifications/${id}/read`, { method: "PATCH", auth: true }),
  markAllNotificationsRead: () => request("/api/client/notifications/read-all", { method: "POST", auth: true }),
  clientFavorites: () => request("/api/client/favorites", { auth: true }),
  toggleClientFavorite: (body) => request("/api/client/favorites/toggle", { method: "POST", body, auth: true }),

  prestataireDashboard: () => request("/api/prestataire/dashboard", { auth: true }),
  // Missions et suivi de trajet — côté prestataire
  prestataireMissions: () => request("/api/prestataire/missions", { auth: true }),
  prestataireMission: (id) => request(`/api/prestataire/missions/${id}`, { auth: true }),
  prestatairePendingOffers: () => request("/api/prestataire/missions/pending-offers", { auth: true }),
  acceptMission: (id) => request(`/api/prestataire/missions/${id}/accept`, { method: "POST", auth: true }),
  refuseMission: (id, body = {}) =>
    request(`/api/prestataire/missions/${id}/refuse`, { method: "POST", body, auth: true }),
  startTrip: (id) => request(`/api/prestataire/missions/${id}/trip`, { method: "POST", auth: true }),
  pushTripLocation: (id, body) =>
    request(`/api/prestataire/missions/${id}/location`, { method: "POST", body, auth: true }),
  tripArrived: (id) => request(`/api/prestataire/missions/${id}/trip/arrived`, { method: "POST", auth: true }),
  cancelTrip: (id) => request(`/api/prestataire/missions/${id}/trip/cancel`, { method: "POST", auth: true }),
  prestataireNotifications: () => request("/api/prestataire/notifications", { auth: true }),
  markPrestataireNotificationRead: (id) =>
    request(`/api/prestataire/notifications/${id}/read`, { method: "PATCH", auth: true }),
  markAllPrestataireNotificationsRead: () =>
    request("/api/prestataire/notifications/read-all", { method: "POST", auth: true }),
  prestataireProfil: () => request("/api/prestataire/profil", { auth: true }),
  updatePrestataireProfil: (body) => request("/api/prestataire/profil", { method: "PATCH", body, auth: true }),
  prestataireDisponibilite: () => request("/api/prestataire/disponibilite", { auth: true }),
  updatePrestataireDisponibilite: (slots) =>
    request("/api/prestataire/disponibilite", { method: "PUT", body: { slots }, auth: true }),
  prestatairePlanning: () => request("/api/prestataire/planning", { auth: true }),
  prestataireGains: () => request("/api/prestataire/gains", { auth: true }),
  prestataireAvis: () => request("/api/prestataire/avis", { auth: true }),

  adminDashboard: () => request("/api/admin/dashboard", { auth: true }),
  adminPrestataires: () => request("/api/admin/prestataires", { auth: true }),
  adminPrestatairesPending: () => request("/api/admin/prestataires/pending", { auth: true }),
  adminPrestataire: (id) => request(`/api/admin/prestataires/${id}`, { auth: true }),
  adminActiveMissions: () => request("/api/admin/missions/actives", { auth: true }),
  adminMission: (id) => request(`/api/admin/missions/${id}`, { auth: true }),
  createAdminMissionNote: (id, body) =>
    request(`/api/admin/missions/${id}/notes`, { method: "POST", body, auth: true }),
  updateProviderStatus: (id, status) =>
    request(`/api/admin/prestataires/${id}/status`, { method: "PATCH", body: { status }, auth: true }),
  adminClients: () => request("/api/admin/clients", { auth: true }),
  adminClient: (id) => request(`/api/admin/clients/${id}`, { auth: true }),
  adminOrders: () => request("/api/admin/commandes", { auth: true }),
  adminOrder: (id) => request(`/api/admin/commandes/${id}`, { auth: true }),
  assignAdminOrder: (id, body) =>
    request(`/api/admin/commandes/${id}/assign`, { method: "POST", body, auth: true }),
  adminPayments: () => request("/api/admin/paiements", { auth: true }),
  createAdminPayment: (body) => request("/api/admin/paiements", { method: "POST", body, auth: true }),
  adminServiceRequests: () => request("/api/admin/leads/demandes", { auth: true }),
  patchAdminServiceRequest: (id, body) =>
    request(`/api/admin/leads/demandes/${id}`, { method: "PATCH", body, auth: true }),
  adminQuoteRequests: () => request("/api/admin/leads/devis", { auth: true }),
  patchAdminQuoteRequest: (id, body) =>
    request(`/api/admin/leads/devis/${id}`, { method: "PATCH", body, auth: true }),
  adminPlatformSettings: () => request("/api/admin/parametres-plateforme", { auth: true }),
  updateAdminPlatformSettings: (settings) =>
    request("/api/admin/parametres-plateforme", { method: "PUT", body: { settings }, auth: true }),
  adminReports: () => request("/api/admin/rapports", { auth: true }),
  adminAppointments: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    const q = qs.toString();
    return request(`/api/admin/rendez-vous${q ? `?${q}` : ""}`, { auth: true });
  },
  createAdminAppointment: (body) => request("/api/admin/rendez-vous", { method: "POST", body, auth: true }),
  deleteAdminAppointment: (id) => request(`/api/admin/rendez-vous/${id}`, { method: "DELETE", auth: true }),

  adminTariffs: (params = {}) => {
    const q = new URLSearchParams();
    if (params.domain) q.set("domain", params.domain);
    if (params.active != null) q.set("active", params.active ? "1" : "0");
    const qs = q.toString();
    return request(`/api/admin/tarifs${qs ? `?${qs}` : ""}`, { auth: true });
  },
  createAdminTariff: (body) => request("/api/admin/tarifs", { method: "POST", body, auth: true }),
  updateAdminTariff: (id, body) => request(`/api/admin/tarifs/${id}`, { method: "PATCH", body, auth: true }),
  deleteAdminTariff: (id) => request(`/api/admin/tarifs/${id}`, { method: "DELETE", auth: true }),
  seedAdminTariffs: () => request("/api/admin/tarifs/seed-catalog", { method: "POST", auth: true }),

  superAdminUsers: () => request("/api/admin/utilisateurs", { auth: true }),
  createSuperAdminUser: (body) =>
    request("/api/admin/utilisateurs", { method: "POST", body, auth: true }),
  updateSuperAdminUser: (id, body) =>
    request(`/api/admin/utilisateurs/${id}`, { method: "PATCH", body, auth: true }),
  superAdminLoginJournal: () => request("/api/admin/journal-connexions", { auth: true }),
  superAdminAccounting: () => request("/api/admin/comptabilite", { auth: true }),
  superAdminStatistics: () => request("/api/admin/statistiques", { auth: true }),
  superAdminDataOverview: () => request("/api/admin/donnees", { auth: true }),
  superAdminExportBackup: async () => {
    const token = getToken();
    const res = await fetch(apiUrl("/api/admin/donnees/backup"), {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      let message = "Export impossible.";
      try {
        const data = await res.json();
        message = data?.error || data?.message || message;
      } catch {
        /* ignore */
      }
      throw new ApiError(message, res.status);
    }
    const blob = await res.blob();
    const disposition = res.headers.get("content-disposition") || "";
    const match = disposition.match(/filename="?([^";]+)"?/i);
    const filename = match?.[1] || `saacare-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return { ok: true, filename };
  },
  superAdminPurgeData: (body) => request("/api/admin/donnees/purge", { method: "POST", body, auth: true }),

  // Public registry (Laravel)
  providers: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.domaine || params.domain) qs.set("domaine", params.domaine || params.domain);
    if (params.commune) qs.set("commune", params.commune);
    const query = qs.toString();
    return request(`/api/providers${query ? `?${query}` : ""}`);
  },
  provider: (reference) => request(`/api/providers/${encodeURIComponent(reference)}`),
  verifySeal: (seal) => request(`/api/providers/verify?seal=${encodeURIComponent(seal)}`),

  // Formulaires publics
  contact: (body) => request("/api/contact", { method: "POST", body }),
  request: (body) => request("/api/requests", { method: "POST", body }),
  quote: (body) => request("/api/quotes/request", { method: "POST", body }),
};
