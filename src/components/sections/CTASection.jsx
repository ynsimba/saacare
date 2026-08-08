import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Sparkles } from "lucide-react";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";
import Section3D from "../ui/Section3D";
import { useIsReducedMotion } from "../../lib/motion";

export default function CTASection({
  eyebrow = "Prêt à commencer ?",
  title = "Trouvez un prestataire de confiance dès aujourd'hui.",
  subtitle = "Recherche gratuite, paiement protégé, satisfaction suivie à chaque prestation.",
  primaryTo = "/trouver-un-prestataire",
  primaryLabel = "Trouver un prestataire",
  secondaryTo = "/devenir-prestataire",
  secondaryLabel = "Devenir prestataire",
}) {
  const ref = useRef(null);
  const reduced = useIsReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const blobY = useTransform(scrollYProgress, [0, 1], ["25%", "-25%"]);

  return (
    <Section3D variant="down" intensity={1.2} className="bg-paper-100">
    <section ref={ref} className="bg-paper-100 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      {/* Fondu simple : la mise à l'échelle est déjà portée par Section3D. */}
      <Reveal
        variant="fade"
        duration={0.85}
        className="noise-overlay relative isolate mx-auto max-w-5xl overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 via-navy-900 to-ink-950 px-8 py-16 text-center shadow-lifted sm:px-16 sm:py-20"
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

        {/* Trame fine */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(65%_65%_at_50%_35%,#000,transparent)]"
          aria-hidden="true"
        />

        <span className="relative inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/6 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-gold-200">
          <Sparkles className="size-3.5" aria-hidden="true" />
          {eyebrow}
        </span>

        <h2 className="relative mt-6 text-balance font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[2.6rem]">
          {title}
        </h2>

        <p className="relative mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-white/65">
          {subtitle}
        </p>

        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button to={primaryTo} size="lg" withArrow magnetic>
            {primaryLabel}
          </Button>
          <Button to={secondaryTo} variant="glass" size="lg" magnetic>
            {secondaryLabel}
          </Button>
        </div>

        <p className="relative mt-8 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-white/40">
          Sans engagement · Paiement libéré après validation
        </p>
      </Reveal>
    </section>
    </Section3D>
  );
}
