import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";
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
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { homeForRole, useAuth } from "../../lib/auth";
import ClientProfileShell from "./ClientProfileShell";
import PrestataireProfileShell from "./PrestataireProfileShell";
import AdminShell from "../admin/AdminShell";
import { ProviderTripTrackingProvider } from "../tracking/ProviderTripTracking";
import MissionOfferModal from "../tracking/MissionOfferModal";
import { CLIENT_NAV, PRESTATAIRE_NAV, SpaceNav } from "./SpaceNav";
import AppTabBar, { isTabActive } from "./AppTabBar";
import BottomSheet from "../ui/BottomSheet";
import { IS_COARSE_POINTER, springs, useIsReducedMotion } from "../../lib/motion";

export { CLIENT_NAV, PRESTATAIRE_NAV, SpaceNav };

const SUPER_ADMIN_NAV = [
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: UserCog, match: "users" },
  { to: "/admin/journal-connexions", label: "Journal connexions", icon: ScrollText, end: true },
  { to: "/admin/comptabilite", label: "Comptabilité", icon: Calculator, end: true },
  { to: "/admin/statistiques", label: "Statistiques", icon: LineChart, end: true },
  { to: "/admin/donnees", label: "Données", icon: Database, end: true },
];

/** Onglets prioritaires de la barre basse ; le reste passe dans « Plus ». */
const CLIENT_TABS = ["/client/dashboard", "/client/reservations", "/client/messages", "/client/paiements", "/client/profil"];
const PRESTATAIRE_TABS = ["/prestataire/dashboard", "/prestataire/missions", "/prestataire/planning", "/prestataire/gains"];

/** Barre d'onglets façon application pour les espaces client et prestataire (< lg). */
function SpaceTabBar({ links, primaryPaths, onLogout }) {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const closeMore = useCallback(() => setMoreOpen(false), []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const byPath = new Map(links.map((l) => [l.to, l]));
  const primary = primaryPaths.map((to) => byPath.get(to)).filter(Boolean);
  const more = links.filter((l) => !primaryPaths.includes(l.to));
  const moreActive = more.some((l) => isTabActive(pathname, l));

  const items = more.length
    ? [
        ...primary,
        {
          key: "more",
          label: "Plus de sections",
          short: "Plus",
          icon: LayoutGrid,
          onClick: () => setMoreOpen(true),
          active: moreOpen || moreActive,
          expanded: moreOpen,
        },
      ]
    : primary;

  return (
    <>
      <AppTabBar items={items} label="Navigation de l’espace" className="lg:hidden" />
      {more.length > 0 && (
        <BottomSheet
          open={moreOpen}
          onClose={closeMore}
          title="Plus"
          footer={
            <button
              type="button"
              onClick={onLogout}
              className="tap flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink-900/5 text-sm font-semibold text-ink-900/75"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Déconnexion
            </button>
          }
        >
          <motion.ul
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } } }}
          >
            {more.map(({ to, label, icon: Icon, end }) => {
              const active = isTabActive(pathname, { to, end });
              return (
                <motion.li
                  key={to}
                  variants={{ hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1, transition: springs.gentle } }}
                >
                  <Link
                    to={to}
                    aria-current={active ? "page" : undefined}
                    className={`tap flex min-h-24 flex-col justify-between gap-3 rounded-2xl border p-3.5 ${
                      active ? "border-teal-600/30 bg-teal-50 text-teal-700" : "border-ink-900/6 bg-paper-100 text-ink-900"
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <Icon className="size-5" aria-hidden="true" />
                      <ChevronRight className="size-4 opacity-30" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold leading-tight">{label}</span>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        </BottomSheet>
      )}
    </>
  );
}

/** Transition d'écran légère (sans flou sur tactile pour rester à 60 i/s). */
function ScreenTransition({ children }) {
  const { pathname } = useLocation();
  const reduced = useIsReducedMotion();
  if (reduced) return children;
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: IS_COARSE_POINTER ? 10 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.gentle}
    >
      {children}
    </motion.div>
  );
}

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
        <div className="mx-auto max-w-6xl px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-8 lg:pb-8">
          {isClient ? <ClientProfileShell /> : <PrestataireProfileShell />}
          <main className="mt-6 min-w-0">
            {isPrestataire ? (
              <ProviderTripTrackingProvider>
                <MissionOfferModal />
                <ScreenTransition>
                  <Outlet />
                </ScreenTransition>
              </ProviderTripTrackingProvider>
            ) : (
              <ScreenTransition>
                <Outlet />
              </ScreenTransition>
            )}
          </main>
          <SpaceTabBar
            links={links}
            primaryPaths={isClient ? CLIENT_TABS : PRESTATAIRE_TABS}
            onLogout={logout}
          />
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
