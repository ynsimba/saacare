import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import DomainIcon from "../ui/DomainIcon";
import Reveal, { Stagger, RevealItem } from "../ui/Reveal";
import Section3D from "../ui/Section3D";
import { domains } from "../../data/domains";
import { THEME } from "../../lib/theme";
import { EASE, useHasFinePointer, useIsReducedMotion } from "../../lib/motion";

/**
 * Les domaines présentés en liste éditoriale plein format : chaque ligne se
 * remplit de la couleur du domaine au survol, et une vignette d'aperçu suit le
 * curseur pour montrer les services sans quitter la page.
 */
export default function DomainsGrid() {
  const reduced = useIsReducedMotion();
  const fine = useHasFinePointer();
  const previewEnabled = fine && !reduced;

  const [hovered, setHovered] = useState(null);
  // La vignette ne s'affiche qu'après un vrai déplacement du pointeur : un simple
  // focus clavier met la ligne en avant sans faire surgir une carte hors contexte.
  const [pointerActive, setPointerActive] = useState(false);
  // La vignette bascule à gauche du curseur dans la moitié droite de la section,
  // pour ne jamais sortir de l'écran.
  const [flipped, setFlipped] = useState(false);

  // Coordonnées relatives à la section : un ancêtre animé (transition de page)
  // peut créer un bloc conteneur, ce qui rendrait `position: fixed` imprévisible.
  const sectionRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const px = useSpring(x, { stiffness: 320, damping: 30, mass: 0.5 });
  const py = useSpring(y, { stiffness: 320, damping: 30, mass: 0.5 });

  const onMouseMove = useCallback(
    (event) => {
      const node = sectionRef.current;
      if (!previewEnabled || !node) return;
      const rect = node.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      x.set(localX);
      y.set(event.clientY - rect.top);
      setFlipped(localX > rect.width * 0.62);
      setPointerActive(true);
    },
    [previewEnabled, x, y]
  );

  const activeDomain = hovered != null && pointerActive ? domains[hovered] : null;

  // `clip={false}` : la vignette d'aperçu doit pouvoir déborder latéralement
  // de la section ; le débordement reste borné par le clip global de la page.
  return (
    <Section3D variant="up" clip={false} className="bg-white">
    <section
      ref={sectionRef}
      className="relative isolate bg-white py-20 sm:py-28"
      aria-labelledby="domains-heading"
    >
      {/* Halo de marque diffus — confiné à son propre calque pour que la vignette
          d'aperçu puisse déborder de la section sans être rognée. */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-100/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Nos domaines"
            title={<span id="domains-heading">Un standard de confiance, quatre besoins du quotidien</span>}
            subtitle="Chaque domaine applique le même socle d'exigence : vérification d'identité, formation obligatoire et suivi qualité continu."
          />
          <Reveal variant="right" delay={0.2} className="shrink-0">
            <Link
              to="/trouver-un-prestataire"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800"
            >
              <span className="link-underline">Voir tous les prestataires</span>
              <ArrowRight
                className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </Reveal>
        </div>

        {/* ---------------- Liste éditoriale ---------------- */}
        <Stagger
          as="ul"
          stagger={0.1}
          onMouseMove={onMouseMove}
          onMouseLeave={() => {
            setHovered(null);
            setPointerActive(false);
          }}
          className="mt-14 border-t border-ink-900/10"
        >
          {domains.map((domain, index) => (
            <DomainRow
              key={domain.slug}
              domain={domain}
              index={index}
              isHovered={hovered === index}
              onEnter={() => setHovered(index)}
              reduced={reduced}
            />
          ))}
        </Stagger>
      </div>

      {/* ---------------- Vignette d'aperçu qui suit le curseur ---------------- */}
      {previewEnabled && (
        <motion.div
          className="pointer-events-none absolute left-0 top-0 z-20"
          style={{ x: px, y: py }}
          aria-hidden="true"
        >
          {/* Calque de décalage séparé : motion écrit `transform` sur la carte
              animée, il ne peut donc pas porter les classes de positionnement. */}
          <div
            className={`w-64 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              flipped ? "-translate-x-[calc(100%+1.75rem)]" : "translate-x-7"
            } -translate-y-1/2`}
          >
          <AnimatePresence>
            {activeDomain && (
              <motion.div
                key={activeDomain.slug}
                initial={{ opacity: 0, scale: 0.86, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 6 }}
                transition={{ duration: 0.28, ease: EASE }}
                className={`w-64 overflow-hidden rounded-2xl p-5 shadow-lifted ${
                  THEME[activeDomain.theme].bg
                }`}
              >
                <div className="flex items-center gap-2.5 text-white">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15">
                    <DomainIcon name={activeDomain.icon} className="size-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-sm font-semibold">
                      {activeDomain.name}
                    </span>
                    <span className="block truncate text-[0.68rem] text-white/60">
                      {activeDomain.services.length} services proposés
                    </span>
                  </span>
                </div>

                <ul className="mt-4 flex flex-col gap-2 border-t border-white/15 pt-4">
                  {activeDomain.services.slice(0, 3).map((service) => (
                    <li key={service} className="flex items-start gap-2 text-xs leading-snug text-white/80">
                      <Check className="mt-0.5 size-3 shrink-0 text-white/60" strokeWidth={2.5} />
                      <span className="line-clamp-1">{service}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white/70">
                  Découvrir le domaine
                  <ArrowUpRight className="size-3" />
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </motion.div>
      )}
    </section>
    </Section3D>
  );
}

function DomainRow({ domain, index, isHovered, onEnter, reduced }) {
  const theme = THEME[domain.theme];

  return (
    <RevealItem as="li" variant="up" className="border-b border-ink-900/10">
      <Link
        to={`/domaines/${domain.slug}`}
        onMouseEnter={onEnter}
        onFocus={onEnter}
        className="group relative flex items-center gap-5 overflow-hidden px-2 py-7 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-gold-500 sm:gap-7 sm:px-5 sm:py-9 lg:py-10"
      >
        {/* Remplissage coloré qui monte depuis le bas */}
        <motion.span
          className={`pointer-events-none absolute inset-0 origin-bottom ${theme.bg}`}
          initial={false}
          animate={{ scaleY: isHovered && !reduced ? 1 : 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          aria-hidden="true"
        />
        {/* Liseré coloré permanent, visible surtout au tactile */}
        <span
          className={`pointer-events-none absolute inset-y-0 left-0 w-0.5 ${theme.dot} transition-opacity duration-500 group-hover:opacity-0 lg:opacity-0`}
          aria-hidden="true"
        />

        {/* Numéro d'ordre */}
        <span
          className={`relative shrink-0 font-mono text-xs font-semibold tracking-[0.2em] transition-colors duration-500 ${
            isHovered ? "text-white/50" : "text-ink-900/25"
          }`}
        >
          0{index + 1}
        </span>

        {/* Icône */}
        <span
          className={`relative grid size-12 shrink-0 place-items-center rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 sm:size-14 ${
            isHovered ? "bg-white/15 text-white" : `${theme.bgSoft} ${theme.text}`
          }`}
        >
          <DomainIcon name={domain.icon} className="size-6 sm:size-7" />
        </span>

        {/* Titre + accroche */}
        <span className="relative min-w-0 flex-1">
          <span
            className={`block font-display text-xl font-semibold leading-tight transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:text-2xl lg:text-[1.75rem] ${
              isHovered ? "translate-x-1 text-white" : "text-ink-900"
            }`}
          >
            {domain.name}
          </span>
          <span
            className={`mt-1 block text-sm leading-relaxed transition-colors duration-500 sm:text-[0.95rem] ${
              isHovered ? "text-white/70" : "text-ink-900/60"
            }`}
          >
            {domain.tagline}
          </span>
        </span>

        {/* Statistique */}
        <span className="relative hidden shrink-0 text-right lg:block">
          <span
            className={`block font-display text-2xl font-semibold transition-colors duration-500 ${
              isHovered ? "text-white" : theme.text
            }`}
          >
            {domain.heroStat.value}
          </span>
          <span
            className={`mt-0.5 block max-w-[11rem] font-mono text-[0.62rem] uppercase leading-snug tracking-[0.1em] transition-colors duration-500 ${
              isHovered ? "text-white/55" : "text-ink-900/40"
            }`}
          >
            {domain.heroStat.label}
          </span>
        </span>

        {/* Flèche */}
        <span
          className={`relative grid size-10 shrink-0 place-items-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isHovered ? "bg-white text-ink-900" : "bg-ink-900/5 text-ink-900/60"
          }`}
          aria-hidden="true"
        >
          <ArrowUpRight
            className={`size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isHovered ? "translate-x-0.5 -translate-y-0.5" : ""
            }`}
          />
        </span>
      </Link>
    </RevealItem>
  );
}
