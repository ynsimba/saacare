import {
  LayoutDashboard,
  UserRound,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  Briefcase,
  Bell,
  Clock,
  CalendarDays,
  Wallet,
  Star,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export const CLIENT_NAV = [
  { to: "/client/dashboard", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/client/profil", label: "Mon profil", icon: UserRound },
  { to: "/client/reservations", label: "Mes réservations", icon: CalendarCheck },
  { to: "/client/paiements", label: "Paiements", icon: CreditCard },
  { to: "/client/messages", label: "Messages", icon: MessageSquare },
];

export const PRESTATAIRE_NAV = [
  { to: "/prestataire/dashboard", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/prestataire/profil", label: "Mon profil", icon: UserRound },
  { to: "/prestataire/missions", label: "Missions", icon: Briefcase },
  { to: "/prestataire/notifications", label: "Notifications", icon: Bell },
  { to: "/prestataire/disponibilite", label: "Disponibilité", icon: Clock },
  { to: "/prestataire/planning", label: "Planning", icon: CalendarDays },
  { to: "/prestataire/gains", label: "Gains", icon: Wallet },
  { to: "/prestataire/avis", label: "Avis", icon: Star },
];

/** Navigation horizontale (espace client / prestataire / onglets profil). */
export function SpaceNav({ links, variant = "pills", className = "" }) {
  const isTabs = variant === "tabs";

  return (
    <nav
      aria-label="Navigation de l’espace"
      className={
        isTabs
          ? `flex gap-1 overflow-x-auto overscroll-x-contain px-2 sm:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`
          : `flex gap-2 overflow-x-auto pb-1 ${className}`
      }
    >
      {links.map(({ to, label, icon: Icon, end, soon }) =>
        soon ? (
          <span
            key={to}
            className={
              isTabs
                ? "inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-3.5 text-sm font-medium text-ink-900/35"
                : "inline-flex shrink-0 items-center gap-2 rounded-lg border border-ink-900/6 bg-white/60 px-3 py-2.5 text-sm font-medium text-ink-900/35"
            }
            title="Bientôt disponible"
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </span>
        ) : (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isTabs
                ? `inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-teal-600 text-teal-700"
                      : "border-transparent text-ink-900/60 hover:border-ink-900/15 hover:text-ink-900"
                  }`
                : `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-navy-700 text-white"
                      : "border border-ink-900/8 bg-white text-ink-900/70 hover:border-ink-900/15 hover:text-ink-900"
                  }`
            }
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </NavLink>
        )
      )}
    </nav>
  );
}
