import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { House, LayoutGrid, Search, Headset, UserRound, Phone, MessageCircle, Mail, LifeBuoy, ChevronRight } from "lucide-react";
import AppTabBar from "./AppTabBar";
import BottomSheet from "../ui/BottomSheet";
import { PHONE, PHONE_HREF, WHATSAPP_HREF, HOURS } from "../../data/site";
import { homeForRole, useAuth } from "../../lib/auth";
import { springs } from "../../lib/motion";

const CONTACT_ACTIONS = [
  { href: WHATSAPP_HREF, external: true, icon: MessageCircle, label: "WhatsApp", hint: "Réponse rapide", tone: "bg-teal-600 text-white" },
  { href: PHONE_HREF, icon: Phone, label: "Appeler", hint: PHONE, tone: "bg-teal-100 text-teal-700" },
  { to: "/contact", icon: Mail, label: "Envoyer un message", hint: "Formulaire de contact", tone: "bg-gold-100 text-gold-700" },
  { to: "/aide", icon: LifeBuoy, label: "Centre d’aide", hint: "Questions fréquentes", tone: "bg-sky text-navy-700" },
];

/**
 * Navigation « application » du site public sur mobile et tablette :
 * barre d'onglets flottante + feuille de contact (appel, WhatsApp, message).
 * Remplace la barre d'appel historique (cahier des charges §2.1 : contact
 * toujours à portée de pouce).
 */
export default function MobileCallBar() {
  const [contactOpen, setContactOpen] = useState(false);
  const { user } = useAuth();
  const { pathname } = useLocation();
  const closeContact = useCallback(() => setContactOpen(false), []);

  useEffect(() => {
    setContactOpen(false);
  }, [pathname]);

  const items = [
    { to: "/", label: "Accueil", icon: House, end: true },
    { to: "/solutions", label: "Solutions", icon: LayoutGrid },
    { to: "/prestataires", label: "Trouver un prestataire", short: "Demander", icon: Search, primary: true },
    {
      key: "contact",
      label: "Contact",
      icon: Headset,
      onClick: () => setContactOpen(true),
      active: contactOpen,
      expanded: contactOpen,
      badge: true,
    },
    user
      ? { to: homeForRole(user.role), label: "Mon espace", short: "Espace", icon: UserRound }
      : {
          to: "/login",
          label: "Compte",
          icon: UserRound,
          match: (p) => p === "/login" || p.startsWith("/inscription"),
        },
  ];

  return (
    <>
      <AppTabBar items={items} label="Navigation mobile" className="xl:hidden" />

      <BottomSheet open={contactOpen} onClose={closeContact} title="Support client">
        <p className="-mt-1 mb-4 text-sm text-ink-900/60">
          Une équipe à Kinshasa, {HOURS.toLowerCase()}.
        </p>
        <motion.ul
          className="flex flex-col gap-2"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } } }}
        >
          {CONTACT_ACTIONS.map(({ href, to, external, icon: Icon, label, hint, tone }) => {
            const inner = (
              <>
                <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tone}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.95rem] font-semibold text-ink-900">{label}</span>
                  <span className="block truncate text-xs text-ink-900/55">{hint}</span>
                </span>
                <ChevronRight className="size-4 text-ink-900/30" aria-hidden="true" />
              </>
            );
            const cls = "tap flex min-h-16 items-center gap-3.5 rounded-2xl border border-ink-900/6 bg-paper-100 px-3 py-2.5";
            return (
              <motion.li
                key={label}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: springs.gentle } }}
              >
                {to ? (
                  <Link to={to} onClick={closeContact} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={cls}>
                    {inner}
                  </a>
                )}
              </motion.li>
            );
          })}
        </motion.ul>
      </BottomSheet>
    </>
  );
}
