import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { Search, ShieldCheck, Lock, Headphones, MapPin, BadgeCheck, ChevronDown, Check } from "lucide-react";
import Button from "../ui/Button";
import AnimatedText from "../ui/AnimatedText";
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
  const sectionRef = useRef(null);
  const [slide, setSlide] = useState(0);
  const [domainSlug, setDomainSlug] = useState("");
  const [commune, setCommune] = useState("");

  // Indique au Navbar de passer en mode clair sur fond sombre tant qu'on est en haut.
  useDeclareNavTheme("dark");

  const parallax = usePointerParallax(1);
  const glowX = useTransform(parallax.x, (v) => v * -50);
  const glowY = useTransform(parallax.y, (v) => v * -40);
  const imageX = useTransform(parallax.x, (v) => v * -22);
  const imageY = useTransform(parallax.y, (v) => v * -18);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  useEffect(() => {
    if (reduced) return undefined;
    const id = window.setInterval(() => {
      setSlide((current) => (current + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [reduced]);

  const onSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (domainSlug) params.set("domaine", domainSlug);
    if (commune) params.set("commune", commune.trim());
    navigate(`/trouver-un-prestataire?${params.toString()}`);
  };

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.11, delayChildren: 0.25 } },
  };
  const item = {
    hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
  };

  return (
    <section
      ref={sectionRef}
      data-nav-theme="dark"
      className="noise-overlay relative isolate -mt-20 flex min-h-[100svh] items-center overflow-hidden bg-ink-950 pt-20"
    >
      {/* ---------- Visuels de fond : crossfade + Ken Burns + parallaxe pointeur ---------- */}
      <motion.div
        className="absolute inset-0 -z-20"
        style={reduced ? undefined : { scale: bgScale, x: imageX, y: imageY }}
        aria-hidden="true"
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={HERO_IMAGES[slide].src}
            src={HERO_IMAGES[slide].src}
            alt=""
            loading="eager"
            fetchPriority="high"
            initial={reduced ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ opacity: { duration: 1.4, ease: EASE }, scale: { duration: 7, ease: "linear" } }}
            style={{ "--hero-pos": HERO_IMAGES[slide].mobilePosition }}
            className="absolute inset-0 size-full object-cover will-change-transform [object-position:var(--hero-pos)] lg:scale-105 lg:[object-position:center]"
          />
        </AnimatePresence>
      </motion.div>

      {/* ---------- Voiles de lisibilité ---------- */}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,15,26,0.82)_0%,rgba(11,15,26,0.55)_38%,rgba(11,15,26,0.72)_100%)] lg:bg-[linear-gradient(100deg,rgba(11,15,26,0.96)_0%,rgba(11,15,26,0.88)_32%,rgba(15,24,48,0.55)_62%,rgba(15,24,48,0.28)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_35%,transparent_40%,rgba(11,15,26,0.55)_100%)] lg:bg-[radial-gradient(120%_90%_at_20%_40%,transparent_35%,rgba(11,15,26,0.7)_100%)]"
        aria-hidden="true"
      />

      {/* ---------- Halos colorés animés ---------- */}
      <motion.div
        className="absolute inset-x-0 top-0 -z-10 h-[100vh] overflow-hidden lg:inset-0 lg:h-auto"
        style={reduced ? undefined : { x: glowX, y: glowY }}
        aria-hidden="true"
      >
        <div className="aurora-blob -left-32 top-[-10%] size-[38rem] bg-teal-500/25 animate-aurora" />
        <div className="aurora-blob bottom-[-18%] left-[18%] size-[30rem] bg-coral-500/20 animate-aurora-slow" />
        <div className="aurora-blob right-[-8%] top-[12%] size-[26rem] bg-gold-500/14 animate-aurora" />
      </motion.div>

      {/* ---------- Trame fine ---------- */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:76px_76px] [mask-image:radial-gradient(80%_60%_at_30%_50%,#000,transparent)]"
        aria-hidden="true"
      />

      {/* ---------- Contenu ---------- */}
      <motion.div
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-28 pt-12 sm:px-6 lg:px-8 lg:pb-32 lg:pt-16"
      >
        <div>
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl">
            {/* Pastille d'annonce */}
            <motion.div variants={item}>
              <span className="glass-dark inline-flex max-w-full flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full py-1.5 pl-1.5 pr-4 text-xs font-medium text-paper-100/90">
                <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-500/20">
                  <span className="absolute inline-flex size-2 rounded-full bg-teal-400 animate-pulse-ring" aria-hidden="true" />
                  <span className="relative inline-flex size-2 rounded-full bg-teal-400" aria-hidden="true" />
                </span>
                <span className="font-mono uppercase tracking-[0.16em]">Kinshasa · RDC</span>
                <span className="hidden h-3 w-px bg-white/20 sm:block" aria-hidden="true" />
                <span className="hidden text-paper-100/70 sm:inline">Services vérifiés à domicile</span>
              </span>
            </motion.div>

            {/* Titre */}
            <h1 className="mt-6 text-balance font-display text-[2.25rem] font-semibold leading-[1.06] tracking-[-0.02em] text-paper-50 sm:mt-7 sm:text-6xl sm:leading-[1.04] lg:text-[4.15rem]">
              <AnimatedText text="Des professionnels" as="span" className="block" delay={0.35} />
              <AnimatedText text="de confiance," as="span" className="block" delay={0.5} />
              <AnimatedText
                text="à la porte de votre foyer."
                as="span"
                className="mt-1 block text-gradient"
                delay={0.68}
              />
            </h1>

            <motion.p
              variants={item}
              className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-paper-100/72 sm:text-lg"
            >
              Nounous, chauffeurs, répétiteurs et artisans vérifiés, formés et notés. Réservez en
              quelques clics et payez en toute sécurité —{" "}
              <span className="font-medium text-paper-50">
                le paiement n'est libéré qu'après votre validation.
              </span>
            </motion.p>

            {/* Recherche */}
            <motion.form
              variants={item}
              onSubmit={onSearch}
              role="search"
              aria-label="Recherche rapide de prestataire"
              className="gradient-border glass-dark relative z-40 mt-7 flex flex-col gap-2 rounded-2xl p-2 sm:mt-9 sm:flex-row sm:items-center"
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

              <span className="hidden h-7 w-px bg-white/12 sm:block" aria-hidden="true" />

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
                className="shine group relative flex w-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[linear-gradient(110deg,var(--color-teal-600),var(--color-teal-500)_50%,var(--color-coral-500))] bg-[length:220%_auto] px-6 py-3.5 text-sm font-semibold text-white transition-[background-position,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[position:100%_center] hover:shadow-[0_16px_40px_-16px_rgba(184,40,91,0.9)] focus-visible:outline-2 focus-visible:outline-gold-500 sm:w-auto sm:py-3"
              >
                <Search className="relative z-10 size-4 transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />
                <span className="relative z-10">Rechercher</span>
              </button>
            </motion.form>

            {/* Actions */}
            <motion.div variants={item} className="relative z-0 mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button to="/trouver-un-prestataire" size="lg" variant="primary" withArrow magnetic className="w-full sm:w-auto">
                Trouver un prestataire
              </Button>
              <Button to="/devenir-prestataire" size="lg" variant="glass" magnetic className="w-full sm:w-auto">
                Devenir prestataire
              </Button>
            </motion.div>

            {/* Gages de confiance */}
            <motion.ul variants={item} className="mt-9 flex flex-wrap gap-x-7 gap-y-3">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-paper-100/65">
                  <Icon className="size-4 text-teal-300" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </div>

      </motion.div>

      {/* ---------- Indicateurs de diapositive ---------- */}
      <div className="absolute bottom-10 right-6 z-10 hidden items-center gap-2 lg:flex" aria-hidden="true">
        {HERO_IMAGES.map((image, index) => (
          <button
            key={image.src}
            type="button"
            tabIndex={-1}
            onClick={() => setSlide(index)}
            className="group relative h-1 w-9 overflow-hidden rounded-full bg-white/20"
          >
            <motion.span
              className="absolute inset-y-0 left-0 rounded-full bg-paper-50"
              initial={false}
              animate={{ width: index === slide ? "100%" : "0%" }}
              transition={{ duration: index === slide && !reduced ? 6 : 0.3, ease: "linear" }}
            />
          </button>
        ))}
      </div>

      {/* ---------- Invitation au défilement ---------- */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="absolute bottom-9 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2.5 lg:flex"
        aria-hidden="true"
      >
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-paper-100/45">
          Découvrir
        </span>
        <span className="relative flex h-9 w-5 justify-center rounded-full border border-white/25">
          <span className="mt-1.5 h-1.5 w-1 rounded-full bg-paper-50/70 animate-scroll-hint" />
        </span>
      </motion.div>

      {/* ---------- Raccord vers la bande de chiffres (navy) ---------- */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-32 bg-gradient-to-b from-transparent to-navy-900"
        aria-hidden="true"
      />
    </section>
  );
}

/** Liste déroulante du hero : ouverture au clic (champ + chevron), panneau sombre optimisé. */
function HeroSelect({ id, label, icon: Icon, value, onChange, placeholder, options }) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => opt.value === value) ?? null;

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
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-1 text-left transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
      >
        <Icon className="size-4 shrink-0 text-teal-300" aria-hidden="true" />
        <span className={`min-w-0 flex-1 truncate py-2.5 text-sm ${selected ? "text-paper-50" : "text-paper-100/55"}`}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-paper-100/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-labelledby={id}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-56 overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-navy-900 p-1.5 shadow-lifted sm:max-h-64"
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
                  !value ? "bg-white/10 text-paper-50" : "text-paper-100/75 hover:bg-white/8 hover:text-paper-50"
                }`}
              >
                <span className="truncate">{placeholder}</span>
                {!value && <Check className="size-3.5 shrink-0 text-teal-300" aria-hidden="true" />}
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
                        ? "bg-teal-500/20 text-paper-50"
                        : "text-paper-100/75 hover:bg-white/8 hover:text-paper-50"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="size-3.5 shrink-0 text-teal-300" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
