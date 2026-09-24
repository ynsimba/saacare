import { motion } from "motion/react";
import { EASE, useIsReducedMotion, viewportOnce } from "../../lib/motion";

export function Eyebrow({ children, tone = "text-teal-700", className = "" }) {
  // Teintes claires = posé sur un fond sombre : pastille translucide plutôt que blanche.
  const onDark = /-(100|200|300)\b|paper/.test(tone);
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 ${onDark ? "border-white/15 bg-white/8" : "border-current/15 bg-white/70"} text-[0.7rem] font-semibold uppercase tracking-[0.14em] backdrop-blur ${tone} ${className}`}
    >
      <motion.span
        className="block size-1.5 rounded-full bg-gold-500"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={viewportOnce}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "text-teal-700",
  titleClassName = "",
  invert = false,
  as: Component = motion.h2,
}) {
  const reduced = useIsReducedMotion();
  const alignClasses = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.75, ease: EASE } },
  };

  return (
    <motion.div
      variants={reduced ? undefined : container}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "show"}
      viewport={viewportOnce}
      className={`flex max-w-2xl flex-col gap-2.5 sm:gap-4 ${alignClasses}`}
    >
      {eyebrow && (
        <motion.span variants={reduced ? undefined : item}>
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </motion.span>
      )}
      <Component
        variants={reduced ? undefined : item}
        className={`text-balance font-display text-[1.65rem] font-bold leading-[1.12] tracking-[-0.015em] sm:text-4xl ${
          invert ? "text-paper-50" : "text-ink-900"
        } ${titleClassName}`}
      >
        {title}
      </Component>
      {subtitle && (
        <motion.p
          variants={reduced ? undefined : item}
          className={`text-pretty text-[0.95rem] leading-relaxed sm:text-lg ${
            invert ? "text-paper-100/70" : "text-ink-900/65"
          }`}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
