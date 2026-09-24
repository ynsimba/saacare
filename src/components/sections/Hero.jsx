import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useTransform } from "motion/react";
import { Search, ShieldCheck, Lock, Headphones, MapPin, BadgeCheck, ChevronDown, Check, ArrowRight } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import BottomSheet from "../ui/BottomSheet";
import { domains } from "../../data/domains";
import { COMMUNES } from "../../data/providerForm";
import { EASE, useIsReducedMotion, usePointerParallax } from "../../lib/motion";
import { useDeclareNavTheme } from "../../lib/navTheme";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Prestataires vérifiés" },
  { icon: Lock, label: "Paiement protégé" },
  { icon: Headphones, label: "Support réactif" },
];

/** Sujets concentrés à droite : sur mobile on ancre le crop pour les garder dans le cadre. */
const HERO_IMAGES = [
  { src: "/hero.png", mobilePosition: "72% 45%" },
  { src: "/hero-2.png", mobilePosition: "78% 42%" },
  { src: "/hero-3.png", mobilePosition: "82% 55%" },
  { src: "/hero-4.png", mobilePosition: "76% 40%" },
];

export default function Hero() {
  const navigate = useNavigate();
  const reduced = useIsReducedMotion();
  const [slide, setSlide] = useState(0);
  const [domainSlug, setDomainSlug] = useState("");
  const [commune, setCommune] = useState("");

  useDeclareNavTheme("light");

  // Légère profondeur au pointeur, sur le cadre photo uniquement (desktop).
  const parallax = usePointerParallax(1);
  const frameX = useTransform(parallax.x, (v) => v * -10);
  const frameY = useTransform(parallax.y, (v) => v * -8);
  const chipX = useTransform(parallax.x, (v) => v * 16);
  const chipY = useTransform(parallax.y, (v) => v * 12);

  useEffect(() => {
    if (reduced) return undefined;
    const id = window.setInterval(() => setSlide((c) => (c + 1) % HERO_IMAGES.length), 6000);
    return () => window.clearInterval(id);
  }, [reduced]);

  const onSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (domainSlug) params.set("domaine", domainSlug);
    if (commune) params.set("commune", commune.trim());
    navigate(`/trouver-un-prestataire?${params.toString()}`);
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } };
  const item = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 110, damping: 20 } },
  };

  return (
    <section className="relative isolate -mt-20 overflow-hidden bg-paper-100 pt-24 sm:pt-28 lg:pt-32">
      {/* Trame de marque très discrète, en vert, derrière la photo */}
      <div className="hero-rays pointer-events-none absolute -right-24 top-10 -z-10 hidden h-[34rem] w-[48rem] lg:block" aria-hidden="true" />

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 sm:px-6 sm:pb-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:px-8 lg:pb-24">
        {/* ---------------- Texte ---------------- */}
        <motion.div variants={container} initial="hidden" animate="show" className="min-w-0">
          <motion.p variants={item} className="inline-flex items-center gap-2 rounded-full border border-teal-600/15 bg-white/80 px-3 py-1.5 text-xs font-semibold text-teal-700 shadow-soft backdrop-blur">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold-500/60" />
              <span className="relative inline-flex size-2 rounded-full bg-gold-500" />
            </span>
            Kinshasa · Registre d’agents vérifiés
          </motion.p>

          <h1 className="mt-5 text-balance font-display text-[2.6rem] font-extrabold leading-[0.98] text-ink-900 sm:mt-6 sm:text-6xl lg:text-[4.6rem]">
            <AnimatedText text="Des professionnels" as="span" className="block" delay={0.2} />
            <AnimatedText text="de confiance" as="span" className="block" delay={0.32} />
            <span className="block">
              <AnimatedText text="à la porte de" as="span" delay={0.44} />{" "}
              <span className="relative inline-block text-teal-600">
                <AnimatedText text="votre foyer." as="span" delay={0.56} />
                <motion.svg
                  viewBox="0 0 300 18"
                  preserveAspectRatio="none"
                  className="absolute -bottom-2 left-0 h-3 w-full text-gold-500"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M3 12 C 80 2, 180 2, 297 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    initial={reduced ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, delay: 1, ease: EASE }}
                  />
                </motion.svg>
              </span>
            </span>
          </h1>

          <motion.p variants={item} className="mt-6 max-w-xl text-pretty text-[0.98rem] leading-relaxed text-ink-900/65 sm:text-lg">
            Nounous, chauffeurs, livreurs, répétiteurs et artisans vérifiés, formés et notés.{" "}
            <span className="font-medium text-ink-900">Le paiement n’est libéré qu’après votre validation.</span>
          </motion.p>

          {/* Recherche : capsule de verre, l’unique action principale */}
          <motion.form
            variants={item}
            onSubmit={onSearch}
            role="search"
            aria-label="Recherche rapide de prestataire"
            className="glass-capsule relative z-40 mt-7 flex flex-col gap-1.5 rounded-[1.75rem] p-2 sm:flex-row sm:items-center sm:rounded-full sm:p-1.5 sm:pl-3"
          >
            <HeroSelect
              id="hero-domain"
              label="Domaine"
              icon={BadgeCheck}
              value={domainSlug}
              onChange={setDomainSlug}
              placeholder="Tous les domaines"
              options={domains.map((d) => ({ value: d.slug, label: d.name }))}
            />
            <span className="hidden h-7 w-px bg-ink-900/10 sm:block" aria-hidden="true" />
            <HeroSelect
              id="hero-commune"
              label="Commune"
              icon={MapPin}
              value={commune}
              onChange={setCommune}
              placeholder="Toutes les communes"
              options={COMMUNES.map((c) => ({ value: c, label: c }))}
            />
            <button
              type="submit"
              className="tap group flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-teal-600 px-6 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(1,67,61,0.8)] transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 sm:w-auto"
            >
              <Search className="size-4 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
              Rechercher
            </button>
          </motion.form>

          <motion.div variants={item} className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-1.5 text-sm text-ink-900/60">
                  <Icon className="size-4 text-teal-600" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
            <Link
              to="/devenir-prestataire"
              className="group inline-flex items-center gap-1 text-sm font-semibold text-teal-700 underline decoration-gold-500/50 decoration-2 underline-offset-4 hover:decoration-gold-500"
            >
              Vous êtes un professionnel ?
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ---------------- Cadre photo + capsules de verre ---------------- */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.25 }}
          className="relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-none"
        >
          <motion.div
            style={reduced ? undefined : { x: frameX, y: frameY }}
            className="relative aspect-[5/4] overflow-hidden rounded-[2.5rem] bg-teal-100 shadow-[0_40px_80px_-40px_rgba(1,67,61,0.55)] ring-1 ring-ink-900/5 sm:aspect-[4/5] lg:aspect-[4/5]"
          >
            <AnimatePresence initial={false}>
              <motion.img
                key={HERO_IMAGES[slide].src}
                src={HERO_IMAGES[slide].src}
                alt=""
                loading="eager"
                fetchPriority="high"
                initial={reduced ? false : { opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ opacity: { duration: 1.1, ease: EASE }, scale: { duration: 6, ease: "linear" } }}
                style={{ "--hero-pos": HERO_IMAGES[slide].mobilePosition }}
                className="absolute inset-0 size-full object-cover [object-position:var(--hero-pos)]"
              />
            </AnimatePresence>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-950/35 to-transparent" aria-hidden="true" />

            {/* Indicateurs de diapositive, dans le cadre */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/25 p-1.5 backdrop-blur-md" aria-hidden="true">
              {HERO_IMAGES.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  tabIndex={-1}
                  onClick={() => setSlide(index)}
                  className="relative h-1.5 w-6 overflow-hidden rounded-full bg-white/40"
                >
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full bg-white"
                    initial={false}
                    animate={{ width: index === slide ? "100%" : "0%" }}
                    transition={{ duration: index === slide && !reduced ? 6 : 0.3, ease: "linear" }}
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Capsule : protocole */}
          <motion.div
            style={reduced ? undefined : { x: chipX, y: chipY }}
            initial={reduced ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.7 }}
            className="glass-capsule absolute -left-3 top-8 flex items-center gap-3 rounded-2xl py-2.5 pl-2.5 pr-4 sm:-left-8 sm:top-12"
          >
            <span className="grid size-10 place-items-center rounded-full bg-teal-600 text-white">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-lg font-extrabold leading-none text-ink-900 tabular-nums">7 contrôles</span>
              <span className="mt-1 block text-[0.7rem] text-ink-900/55">avant toute mise en relation</span>
            </span>
          </motion.div>

          {/* Capsule : remplacement */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.85 }}
            className="glass-capsule absolute -right-2 bottom-16 flex items-center gap-2.5 rounded-full py-2 pl-2 pr-4 sm:-right-6 sm:bottom-20"
          >
            <span className="grid size-8 place-items-center rounded-full bg-gold-500 text-white">
              <Check className="size-4" strokeWidth={3} aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-ink-900">Remplacement sous 24 h</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/** Liste déroulante du hero : ouverture au clic (champ + chevron), panneau clair. */
function HeroSelect({ id, label, icon: Icon, value, onChange, placeholder, options }) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  // Sens et hauteur calculés à l'ouverture : la liste reste dans la zone visible,
  // hors de la barre d'onglets (mobile), du bouton Support (desktop) et de la navigation.
  const [placement, setPlacement] = useState({ up: false, maxHeight: 256 });
  const selected = options.find((opt) => opt.value === value) ?? null;

  const [sheetOpen, setSheetOpen] = useState(false);

  const toggle = () => {
    // Téléphone : feuille glissante plein écran, toujours au-dessus de la barre d'onglets.
    if (window.matchMedia("(max-width: 639px)").matches) {
      setSheetOpen(true);
      return;
    }
    if (!open && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const BOTTOM_UI = 128; // bouton « Support client » flottant (desktop) + marge
      const TOP_UI = 88; // navigation flottante
      const below = window.innerHeight - rect.bottom - BOTTOM_UI;
      const above = rect.top - TOP_UI;
      const up = below < 200 && above > below;
      setPlacement({ up, maxHeight: Math.max(160, Math.min(256, up ? above : below)) });
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative min-w-0 flex-1 ${open ? "z-50" : "z-0"}`}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open || sheetOpen}
        aria-label={label}
        onClick={toggle}
        className="flex w-full items-center gap-2.5 rounded-full px-3 py-1 text-left transition-colors hover:bg-ink-900/5 focus-visible:bg-ink-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
      >
        <Icon className="size-4 shrink-0 text-teal-600" aria-hidden="true" />
        <span className={`min-w-0 flex-1 truncate py-2.5 text-sm ${selected ? "font-medium text-ink-900" : "text-ink-900/55"}`}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-ink-900/35 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-labelledby={id}
            initial={{ opacity: 0, y: placement.up ? -6 : 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement.up ? -4 : 4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ maxHeight: placement.maxHeight }}
            className={`absolute left-0 right-0 z-50 overflow-y-auto overscroll-contain rounded-2xl border border-ink-900/8 bg-white p-1.5 shadow-lifted ${
              placement.up ? "bottom-[calc(100%+0.35rem)] origin-bottom" : "top-[calc(100%+0.35rem)] origin-top"
            }`}
          >
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  !value ? "bg-teal-50 font-medium text-teal-700" : "text-ink-900/75 hover:bg-ink-900/5"
                }`}
              >
                <span className="truncate">{placeholder}</span>
                {!value && <Check className="size-3.5 shrink-0 text-teal-600" aria-hidden="true" />}
              </button>
            </li>
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-teal-50 font-medium text-teal-700"
                        : "text-ink-900/75 hover:bg-ink-900/5"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="size-3.5 shrink-0 text-teal-600" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={label}>
        <ul role="listbox" aria-label={label} className="flex flex-col gap-1 pb-2">
          {[{ value: "", label: placeholder }, ...options].map((opt) => {
            const isSelected = opt.value === value || (!opt.value && !value);
            return (
              <li key={opt.value || "__all"}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setSheetOpen(false);
                  }}
                  className={`tap flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl px-4 text-left text-[0.95rem] ${
                    isSelected ? "bg-teal-50 font-semibold text-teal-700" : "text-ink-900"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="size-4 shrink-0 text-teal-600" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </div>
  );
}
