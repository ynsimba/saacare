import { Info } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import SectionHeading from "../components/ui/SectionHeading";
import ProcessIcon from "../components/ui/ProcessIcon";
import Reveal, { Stagger, RevealItem } from "../components/ui/Reveal";
import Section3D from "../components/ui/Section3D";
import CTASection from "../components/sections/CTASection";
import { guarantees } from "../data/content";

/** Ce qui se passe en cas d'incident (plan d'affaires, matrice des risques). */
const INCIDENT_STEPS = [
  { title: "Vous signalez", text: "Par téléphone ou WhatsApp, à votre chargé de clientèle." },
  { title: "Nous agissons", text: "En cas de faute grave, l'agent est retiré de la mission immédiatement." },
  { title: "Nous remplaçons", text: "Un nouvel agent vérifié intervient sous 24 heures ouvrées." },
  { title: "Nous accompagnons", text: "Médiation, déclaration à l'assurance si nécessaire, et revérification de l'agent." },
];

export default function Garanties() {
  return (
    <>
      <Seo
        title="Nos garanties"
        description="Remplacement sous 24 heures, garantie placement de 90 jours, assurance responsabilité civile, garantie vol, visite qualité et médiation."
        path="/garanties"
      />

      <PageHero
        eyebrow="Nos garanties"
        title="Si quelque chose ne va pas, nous sommes là."
        subtitle="Remplacement, assurance, suivi et médiation : ce que nous nous engageons à faire, écrit noir sur blanc."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Nos garanties" }]}
        compact
      />

      <section className="bg-paper-100 py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Stagger className="snap-row grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
            {guarantees.map((g) => (
              <RevealItem key={g.title} variant="up" className="flex h-full flex-col rounded-2xl border border-ink-900/8 bg-white p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-teal-600 text-white">
                  <ProcessIcon name={g.icon} className="size-5" />
                </span>
                <h2 className="mt-5 font-display text-xl font-bold text-ink-900">{g.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-900/75">{g.detail}</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      <Section3D variant="up" className="bg-white">
        <section className="bg-white py-8 sm:py-16" aria-labelledby="incident-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="En cas d'incident" title={<span id="incident-heading">Voici ce qui se passe, étape par étape</span>} />
            <Stagger as="ol" className="snap-row mt-6 sm:mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
              {INCIDENT_STEPS.map((s, i) => (
                <RevealItem as="li" key={s.title} variant="up" className="rounded-2xl bg-mint p-6">
                  <span className="font-display text-3xl font-bold text-gold-700">0{i + 1}</span>
                  <h3 className="mt-2 font-display text-lg font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-900/80">{s.text}</p>
                </RevealItem>
              ))}
            </Stagger>
          </div>
        </section>
      </Section3D>

      <section className="bg-paper-100 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="fade" className="flex items-start gap-3 rounded-2xl border border-ink-900/10 bg-white p-5 text-sm leading-relaxed text-ink-900">
            <Info className="mt-0.5 size-5 shrink-0 text-teal-700" aria-hidden="true" />
            <span>
              <strong className="block">Les limites, en toute transparence</strong>
              La garantie vol s'applique avec une franchise et un plafond précisés au contrat, sous réserve du dépôt d'une
              plainte. Les garanties et l'assurance ne s'appliquent plus si vous engagez l'agent directement, en dehors
              de SaaCare.
            </span>
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
