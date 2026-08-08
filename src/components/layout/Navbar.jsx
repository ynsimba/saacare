import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { Menu, X, ChevronDown, ArrowUpRight, Phone, LogIn, LayoutDashboard } from "lucide-react";
import Button from "../ui/Button";
import DomainIcon from "../ui/DomainIcon";
import { domains } from "../../data/domains";
import { EASE, useIsReducedMotion } from "../../lib/motion";
import { useNavTheme } from "../../lib/navTheme";
import { homeForRole, useAuth } from "../../lib/auth";

const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  {
    to: "/comment-ca-marche",
    label: "Nos domaines",
    children: domains.map((d) => ({
      to: `/domaines/${d.slug}`,
      label: d.name,
      description: d.tagline,
      icon: d.icon,
      theme: d.theme,
    })),
  },
  { to: "/comment-ca-marche", label: "Comment ça marche" },
  { to: "/a-propos", label: "À propos" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

const ACCENT = {
  teal: "bg-teal-100 text-teal-700",
  navy: "bg-navy-700/10 text-navy-700",
  gold: "bg-gold-100 text-gold-800",
  coral: "bg-coral-100 text-coral-800",
};

/**
 * Deux versions du logo se croisent en fondu selon le fond de la barre :
 * la version claire (`logo-1.png`) au chargement, tant que la barre est
 * transparente sur l'en-tête sombre ; la version couleur (`logo.png`) dès que
 * la barre passe en verre dépoli clair au défilement.
 *
 * Les deux images sont montées en permanence et superposées : la bascule est un
 * simple changement d'opacité, sans requête réseau ni clignotement au scroll.
 */
function Logo({ dark }) {
  return (
    <Link
      to="/"
      className="group flex shrink-0 items-center"
      aria-label="SaaCare — Accueil"
    >
      <span className="relative block h-10 max-w-[9.5rem] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.04] sm:h-12 sm:max-w-none lg:h-14">
        {/* Version couleur — définit la largeur du bloc */}
        <motion.img
          src="/logo.png"
          alt=""
          width={2480}
          height={781}
          initial={false}
          animate={{ opacity: dark ? 0 : 1 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="h-full w-auto object-contain object-left"
        />
        {/* Version claire — superposée, visible sur fond sombre */}
        <motion.img
          src="/logo-1.png"
          alt=""
          width={2480}
          height={781}
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
  const { user, logout, loading: authLoading } = useAuth();
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const closeTimer = useRef(null);
  const lastY = useRef(0);
  const espaceTo = homeForRole(user?.role);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 });

  /* Affiche la barre en verre dépoli après quelques pixels, et la masque
     lorsqu'on descend rapidement (elle revient dès qu'on remonte). */
  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 16);
    const goingDown = y > lastY.current;
    setHidden(!open && goingDown && y > 320);
    lastY.current = y;
  });

  /* Barre transparente sur fond sombre uniquement en haut d'une page à hero sombre. */
  const onDark = navTheme === "dark" && !scrolled && !open;
  const solid = scrolled || open;

  // État initial correct même si la page est rechargée en cours de défilement.
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
    const first = panelRef.current?.querySelector("a,button");
    first?.focus();
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

  /* Fermeture du méga-menu à la touche Échap. */
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
    "relative z-10 block rounded-md px-3.5 py-2 text-sm font-medium transition-colors duration-300";
  const linkTone = (isActive) => {
    if (isActive) return onDark ? "text-paper-50" : "text-teal-700";
    return onDark ? "text-paper-100/72 hover:text-paper-50" : "text-ink-900/65 hover:text-ink-900";
  };

  return (
    <motion.header
      initial={false}
      animate={{ y: hidden && !reduced ? "-110%" : "0%" }}
      transition={{ duration: 0.45, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]"
    >
      {/* Fond animé : apparaît en fondu au défilement */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: solid ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="glass absolute inset-0 shadow-soft"
      />

      <nav
        className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:gap-6 sm:px-6 lg:px-8"
        aria-label="Navigation principale"
      >
        <Logo dark={onDark} />

        {/* ---------- Liens (desktop) ---------- */}
        <ul
          className="hidden items-center gap-0.5 lg:flex"
          onMouseLeave={() => {
            setHovered(null);
            scheduleClose();
          }}
        >
          {NAV_LINKS.map((link, index) => {
            const key = `${link.to}-${index}`;
            const hasChildren = Boolean(link.children);
            const isMenuOpen = openMenu === key;

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
                    className={`${linkBase} ${linkTone(false)} inline-flex items-center gap-1.5`}
                  >
                    {link.label}
                    <ChevronDown
                      className={`size-3.5 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  <NavLink to={link.to} end={link.to === "/"} className={({ isActive }) => `${linkBase} ${linkTone(isActive)}`}>
                    {({ isActive }) => (
                      <>
                        <span className="relative">
                          {link.label}
                          {isActive && (
                            <motion.span
                              layoutId="nav-active-underline"
                              className={`absolute -bottom-1.5 left-0 h-[2px] w-full rounded-full ${
                                onDark ? "bg-teal-300" : "bg-teal-600"
                              }`}
                              transition={{ duration: 0.4, ease: EASE }}
                            />
                          )}
                        </span>
                      </>
                    )}
                  </NavLink>
                )}

                {/* Pastille de survol qui glisse d'un lien à l'autre */}
                {hovered === key && (
                  <motion.span
                    layoutId="nav-hover-pill"
                    aria-hidden="true"
                    className={`absolute inset-0 rounded-md ${onDark ? "bg-white/10" : "bg-ink-900/6"}`}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}

                {/* ---------- Méga-menu des domaines ---------- */}
                <AnimatePresence>
                  {hasChildren && isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      onMouseEnter={cancelClose}
                      className="absolute left-1/2 top-full z-50 w-[34rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 pt-3"
                    >
                      <div className="glass overflow-hidden rounded-2xl p-2.5 shadow-lifted">
                        <ul className="grid grid-cols-2 gap-1.5">
                          {link.children.map((child) => (
                            <li key={child.to}>
                              <Link
                                to={child.to}
                                className="group flex items-start gap-3 rounded-xl p-3 transition-colors duration-300 hover:bg-ink-900/4"
                              >
                                <span
                                  className={`grid size-9 shrink-0 place-items-center rounded-lg transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 ${
                                    ACCENT[child.theme] ?? ACCENT.teal
                                  }`}
                                >
                                  <DomainIcon name={child.icon} className="size-4.5" />
                                </span>
                                <span className="min-w-0">
                                  <span className="flex items-center gap-1 text-sm font-semibold text-ink-900">
                                    {child.label}
                                    <ArrowUpRight className="size-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-60" aria-hidden="true" />
                                  </span>
                                  <span className="mt-0.5 block text-xs leading-snug text-ink-900/55">
                                    {child.description}
                                  </span>
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <Link
                          to="/trouver-un-prestataire"
                          className="mt-1.5 flex items-center justify-between rounded-xl bg-navy-700/5 px-4 py-3 text-sm font-medium text-navy-700 transition-colors hover:bg-navy-700/10"
                        >
                          Voir tous les prestataires vérifiés
                          <ArrowUpRight className="size-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        {/* ---------- Actions (desktop) ---------- */}
        <div className="hidden items-center gap-2 lg:flex">
          {!authLoading && user ? (
            <>
              <Button to={espaceTo} variant={onDark ? "glass" : "secondary"} size="sm">
                <span className="inline-flex items-center gap-1.5">
                  <LayoutDashboard className="size-3.5" aria-hidden="true" />
                  Mon espace
                </span>
              </Button>
              <button
                type="button"
                onClick={logout}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  onDark ? "text-paper-100/70 hover:text-paper-50" : "text-ink-900/60 hover:text-ink-900"
                }`}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Button to="/connexion" variant={onDark ? "glass" : "primary"} size="sm" magnetic>
              Connexion
            </Button>
          )}
        </div>

        {/* ---------- Bouton menu (mobile) ---------- */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className={`relative flex size-11 items-center justify-center rounded-full transition-colors duration-300 lg:hidden ${
            onDark ? "text-paper-50 hover:bg-white/10" : "text-ink-900 hover:bg-ink-900/5"
          }`}
        >
          <AnimatePresence initial={false} mode="wait">
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <X className="size-6" aria-hidden="true" />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
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
        className={`absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[linear-gradient(90deg,var(--color-teal-500),var(--color-gold-500),var(--color-coral-500))] transition-opacity duration-300 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* ---------- Panneau mobile plein écran ---------- */}
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
              className="fixed inset-0 top-[calc(4rem+env(safe-area-inset-top))] z-40 bg-ink-950/40 backdrop-blur-sm sm:top-[calc(5rem+env(safe-area-inset-top))] lg:hidden"
              aria-hidden="true"
            />
            <motion.div
              key="panel"
              id="mobile-menu"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] z-40 max-h-[calc(100svh-4rem-env(safe-area-inset-top))] overflow-y-auto border-t border-ink-900/8 bg-paper-50 pb-[env(safe-area-inset-bottom)] sm:top-[calc(5rem+env(safe-area-inset-top))] sm:max-h-[calc(100svh-5rem-env(safe-area-inset-top))] lg:hidden"
            >
              <motion.ul
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
                className="flex flex-col gap-1 px-4 pt-5"
              >
                {NAV_LINKS.filter((l) => !l.children).map((link, index) => (
                  <motion.li
                    key={`${link.to}-${index}`}
                    variants={{
                      hidden: { opacity: 0, x: -18 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
                    }}
                  >
                    <NavLink
                      to={link.to}
                      end={link.to === "/"}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium transition-colors ${
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

              {/* Domaines en grille */}
              <div className="px-4 pt-5">
                <p className="px-1 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-ink-900/40">
                  Nos domaines
                </p>
                <motion.ul
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }}
                  className="mt-2.5 grid grid-cols-2 gap-2"
                >
                  {domains.map((d) => (
                    <motion.li
                      key={d.slug}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
                      }}
                    >
                      <Link
                        to={`/domaines/${d.slug}`}
                        className="flex h-full flex-col gap-2 rounded-2xl border border-ink-900/8 bg-paper-100 p-3.5 transition-colors hover:border-ink-900/20"
                      >
                        <span className={`grid size-9 place-items-center rounded-lg ${ACCENT[d.theme] ?? ACCENT.teal}`}>
                          <DomainIcon name={d.icon} className="size-4.5" />
                        </span>
                        <span className="text-sm font-semibold leading-tight text-ink-900">{d.shortName}</span>
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 border-t border-ink-900/8 px-4 py-5">
                {!authLoading && user ? (
                  <>
                    <Button to={espaceTo} variant="primary" size="lg" className="w-full">
                      <span className="inline-flex items-center gap-2">
                        <LayoutDashboard className="size-4" aria-hidden="true" />
                        Mon espace
                      </span>
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                      className="w-full rounded-lg border border-ink-900/10 px-4 py-3 text-sm font-semibold text-ink-900/70"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <Button to="/connexion" variant="primary" size="lg" className="w-full">
                    <span className="inline-flex items-center gap-2">
                      <LogIn className="size-4" aria-hidden="true" />
                      Connexion
                    </span>
                  </Button>
                )}
                <Button to="/contact" variant="outline" size="lg" className="w-full">
                  <span className="inline-flex items-center gap-2">
                    <Phone className="size-4" aria-hidden="true" />
                    Nous contacter
                  </span>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
