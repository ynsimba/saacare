import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useHasFinePointer, useIsReducedMotion } from "../../lib/motion";

const INTERACTIVE = 'a, button, [role="button"], select, summary, input[type="submit"]';

/**
 * Curseur personnalisé : un point qui suit le pointeur au pixel près et un anneau
 * qui le rattrape avec un ressort. Il grossit au survol des éléments interactifs.
 * Totalement désactivé au tactile et si prefers-reduced-motion est actif —
 * le curseur système reste alors la seule référence.
 */
export default function Cursor() {
  const fine = useHasFinePointer();
  const reduced = useIsReducedMotion();
  const enabled = fine && !reduced;

  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove("has-custom-cursor");
      return undefined;
    }
    document.body.classList.add("has-custom-cursor");

    const onMove = (event) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      const target = event.target instanceof Element ? event.target : null;
      setHovering(Boolean(target?.closest(INTERACTIVE)));
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true">
      <motion.div
        className="cursor-dot bg-paper-50"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 6 : 8,
          height: hovering ? 6 : 8,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.18 }}
      />
      <motion.div
        className="cursor-ring border border-paper-50"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 46 : 28,
          height: hovering ? 46 : 28,
          opacity: visible ? (hovering ? 0.9 : 0.55) : 0,
          scale: pressed ? 0.82 : 1,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      />
    </div>
  );
}
