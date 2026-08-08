import { useMemo } from "react";
import { motion } from "motion/react";
import { EASE, useIsReducedMotion } from "../../lib/motion";

/**
 * Révèle un texte mot par mot (ou lettre par lettre) avec un léger basculement 3D.
 * Le texte reste lisible par les lecteurs d'écran grâce à `aria-label` + `aria-hidden`
 * sur les fragments animés. Se réduit à un simple fondu si prefers-reduced-motion.
 */
export default function AnimatedText({
  text,
  as: Component = "span",
  by = "word",
  className = "",
  itemClassName = "",
  stagger = 0.045,
  delay = 0,
}) {
  const reduced = useIsReducedMotion();
  // Mémorisé : sans cela un nouveau composant serait créé à chaque rendu (remontage).
  const MotionComponent = useMemo(() => motion.create(Component), [Component]);

  if (reduced) {
    return (
      <MotionComponent
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {text}
      </MotionComponent>
    );
  }

  const chunks = by === "char" ? Array.from(text) : text.split(" ");

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const item = {
    hidden: { opacity: 0, y: "0.55em", rotateX: -70 },
    show: {
      opacity: 1,
      y: "0em",
      rotateX: 0,
      transition: { duration: 0.85, ease: EASE },
    },
  };

  return (
    <MotionComponent
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
      style={{ perspective: 800 }}
    >
      {/* Le texte réel reste dans le DOM pour les lecteurs d'écran ;
          seuls les fragments animés sont masqués à l'accessibilité. */}
      <span className="sr-only">{text}</span>
      {chunks.map((chunk, index) => (
        <span
          key={`${chunk}-${index}`}
          aria-hidden="true"
          className="inline-block overflow-hidden align-bottom"
        >
          <motion.span
            variants={item}
            className={`inline-block ${itemClassName}`}
            style={{ transformOrigin: "bottom center" }}
          >
            {chunk}
            {by === "word" && index < chunks.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </MotionComponent>
  );
}
