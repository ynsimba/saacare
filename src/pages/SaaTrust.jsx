import { motion } from "motion/react";
import { Search, FileCheck2, XCircle, Ban, BadgeCheck, CalendarClock, Hash, RefreshCw, HeartHandshake } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import SectionHeading from "../components/ui/SectionHeading";
import ProcessIcon from "../components/ui/ProcessIcon";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import VerificationSeal from "../components/ui/VerificationSeal";
import Reveal, { Stagger, RevealItem } from "../components/ui/Reveal";
import Section3D from "../components/ui/Section3D";
import CTASection from "../components/sections/CTASection";
import { saatrustSteps, certificationLevels } from "../data/content";
import { EASE, useIsReducedMotion, viewportOnce } from "../lib/motion";

/** Taux d'admission visé (plan d'affaires §6.3), à remplacer par le taux réel servi par l'API. */
const ADMITTED = 15;

/**
 * La page la plus importante du site en conversion (cahier des charges §2.2.3) :
 * traitée comme une démonstration, pas comme un argumentaire.
 */
export default function SaaTrust() {
  const reduced = useIsReducedMotion();

  return (
    <>
      <Seo
        title="Le protocole SaaTrust — 7 étapes de vérification"
        description="Identité, domicile, antécédents, garants, références, test pratique et aptitude médicale : ce que SaaCare contrôle, comment, et ce qui entraîne un refus."
        path="/saatrust"
      />

      <PageHero
        eyebrow="Le protocole SaaTrust"
        title="Un protocole que l'on peut vous montrer."
        subtitle="Sept contrôles écrits, appliqués sans exception, dont chaque preuve est conservée. Voici exactement ce que nous vérifions avant qu'un agent entre chez vous."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Le protocole SaaTrust" }]}
        compact
      >
        <div className="flex flex-wrap gap-3">
          <Button to="/verifier" size="lg" variant="onDark" withArrow>
            Vérifier un agent
          </Button>
          <Button to="/prestataires" size="lg" variant="glass">
            Voir les profils vérifiés
          </Button>
        </div>
      </PageHero>

      {/* ---------------- Taux d'admission ---------------- */}
      <section className="bg-white py-8 sm:py-16" aria-labelledby="admission-heading">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 sm:gap-10 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Taux d'admission"
              title={<span id="admission-heading">Sur 100 candidatures, environ {ADMITTED} agents admis.</span>}
              subtitle="Le recrutement n'est pas un problème de volume, c'est un problème de tri. Ce taux sera publié et mis à jour chaque mois dès l'ouverture du registre."
            />
          </div>
          <div className="mx-auto grid w-full max-w-md grid-cols-10 gap-1.5 rounded-3xl bg-paper-100 p-5 sm:gap-2 sm:p-6 lg:max-w-none" role="img" aria-label={`${ADMITTED} candidatures admises sur 100`}>
            {Array.from({ length: 100 }, (_, i) => (
              <motion.span
                key={i}
                initial={reduced ? false : { opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={viewportOnce}
                transition={{ duration: 0.3, delay: reduced ? 0 : i * 0.008, ease: EASE }}
                className={`aspect-square rounded-full ${i < ADMITTED ? "bg-gold-500" : "bg-teal-100"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Les sept étapes ---------------- */}
      <Section3D variant="up" className="bg-paper-100">
        <section className="bg-paper-100 py-8 sm:py-16" aria-labelledby="steps-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Les sept étapes" title={<span id="steps-heading">Ce qui est contrôlé, comment, et ce qui entraîne un refus</span>} />
            <Stagger as="ol" className="snap-row-lg mt-6 flex flex-col gap-4 [--snap-w:86%] [--snap-w-sm:52%] sm:mt-12" stagger={0.06}>
              {saatrustSteps.map((step) => (
                <RevealItem as="li" key={step.number} variant="up" className="grid grid-cols-1 content-start gap-3 rounded-2xl border border-ink-900/8 bg-white p-4 sm:gap-5 sm:p-6 lg:grid-cols-[14rem_1fr_1fr_1fr] lg:items-start">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-600 text-white">
                      <ProcessIcon name={step.icon} className="size-5" />
                    </span>
                    <span>
                      <span className="block text-xs font-bold tracking-[0.16em] text-gold-700">ÉTAPE {step.number}</span>
                      <span className="block font-display text-xl font-bold text-ink-900">{step.title}</span>
                    </span>
                  </div>
                  <StepCell icon={Search} label="Ce que nous contrôlons" text={step.control} />
                  <StepCell icon={FileCheck2} label="La preuve conservée" text={step.proof} />
                  <StepCell icon={XCircle} label="Ce qui entraîne un refus" text={step.refusal} tone="text-coral-700" />
                </RevealItem>
              ))}
            </Stagger>
            <Reveal variant="fade" className="mt-6 flex items-start gap-3 rounded-2xl bg-peach p-5 text-sm leading-relaxed text-ink-900">
              <HeartHandshake className="mt-0.5 size-5 shrink-0 text-coral-700" aria-hidden="true" />
              <span>
                <strong>Saa Walé ajoute trois contrôles bloquants</strong> : expérience de la maternité, entretien sur la
                confidentialité, et visite médicale renforcée avec mise à jour vaccinale. La formation de 5 jours est
                obligatoire avant toute première mission.
              </span>
            </Reveal>
          </div>
        </section>
      </Section3D>

      {/* ---------------- Niveaux de certification ---------------- */}
      <section className="bg-white py-8 sm:py-16" aria-labelledby="levels-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Trois niveaux" title={<span id="levels-heading">Vérifié, Certifié, Élite</span>} subtitle="Le niveau d'un agent s'affiche sur son profil, toujours écrit en toutes lettres." />
          <Stagger className="snap-row mt-6 grid grid-cols-1 gap-4 sm:mt-10 md:grid-cols-3" stagger={0.1}>
            {certificationLevels.map((level, i) => (
              <RevealItem key={level.name} variant="up" className="flex h-full flex-col gap-4 rounded-2xl border border-ink-900/8 bg-paper-100 p-6">
                <div className="flex items-center justify-between">
                  <Badge label={level.name} size="md" />
                  <span className="font-display text-3xl font-bold text-teal-100">0{i + 1}</span>
                </div>
                <p className="text-sm leading-relaxed text-ink-900">{level.criteria}</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------------- Le sceau ---------------- */}
      <Section3D variant="left" className="bg-navy-800">
        <section className="relative isolate overflow-hidden bg-navy-800 py-8 text-paper-50 sm:py-16" aria-labelledby="seal-heading">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">Le sceau SaaTrust</p>
              <h2 id="seal-heading" className="mt-3 max-w-2xl text-balance font-display text-2xl sm:mt-4 sm:text-3xl font-bold sm:text-4xl">
                Chaque agent porte un sceau vérifiable en ligne.
              </h2>
              <ul className="snap-row mt-6 grid grid-cols-1 gap-4 [--snap-w:70%] sm:mt-8 md:grid-cols-3">
                {[
                  { icon: Hash, title: "Numéro unique", text: "Sur sa carte professionnelle et son profil." },
                  { icon: BadgeCheck, title: "Date de vérification", text: "Le jour où les 7 contrôles ont été validés." },
                  { icon: CalendarClock, title: "Date de revérification", text: "Tous les 12 mois, et après tout incident." },
                ].map(({ icon: Icon, title, text }) => (
                  <li key={title} className="rounded-2xl bg-white/8 p-5">
                    <Icon className="size-5 text-gold-500" aria-hidden="true" />
                    <p className="mt-3 font-display font-bold">{title}</p>
                    <p className="mt-1 text-sm text-paper-50/80">{text}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button to="/verifier" variant="onDark" size="lg" withArrow>
                  Vérifier un numéro de sceau
                </Button>
              </div>
            </div>
            <div className="mx-auto hidden sm:block">
              <VerificationSeal size={220} />
            </div>
          </div>
        </section>
      </Section3D>

      {/* ---------------- Ce que SaaCare ne fait pas ---------------- */}
      <section className="bg-white py-8 sm:py-16" aria-labelledby="never-heading">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <SectionHeading align="center" eyebrow="Tolérance zéro" title={<span id="never-heading">Ce que SaaCare ne fait jamais</span>} />
          <ul className="snap-row mt-6 grid grid-cols-1 gap-4 text-left [--snap-w:78%] sm:mt-10 md:grid-cols-3">
            {[
              { icon: Ban, text: "Aucun frais n'est demandé à un prestataire, ni à l'inscription, ni ensuite." },
              { icon: Ban, text: "Aucune personne de moins de 18 ans n'est placée, sans exception." },
              { icon: RefreshCw, text: "Aucun contrôle n'est sauté pour tenir un délai commercial." },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 rounded-2xl border-2 border-coral-500/40 p-5">
                <Icon className="mt-0.5 size-5 shrink-0 text-coral-700" aria-hidden="true" />
                <span className="text-sm font-medium leading-relaxed text-ink-900">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTASection title="Des agents vérifiés, prêts à vous accompagner." />
    </>
  );
}

function StepCell({ icon: Icon, label, text, tone = "text-teal-600" }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-navy-600">
        <Icon className={`size-3.5 ${tone}`} aria-hidden="true" />
        {label}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-900">{text}</p>
    </div>
  );
}
