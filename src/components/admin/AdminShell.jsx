import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LogOut, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import "@fontsource/urbanist/latin-400.css";
import "@fontsource/urbanist/latin-500.css";
import "@fontsource/urbanist/latin-600.css";
import "@fontsource/urbanist/latin-700.css";
import { useAuth } from "../../lib/auth";
import BottomSheet from "../ui/BottomSheet";
import { adminDayGreeting, adminDayGreetingParts } from "../../lib/adminGreeting";
import { initials } from "./DeskUI";
import { onMediaChange, readMedia } from "../../lib/userMedia";

const SIDEBAR_KEY = "saacare.admin.sidebarExpanded";

/** Liens prioritaires sur mobile (pas de scroll). Le reste passe dans « Plus ». */
const MOBILE_PRIMARY_PATHS = [
  "/admin/dashboard",
  "/admin/prestataires",
  "/admin/missions",
  "/admin/commandes",
];

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
  const greetingParts = adminDayGreetingParts(user);

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
          <header className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:flex-wrap lg:gap-3 lg:px-8 lg:pt-6">
            <Link to="/admin/dashboard" className="lg:hidden" aria-label="SaaCare">
              <img src="/icone.png" alt="" width={36} height={36} className="size-9 object-contain" />
            </Link>

            <p className="hidden text-3xl font-semibold leading-none tracking-tight lg:block">{greeting}</p>

            <div className="ml-auto flex min-w-0 flex-1 items-center gap-3 sm:max-w-sm sm:flex-none lg:w-80 lg:max-w-none">
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

          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6">
            <section
              aria-label="Salutation"
              className="relative mb-5 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-white via-white to-desk-butter/70 px-5 py-4 shadow-[0_10px_30px_-18px_rgba(29,31,36,0.35)] lg:hidden"
            >
              <div
                className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full bg-desk-ink/[0.04]"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-10 left-8 size-24 rounded-full bg-desk-butter"
                aria-hidden="true"
              />
              <p className="relative text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-desk-ink/45">
                {greetingParts.hello}
              </p>
              <p className="relative mt-1.5 text-[1.65rem] font-semibold leading-none tracking-tight text-desk-ink">
                {greetingParts.title ? (
                  <>
                    <span className="text-desk-ink/55">{greetingParts.title}</span> {greetingParts.name}
                  </>
                ) : (
                  greetingParts.name || "Admin"
                )}
              </p>
              <p className="relative mt-2 text-sm text-desk-ink/55">Back-office SaaCare</p>
            </section>

            <Outlet context={{ query: query.trim().toLowerCase() }} />
          </main>
        </div>
      </div>

      <MobileAdminDock links={links} onLogout={logout} />
    </div>
  );
}

function MobileAdminDock({ links, onLogout }) {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const byPath = new Map(links.map((l) => [l.to, l]));
  const primary = MOBILE_PRIMARY_PATHS.map((to) => byPath.get(to)).filter(Boolean);
  const primarySet = new Set(MOBILE_PRIMARY_PATHS);
  const more = links.filter((l) => !primarySet.has(l.to));
  const moreActive = more.some((l) => isRailActive(pathname, l));

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const closeMore = useCallback(() => setMoreOpen(false), []);

  return (
    <>
      <BottomSheet open={moreOpen} onClose={closeMore} title="Plus" className="admin-ui lg:hidden">
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {more.map((link) => {
                const { to, label, icon: Icon, soon } = link;
                const active = !soon && isRailActive(pathname, link);
                if (soon) {
                  return (
                    <li key={to}>
                      <span className="flex flex-col items-center gap-1.5 rounded-2xl bg-desk-canvas/80 px-2 py-3 text-desk-ink/30">
                        <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
                        <span className="line-clamp-2 text-center text-[0.7rem] font-medium leading-tight">{label}</span>
                      </span>
                    </li>
                  );
                }
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      onClick={() => setMoreOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 transition-colors ${
                        active ? "bg-desk-ink text-white" : "bg-desk-canvas text-desk-ink hover:bg-desk-ink/[0.08]"
                      }`}
                    >
                      <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
                      <span className="line-clamp-2 text-center text-[0.7rem] font-semibold leading-tight">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={onLogout}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-desk-canvas text-sm font-semibold text-desk-ink"
            >
              <LogOut className="size-5" aria-hidden="true" />
              Déconnexion
            </button>
      </BottomSheet>

      <nav
        aria-label="Navigation du back-office"
        className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-5 items-center gap-1 rounded-[1.75rem] bg-white px-1.5 py-2 shadow-[0_12px_40px_-12px_rgba(29,31,36,0.35)] lg:hidden"
      >
        {primary.map((link) => {
          const { to, label, icon: Icon } = link;
          const active = isRailActive(pathname, link);
          return (
            <Link
              key={to}
              to={to}
              title={label}
              aria-current={active ? "page" : undefined}
              className={`admin-rail-link flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 ${
                active ? "admin-rail-link--active" : "admin-rail-link--idle"
              }`}
            >
              <Icon className="relative z-10 size-6 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="relative z-10 max-w-full truncate px-0.5 text-[0.62rem] font-semibold leading-none">
                {label === "Tableau de bord" ? "Accueil" : label === "Missions actives" ? "Missions" : label === "Commandes" ? "Commandes" : label}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          title="Plus"
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
          onClick={() => setMoreOpen(true)}
          className={`admin-rail-link flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 ${
            moreActive || moreOpen ? "admin-rail-link--active" : "admin-rail-link--idle"
          }`}
        >
          <MoreHorizontal className="relative z-10 size-6 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span className="relative z-10 text-[0.62rem] font-semibold leading-none">Plus</span>
        </button>
      </nav>
    </>
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
