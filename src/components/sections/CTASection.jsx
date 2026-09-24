import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Sparkles } from "lucide-react";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";
import Section3D from "../ui/Section3D";
import { useIsReducedMotion } from "../../lib/motion";

export default function CTASection({
  eyebrow = "Avancer ensemble, chaque jour",
  title = "Le bon service, au bon moment.",
  subtitle = "Recherche sans inscription, agents vérifiés en 7 étapes, remplacement sous 24 heures.",
  primaryTo = "/prestataires",
  primaryLabel = "Demander un prestataire",
  secondaryTo = "/devenir-prestataire",
  secondaryLabel = "Devenir prestataire",
}) {
  const ref = useRef(null);
  const reduced = useIsReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const blobY = useTransform(scrollYProgress, [0, 1], ["25%", "-25%"]);

  return (
    <Section3D variant="down" intensity={1.2} className="bg-paper-100">
    <section ref={ref} className="bg-paper-100 px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
      {/* Fondu simple : la mise à l'échelle est déjà portée par Section3D. */}
      <Reveal
        variant="fade"
        duration={0.45}
        className="noise-overlay relative isolate mx-auto max-w-5xl overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 via-navy-900 to-ink-950 px-5 py-7 text-center shadow-lifted sm:px-16 sm:py-16"
      >
        {/* Halos animés */}
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10"
          style={reduced ? undefined : { y: blobY }}
          aria-hidden="true"
        >
          <div className="aurora-blob left-[10%] top-[-30%] size-80 bg-teal-500/25 animate-aurora" />
          <div className="aurora-blob right-[5%] bottom-[-40%] size-72 bg-gold-500/16 animate-aurora-slow" />
        </motion.div>

        <span className="relative inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/6 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-gold-200">
          <Sparkles className="size-3.5" aria-hidden="true" />
          {eyebrow}
        </span>

        <h2 className="relative mt-4 text-balance font-display text-2xl sm:mt-6 sm:text-3xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-[2.6rem]">
          {title}
        </h2>

        <p className="relative mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-white/65 sm:mt-5 sm:text-base">
          {subtitle}
        </p>

        <div className="relative mt-6 grid grid-cols-1 gap-2.5 sm:mt-10 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
          <Button to={primaryTo} size="lg" variant="onDark" withArrow magnetic>
            {primaryLabel}
          </Button>
          <Button to={secondaryTo} variant="glass" size="lg" magnetic>
            {secondaryLabel}
          </Button>
        </div>

        <p className="relative mt-8 hidden font-mono text-[0.68rem] sm:block uppercase tracking-[0.2em] text-white/40">
          Aucun frais pour les agents · Un interlocuteur dédié
        </p>
      </Reveal>
    </section>
    </Section3D>
  );
}
