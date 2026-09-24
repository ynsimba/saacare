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
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 20 : -20 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -20 : 20 }),
  };

  return (
    <Section3D variant="right" className="bg-white">
    <section
      className="relative overflow-hidden bg-white py-8 sm:py-20"
      aria-labelledby="testimonials-heading"
    >

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="Avis clients"
          title={<span id="testimonials-heading">Ce que les familles racontent</span>}
          subtitle="Prénom, commune et service : des avis recueillis après chaque mission."
        />

        <Reveal
          variant="scale"
          delay={0.15}
          className="relative mx-auto mt-5 grid max-w-6xl items-stretch gap-5 sm:mt-14 lg:grid-cols-[0.85fr_1.15fr]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Photo + capsule de note (grand écran) */}
          <div className="relative hidden overflow-hidden rounded-[2.25rem] lg:block">
            <img src="/hero-4.png" alt="" loading="lazy" className="absolute inset-0 size-full object-cover [object-position:60%_40%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" aria-hidden="true" />
            <div className="glass-capsule absolute bottom-5 left-5 flex items-center gap-3 rounded-2xl px-4 py-3">
              <div className="flex gap-0.5" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-4 fill-gold-500 text-gold-500" />
                ))}
              </div>
              <span className="text-sm font-semibold text-ink-900">Avis recueillis après mission</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.25rem] border border-ink-900/8 bg-paper-100 px-5 py-6 shadow-soft sm:px-12 sm:py-12">
            <Quote
              className="absolute right-8 top-8 size-20 text-gold-500/20"
              aria-hidden="true"
              strokeWidth={1.5}
            />

            <div className="relative min-h-[10rem] sm:min-h-[13rem]">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.figure
                  key={active.name}
                  custom={direction}
                  variants={reduced ? undefined : variants}
                  initial={reduced ? false : "enter"}
                  animate="center"
                  exit={reduced ? undefined : "exit"}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="flex flex-col gap-4 sm:gap-6"
                >
                  <div className="flex gap-0.5" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="size-4 fill-gold-500 text-gold-500" />
                    ))}
                  </div>

                  <blockquote className="text-pretty font-display text-xl font-semibold leading-snug text-ink-900 sm:text-[1.7rem]">
                    « {active.quote} »
                  </blockquote>

                  <figcaption className="mt-auto flex items-center gap-3.5">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-700 font-display text-sm font-bold text-white">
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
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-ink-900/8 pt-4 sm:mt-8 sm:pt-6">
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
