import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useIsReducedMotion } from "../../lib/motion";

/**
 * Transition 3D à l'entrée d'une section : le bloc arrive incliné dans la
 * profondeur puis se redresse à plat au fil du défilement.
 *
 * L'animation est bornée à la phase d'entrée (`start end` → `start 40%`) :
 * une fois la section installée, la transformation vaut l'identité et n'inter-
 * fère plus avec les éléments `sticky` qu'elle peut contenir.
 *
 * `variant` : up (charnière haute) · down (charnière basse) · left · right.
 *
 * IMPORTANT : passer via `className` la couleur de fond de la section enveloppée.
 * Le bloc étant réduit puis translaté pendant l'entrée, ses bords laisseraient
 * autrement apparaître le fond de la page — une couture visible entre sections.
 */
const PRESETS = {
  up: { rotateX: 9, rotateY: 0, origin: "50% 0%" },
  down: { rotateX: -8, rotateY: 0, origin: "50% 100%" },
  left: { rotateX: 5, rotateY: -9, origin: "0% 50%" },
  right: { rotateX: 5, rotateY: 9, origin: "100% 50%" },
};

export default function Section3D({
  children,
  variant = "up",
  intensity = 1,
  perspective = 1600,
  clip = true,
  className = "",
}) {
  const reduced = useIsReducedMotion();
  const ref = useRef(null);
  const preset = PRESETS[variant] ?? PRESETS.up;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 40%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 30,
    restDelta: 0.001,
  });

  const rotateX = useTransform(progress, [0, 1], [preset.rotateX * intensity, 0]);
  const rotateY = useTransform(progress, [0, 1], [preset.rotateY * intensity, 0]);
  const y = useTransform(progress, [0, 1], [52 * intensity, 0]);
  const scale = useTransform(progress, [0, 1], [1 - 0.04 * intensity, 1]);
  const opacity = useTransform(progress, [0, 0.55], [0.72, 1]);

  // Le conteneur porteur du `ref` est toujours rendu : `useScroll` a besoin d'une
  // cible montée. En mouvement réduit, aucune transformation n'est appliquée.
  return (
    <div
      ref={ref}
      className={className}
      style={
        reduced
          ? undefined
          : {
              perspective,
              // Une rotation en perspective rapproche l'un des bords de l'œil, ce qui
              // l'agrandit et le fait déborder latéralement. `clip` supprime ce
              // débordement sans créer de conteneur de défilement — contrairement à
              // `hidden`, les enfants `sticky` continuent donc de fonctionner.
              overflowX: clip ? "clip" : undefined,
            }
      }
    >
      {reduced ? (
        children
      ) : (
        <motion.div
          style={{
            rotateX,
            rotateY,
            y,
            scale,
            opacity,
            transformOrigin: preset.origin,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            willChange: "transform, opacity",
          }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
