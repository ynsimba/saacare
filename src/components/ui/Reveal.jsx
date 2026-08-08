import { useMemo } from "react";
import { motion } from "motion/react";
import { EASE, useIsReducedMotion, viewportOnce } from "../../lib/motion";

/**
 * Jeux de variantes utilisés partout sur la plateforme pour les révélations au scroll.
 * Chaque entrée reste discrète : on ne déplace jamais un élément de plus de ~40 px.
 */
const PRESETS = {
  up: { hidden: { opacity: 0, y: 28 } },
  blur: { hidden: { opacity: 0, y: 30, filter: "blur(10px)" } },
  left: { hidden: { opacity: 0, x: -36 } },
  right: { hidden: { opacity: 0, x: 36 } },
  scale: { hidden: { opacity: 0, scale: 0.94 } },
  fade: { hidden: { opacity: 0 } },
};

const SHOWN = { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" };

function buildVariants(variant, duration, delay) {
  const hidden = (PRESETS[variant] ?? PRESETS.up).hidden;
  // On ne réanime que les propriétés réellement présentes dans l'état caché.
  const show = Object.keys(hidden).reduce((acc, key) => ({ ...acc, [key]: SHOWN[key] }), {});
  return {
    hidden,
    show: { ...show, transition: { duration, delay, ease: EASE } },
  };
}

/**
 * Révèle un bloc lorsqu'il entre dans le viewport.
 * `variant` : up | blur | left | right | scale | fade.
 * Si l'utilisateur demande une réduction des animations, le contenu s'affiche directement.
 */
export default function Reveal({
  children,
  as: Component = "div",
  variant = "up",
  delay = 0,
  duration = 0.7,
  className = "",
  ...props
}) {
  const reduced = useIsReducedMotion();
  const MotionComponent = useMemo(() => motion.create(Component), [Component]);
  const variants = useMemo(() => buildVariants(variant, duration, delay), [variant, duration, delay]);

  if (reduced) {
    return <Component className={className} {...props}>{children}</Component>;
  }

  return (
    <MotionComponent
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}

/**
 * Conteneur qui déclenche ses enfants <RevealItem> en cascade.
 * À utiliser pour les grilles de cartes, les listes de bénéfices, les étapes…
 */
export function Stagger({
  children,
  as: Component = "div",
  stagger = 0.09,
  delay = 0.05,
  className = "",
  ...props
}) {
  const reduced = useIsReducedMotion();
  const MotionComponent = useMemo(() => motion.create(Component), [Component]);

  if (reduced) {
    return <Component className={className} {...props}>{children}</Component>;
  }

  return (
    <MotionComponent
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}

/** Enfant d'un <Stagger>. Hérite du rythme défini par le conteneur. */
export function RevealItem({
  children,
  as: Component = "div",
  variant = "up",
  duration = 0.65,
  className = "",
  ...props
}) {
  const reduced = useIsReducedMotion();
  const MotionComponent = useMemo(() => motion.create(Component), [Component]);
  const variants = useMemo(() => buildVariants(variant, duration, 0), [variant, duration]);

  if (reduced) {
    return <Component className={className} {...props}>{children}</Component>;
  }

  return (
    <MotionComponent variants={variants} className={className} {...props}>
      {children}
    </MotionComponent>
  );
}
