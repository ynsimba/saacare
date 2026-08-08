import { Link } from "react-router-dom";
import {
  ShieldCheck,
  FileCheck2,
  GraduationCap,
  RefreshCcw,
  Wallet,
  CalendarRange,
  Receipt,
  Lock,
  Timer,
  MapPin,
  LifeBuoy,
  ScrollText,
  ArrowUpRight,
} from "lucide-react";
import Seo from "../lib/Seo";
import HowItWorks from "../components/sections/HowItWorks";
import CTASection from "../components/sections/CTASection";
import SectionHeading from "../components/ui/SectionHeading";
import PageHero from "../components/ui/PageHero";
import Section3D from "../components/ui/Section3D";
import Reveal, { Stagger, RevealItem } from "../components/ui/Reveal";
import Button from "../components/ui/Button";

/** Repères affichés dès l'en-tête : ce que l'utilisateur veut savoir avant tout. */
const HIGHLIGHTS = [
  { value: "Devis", label: "communiqué avant tout paiement" },
  { value: "0 $", label: "libéré tant que vous n'avez pas validé" },
  { value: "24 h", label: "de délai de reversement après validation" },
];

/**
 * Informations pratiques rassemblées au même endroit. Ce sont les questions qui
 * bloquent une réservation — les laisser éparpillées dans la FAQ fait perdre
 * l'utilisateur au moment le plus décisif.
 */
const FACTS = [
  {
    icon: CalendarRange,
    term: "Types de contrat",
    detail: "Journée · Semaine · Mois · Durée indéterminée",
  },
  {
    icon: Wallet,
    term: "Moyens de paiement",
    detail: "Mobile Money ou carte bancaire",
  },
  {
    icon: Receipt,
    term: "Devis",
    detail: "Montant communiqué et validé par vos soins avant tout débit",
  },
  {
    icon: Lock,
    term: "Protection des fonds",
    detail: "Conservés par SaaCare, libérés seulement après votre validation",
  },
  {
    icon: Timer,
    term: "Reversement au prestataire",
    detail: "Sous 24 heures une fois la prestation validée",
  },
  {
    icon: MapPin,
    term: "Zone couverte",
    detail: "Kinshasa et communes environnantes",
  },
  {
    icon: LifeBuoy,
    term: "En cas de litige",
    detail: "Ouvert depuis votre espace client, examiné avant tout reversement",
  },
  {
    icon: ScrollText,
    term: "Conditions détaillées",
    detail: "Précisées dans les conditions de vente",
    to: "/cgv",
    linkLabel: "Lire les CGV",
  },
];

const VERIFICATION_STEPS = [
  {
    icon: FileCheck2,
    title: "Candidature & pièces",
    description: "Identité, références et expérience soumises à notre équipe qualité.",
  },
  {
    icon: ShieldCheck,
    title: "Contrôle des antécédents",
    description: "Vérification d'identité et des références avant tout entretien.",
  },
  {
    icon: GraduationCap,
    title: "Entretien & formation",
    description: "Entretien individuel puis formation obligatoire propre au domaine.",
  },
  {
    icon: RefreshCcw,
    title: "Suivi continu",
    description: "Évaluation après chaque mission et audits aléatoires une fois actif.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Seo
        title="Comment ça marche"
        description="Découvrez le parcours SaaCare en 5 étapes : recherche, réservation, paiement sécurisé, intervention et évaluation — et comment nous vérifions chaque prestataire."
        path="/comment-ca-marche"
      />

      <PageHero
        align="center"
        eyebrow="Le fonctionnement de SaaCare"
        title="Vous ne payez rien tant que la prestation n'est pas validée."
        subtitle="Chaque réservation suit le même cycle sécurisé, du premier clic à l'avis laissé après la prestation."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Comment ça marche" }]}
        compact
      >
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-wrap justify-center gap-3">
            <Button to="/trouver-un-prestataire" size="lg" withArrow magnetic>
              Commencer une recherche
            </Button>
            <Button to="/faq" variant="glass" size="lg" magnetic>
              Consulter la FAQ
            </Button>
          </div>

          {/* Repères clés */}
          <dl className="grid w-full max-w-2xl grid-cols-1 divide-y divide-white/10 border-t border-white/10 pt-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {HIGHLIGHTS.map((item) => (
              <div key={item.label} className="px-4 py-3 text-center sm:py-0">
                <dt className="sr-only">{item.label}</dt>
                <dd>
                  <span className="block font-display text-2xl font-semibold text-paper-50">
                    {item.value}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-paper-100/55">
                    {item.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </PageHero>

      <HowItWorks />

      {/* ---------------- L'essentiel en un coup d'œil ---------------- */}
      <Section3D variant="right" className="bg-white">
        <section className="bg-white py-20 sm:py-28" aria-labelledby="facts-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="L'essentiel"
              title={<span id="facts-heading">Tout ce qu'il faut savoir avant de réserver</span>}
              subtitle="Les réponses aux questions qui reviennent le plus, rassemblées ici plutôt qu'éparpillées."
            />

            <Stagger
              as="dl"
              stagger={0.06}
              className="mt-12 grid grid-cols-1 gap-x-12 border-t border-ink-900/10 lg:grid-cols-2"
            >
              {FACTS.map(({ icon: Icon, term, detail, to, linkLabel }) => (
                <RevealItem
                  key={term}
                  variant="up"
                  className="group border-b border-ink-900/10 py-5"
                >
                  <dt className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:bg-teal-600 group-hover:text-white">
                      <Icon className="size-4.5" aria-hidden="true" strokeWidth={1.75} />
                    </span>
                    <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-900/40">
                      {term}
                    </span>
                  </dt>
                  <dd className="mt-2 pl-12 text-[0.95rem] font-medium leading-snug text-ink-900">
                    {detail}
                    {to && (
                      <Link
                        to={to}
                        className="ml-2 inline-flex items-center gap-1 align-middle text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800"
                      >
                        <span className="link-underline">{linkLabel}</span>
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    )}
                  </dd>
                </RevealItem>
              ))}
            </Stagger>
          </div>
        </section>
      </Section3D>

      {/* ---------------- Vérification des prestataires ---------------- */}
      <Section3D variant="left" className="bg-paper-100">
        <section className="bg-paper-100 py-20 sm:py-28" aria-labelledby="verification-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Vérification des prestataires"
              title={
                <span id="verification-heading">
                  Ce qui se passe avant qu'un prestataire n'apparaisse sur SaaCare
                </span>
              }
              subtitle="Le même standard pour les quatre domaines, avec une formation adaptée à chaque métier."
            />

            <Stagger
              as="ol"
              stagger={0.1}
              className="relative mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
            >
              {/* Rail de progression horizontal */}
              <span
                className="pointer-events-none absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-teal-600/40 via-ink-900/10 to-transparent lg:block"
                aria-hidden="true"
              />

              {VERIFICATION_STEPS.map((step, i) => (
                <RevealItem as="li" key={step.title} variant="blur" className="group relative">
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-600 text-white shadow-[0_10px_24px_-10px_rgba(159,26,74,0.9)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
                      <step.icon className="size-4.5" aria-hidden="true" strokeWidth={1.75} />
                    </span>
                    <span className="font-mono text-xs font-semibold tracking-[0.2em] text-navy-700/40">
                      0{i + 1}
                    </span>
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold leading-snug text-ink-900">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-900/60">{step.description}</p>
                </RevealItem>
              ))}
            </Stagger>

            <Reveal variant="fade" delay={0.2} className="mt-10">
              <p className="flex flex-wrap items-center gap-2 text-sm text-ink-900/55">
                <ShieldCheck className="size-4 shrink-0 text-teal-700" aria-hidden="true" />
                Un prestataire qui ne respecte plus ces exigences est suspendu.
                <Link
                  to="/devenir-prestataire"
                  className="inline-flex items-center gap-1 font-semibold text-teal-700 transition-colors hover:text-teal-800"
                >
                  <span className="link-underline">Devenir prestataire</span>
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              </p>
            </Reveal>
          </div>
        </section>
      </Section3D>

      <CTASection />
    </>
  );
}
