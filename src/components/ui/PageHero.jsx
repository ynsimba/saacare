import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import AnimatedText from "./AnimatedText";
import { EASE, useIsReducedMotion, usePointerParallax } from "../../lib/motion";
import { useDeclareNavTheme } from "../../lib/navTheme";

/**
 * En-tête commun à toutes les pages internes : bandeau sombre, halos animés,
 * titre révélé mot par mot et fil d'Ariane. Il remonte sous la barre de
 * navigation fixe (-mt-20 / pt-20) pour que celle-ci se fonde dans le visuel.
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  breadcrumb = [],
  children,
  align = "left",
  tone = "navy",
  compact = false,
}) {
  const reduced = useIsReducedMotion();
  const parallax = usePointerParallax(1);
  useDeclareNavTheme("dark");

  const centered = align === "center";
  const toneClass =
    tone === "teal"
      ? "from-teal-800 via-navy-900 to-ink-950"
      : tone === "coral"
        ? "from-coral-800 via-navy-900 to-ink-950"
        : "from-navy-800 via-navy-900 to-ink-950";

  return (
    <section
      className={`noise-overlay relative isolate -mt-20 overflow-hidden bg-gradient-to-br ${toneClass} pt-20 text-paper-50`}
    >
      {/* Halos animés */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={reduced ? undefined : { x: parallax.x, y: parallax.y }}
        aria-hidden="true"
      >
        <div className="aurora-blob -left-24 top-[-40%] size-[30rem] bg-teal-500/22 animate-aurora" />
        <div className="aurora-blob -right-20 bottom-[-60%] size-[26rem] bg-gold-500/12 animate-aurora-slow" />
      </motion.div>

      {/* Trame fine */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(70%_70%_at_40%_40%,#000,transparent)]"
        aria-hidden="true"
      />

      <div
        className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${
          compact ? "pb-10 pt-10 sm:pb-16 sm:pt-20" : "pb-14 pt-12 sm:pb-24 sm:pt-24"
        }`}
      >
        <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
          {breadcrumb.length > 0 && (
            <motion.nav
              aria-label="Fil d'Ariane"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className={`mb-6 flex flex-wrap items-center gap-1 text-xs text-paper-100/55 ${
                centered ? "justify-center" : ""
              }`}
            >
              {breadcrumb.map((crumb, index) => (
                <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
                  {index > 0 && <ChevronRight className="size-3 opacity-50" aria-hidden="true" />}
                  {crumb.to ? (
                    <Link to={crumb.to} className="link-underline transition-colors hover:text-paper-50">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-paper-100/80">{crumb.label}</span>
                  )}
                </span>
              ))}
            </motion.nav>
          )}

          {eyebrow && (
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05, ease: EASE }}
              className={`inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-teal-300 ${
                centered ? "justify-center" : ""
              }`}
            >
              <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
              {eyebrow}
            </motion.span>
          )}

          <h1
            className={`mt-5 text-balance font-display font-semibold leading-[1.06] tracking-[-0.02em] ${
              compact ? "text-3xl sm:text-4xl lg:text-5xl" : "text-4xl sm:text-5xl lg:text-[3.5rem]"
            }`}
          >
            <AnimatedText text={title} as="span" className="block" delay={0.12} />
          </h1>

          {subtitle && (
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
              className={`mt-6 text-pretty text-base leading-relaxed text-paper-100/70 sm:text-lg ${
                centered ? "mx-auto max-w-2xl" : "max-w-2xl"
              }`}
            >
              {subtitle}
            </motion.p>
          )}

          {children && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
              className={`mt-9 ${centered ? "flex flex-wrap justify-center gap-3" : ""}`}
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>

      {/* Vague de raccord vers le contenu clair */}
      <div className="relative -mb-px" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="block h-10 w-full text-paper-100 sm:h-14">
          <path
            d="M0,60 L0,28 C240,4 480,44 720,32 C960,20 1200,-8 1440,16 L1440,60 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
