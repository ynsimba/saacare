import { motion } from "motion/react";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "../ui/SectionHeading";
import ProcessIcon from "../ui/ProcessIcon";
import Button from "../ui/Button";
import Reveal, { Stagger, RevealItem } from "../ui/Reveal";
import Section3D from "../ui/Section3D";
import { saatrustSteps } from "../../data/content";
import { EASE, useIsReducedMotion, viewportOnce } from "../../lib/motion";

/**
 * Frise SaaTrust : rail vertical élégant sur mobile, 7 colonnes sur desktop.
 */
export default function SaaTrustTimeline() {
  const reduced = useIsReducedMotion();

  return (
    <Section3D variant="up" className="bg-white">
      <section className="relative overflow-hidden bg-white py-8 sm:py-20" aria-labelledby="saatrust-heading">
        <div className="pointer-events-none absolute -right-24 top-10 -z-10 size-[28rem] rounded-full bg-teal-100/40 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-20 bottom-0 -z-10 size-[22rem] rounded-full bg-gold-100/50 blur-3xl" aria-hidden="true" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:gap-8 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow="Le protocole SaaTrust"
              title={<span id="saatrust-heading">Sept contrôles avant toute mise en relation</span>}
              subtitle="Identité, domicile, antécédents, garants, références, compétence et aptitude — chaque preuve est conservée et vérifiable en ligne."
            />
            <Reveal variant="right" delay={0.15} className="hidden shrink-0 flex-wrap gap-3 sm:flex">
              <Button to="/saatrust" size="md" withArrow>
                Découvrir le protocole
              </Button>
              <Button to="/verifier" variant="outline" size="md">
                Vérifier un agent
              </Button>
            </Reveal>
          </div>

          {/* ---------- Mobile : rail vertical ---------- */}
          <ol className="snap-row-lg mt-5 [--snap-w:62%] [--snap-w-sm:36%] lg:hidden">
            {saatrustSteps.map((step, index) => (
              <li key={step.number} className="flex flex-col rounded-2xl border border-ink-900/6 bg-paper-100/80 p-3.5">
                <span className="flex items-center justify-between">
                  <span className="grid size-9 place-items-center rounded-xl bg-teal-600 text-white shadow-[0_8px_20px_-8px_rgba(1,67,61,0.65)]">
                    <ProcessIcon name={step.icon} className="size-4" />
                  </span>
                  <span className="font-mono text-[0.62rem] font-bold tracking-[0.16em] text-gold-700">
                    {step.number}
                    <span className="text-ink-900/30"> / 0{saatrustSteps.length}</span>
                  </span>
                </span>
                <span className="mt-3 font-display text-[0.95rem] font-bold text-ink-900">{step.title}</span>
                <p className="mt-1 text-xs leading-snug text-ink-900/60">{step.proof}</p>
                {index < saatrustSteps.length - 1 && <span className="sr-only">puis</span>}
              </li>
            ))}
          </ol>

          {/* ---------- Tablet + desktop ---------- */}
          <div className="relative mt-14 hidden lg:block">
            <svg className="absolute left-0 right-0 top-6 hidden h-4 w-full lg:block" viewBox="0 0 1000 16" preserveAspectRatio="none" aria-hidden="true">
              <motion.path
                d="M0 8 H1000"
                stroke="#EE5518"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                initial={reduced ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={viewportOnce}
                transition={{ duration: 1.6, ease: EASE }}
              />
            </svg>

            <Stagger as="ol" stagger={0.07} className="relative grid grid-cols-7 gap-4">
              {saatrustSteps.map((step) => (
                <RevealItem as="li" key={step.number} variant="up" className="group relative flex flex-col">
                  <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-600 text-white shadow-soft ring-4 ring-white transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-110">
                    <ProcessIcon name={step.icon} className="size-5" />
                  </span>
                  <span className="mt-4">
                    <span className="block text-xs font-bold tracking-[0.16em] text-gold-700">{step.number}</span>
                    <span className="mt-0.5 block font-display text-lg font-bold text-ink-900">{step.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-900/70">{step.proof}</span>
                  </span>
                </RevealItem>
              ))}
            </Stagger>
          </div>

          <Reveal variant="fade" delay={0.15} className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-mint to-sky/40 p-4 sm:mt-12 sm:p-5">
            <div className="flex items-start gap-3 sm:items-center">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-600 text-white sm:size-10">
                <ShieldCheck className="size-4 sm:size-5" aria-hidden="true" />
              </span>
              <p className="text-xs leading-snug text-ink-900 sm:text-sm sm:leading-relaxed">
                <strong className="font-semibold">Sur 100 candidatures, environ 15 agents sont admis.</strong>{" "}
                Aucun frais n&apos;est demandé aux candidats, et aucune personne de moins de 18 ans n&apos;est placée.
              </p>
            </div>
            <div className="mt-3 flex gap-2 sm:hidden">
              <Link
                to="/saatrust"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2.5 text-sm font-semibold text-white"
              >
                Le protocole <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
              <Link
                to="/verifier"
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-teal-600/25 bg-white/70 px-3 py-2.5 text-sm font-semibold text-teal-700"
              >
                Vérifier
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </Section3D>
  );
}
