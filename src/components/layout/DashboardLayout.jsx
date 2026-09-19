import { Link, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Navigation,
  LogOut,
  ClipboardCheck,
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  Settings,
  BarChart3,
  Package,
  UserCog,
  ScrollText,
  Calculator,
  LineChart,
  Database,
  Tags,
} from "lucide-react";
import { homeForRole, useAuth } from "../../lib/auth";
import ClientProfileShell from "./ClientProfileShell";
import PrestataireProfileShell from "./PrestataireProfileShell";
import AdminShell from "../admin/AdminShell";
import { ProviderTripTrackingProvider } from "../tracking/ProviderTripTracking";
import MissionOfferModal from "../tracking/MissionOfferModal";
import { CLIENT_NAV, PRESTATAIRE_NAV, SpaceNav } from "./SpaceNav";

export { CLIENT_NAV, PRESTATAIRE_NAV, SpaceNav };

const SUPER_ADMIN_NAV = [
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: UserCog, match: "users" },
  { to: "/admin/journal-connexions", label: "Journal connexions", icon: ScrollText, end: true },
  { to: "/admin/comptabilite", label: "Comptabilité", icon: Calculator, end: true },
  { to: "/admin/statistiques", label: "Statistiques", icon: LineChart, end: true },
  { to: "/admin/donnees", label: "Données", icon: Database, end: true },
];

function navForUser(user) {
  if (user?.role === "admin") {
    const links = [
      { to: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard, end: true },
      { to: "/admin/prestataires", label: "Prestataires", icon: Users, match: "providers" },
      { to: "/admin/prestataires/validation", label: "Validation", icon: ClipboardCheck, end: true },
      { to: "/admin/missions", label: "Missions actives", icon: Navigation, match: "missions" },
      { to: "/admin/clients", label: "Clients", icon: Users, match: "clients" },
      { to: "/admin/commandes", label: "Commandes", icon: Package, match: "orders" },
      { to: "/admin/demandes", label: "Demandes web", icon: Clock, end: true },
      { to: "/admin/devis", label: "Devis", icon: CalendarDays, end: true },
      { to: "/admin/paiements", label: "Paiements", icon: CreditCard, end: true },
      { to: "/admin/tarifs", label: "Grille tarifaire", icon: Tags, end: true },
      { to: "/admin/parametres", label: "Paramètres", icon: Settings, end: true },
      { to: "/admin/rapports", label: "Rapports", icon: BarChart3, end: true },
    ];
    if (user.isSuperAdmin) links.push(...SUPER_ADMIN_NAV);
    return links;
  }
  if (user?.role === "prestataire") {
    return PRESTATAIRE_NAV;
  }
  return CLIENT_NAV;
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const links = navForUser(user);
  const isClient = user?.role === "client";
  const isPrestataire = user?.role === "prestataire";
  const useProfileShell = isClient || isPrestataire;

  if (user?.role === "admin") return <AdminShell links={links} />;

  return (
    <div className="min-h-screen bg-paper-100">
      <header className="sticky top-0 z-40 border-b border-ink-900/8 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to={homeForRole(user?.role)} className="flex items-center gap-2.5">
            <img src="/logo.png" alt="SaaCare" width={1400} height={322} className="h-9 w-auto" />
            <span className="hidden rounded-md bg-teal-50 px-2 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-teal-700 sm:inline">
              Espace
            </span>
          </Link>

          <div className="flex items-center gap-3">
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

      {useProfileShell ? (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {isClient ? <ClientProfileShell /> : <PrestataireProfileShell />}
          <main className="mt-6 min-w-0">
            {isPrestataire ? (
              <ProviderTripTrackingProvider>
                <MissionOfferModal />
                <Outlet />
              </ProviderTripTrackingProvider>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr]">
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <SpaceNav links={links} className="lg:flex-col lg:overflow-visible" />
          </aside>
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      )}
    </div>
  );
}
