import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import AnimatedText from "./AnimatedText";
import { EASE, useIsReducedMotion } from "../../lib/motion";
import { useDeclareNavTheme } from "../../lib/navTheme";
import { SurfaceContext } from "../../lib/surface";

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
  useDeclareNavTheme("light");

  const centered = align === "center";
  // Surfaces claires de la charte : menthe par défaut, pêche pour les pages « orange ».
  const toneClass =
    tone === "coral"
      ? "from-peach via-cream to-paper-100"
      : "from-mint via-[#eef7f4] to-paper-100";

  return (
    <SurfaceContext.Provider value="light">
    <section
      className={`relative isolate -mt-20 overflow-hidden bg-gradient-to-b ${toneClass} pt-20 text-ink-900`}
    >
      {/* Signature : le motif rayonnant de la charte, recoloré en vert */}
      <div className="hero-rays pointer-events-none absolute -bottom-10 -right-20 -z-10 h-72 w-[26rem] !opacity-[0.05] sm:h-[26rem] sm:w-[38rem] lg:right-0" aria-hidden="true" />

      <div
        className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${
          compact ? "pb-6 pt-8 sm:pb-16 sm:pt-20" : "pb-14 pt-12 sm:pb-24 sm:pt-24"
        }`}
      >
        <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
          {breadcrumb.length > 0 && (
            <motion.nav
              aria-label="Fil d'Ariane"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className={`mb-3 flex flex-wrap items-center gap-1 text-xs text-ink-900/50 sm:mb-6 ${
                centered ? "justify-center" : ""
              }`}
            >
              {breadcrumb.map((crumb, index) => (
                <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
                  {index > 0 && <ChevronRight className="size-3 opacity-50" aria-hidden="true" />}
                  {crumb.to ? (
                    <Link to={crumb.to} className="link-underline transition-colors hover:text-teal-700">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-ink-900/75">{crumb.label}</span>
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
              className={`inline-flex items-center gap-2 rounded-full border border-teal-600/15 bg-white/70 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-teal-700 backdrop-blur ${
                centered ? "justify-center" : ""
              }`}
            >
              <span className="size-1.5 rounded-full bg-gold-500" aria-hidden="true" />
              {eyebrow}
            </motion.span>
          )}

          <h1
            className={`mt-3 text-balance font-display font-extrabold leading-[1.02] text-ink-900 sm:mt-5 ${
              compact ? "text-3xl sm:text-5xl lg:text-[3.4rem]" : "text-[2.4rem] sm:text-6xl lg:text-[4.2rem]"
            }`}
          >
            <AnimatedText text={title} as="span" className="block" delay={0.12} />
          </h1>

          {subtitle && (
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
              className={`mt-3 text-pretty text-[0.95rem] leading-relaxed text-ink-900/65 sm:mt-6 sm:text-lg ${
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
              className={`page-hero-actions mt-5 sm:mt-9 ${centered ? "flex flex-wrap justify-center gap-3" : ""}`}
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>

    </section>
    </SurfaceContext.Provider>
  );
}
