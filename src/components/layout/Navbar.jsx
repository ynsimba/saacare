import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { Menu, X, ChevronDown, ArrowUpRight, Phone, MessageCircle } from "lucide-react";
import Button from "../ui/Button";
import DomainIcon from "../ui/DomainIcon";
import { domains } from "../../data/domains";
import { PHONE, PHONE_HREF, WHATSAPP_HREF } from "../../data/site";
import { THEME } from "../../lib/theme";
import { EASE, useIsReducedMotion } from "../../lib/motion";
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
      <span className="relative block h-9 sm:h-11 xl:h-12">
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
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const closeTimer = useRef(null);
  const lastY = useRef(0);
  const espaceTo = homeForRole(user?.role);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 });

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 16);
    const goingDown = y > lastY.current;
    setHidden(!open && goingDown && y > 320);
    lastY.current = y;
  });

  const onDark = navTheme === "dark" && !scrolled && !open;
  const solid = scrolled || open;

  useEffect(() => {
    lastY.current = window.scrollY;
    setScrolled(window.scrollY > 16);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
    setHovered(null);
  }, [location.pathname]);

  /* Menu mobile : verrou du défilement, focus initial, fermeture via Échap. */
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("a,button")?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

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
      className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]"
    >
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: solid ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="glass absolute inset-0 shadow-soft"
      />

      <nav
        className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8"
        aria-label="Navigation principale"
      >
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
                              className="flex h-full items-center justify-between gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
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
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className={`relative flex size-11 items-center justify-center rounded-full transition-colors duration-300 xl:hidden ${
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

      {/* ---------- Barre de progression de lecture ---------- */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className={`absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[linear-gradient(90deg,var(--color-teal-600),var(--color-gold-500))] transition-opacity duration-300 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* ---------- Panneau latéral mobile ---------- */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 top-[calc(4rem+env(safe-area-inset-top))] z-40 bg-ink-950/40 backdrop-blur-sm sm:top-[calc(5rem+env(safe-area-inset-top))] xl:hidden"
              aria-hidden="true"
            />
            <motion.div
              key="panel"
              id="mobile-menu"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="fixed bottom-0 right-0 top-[calc(4rem+env(safe-area-inset-top))] z-40 w-full max-w-md overflow-y-auto border-l border-ink-900/8 bg-paper-50 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:top-[calc(5rem+env(safe-area-inset-top))] xl:hidden"
            >
              <div className="flex flex-col gap-2.5 border-b border-ink-900/8 px-4 py-5">
                <Button to={user ? espaceTo : "/login"} variant="primary" size="lg" className="w-full">
                  {user ? "Mon espace" : "Connexion"}
                </Button>
              </div>

              <motion.ul
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
                className="flex flex-col gap-1 px-4 pt-4"
              >
                {NAV_LINKS.filter((l) => !l.children).map((link) => (
                  <motion.li
                    key={link.to}
                    variants={{ hidden: { opacity: 0, x: 18 }, show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } } }}
                  >
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                          isActive ? "bg-teal-50 text-teal-700" : "text-ink-900/80 hover:bg-ink-900/4"
                        }`
                      }
                    >
                      {link.label}
                      <ArrowUpRight className="size-4 opacity-40" aria-hidden="true" />
                    </NavLink>
                  </motion.li>
                ))}
              </motion.ul>

              <div className="px-4 pt-5">
                <p className="px-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-navy-500">
                  Nos solutions
                </p>
                <ul className="mt-2.5 grid grid-cols-2 gap-2">
                  {domains.map((d) => (
                    <li key={d.slug}>
                      <Link
                        to={`/solutions/${d.slug}`}
                        className="flex h-full flex-col gap-2 rounded-2xl border border-ink-900/8 bg-paper-100 p-3.5 transition-colors hover:border-ink-900/20"
                      >
                        <span className={`grid size-9 place-items-center rounded-lg ${THEME[d.theme]?.chip}`}>
                          <DomainIcon name={d.icon} className="size-4.5" />
                        </span>
                        <span className="text-sm font-semibold leading-tight text-ink-900">{d.name}</span>
                        {!d.available && (
                          <span className="text-[0.65rem] font-medium uppercase tracking-wide text-navy-500">{d.phase}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-col gap-1 border-t border-ink-900/8 px-4 py-5">
                <a href={PHONE_HREF} className="flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium text-ink-900/80 hover:bg-ink-900/4">
                  <Phone className="size-4 text-teal-600" aria-hidden="true" /> {PHONE}
                </a>
                <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium text-ink-900/80 hover:bg-ink-900/4">
                  <MessageCircle className="size-4 text-teal-600" aria-hidden="true" /> WhatsApp
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
