import { motion } from "motion/react";
import { Star } from "lucide-react";
import { EASE, useIsReducedMotion, viewportOnce } from "../../lib/motion";

export default function Rating({ value, reviews, size = "sm" }) {
  const reduced = useIsReducedMotion();
  const starSize = size === "sm" ? "size-3.5" : "size-4.5";

  return (
    <div
      className="flex items-center gap-1.5"
      role="img"
      aria-label={`Note ${value} sur 5${reviews ? `, ${reviews} avis` : ""}`}
    >
      <motion.div
        className="flex"
        aria-hidden="true"
        variants={reduced ? undefined : { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        initial={reduced ? false : "hidden"}
        whileInView={reduced ? undefined : "show"}
        viewport={viewportOnce}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.span
            key={i}
            variants={
              reduced
                ? undefined
                : {
                    hidden: { opacity: 0, scale: 0.4 },
                    show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE } },
                  }
            }
          >
            <Star
              className={`${starSize} ${
                i < Math.round(value) ? "fill-gold-500 text-gold-500" : "fill-transparent text-ink-900/20"
              }`}
              strokeWidth={1.5}
            />
          </motion.span>
        ))}
      </motion.div>
      <span className="text-sm font-semibold text-ink-900">{value.toFixed(1)}</span>
      {reviews != null && <span className="text-sm text-ink-900/65">({reviews})</span>}
    </div>
  );
}
