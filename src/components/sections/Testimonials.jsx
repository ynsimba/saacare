import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Quote, ArrowLeft, ArrowRight, Star } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import Section3D from "../ui/Section3D";
import { testimonials } from "../../data/content";
import { EASE, useIsReducedMotion } from "../../lib/motion";

const AUTOPLAY_MS = 7000;

export default function Testimonials() {
  const reduced = useIsReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const total = testimonials.length;

  const go = useCallback(
    (next) => {
      setDirection(next > index || (index === total - 1 && next === 0) ? 1 : -1);
      setIndex((next + total) % total);
    },
    [index, total]
  );

  useEffect(() => {
    if (reduced || paused) return undefined;
    const id = window.setInterval(() => {
      setDirection(1);
      setIndex((current) => (current + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, reduced, total]);

  const active = testimonials[index];

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 48 : -48, filter: "blur(6px)" }),
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -48 : 48, filter: "blur(6px)" }),
  };

  return (
    <Section3D variant="right" className="bg-white">
    <section
      className="relative overflow-hidden bg-white py-20 sm:py-28"
      aria-labelledby="testimonials-heading"
    >
      <div
        className="pointer-events-none absolute right-[-10%] top-10 -z-10 size-[30rem] rounded-full bg-gold-100/70 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="Avis clients"
          title={<span id="testimonials-heading">Ce que les familles racontent</span>}
          subtitle="Des avis authentiques, vérifiés après chaque prestation validée sur la plateforme."
        />

        <Reveal
          variant="scale"
          delay={0.15}
          className="relative mx-auto mt-14 max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative overflow-hidden rounded-2xl border border-ink-900/8 bg-paper-100 px-6 py-10 shadow-soft sm:px-12 sm:py-14">
            <Quote
              className="absolute right-8 top-8 size-16 text-gold-500/15"
              aria-hidden="true"
              strokeWidth={1.5}
            />

            <div className="relative min-h-[15rem] sm:min-h-[13rem]">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.figure
                  key={active.name}
                  custom={direction}
                  variants={reduced ? undefined : variants}
                  initial={reduced ? false : "enter"}
                  animate="center"
                  exit={reduced ? undefined : "exit"}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex gap-0.5" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="size-4 fill-gold-500 text-gold-500" />
                    ))}
                  </div>

                  <blockquote className="text-pretty font-display text-xl leading-relaxed text-ink-900 sm:text-2xl">
                    « {active.quote} »
                  </blockquote>

                  <figcaption className="mt-auto flex items-center gap-3.5">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-700 font-display text-sm font-semibold text-white">
                      {active.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{active.name}</p>
                      <p className="text-xs text-ink-900/60">
                        {active.role} · {active.domain}
                      </p>
                    </div>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            {/* Contrôles */}
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-ink-900/8 pt-6">
              <div className="flex items-center gap-2" role="tablist" aria-label="Choisir un témoignage">
                {testimonials.map((t, i) => (
                  <button
                    key={t.name}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Témoignage de ${t.name}`}
                    onClick={() => go(i)}
                    className="group relative h-1.5 w-8 overflow-hidden rounded-full bg-ink-900/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500"
                  >
                    <motion.span
                      className="absolute inset-y-0 left-0 rounded-full bg-teal-600"
                      initial={false}
                      animate={{ width: i === index ? "100%" : "0%" }}
                      transition={{
                        duration: i === index && !reduced && !paused ? AUTOPLAY_MS / 1000 : 0.35,
                        ease: "linear",
                      }}
                    />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <ArrowButton label="Témoignage précédent" onClick={() => go(index - 1)}>
                  <ArrowLeft className="size-4" aria-hidden="true" />
                </ArrowButton>
                <ArrowButton label="Témoignage suivant" onClick={() => go(index + 1)}>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </ArrowButton>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
    </Section3D>
  );
}

function ArrowButton({ children, label, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className="flex size-10 items-center justify-center rounded-full border border-ink-900/10 bg-white text-ink-900/70 transition-colors duration-300 hover:border-navy-700 hover:bg-navy-700 hover:text-white focus-visible:outline-2 focus-visible:outline-gold-500"
    >
      {children}
    </motion.button>
  );
}
