import { Zap, UserPlus, Building2, Check } from "lucide-react";
import Seo, { SITE } from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import SectionHeading from "../components/ui/SectionHeading";
import DomainCard from "../components/ui/DomainCard";
import Button from "../components/ui/Button";
import Reveal, { Stagger, RevealItem } from "../components/ui/Reveal";
import Section3D from "../components/ui/Section3D";
import CTASection from "../components/sections/CTASection";
import { domains } from "../data/domains";

/** Les trois régimes contractuels (plan d'affaires §10), expliqués sans jargon. */
const REGIMES = [
  {
    icon: Zap,
    name: "La mission",
    brand: "Saa Flex",
    forWho: "Pour une intervention courte : ménage à l'heure, dépannage, garde d'un jour.",
    points: ["Devis confirmé avant intervention", "L'agent est payé sous 48 heures", "80 heures par mois maximum chez un même client"],
  },
  {
    icon: UserPlus,
    name: "Le placement",
    brand: "Saa Talent",
    forWho: "Pour un poste permanent chez vous : nounou, domestique, cuisinier, chauffeur privé.",
    points: ["Vous êtes l'employeur", "Frais de placement selon le poste", "Remplacement gratuit sous 90 jours"],
  },
  {
    icon: Building2,
    name: "La mise à disposition",
    brand: "Saa Pro",
    forWho: "Pour les entreprises, ONG, ambassades et foyers très exigeants.",
    points: ["SaaCare est l'employeur déclaré", "CNSS, INPP, ONEM et IPR gérés", "Contrat de 12 à 24 mois"],
  },
];

export default function Solutions() {
  return (
    <>
      <Seo
        title="Nos solutions"
        description="Sept pôles de services à la personne à Kinshasa : garde d'enfants, accompagnement Walé, maison et bâtiment, chauffeurs, cours à domicile, aînés et formation."
        path="/solutions"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: domains.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: d.name, url: `${SITE}/solutions/${d.slug}` })),
        }}
      />

      <PageHero
        eyebrow="Nos solutions"
        title="Sept pôles, un seul registre d'agents vérifiés."
        subtitle="Une même exigence pour chaque métier : le protocole SaaTrust, un contrat adapté et un interlocuteur qui reste présent."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Nos solutions" }]}
        compact
      >
        <div className="flex flex-wrap gap-3">
          <Button to="/prestataires" size="lg" variant="onDark" withArrow>
            Demander un prestataire
          </Button>
          <Button to="/contact" size="lg" variant="glass">
            Demander un devis
          </Button>
        </div>
      </PageHero>

      <section className="bg-paper-100 py-8 sm:py-16" aria-label="Les sept pôles">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {domains.map((domain, index) => (
              <DomainCard key={domain.slug} domain={domain} index={index} />
            ))}
          </div>
          <Reveal variant="fade" className="mt-5 rounded-2xl bg-mint p-4 text-sm sm:mt-8 sm:p-5 leading-relaxed text-ink-900">
            <strong>Kids Care, Walé, Home, Driver, Tutora, Assist et Academy</strong> sont ouverts : déposez une
            demande, un chargé de clientèle vous rappelle.
          </Reveal>
        </div>
      </section>

      <Section3D variant="up" className="bg-white">
        <section className="bg-white py-8 sm:py-16" aria-labelledby="regimes-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Trois façons de travailler avec nous"
              title={<span id="regimes-heading">Le bon contrat pour chaque besoin</span>}
              subtitle="La durée et la régularité de votre besoin déterminent le contrat. Nous vous le proposons lors de l'appel de confirmation."
            />
            <Stagger className="snap-row-lg mt-6 sm:mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3" stagger={0.1}>
              {REGIMES.map(({ icon: Icon, name, brand, forWho, points }) => (
                <RevealItem key={name} variant="up" className="flex h-full flex-col rounded-2xl border border-ink-900/8 bg-paper-100 p-5 sm:p-7">
                  <span className="grid size-12 place-items-center rounded-2xl bg-teal-600 text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-gold-700">{brand}</p>
                  <h3 className="mt-1 font-display text-xl font-bold text-ink-900">{name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-900/75">{forWho}</p>
                  <ul className="mt-5 flex flex-col gap-2 border-t border-ink-900/8 pt-5">
                    {points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-ink-900">
                        <Check className="mt-0.5 size-4 shrink-0 text-teal-600" strokeWidth={3} aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </RevealItem>
              ))}
            </Stagger>
          </div>
        </section>
      </Section3D>

      <CTASection />
    </>
  );
}
