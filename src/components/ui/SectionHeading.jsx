import { motion } from "motion/react";
import { EASE, useIsReducedMotion, viewportOnce } from "../../lib/motion";

export function Eyebrow({ children, tone = "text-teal-700", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.18em] ${tone} ${className}`}
    >
      <motion.span
        className="block h-px bg-current opacity-60"
        initial={{ width: 0 }}
        whileInView={{ width: "1.5rem" }}
        viewport={viewportOnce}
        transition={{ duration: 0.6, ease: EASE }}
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
      className={`flex max-w-2xl flex-col gap-4 ${alignClasses}`}
    >
      {eyebrow && (
        <motion.span variants={reduced ? undefined : item}>
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </motion.span>
      )}
      <Component
        variants={reduced ? undefined : item}
        className={`text-balance font-display text-3xl font-semibold leading-[1.1] tracking-[-0.015em] sm:text-4xl ${
          invert ? "text-paper-50" : "text-ink-900"
        } ${titleClassName}`}
      >
        {title}
      </Component>
      {subtitle && (
        <motion.p
          variants={reduced ? undefined : item}
          className={`text-pretty text-base leading-relaxed sm:text-lg ${
            invert ? "text-paper-100/70" : "text-ink-900/65"
          }`}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
