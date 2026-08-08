import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Lock } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import ProcessIcon from "../ui/ProcessIcon";
import StepVisual from "./StepVisual";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";
import Section3D from "../ui/Section3D";
import { processSteps } from "../../data/content";
import { EASE, useIsReducedMotion } from "../../lib/motion";

const AUTOPLAY_MS = 6000;

/**
 * Parcours client présenté comme un « showcase » interactif :
 * une colonne d'étapes (cliquables, avec lecture automatique) et un aperçu
 * animé de l'interface correspondant à l'étape sélectionnée.
 */
export default function HowItWorks({ compact = false }) {
  const sectionRef = useRef(null);
  const reduced = useIsReducedMotion();
  const inView = useInView(sectionRef, { once: false, margin: "-25% 0px -25% 0px" });

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = processSteps.length;

  const select = useCallback((index) => {
    setActive(index);
    setPaused(true);
  }, []);

  // Lecture automatique tant que la section est visible et qu'aucune étape
  // n'a été choisie manuellement.
  useEffect(() => {
    if (reduced || paused || !inView) return undefined;
    const id = window.setTimeout(() => setActive((current) => (current + 1) % total), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [active, inView, paused, reduced, total]);

  return (
    <Section3D variant="up" className="bg-paper-100">
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-paper-100 py-20 sm:py-28"
      aria-labelledby="how-it-works-heading"
    >
      {/* Fonds : trame fine + halo de marque */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5] [background-image:linear-gradient(rgba(3,41,76,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(3,41,76,0.045)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(75%_60%_at_50%_40%,#000,transparent)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-40 top-1/4 -z-10 size-[32rem] rounded-full bg-teal-100/50 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 -z-10 size-[26rem] rounded-full bg-gold-100/50 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Le parcours"
          title={<span id="how-it-works-heading">Cinq étapes pour une expérience sereine</span>}
          subtitle="Du besoin exprimé à la prestation validée, chaque étape est pensée pour vous rassurer — et pour garantir au prestataire un paiement juste."
        />

        <div className="mt-14 grid grid-cols-1 items-start gap-10 lg:mt-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
          {/* ---------------- Colonne des étapes ---------------- */}
          <div>
            <ol className="relative flex flex-col">
            {/* Rail vertical continu */}
            <span
              className="pointer-events-none absolute bottom-6 left-[1.375rem] top-6 w-px bg-ink-900/10"
              aria-hidden="true"
            />

            {processSteps.map((step, index) => {
              const isActive = index === active;
              const isPast = index < active;

              return (
                <li key={step.number} className="relative">
                  <button
                    type="button"
                    onClick={() => select(index)}
                    aria-current={isActive ? "step" : undefined}
                    className="group flex w-full items-start gap-4 rounded-2xl py-4 pr-3 text-left transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                  >
                    {/* Puce / icône */}
                    <span className="relative z-10 shrink-0">
                      <motion.span
                        animate={{
                          scale: isActive ? 1 : 0.86,
                          backgroundColor: isActive || isPast ? "#9f1a4a" : "#ffffff",
                          color: isActive || isPast ? "#ffffff" : "#33497a",
                        }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className={`flex size-11 items-center justify-center rounded-2xl border transition-shadow duration-500 ${
                          isActive
                            ? "border-teal-600 shadow-[0_14px_32px_-12px_rgba(159,26,74,0.85)]"
                            : "border-ink-900/10"
                        }`}
                      >
                        <ProcessIcon name={step.icon} className="size-[1.15rem]" />
                      </motion.span>
                      {isActive && !reduced && (
                        <motion.span
                          layoutId="step-halo"
                          className="absolute inset-0 -z-10 rounded-2xl bg-teal-500/20 blur-md"
                          transition={{ duration: 0.5, ease: EASE }}
                        />
                      )}
                    </span>

                    {/* Texte */}
                    <span className="min-w-0 flex-1 pt-1">
                      <span className="flex items-baseline gap-2.5">
                        <span
                          className={`font-mono text-[0.68rem] font-semibold tracking-[0.22em] transition-colors duration-500 ${
                            isActive ? "text-teal-700" : "text-navy-700/40"
                          }`}
                        >
                          {step.number}
                        </span>
                        <span
                          className={`font-display text-lg font-semibold leading-snug transition-colors duration-500 sm:text-xl ${
                            isActive ? "text-ink-900" : "text-ink-900/45 group-hover:text-ink-900/75"
                          }`}
                        >
                          {step.title}
                        </span>
                      </span>

                      {/* Description révélée sur l'étape active */}
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.span
                            initial={reduced ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={reduced ? undefined : { height: 0, opacity: 0 }}
                            transition={{
                              height: { duration: 0.45, ease: EASE },
                              opacity: { duration: 0.3 },
                            }}
                            className="block overflow-hidden"
                          >
                            <span className="block pt-2 text-sm leading-relaxed text-ink-900/60">
                              {step.description}
                            </span>
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Barre de progression de lecture automatique */}
                      <span
                        className="mt-3 block h-0.5 w-full overflow-hidden rounded-full bg-ink-900/6"
                        aria-hidden="true"
                      >
                        <motion.span
                          key={`step-progress-${active}`}
                          className="block h-full rounded-full bg-gradient-to-r from-teal-600 to-gold-500"
                          initial={{ width: "0%" }}
                          animate={{ width: isActive ? "100%" : "0%" }}
                          transition={{
                            duration:
                              isActive && !reduced && !paused && inView ? AUTOPLAY_MS / 1000 : 0.45,
                            ease: "linear",
                          }}
                        />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {!compact && (
            <Reveal variant="up" className="mt-8 pl-[3.75rem]">
              <Button to="/trouver-un-prestataire" withArrow magnetic>
                Démarrer une recherche
              </Button>
            </Reveal>
          )}
          </div>

          {/* ---------------- Aperçu de l'interface ---------------- */}
          <Reveal variant="scale" duration={0.85} className="lg:sticky lg:top-28">
            <div className="relative">
              {/* Cadres décalés en arrière-plan */}
              <div
                className="absolute -right-3 -top-3 hidden h-full w-full rounded-xl border border-ink-900/8 bg-white/50 sm:block"
                aria-hidden="true"
              />
              <div
                className="absolute -right-6 -top-6 hidden h-full w-full rounded-xl border border-ink-900/6 bg-white/25 sm:block"
                aria-hidden="true"
              />

              <div className="relative overflow-hidden rounded-xl border border-ink-900/8 bg-paper-50 shadow-lifted">
                <div className="flex min-h-[27rem] flex-col sm:min-h-[28rem]" aria-hidden="true">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={reduced ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={reduced ? undefined : { opacity: 0, y: -12, filter: "blur(4px)" }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="flex flex-1 flex-col"
                    >
                      <StepVisual index={active} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Étiquette flottante de réassurance */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
                className="absolute -bottom-5 left-4 flex items-center gap-2.5 rounded-2xl border border-ink-900/8 bg-white px-4 py-3 shadow-lifted sm:left-8"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-700">
                  <Lock className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-semibold text-ink-900">Paiement protégé</span>
                  <span className="block text-[0.68rem] text-ink-900/50">
                    Libéré après votre validation
                  </span>
                </span>
              </motion.div>
            </div>
          </Reveal>
        </div>

        {/* Pagination discrète (mobile) */}
        <div className="mt-14 flex items-center justify-center gap-2 lg:hidden">
          {processSteps.map((step, index) => (
            <button
              key={step.number}
              type="button"
              onClick={() => select(index)}
              aria-label={`Étape ${index + 1} : ${step.title}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === active ? "w-8 bg-teal-600" : "w-1.5 bg-ink-900/15"
              }`}
            />
          ))}
        </div>

        {compact && (
          <Reveal variant="up" className="mt-12 flex justify-center">
            <Button to="/comment-ca-marche" variant="outline" size="lg" withArrow magnetic>
              Voir le parcours en détail
            </Button>
          </Reveal>
        )}
      </div>
    </section>
    </Section3D>
  );
}
