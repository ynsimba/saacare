import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring, useTransform } from "motion/react";

/** Respecte prefers-reduced-motion : à utiliser pour désactiver les animations non essentielles. */
export function useIsReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/** Vrai uniquement sur un appareil à pointeur fin (souris / trackpad). */
export function useHasFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setFine(mq.matches);
    const handler = (e) => setFine(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return fine;
}

export const EASE = [0.16, 1, 0.3, 1];
export const EASE_SPRING = [0.34, 1.56, 0.64, 1];
export const SPRING = { type: "spring", stiffness: 260, damping: 26, mass: 0.6 };
export const SPRING_SOFT = { type: "spring", stiffness: 140, damping: 20, mass: 0.8 };

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: EASE } },
};

/** Apparition avec flou : très efficace pour les titres et cartes premium. */
export const blurUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE },
  },
};

/** Glissement latéral (panneaux, colonnes éditoriales). */
export const slideIn = (from = "left", distance = 40) => ({
  hidden: {
    opacity: 0,
    x: from === "left" ? -distance : from === "right" ? distance : 0,
    y: from === "top" ? -distance : from === "bottom" ? distance : 0,
  },
  show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.7, ease: EASE } },
});

/** Variantes pour une révélation mot par mot ou lettre par lettre. */
export const revealChar = {
  hidden: { opacity: 0, y: "0.6em", rotateX: -55 },
  show: { opacity: 1, y: "0em", rotateX: 0, transition: { duration: 0.75, ease: EASE } },
};

export const staggerContainer = (stagger = 0.12, delay = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const viewportOnce = { once: true, margin: "-80px 0px -80px 0px" };

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: EASE } },
};

/**
 * Effet « magnétique » : l'élément suit légèrement le curseur au survol.
 * Renvoie les props à étaler sur un composant motion.
 */
export function useMagnetic(strength = 0.35, radius = 120) {
  const ref = useRef(null);
  const reduced = useIsReducedMotion();
  const fine = useHasFinePointer();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);

  const onMouseMove = useCallback(
    (event) => {
      const node = ref.current;
      if (!node || reduced || !fine) return;
      const rect = node.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);
      const falloff = Math.max(0, 1 - distance / (radius + rect.width / 2));
      x.set(dx * strength * falloff);
      y.set(dy * strength * falloff);
    },
    [fine, radius, reduced, strength, x, y]
  );

  const onMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    ref,
    onMouseMove,
    onMouseLeave,
    style: { x: springX, y: springY },
    active: !reduced && fine,
  };
}

/**
 * Inclinaison 3D au survol (cartes). Renvoie ref + handlers + styles rotateX/rotateY.
 */
export function useTilt(max = 9) {
  const ref = useRef(null);
  const reduced = useIsReducedMotion();
  const fine = useHasFinePointer();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, SPRING_SOFT);
  const sy = useSpring(py, SPRING_SOFT);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);

  const onMouseMove = useCallback(
    (event) => {
      const node = ref.current;
      if (!node || reduced || !fine) return;
      const rect = node.getBoundingClientRect();
      px.set((event.clientX - rect.left) / rect.width);
      py.set((event.clientY - rect.top) / rect.height);
    },
    [fine, px, py, reduced]
  );

  const onMouseLeave = useCallback(() => {
    px.set(0.5);
    py.set(0.5);
  }, [px, py]);

  return {
    ref,
    onMouseMove,
    onMouseLeave,
    style: { rotateX, rotateY, transformStyle: "preserve-3d" },
    active: !reduced && fine,
  };
}

/** Position normalisée du pointeur dans la fenêtre (-0.5 → 0.5), lissée. */
export function usePointerParallax(intensity = 1) {
  const reduced = useIsReducedMotion();
  const fine = useHasFinePointer();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 60, damping: 20, mass: 0.8 });
  const sy = useSpring(y, { stiffness: 60, damping: 20, mass: 0.8 });

  useEffect(() => {
    if (reduced || !fine) return undefined;
    const onMove = (event) => {
      x.set((event.clientX / window.innerWidth - 0.5) * intensity);
      y.set((event.clientY / window.innerHeight - 0.5) * intensity);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [fine, intensity, reduced, x, y]);

  return { x: sx, y: sy };
}
