import { useEffect, useRef } from "react";
import { motion, useInView, animate, useMotionValue, useTransform } from "motion/react";
import { EASE, useIsReducedMotion } from "../../lib/motion";

/**
 * Nombre qui s'incrémente à l'entrée dans le viewport, accompagné d'une barre
 * de progression décorative. Désactivé si l'utilisateur demande moins d'animation.
 */
export default function StatCounter({ value, suffix = "", label, decimals = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useIsReducedMotion();
  const count = useMotionValue(reduced ? value : 0);
  const rounded = useTransform(count, (v) =>
    decimals > 0
      ? v.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : Math.round(v).toLocaleString("fr-FR")
  );

  useEffect(() => {
    if (inView && !reduced) {
      const controls = animate(count, value, { duration: 1.8, ease: EASE });
      return controls.stop;
    }
    return undefined;
  }, [inView, reduced, value, count]);

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: EASE }}
      className={`flex h-full flex-col ${className}`}
    >
      <div className="flex min-h-[2.5rem] items-baseline gap-1 font-display text-3xl font-bold tabular-nums text-white sm:min-h-[3.5rem] sm:text-5xl">
        <motion.span>{rounded}</motion.span>
        <span className="text-[0.65em] font-semibold text-teal-300">{suffix}</span>
      </div>
      <p className="mt-1 flex-1 text-xs leading-snug text-white/60 sm:mt-2 sm:min-h-[2.75rem] sm:text-sm sm:leading-snug">
        {label}
      </p>
      <motion.span
        aria-hidden="true"
        className="mt-2.5 block h-px w-full origin-left bg-gradient-to-r from-teal-400/70 to-transparent sm:mt-4"
        initial={reduced ? false : { scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : undefined}
        transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
      />
    </motion.div>
  );
}
