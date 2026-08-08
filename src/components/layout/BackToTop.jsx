import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { EASE, useIsReducedMotion } from "../../lib/motion";

/**
 * Bouton de retour en haut, entouré d'un anneau qui matérialise la progression
 * de lecture. Il n'apparaît qu'après un défilement significatif.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reduced = useIsReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 26, restDelta: 0.001 });

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 640));

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
          }
          initial={{ opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 12 }}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          transition={{ duration: 0.35, ease: EASE }}
          aria-label="Revenir en haut de la page"
          className="glass fixed bottom-6 right-5 z-40 grid size-12 place-items-center rounded-full text-ink-900 shadow-lifted focus-visible:outline-2 focus-visible:outline-gold-500 sm:bottom-8 sm:right-8"
        >
          <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(3,41,76,0.10)" strokeWidth="2" />
            <motion.circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="var(--color-teal-600)"
              strokeWidth="2"
              strokeLinecap="round"
              pathLength="1"
              style={{ pathLength: progress }}
            />
          </svg>
          <ArrowUp className="relative size-5" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
