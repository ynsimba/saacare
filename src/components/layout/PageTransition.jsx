import { motion } from "motion/react";
import { EASE, useIsReducedMotion } from "../../lib/motion";

/**
 * Enveloppe chaque page pour une transition douce lors du changement de route :
 * léger glissement vers le haut accompagné d'un flou qui se dissipe.
 */
export default function PageTransition({ children }) {
  const reduced = useIsReducedMotion();

  if (reduced) return <div>{children}</div>;

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
