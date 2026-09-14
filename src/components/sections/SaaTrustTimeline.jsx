import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import ProcessIcon from "../ui/ProcessIcon";
import Button from "../ui/Button";
import Reveal, { Stagger, RevealItem } from "../ui/Reveal";
import Section3D from "../ui/Section3D";
import { saatrustSteps } from "../../data/content";
import { EASE, useIsReducedMotion, viewportOnce } from "../../lib/motion";

/**
 * Frise horizontale des sept contrôles SaaTrust (cahier des charges §2.2.1).
 * Le protocole est le produit : il est montré dès l'accueil, pas relégué.
 */
export default function SaaTrustTimeline() {
  const reduced = useIsReducedMotion();

  return (
    <Section3D variant="up" className="bg-white">
      <section className="relative overflow-hidden bg-white py-20 sm:py-28" aria-labelledby="saatrust-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow="Le protocole SaaTrust"
              title={<span id="saatrust-heading">Sept contrôles avant toute mise en relation</span>}
              subtitle="Identité, domicile, antécédents, garants, références, compétence et aptitude. Écrits, appliqués sans exception, et vérifiables en ligne."
            />
            <Reveal variant="right" delay={0.15} className="flex shrink-0 flex-wrap gap-3">
              <Button to="/saatrust" withArrow>
                Découvrir le protocole
              </Button>
              <Button to="/verifier" variant="outline">
                Vérifier un agent
              </Button>
            </Reveal>
          </div>

          <div className="relative mt-14">
            {/* Chevron de progression qui se trace au défilement */}
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

            <Stagger as="ol" stagger={0.08} className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-7 lg:gap-4">
              {saatrustSteps.map((step) => (
                <RevealItem as="li" key={step.number} variant="up" className="group relative flex gap-4 lg:flex-col lg:gap-0">
                  <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-600 text-white shadow-soft ring-4 ring-white transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-110">
                    <ProcessIcon name={step.icon} className="size-5" />
                  </span>
                  <span className="lg:mt-4">
                    <span className="block text-xs font-bold tracking-[0.16em] text-gold-700">{step.number}</span>
                    <span className="mt-0.5 block font-display text-lg font-bold text-ink-900">{step.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-900/70">{step.proof}</span>
                  </span>
                </RevealItem>
              ))}
            </Stagger>
          </div>

          <Reveal variant="fade" delay={0.2} className="mt-12 flex items-start gap-3 rounded-2xl bg-mint p-5 sm:items-center">
            <ShieldCheck className="size-5 shrink-0 text-teal-700" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-ink-900">
              <strong>Sur 100 candidatures, environ 15 agents sont admis.</strong> Aucun frais n'est demandé aux
              candidats, et aucune personne de moins de 18 ans n'est placée.
            </p>
          </Reveal>
        </div>
      </section>
    </Section3D>
  );
}
