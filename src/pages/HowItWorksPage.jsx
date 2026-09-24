import { Link } from "react-router-dom";
import { FileSignature, Receipt, EyeOff, Wallet, MapPin, RefreshCcw, UserCheck, Scale, ScrollText, ArrowUpRight, ShieldCheck } from "lucide-react";
import Seo from "../lib/Seo";
import HowItWorks from "../components/sections/HowItWorks";
import CTASection from "../components/sections/CTASection";
import SectionHeading from "../components/ui/SectionHeading";
import PageHero from "../components/ui/PageHero";
import ProcessIcon from "../components/ui/ProcessIcon";
import Section3D from "../components/ui/Section3D";
import Button from "../components/ui/Button";
import { Stagger, RevealItem } from "../components/ui/Reveal";
import { saatrustSteps } from "../data/content";

const HIGHLIGHTS = [
  { value: "0", label: "inscription pour chercher" },
  { value: "1 appel", label: "pour confirmer votre demande" },
  { value: "24 h", label: "pour remplacer un agent" },
];

/** Les questions qui bloquent une demande, rassemblées au même endroit. */
const FACTS = [
  { icon: FileSignature, term: "Types de contrat", detail: "Mission, placement ou mise à disposition, selon la durée de votre besoin" },
  { icon: Receipt, term: "Tarifs", detail: "Confirmés par votre chargé de clientèle avant toute intervention", to: "/contact", linkLabel: "Demander un devis" },
  { icon: EyeOff, term: "Coordonnées de l'agent", detail: "Jamais publiées : transmises par votre chargé de clientèle après validation" },
  { icon: Wallet, term: "Règlement", detail: "Modalités précisées au contrat ; paiement Mobile Money prévu" },
  { icon: MapPin, term: "Zone couverte", detail: "Les 24 communes de Kinshasa, puis Lubumbashi" },
  { icon: RefreshCcw, term: "Remplacement", detail: "Sous 24 heures ouvrées si l'agent ne convient pas" },
  { icon: UserCheck, term: "Suivi qualité", detail: "Visite d'un superviseur à J+7, puis chaque mois pour les contrats permanents" },
  { icon: Scale, term: "En cas de litige", detail: "Médiation par notre équipe qualité", to: "/garanties", linkLabel: "Nos garanties" },
  { icon: ScrollText, term: "Conditions", detail: "Détaillées dans les conditions générales", to: "/cgu", linkLabel: "Lire les conditions" },
];

export default function HowItWorksPage() {
  return (
    <>
      <Seo
        title="Comment ça marche"
        description="Cherchez sans inscription, déposez une demande, un chargé de clientèle confirme, et SaaCare reste à vos côtés : le parcours client en quatre étapes."
        path="/comment-ca-marche"
      />

      <PageHero
        align="center"
        eyebrow="Comment ça marche"
        title="Vous demandez. Nous confirmons. Nous restons présents."
        subtitle="Un parcours en quatre étapes, avec une personne de l'équipe SaaCare derrière chaque mise en relation."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Comment ça marche" }]}
        compact
      >
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-wrap justify-center gap-3">
            <Button to="/prestataires" size="lg" variant="onDark" withArrow>
              Commencer une recherche
            </Button>
            <Button to="/aide" variant="glass" size="lg">
              Centre d'aide
            </Button>
          </div>
          <dl className="grid w-full max-w-2xl grid-cols-1 divide-y divide-ink-900/10 border-t border-ink-900/10 pt-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {HIGHLIGHTS.map((item) => (
              <div key={item.label} className="flex flex-col-reverse px-4 py-3 text-center sm:py-0">
                <dt className="mt-1 text-xs leading-snug text-ink-900/60">{item.label}</dt>
                <dd className="font-display text-3xl font-extrabold tabular-nums text-teal-700">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </PageHero>

      <HowItWorks />

      <Section3D variant="right" className="bg-white">
        <section className="bg-white py-8 sm:py-16" aria-labelledby="facts-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="L'essentiel" title={<span id="facts-heading">Ce qu'il faut savoir avant de demander</span>} />
            <Stagger as="dl" stagger={0.05} className="snap-row mt-6 grid grid-cols-1 gap-x-12 [--snap-w:78%] sm:mt-12 md:grid-cols-2 md:border-t md:border-ink-900/10">
              {FACTS.map(({ icon: Icon, term, detail, to, linkLabel }) => (
                <RevealItem key={term} variant="up" className="rounded-2xl bg-paper-100 p-4 md:rounded-none md:border-b md:border-ink-900/10 md:bg-transparent md:px-0 md:py-5">
                  <dt className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                      <Icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-600">{term}</span>
                  </dt>
                  <dd className="mt-2 text-[0.9rem] md:pl-12 md:text-[0.95rem] font-medium leading-snug text-ink-900">
                    {detail}
                    {to && (
                      <Link to={to} className="ml-2 inline-flex items-center gap-1 align-middle text-sm font-semibold text-teal-700 hover:underline">
                        {linkLabel}
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

      <Section3D variant="left" className="bg-paper-100">
        <section className="bg-paper-100 py-8 sm:py-16" aria-labelledby="verification-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Avant la mise en relation"
              title={<span id="verification-heading">Chaque agent a passé ces sept contrôles</span>}
              subtitle="Le même protocole pour tous les pôles, complété par un test pratique propre à chaque métier."
            />
            <Stagger as="ol" stagger={0.06} className="snap-row mt-6 grid grid-cols-2 gap-4 [--snap-w:36%] [--snap-w-sm:24%] sm:mt-12 md:grid-cols-4 lg:grid-cols-7">
              {saatrustSteps.map((step) => (
                <RevealItem as="li" key={step.number} variant="up" className="rounded-2xl bg-white p-4 text-center">
                  <span className="mx-auto grid size-11 place-items-center rounded-full bg-teal-600 text-white">
                    <ProcessIcon name={step.icon} className="size-5" />
                  </span>
                  <span className="mt-3 block text-xs font-bold text-gold-700">{step.number}</span>
                  <span className="block font-display font-bold text-ink-900">{step.title}</span>
                </RevealItem>
              ))}
            </Stagger>
            <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-ink-900/80 sm:mt-8">
              <ShieldCheck className="size-4 text-teal-700" aria-hidden="true" />
              Revérification tous les 12 mois, et après tout incident.
              <Link to="/saatrust" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline">
                Le protocole en détail <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </section>
      </Section3D>

      <CTASection />
    </>
  );
}
