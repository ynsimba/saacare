import { Link } from "react-router-dom";
import { UserSearch, GraduationCap, Lock, ArrowUpRight, AlertTriangle } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal, { Stagger, RevealItem } from "../components/ui/Reveal";
import Spotlight from "../components/ui/Spotlight";
import Section3D from "../components/ui/Section3D";
import Button from "../components/ui/Button";
import ValuesBento from "../components/sections/ValuesBento";
import StatsBand from "../components/sections/StatsBand";
import CTASection from "../components/sections/CTASection";

/**
 * Le rôle de tiers de confiance est ce qui distingue réellement SaaCare d'une
 * petite annonce. Il est expliqué ici en trois responsabilités concrètes plutôt
 * qu'en paragraphe de positionnement.
 */
const ROLE = [
  {
    icon: UserSearch,
    step: "Nous sélectionnons",
    description:
      "Ce n'est pas au client de mener l'enquête. Notre équipe contrôle l'identité, les antécédents et les références avant qu'un profil soit visible.",
  },
  {
    icon: GraduationCap,
    step: "Nous formons et suivons",
    description:
      "Formation obligatoire propre à chaque métier, puis évaluation après chaque mission et audits aléatoires.",
  },
  {
    icon: Lock,
    step: "Nous gardons l'argent",
    description:
      "Le paiement est conservé par SaaCare, jamais versé d'avance au prestataire. Il n'est libéré qu'après votre validation.",
  },
];

export default function About() {
  return (
    <>
      <Seo
        title="À propos"
        description="SaaCare transforme le marché informel des services à domicile en RDC en une expérience fiable, sécurisée et professionnelle. Découvrez notre mission et nos valeurs."
        path="/a-propos"
      />

      <PageHero
        eyebrow="Notre mission"
        title="Transformer un marché informel en une expérience de confiance."
        subtitle="En RDC, la majorité des services à domicile restent non encadrés. SaaCare s'interpose comme tiers de confiance : nous sélectionnons, nous formons, et nous conservons le paiement jusqu'à votre validation."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "À propos" }]}
        compact
      >
        <Button to="/comment-ca-marche" size="lg" withArrow magnetic>
          Voir comment ça marche
        </Button>
      </PageHero>

      {/* ---------------- Le constat / notre réponse ---------------- */}
      <Section3D variant="up" className="bg-paper-100">
        <section className="bg-paper-100 py-20 sm:py-24" aria-labelledby="approach-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal variant="up" className="mb-12 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-md border border-coral-500/20 bg-coral-100/60 px-3 py-1 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-coral-800">
                <AlertTriangle className="size-3.5" aria-hidden="true" />
                Le constat
              </span>
              <h2
                id="approach-heading"
                className="mt-5 text-balance font-display text-3xl font-semibold leading-[1.15] tracking-[-0.015em] text-ink-900 sm:text-4xl"
              >
                Confier son foyer à un inconnu ne devrait pas être un pari.
              </h2>
              <p className="mt-5 text-pretty leading-relaxed text-ink-900/65">
                Aujourd'hui, tout repose sur le bouche-à-oreille : aucune vérification d'identité,
                aucun cadre contractuel, aucun recours si la prestation tourne mal. C'est précisément
                ce que nous prenons en charge.
              </p>
            </Reveal>

            <Stagger as="ol" stagger={0.1} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {ROLE.map(({ icon: Icon, step, description }, index) => (
                <RevealItem as="li" key={step} variant="blur" className="h-full">
                  <Spotlight
                    tone="teal"
                    lift={6}
                    className="group flex h-full flex-col rounded-3xl border border-ink-900/8 bg-white p-7 transition-[box-shadow,border-color] duration-500 hover:border-ink-900/12 hover:shadow-lifted"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:bg-teal-600 group-hover:text-white">
                        <Icon className="size-5" aria-hidden="true" strokeWidth={1.75} />
                      </span>
                      <span className="font-mono text-xs font-semibold tracking-[0.2em] text-ink-900/20 transition-colors duration-500 group-hover:text-teal-600/40">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 font-display text-lg font-semibold text-ink-900">{step}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-900/60">{description}</p>
                  </Spotlight>
                </RevealItem>
              ))}
            </Stagger>
          </div>
        </section>
      </Section3D>

      {/* ---------------- Vision ---------------- */}
      <Section3D variant="right" className="bg-white">
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <SectionHeading
              align="center"
              eyebrow="Notre vision"
              title="Que « chercher un prestataire » et « chercher sur SaaCare » deviennent synonymes."
            />
            <Reveal variant="up" delay={0.15}>
              <p className="mx-auto mt-6 max-w-2xl text-pretty leading-relaxed text-ink-900/65">
                En RDC d'abord, puis en Afrique centrale : devenir la référence de confiance pour
                l'accès à des professionnels vérifiés du service à la personne.
              </p>
              <Link
                to="/devenir-prestataire"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800"
              >
                <span className="link-underline">Rejoindre le réseau de prestataires</span>
                <ArrowUpRight
                  className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Reveal>
          </div>
        </section>
      </Section3D>

      <ValuesBento />
      <StatsBand />
      <CTASection />
    </>
  );
}
