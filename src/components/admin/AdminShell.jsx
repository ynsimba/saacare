import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LogOut, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import "@fontsource/urbanist/latin-400.css";
import "@fontsource/urbanist/latin-500.css";
import "@fontsource/urbanist/latin-600.css";
import "@fontsource/urbanist/latin-700.css";
import { useAuth } from "../../lib/auth";
import { adminDayGreeting } from "../../lib/adminGreeting";
import { initials } from "./DeskUI";
import { onMediaChange, readMedia } from "../../lib/userMedia";

const SIDEBAR_KEY = "saacare.admin.sidebarExpanded";

function isRailActive(pathname, { to, end, match }) {
  if (match === "providers") {
    if (pathname.startsWith("/admin/prestataires/validation")) return false;
    return pathname === "/admin/prestataires" || pathname.startsWith("/admin/prestataires/");
  }
  if (match === "clients") {
    return pathname === "/admin/clients" || pathname.startsWith("/admin/clients/");
  }
  if (match === "orders") {
    return pathname === "/admin/commandes" || pathname.startsWith("/admin/commandes/");
  }
  if (match === "missions") {
    return pathname === "/admin/missions" || pathname.startsWith("/admin/missions/");
  }
  if (match === "users") {
    return pathname === "/admin/utilisateurs" || pathname.startsWith("/admin/utilisateurs/");
  }
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

/**
 * Cadre du back-office : rail d'icônes à gauche (extensible),
 * en-tête avec salutation selon l’heure + recherche et avatar.
 */
export default function AdminShell({ links }) {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [expanded, setExpanded] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === "1";
    } catch {
      return false;
    }
  });
  const greeting = adminDayGreeting(user);

  useEffect(() => {
    if (!user?.id) {
      setAvatarUrl("");
      return;
    }
    setAvatarUrl(readMedia(user.id, "avatar"));
    return onMediaChange(({ userId, kind, value }) => {
      if (String(userId) === String(user.id) && kind === "avatar") setAvatarUrl(value || "");
    });
  }, [user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, expanded ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [expanded]);

  return (
    <div className="admin-ui flex h-dvh min-h-0 flex-col overflow-hidden bg-desk-canvas text-desk-ink">
      <div className="flex min-h-0 w-full flex-1 overflow-hidden">
        <aside
          className={`hidden shrink-0 border-r border-desk-ink/5 bg-white transition-[width] duration-300 ease-out-expo lg:block ${
            expanded ? "w-56" : "w-20"
          }`}
        >
          <div
            className={`flex h-full flex-col py-5 ${
              expanded ? "items-stretch px-3" : "items-center px-2"
            }`}
          >
            <div className={`flex flex-col ${expanded ? "items-start px-1" : "items-center"}`}>
              <Link
                to="/admin/dashboard"
                aria-label="SaaCare — tableau de bord"
                className={`flex items-center ${expanded ? "w-full px-0.5" : "justify-center"}`}
              >
                {expanded ? (
                  <img
                    src="/logo.png"
                    alt="SaaCare"
                    className="h-11 w-auto max-w-[11.5rem] object-contain object-left"
                  />
                ) : (
                  <img
                    src="/icone.png"
                    alt=""
                    width={48}
                    height={48}
                    className="size-11 shrink-0 object-contain"
                  />
                )}
              </Link>

              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                title={expanded ? "Réduire le menu" : "Agrandir le menu"}
                aria-label={expanded ? "Réduire le menu" : "Agrandir le menu"}
                aria-expanded={expanded}
                className={`mt-2.5 flex items-center justify-center rounded-md text-desk-ink/35 transition-colors duration-200 hover:bg-desk-ink/[0.04] hover:text-desk-ink/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desk-ink/30 ${
                  expanded ? "h-7 w-7" : "size-7"
                }`}
              >
                {expanded ? (
                  <PanelLeftClose className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <PanelLeftOpen className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                )}
              </button>
            </div>

            <RailNav
              links={links}
              expanded={expanded}
              className={`mt-[100px] ${expanded ? "w-full flex-col gap-1" : "flex-col gap-2"}`}
            />

            <button
              type="button"
              onClick={logout}
              title="Déconnexion"
              className={`admin-rail-link admin-rail-link--idle mt-auto flex items-center rounded-full ${
                expanded ? "h-10 w-full gap-2.5 px-3 text-sm font-medium" : "size-11 justify-center"
              }`}
            >
              <LogOut className="relative z-10 size-5 shrink-0" aria-hidden="true" />
              {expanded ? (
                <span className="relative z-10">Déconnexion</span>
              ) : (
                <span className="sr-only">Déconnexion</span>
              )}
            </button>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:px-8 lg:pt-6">
            <Link to="/admin/dashboard" className="lg:hidden" aria-label="SaaCare">
              <img src="/icone.png" alt="" width={36} height={36} className="size-9 object-contain" />
            </Link>
            <p className="order-first w-full text-2xl font-semibold leading-none tracking-tight sm:order-none sm:w-auto sm:text-3xl">
              {greeting}
            </p>

            <div className="ml-auto flex flex-1 items-center gap-3 sm:max-w-sm sm:flex-none lg:w-80 lg:max-w-none">
              <label className="flex h-11 flex-1 items-center gap-2.5 rounded-full bg-white px-4 lg:h-12">
                <Search className="size-5 shrink-0 text-desk-ink" strokeWidth={1.5} aria-hidden="true" />
                <span className="sr-only">Rechercher</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher…"
                  className="w-full min-w-0 bg-transparent text-sm text-desk-ink outline-none placeholder:text-desk-muted"
                />
              </label>
              <Link
                to="/admin/parametres#admin-profile-edit"
                title="Modifier mon profil"
                aria-label="Modifier mon profil"
                className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-desk-butter text-sm font-bold text-desk-ink transition-transform duration-200 hover:scale-105 hover:ring-2 hover:ring-desk-ink/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desk-ink lg:size-12"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  initials(user?.fullName || "Admin")
                )}
              </Link>
            </div>
          </header>

          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6">
            <Outlet context={{ query: query.trim().toLowerCase() }} />
          </main>
        </div>
      </div>

      <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex items-center gap-1 overflow-x-auto rounded-full bg-white px-2 py-2 shadow-[0_12px_40px_-12px_rgba(29,31,36,0.35)] lg:hidden">
        <RailNav links={links} className="gap-1" />
        <button
          type="button"
          onClick={logout}
          title="Déconnexion"
          className="admin-rail-icon-btn ml-auto flex size-11 shrink-0 items-center justify-center rounded-full text-desk-ink"
        >
          <LogOut className="size-5" aria-hidden="true" />
          <span className="sr-only">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

function RailNav({ links, className = "", expanded = false }) {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Navigation du back-office" className={`flex items-center ${className}`}>
      {links.map((link) => {
        const { to, label, icon: Icon, soon } = link;

        if (soon) {
          return (
            <span
              key={to}
              title={`${label} — bientôt disponible`}
              className={
                expanded
                  ? "flex h-10 w-full items-center gap-2.5 rounded-full px-3 text-sm font-medium text-desk-ink/25"
                  : "flex size-10 items-center justify-center rounded-full text-desk-ink/25 lg:size-11"
              }
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {expanded ? (
                <span className="truncate">{label}</span>
              ) : (
                <span className="sr-only">{label} (bientôt disponible)</span>
              )}
            </span>
          );
        }

        const active = isRailActive(pathname, link);

        return (
          <Link
            key={to}
            to={to}
            title={label}
            aria-current={active ? "page" : undefined}
            className={`admin-rail-link ${
              active ? "admin-rail-link--active" : "admin-rail-link--idle"
            } ${
              expanded
                ? "admin-rail-link--labeled h-10 w-full gap-2.5 px-3 text-sm font-medium"
                : "size-10 justify-center lg:size-11"
            }`}
          >
            <Icon className="relative z-10 size-5 shrink-0" aria-hidden="true" />
            {expanded ? (
              <span className="relative z-10 truncate">{label}</span>
            ) : (
              <span className="sr-only">{label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
