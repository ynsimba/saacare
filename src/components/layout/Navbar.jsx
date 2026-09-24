import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X, ChevronDown, ChevronRight, ArrowUpRight, Phone, MessageCircle } from "lucide-react";
import Button from "../ui/Button";
import BottomSheet from "../ui/BottomSheet";
import DomainIcon from "../ui/DomainIcon";
import { domains } from "../../data/domains";
import { PHONE, PHONE_HREF, WHATSAPP_HREF } from "../../data/site";
import { THEME } from "../../lib/theme";
import { EASE, haptic, springs, useIsReducedMotion } from "../../lib/motion";
import { useNavTheme } from "../../lib/navTheme";
import { homeForRole, useAuth } from "../../lib/auth";

/** Menu principal du cahier des charges §2.1. */
const NAV_LINKS = [
  {
    to: "/solutions",
    label: "Nos solutions",
    children: domains.map((d) => ({
      to: `/solutions/${d.slug}`,
      label: d.name,
      description: d.tagline,
      icon: d.icon,
      theme: d.theme,
      phase: d.available ? null : d.phase,
    })),
  },
  { to: "/prestataires", label: "Trouver un prestataire" },
  { to: "/entreprises", label: "Entreprises" },
  { to: "/saatrust", label: "Le protocole SaaTrust" },
  { to: "/aide", label: "Aide" },
];

/**
 * Logo : version couleur sur fond clair, version négative blanche sur l'en-tête
 * sombre (charte §03). Les deux images restent montées et se croisent en fondu.
 * Largeur minimale écran de 180 px respectée dès la tablette.
 */
function Logo({ dark }) {
  return (
    <Link to="/" className="group flex shrink-0 items-center" aria-label="SaaCare — Accueil">
      <span className="relative block h-8 sm:h-9 xl:h-10">
        <motion.img
          src="/logo.png"
          alt=""
          width={1400}
          height={322}
          initial={false}
          animate={{ opacity: dark ? 0 : 1 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="h-full w-auto object-contain object-left"
        />
        <motion.img
          src="/logo-1.png"
          alt=""
          width={1400}
          height={322}
          fetchPriority="high"
          initial={false}
          animate={{ opacity: dark ? 1 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="absolute inset-0 h-full w-auto object-contain object-left"
        />
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [hovered, setHovered] = useState(null);
  const location = useLocation();
  const reduced = useIsReducedMotion();
  const navTheme = useNavTheme();
  const { user, loading: authLoading } = useAuth();
  const toggleRef = useRef(null);
  const closeTimer = useRef(null);
  const lastY = useRef(0);
  const espaceTo = homeForRole(user?.role);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 16);
    const goingDown = y > lastY.current;
    setHidden(!open && goingDown && y > 320);
    lastY.current = y;
  });

  const onDark = navTheme === "dark" && !scrolled && !open;

  useEffect(() => {
    lastY.current = window.scrollY;
    setScrolled(window.scrollY > 16);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
    setHovered(null);
  }, [location.pathname]);

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!openMenu) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpenMenu(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openMenu]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const scheduleClose = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 160);
  }, []);
  const cancelClose = useCallback(() => window.clearTimeout(closeTimer.current), []);

  const linkBase =
    "relative z-10 block whitespace-nowrap rounded-md px-3 py-2 text-[0.84rem] font-medium transition-colors duration-300";
  const linkTone = (isActive) => {
    if (isActive) return onDark ? "text-paper-50" : "text-teal-700";
    return onDark ? "text-paper-50/80 hover:text-paper-50" : "text-ink-900/70 hover:text-ink-900";
  };

  return (
    <motion.header
      initial={false}
      animate={{ y: hidden && !reduced ? "-110%" : "0%" }}
      transition={{ duration: 0.45, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-[calc(env(safe-area-inset-top)+0.5rem)] sm:px-5 sm:pt-[calc(env(safe-area-inset-top)+0.75rem)]"
    >
      <nav
        className="relative isolate mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full pl-4 pr-2 sm:h-16 sm:pl-6 sm:pr-2.5"
        aria-label="Navigation principale"
      >
        {/* Verre liquide : la barre flotte au-dessus du contenu, plus dense une fois la page défilée */}
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ opacity: onDark ? 0.18 : 1, scale: scrolled ? 1 : 1.01 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="glass-capsule absolute inset-0 -z-10 rounded-full"
        />
        <Logo dark={onDark} />

        {/* ---------- Liens (grand écran) ---------- */}
        <ul
          className="hidden items-center gap-0.5 xl:flex"
          onMouseLeave={() => {
            setHovered(null);
            scheduleClose();
          }}
        >
          {NAV_LINKS.map((link) => {
            const key = link.to;
            const hasChildren = Boolean(link.children);
            const isMenuOpen = openMenu === key;
            const sectionActive = location.pathname.startsWith("/solutions");

            return (
              <li
                key={key}
                className="relative"
                onMouseEnter={() => {
                  cancelClose();
                  setHovered(key);
                  setOpenMenu(hasChildren ? key : null);
                }}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    aria-expanded={isMenuOpen}
                    aria-haspopup="true"
                    onClick={() => setOpenMenu(isMenuOpen ? null : key)}
                    className={`${linkBase} ${linkTone(sectionActive)} inline-flex items-center gap-1.5`}
                  >
                    {link.label}
                    <ChevronDown
                      className={`size-3.5 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  <NavLink to={link.to} className={({ isActive }) => `${linkBase} ${linkTone(isActive)}`}>
                    {({ isActive }) => (
                      <span className="relative">
                        {link.label}
                        {isActive && (
                          <motion.span
                            layoutId="nav-active-underline"
                            className="absolute -bottom-1.5 left-0 h-[2px] w-full rounded-full bg-gold-500"
                            transition={{ duration: 0.4, ease: EASE }}
                          />
                        )}
                      </span>
                    )}
                  </NavLink>
                )}

                {hovered === key && (
                  <motion.span
                    layoutId="nav-hover-pill"
                    aria-hidden="true"
                    className={`absolute inset-0 rounded-md ${onDark ? "bg-white/10" : "bg-ink-900/6"}`}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}

                {/* ---------- Méga-menu des sept pôles ---------- */}
                <AnimatePresence>
                  {hasChildren && isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      onMouseEnter={cancelClose}
                      className="absolute left-0 top-full z-50 w-[40rem] pt-3"
                    >
                      <div className="glass overflow-hidden rounded-2xl p-2.5 shadow-lifted">
                        <ul className="grid grid-cols-2 gap-1.5">
                          {link.children.map((child) => (
                            <li key={child.to}>
                              <Link
                                to={child.to}
                                className="group flex items-start gap-3 rounded-xl p-3 transition-colors duration-300 hover:bg-teal-50"
                              >
                                <span
                                  className={`grid size-9 shrink-0 place-items-center rounded-lg transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 ${
                                    THEME[child.theme]?.chip ?? THEME.teal.chip
                                  }`}
                                >
                                  <DomainIcon name={child.icon} className="size-4.5" />
                                </span>
                                <span className="min-w-0">
                                  <span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-ink-900">
                                    {child.label}
                                    {child.phase && (
                                      <span className="rounded-full bg-paper-200 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-navy-500">
                                        {child.phase}
                                      </span>
                                    )}
                                  </span>
                                  <span className="mt-0.5 block text-xs leading-snug text-ink-900/60">
                                    {child.description}
                                  </span>
                                </span>
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link
                              to="/solutions"
                              className="flex h-full items-center justify-between gap-2 rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                            >
                              Voir toutes nos solutions
                              <ArrowUpRight className="size-4" aria-hidden="true" />
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        {/* ---------- Actions (grand écran) ---------- */}
        <div className="hidden items-center gap-2 xl:flex">
          {!authLoading && !user && (
            <Button to="/inscription/client" variant={onDark ? "glass" : "outline"} size="sm" magnetic>
              S’inscrire
            </Button>
          )}
          {!authLoading && (
            <Button
              to={user ? espaceTo : "/login"}
              variant={onDark ? "onDark" : "primary"}
              size="sm"
              magnetic
            >
              {user ? "Mon espace" : "Connexion"}
            </Button>
          )}
        </div>

        {/* ---------- Bouton menu (mobile et tablette) ---------- */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => {
            haptic();
            setOpen((o) => !o);
          }}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className={`tap relative flex size-11 items-center justify-center rounded-full transition-colors duration-300 xl:hidden ${
            onDark ? "text-paper-50 hover:bg-white/10" : "text-ink-900 hover:bg-ink-900/5"
          }`}
        >
          <AnimatePresence initial={false} mode="wait">
            {open ? (
              <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.22 }}>
                <X className="size-6" aria-hidden="true" />
              </motion.span>
            ) : (
              <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.22 }}>
                <Menu className="size-6" aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
          <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
        </button>
      </nav>


      {/* ---------- Menu mobile : feuille glissante depuis le bas ---------- */}
      <BottomSheet open={open} onClose={closeMenu} title="Menu" maxHeight="90dvh">
        <div id="mobile-menu">
          <div className="grid grid-cols-2 gap-2">
            {!user && (
              <Button to="/inscription/client" variant="outline" size="lg" className="tap w-full rounded-2xl">
                S’inscrire
              </Button>
            )}
            <Button
              to={user ? espaceTo : "/login"}
              variant="primary"
              size="lg"
              className={`tap w-full rounded-2xl ${user ? "col-span-2" : ""}`}
            >
              {user ? "Mon espace" : "Connexion"}
            </Button>
          </div>

          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
            className="mt-4 overflow-hidden rounded-2xl border border-ink-900/6 bg-paper-100"
          >
            {NAV_LINKS.filter((l) => !l.children).map((link) => (
              <motion.li
                key={link.to}
                className="border-b border-ink-900/6 last:border-b-0"
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: springs.gentle } }}
              >
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `tap flex min-h-13 items-center justify-between px-4 py-3 text-[0.95rem] font-medium ${
                      isActive ? "text-teal-700" : "text-ink-900/85"
                    }`
                  }
                >
                  {link.label}
                  <ChevronRight className="size-4 opacity-35" aria-hidden="true" />
                </NavLink>
              </motion.li>
            ))}
          </motion.ul>

          <p className="mt-6 px-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-navy-500">Nos solutions</p>
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.18 } } }}
            className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {domains.map((d) => (
              <motion.li
                key={d.slug}
                variants={{ hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1, transition: springs.gentle } }}
              >
                <Link
                  to={`/solutions/${d.slug}`}
                  className="tap flex h-full flex-col gap-2 rounded-2xl border border-ink-900/6 bg-paper-100 p-3.5"
                >
                  <span className={`grid size-9 place-items-center rounded-xl ${THEME[d.theme]?.chip}`}>
                    <DomainIcon name={d.icon} className="size-4.5" />
                  </span>
                  <span className="text-sm font-semibold leading-tight text-ink-900">{d.name}</span>
                  {!d.available && (
                    <span className="text-[0.65rem] font-medium uppercase tracking-wide text-navy-500">{d.phase}</span>
                  )}
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <a href={PHONE_HREF} className="tap flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal-50 px-3 text-sm font-semibold text-teal-700">
              <Phone className="size-4" aria-hidden="true" /> Appeler
            </a>
            <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="tap flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal-50 px-3 text-sm font-semibold text-teal-700">
              <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
            </a>
          </div>
          <p className="mt-3 text-center text-xs text-ink-900/45">{PHONE}</p>
        </div>
      </BottomSheet>
    </motion.header>
  );
}
