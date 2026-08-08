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
      className={className}
    >
      <div className="flex items-baseline gap-1 font-display text-4xl font-semibold text-white sm:text-5xl">
        <motion.span>{rounded}</motion.span>
        <span className="text-teal-300">{suffix}</span>
      </div>
      <p className="mt-1.5 text-sm text-white/60">{label}</p>
      <motion.span
        aria-hidden="true"
        className="mt-4 block h-px origin-left bg-gradient-to-r from-teal-400/70 to-transparent"
        initial={reduced ? false : { scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : undefined}
        transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
      />
    </motion.div>
  );
}
