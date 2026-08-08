import { Link, NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  UserRound,
  LogOut,
  Briefcase,
  FileText,
  Home,
} from "lucide-react";
import { homeForRole, useAuth } from "../../lib/auth";

function navForRole(role) {
  if (role === "PROVIDER" || role === "ADMIN") {
    return [
      { to: "/espace-prestataire", label: "Tableau de bord", icon: LayoutDashboard, end: true },
      { to: "/espace-prestataire/candidature", label: "Ma candidature", icon: FileText },
      { to: "/espace/profil", label: "Mon profil", icon: UserRound },
    ];
  }
  return [
    { to: "/espace-client", label: "Tableau de bord", icon: LayoutDashboard, end: true },
    { to: "/trouver-un-prestataire", label: "Trouver un prestataire", icon: Search },
    { to: "/espace/profil", label: "Mon profil", icon: UserRound },
  ];
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const links = navForRole(user?.role);
  const initials = (user?.fullName || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-paper-100">
      <header className="sticky top-0 z-40 border-b border-ink-900/8 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to={homeForRole(user?.role)} className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="30" fill="#03294c" />
              <circle cx="32" cy="32" r="18" fill="#12877F" />
              <path
                d="M23 32.5 L29 38.5 L41 25"
                fill="none"
                stroke="#ffffff"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-display text-lg font-semibold text-ink-900">SaaCare</span>
            <span className="hidden rounded-md bg-teal-50 px-2 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-teal-700 sm:inline">
              Espace
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden items-center gap-1.5 text-sm font-medium text-ink-900/60 transition-colors hover:text-ink-900 sm:inline-flex"
            >
              <Home className="size-4" aria-hidden="true" />
              Site public
            </Link>
            <div className="flex items-center gap-2 rounded-lg border border-ink-900/8 bg-paper-100/80 px-2.5 py-1.5">
              <span className="grid size-8 place-items-center rounded-md bg-navy-700 font-mono text-xs font-semibold text-white">
                {initials}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-sm font-semibold text-ink-900">{user?.fullName}</span>
                <span className="block font-mono text-[0.65rem] uppercase tracking-wide text-ink-900/45">
                  {user?.role === "PROVIDER" ? "Prestataire" : user?.role === "ADMIN" ? "Admin" : "Client"}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-900/65 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Navigation de l’espace" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-navy-700 text-white"
                      : "border border-ink-900/8 bg-white text-ink-900/70 hover:border-ink-900/15 hover:text-ink-900"
                  }`
                }
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
            {user?.role === "CLIENT" && (
              <NavLink
                to="/devenir-prestataire"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-dashed border-teal-300 bg-teal-50/50 px-3 py-2.5 text-sm font-medium text-teal-800 transition-colors hover:bg-teal-50"
              >
                <Briefcase className="size-4" aria-hidden="true" />
                Devenir prestataire
              </NavLink>
            )}
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
