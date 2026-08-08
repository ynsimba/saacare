import { useCallback, useMemo, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { useHasFinePointer, useIsReducedMotion } from "../../lib/motion";

/**
 * Enveloppe une carte d'un halo radial qui suit le curseur, plus une élévation
 * douce au survol. C'est la micro-interaction signature des cartes SaaCare.
 *
 * `tone` choisit la couleur du halo ; `lift` la hauteur de l'élévation.
 * Sur mobile ou en mouvement réduit, seul le rendu statique est conservé.
 */
const TONES = {
  teal: "rgba(184,40,91,0.16)",
  navy: "rgba(38,58,99,0.14)",
  gold: "rgba(201,50,104,0.16)",
  coral: "rgba(159,26,74,0.15)",
  light: "rgba(255,255,255,0.10)",
};

export default function Spotlight({
  children,
  as: Component = "div",
  tone = "teal",
  lift = 6,
  radius = 320,
  className = "",
  ...props
}) {
  const ref = useRef(null);
  const reduced = useIsReducedMotion();
  const fine = useHasFinePointer();
  const enabled = fine && !reduced;

  const [visible, setVisible] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mx}px ${my}px, ${
    TONES[tone] ?? TONES.teal
  }, transparent 72%)`;

  const onMouseMove = useCallback(
    (event) => {
      if (!enabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      mx.set(event.clientX - rect.left);
      my.set(event.clientY - rect.top);
    },
    [enabled, mx, my]
  );

  const MotionComponent = useMemo(() => motion.create(Component), [Component]);

  return (
    <MotionComponent
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={() => enabled && setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      whileHover={reduced ? undefined : { y: -lift }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className={`group/spot relative isolate ${className}`}
      {...props}
    >
      {enabled && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit]"
          style={{ background }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.35 }}
        />
      )}
      {children}
    </MotionComponent>
  );
}
