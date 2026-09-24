import { motion } from "motion/react";
import { EASE, IS_COARSE_POINTER, springs, useIsReducedMotion } from "../../lib/motion";

/**
 * Enveloppe chaque page pour une transition douce lors du changement de route :
 * léger glissement vers le haut accompagné d'un flou qui se dissipe.
 */
export default function PageTransition({ children }) {
  const reduced = useIsReducedMotion();

  if (reduced) return <div>{children}</div>;

  // Tactile : le flou (filter) coûte cher sur GPU mobile — glissement + fondu
  // sur ressort, uniquement transform/opacity, pour une transition « native ».
  if (IS_COARSE_POINTER) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0, transition: springs.gentle }}
        exit={{ opacity: 0, transition: { duration: 0.14, ease: "easeOut" } }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE } }}
      exit={{ opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.28, ease: EASE } }}
    >
      {children}
    </motion.div>
  );
}
