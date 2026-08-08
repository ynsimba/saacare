const TOKEN_KEY = "saacare_token";

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

  const res = await fetch(path, opts);
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(data?.error || "Une erreur est survenue.", res.status, data?.details);
  }

  return data;
}

export const api = {
  health: () => request("/api/health"),
  register: (body) => request("/api/auth/register", { method: "POST", body }),
  login: (body) => request("/api/auth/login", { method: "POST", body }),
  me: () => request("/api/auth/me", { auth: true }),
  updateProfile: (body) => request("/api/auth/me", { method: "PATCH", body, auth: true }),
  changePassword: (body) => request("/api/auth/me/password", { method: "PATCH", body, auth: true }),
  contact: (body) => request("/api/contact", { method: "POST", body }),
  apply: (body) => request("/api/applications", { method: "POST", body }),
  providers: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.domaine) qs.set("domaine", params.domaine);
    if (params.commune) qs.set("commune", params.commune);
    const query = qs.toString();
    return request(`/api/providers${query ? `?${query}` : ""}`);
  },
  provider: (id) => request(`/api/providers/${id}`),
};
