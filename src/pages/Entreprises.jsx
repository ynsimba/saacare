import { Car, Sparkles, Users, FileCheck2, Check, UserRound, TrendingUp, FolderCheck, ReceiptText } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import SectionHeading from "../components/ui/SectionHeading";
import Button from "../components/ui/Button";
import Reveal, { Stagger, RevealItem } from "../components/ui/Reveal";
import Section3D from "../components/ui/Section3D";
import CTASection from "../components/sections/CTASection";

/** Offre B2B (cahier des charges §3.3, plan d'affaires §10 régime C). */
const OFFERS = [
  { icon: Users, title: "Mise à disposition de personnel", text: "Agents d'entretien, aides, cuisiniers, employés par SaaCare et affectés chez vous." },
  { icon: Sparkles, title: "Entretien de locaux", text: "Bureaux, écoles, immeubles et parties communes, avec continuité de service contractualisée." },
  { icon: Car, title: "Chauffeurs", text: "Chauffeurs de direction et de mission pour entreprises, ONG et ambassades." },
  { icon: FileCheck2, title: "Conformité sociale externalisée", text: "Contrats, bulletins, CNSS, INPP, ONEM et IPR gérés, et audit de conformité sur devis." },
];

const WHY = [
  { icon: FolderCheck, text: "SaaCare est l'employeur déclaré : contrat de travail écrit remis avant la mission" },
  { icon: ReceiptText, text: "Une facture unique, avec les pièces sociales jointes" },
  { icon: TrendingUp, text: "Montée ou baisse des effectifs sans procédure de licenciement" },
  { icon: FileCheck2, text: "Un dossier de conformité prêt en cas d'inspection du travail" },
  { icon: UserRound, text: "Un gestionnaire de compte nommé, joignable" },
];

/** Ce que couvre le tarif mensuel d'un chauffeur mis à disposition. */
const INVOICE_LINES = [
  "Salaire brut, au-dessus du SMIG",
  "CNSS — part patronale",
  "INPP et ONEM",
  "Provision de congés payés",
  "Provision de préavis et de fin de contrat",
  "Assurance, équipement et gestion administrative",
];

const PROCESS = [
  { title: "Votre demande", text: "Type de besoin, nombre de postes, métiers, durée, lieu et date de démarrage." },
  { title: "Votre devis", text: "Un devis détaillé en PDF, envoyé par courriel." },
  { title: "La sélection", text: "Des agents vérifiés par le protocole SaaTrust, présentés pour chaque poste." },
  { title: "Les contrats", text: "Contrat de mise à disposition avec vous, contrats de travail avec les agents." },
  { title: "Le suivi", text: "Visites qualité, remplacement sous 24 heures et reporting mensuel." },
];

export default function Entreprises() {
  return (
    <>
      <Seo
        title="Entreprises, ONG et ambassades — mise à disposition de personnel"
        description="Chauffeurs, entretien de locaux et personnel de service mis à disposition à Kinshasa. SaaCare est l'employeur déclaré : CNSS, INPP, ONEM et IPR gérés, facture unique."
        path="/entreprises"
      />

      <PageHero
        eyebrow="Entreprises, ONG, ambassades"
        title="La conformité sociale, sans la charge administrative."
        subtitle="Nous recrutons, vérifions, employons et encadrons votre personnel de service. Vous recevez une facture unique."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Entreprises" }]}
        compact
      >
        <div className="flex flex-wrap gap-3">
          <Button to="/entreprises/devis" size="lg" variant="onDark" withArrow>
            Demander un devis
          </Button>
          <Button href="#offre" size="lg" variant="glass">
            Découvrir l'offre
          </Button>
        </div>
      </PageHero>

      <section id="offre" className="scroll-mt-24 bg-paper-100 py-16 sm:py-20" aria-labelledby="offers-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Notre offre" title={<span id="offers-heading">Quatre services pour les organisations</span>} />
          <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {OFFERS.map(({ icon: Icon, title, text }) => (
              <RevealItem key={title} variant="up" className="flex h-full flex-col rounded-2xl border border-ink-900/8 bg-white p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-teal-600 text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-ink-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-900/75">{text}</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      <Section3D variant="up" className="bg-white">
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <SectionHeading eyebrow="Pourquoi SaaCare" title="Sept structures de placement sur dix sont irrégulières. Pas nous." subtitle="La conformité n'est pas une contrainte : c'est ce que vous achetez." />
              <ul className="mt-8 flex flex-col gap-3">
                {WHY.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 rounded-xl bg-paper-100 px-4 py-3 text-sm text-ink-900">
                    <Icon className="mt-0.5 size-4.5 shrink-0 text-teal-600" aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <Reveal variant="right" className="h-fit rounded-3xl bg-navy-800 p-6 text-paper-50 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-200">Exemple</p>
              <h3 className="mt-2 font-display text-2xl font-bold">Un chauffeur mis à disposition</h3>
              <p className="mt-1 text-sm text-paper-50/80">Contrat de 12 à 24 mois, à Kinshasa.</p>
              <ul className="mt-6 flex flex-col gap-2.5 border-t border-white/15 pt-5">
                {INVOICE_LINES.map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-sm text-paper-50/90">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold-500" strokeWidth={3} aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-white/15 pt-5 text-sm text-paper-50/80">
                Tarif confirmé sur devis, tout compris. Hors TVA. Clause d'indexation sur le taux de change.
              </p>
            </Reveal>
          </div>
        </section>
      </Section3D>

      <section className="bg-paper-100 py-16 sm:py-20" aria-labelledby="process-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Le déroulé" title={<span id="process-heading">De la demande au suivi mensuel</span>} />
          <Stagger as="ol" className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5" stagger={0.08}>
            {PROCESS.map((p, i) => (
              <RevealItem as="li" key={p.title} variant="up" className="rounded-2xl bg-white p-5">
                <span className="grid size-9 place-items-center rounded-full bg-gold-100 font-display font-bold text-gold-800">{i + 1}</span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-900/75">{p.text}</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CTASection
        eyebrow="Entreprises"
        title="Parlons de vos postes."
        subtitle="Un devis détaillé, des agents vérifiés et un gestionnaire de compte dédié."
        primaryTo="/entreprises/devis"
        primaryLabel="Demander un devis"
        secondaryTo="/contact"
        secondaryLabel="Nous contacter"
      />
    </>
  );
}
