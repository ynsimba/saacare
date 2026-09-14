import { AlertTriangle, Home, Building2, HandCoins, Check, MapPin } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal, { Stagger, RevealItem } from "../components/ui/Reveal";
import Section3D from "../components/ui/Section3D";
import Button from "../components/ui/Button";
import ValuesBento from "../components/sections/ValuesBento";
import StatsBand from "../components/sections/StatsBand";
import CTASection from "../components/sections/CTASection";
import { POSITIONING, PROMISE } from "../data/site";

/** Le problème, des deux côtés (plan d'affaires §2). */
const PROBLEMS = {
  families: [
    "Aucune traçabilité : ni identité vérifiée, ni adresse contrôlée, ni antécédents connus.",
    "Aucun recours en cas de vol, d'accident ou d'abandon de poste.",
    "Une recherche de deux à six semaines à chaque départ.",
    "Une compétence déclarée, jamais prouvée.",
  ],
  workers: [
    "Des bureaux informels qui font payer le travailleur pour être embauché.",
    "Pas de contrat, pas d'affiliation sociale, pas de preuve d'ancienneté.",
    "Quinze ans d'expérience, et aucun document pour l'attester.",
    "Des revenus irréguliers, faute d'accès à une demande stable.",
  ],
};

/** La proposition de valeur (plan d'affaires §3). */
const VALUE = [
  { icon: Home, who: "Pour le ménage", points: ["Un agent vérifié selon un protocole écrit en 7 points", "Un contrat conforme au Code du travail", "Remplacement sous 24 heures ouvrées", "Un interlocuteur joignable, pas un numéro anonyme"] },
  { icon: Building2, who: "Pour l'entreprise", points: ["SaaCare employeur déclaré", "CNSS, INPP, ONEM et IPR assurés et documentés", "Une facture unique, avec pièces sociales", "Un dossier prêt en cas d'inspection"] },
  { icon: HandCoins, who: "Pour l'agent", points: ["Zéro frais, sans exception", "Formation et certification gratuites", "Un contrat et une attestation d'expérience", "Une notation qui fait progresser la rémunération"] },
];

/** Le symbole raconte le service (charte §02). */
const SYMBOL = [
  { title: "Les figures", text: "Des personnes stylisées : proximité, diversité et collectif." },
  { title: "La convergence", text: "Des trajectoires qui se rencontrent : la coordination des services." },
  { title: "Le chevron", text: "Un mouvement vers l'avant : orientation, solution, progression." },
  { title: "Le duo chromatique", text: "Vert = confiance. Orange = action. Ensemble = soin concret." },
];

const ROADMAP = [
  { period: "Aujourd'hui", place: "Gombe, Ngaliema, Limete", goal: "Kids Care, Walet, Home et Driver, premiers contrats entreprises" },
  { period: "Ensuite", place: "Kinshasa entière", goal: "Ouverture de Saa Tutora et de Saa Assist" },
  { period: "Puis", place: "Lubumbashi", goal: "Deuxième ville, avec un responsable de ville dédié" },
  { period: "Plus loin", place: "Goma, Matadi, Kolwezi, Kisangani", goal: "Six villes couvertes" },
];

export default function About() {
  return (
    <>
      <Seo
        title="À propos"
        description="SaaCare construit l'infrastructure de confiance entre les familles, les entreprises et les agents de service à la personne en RDC. Mission, engagements et feuille de route."
        path="/a-propos"
      />

      <PageHero
        eyebrow="À propos"
        title="Une présence utile, humaine et fiable."
        subtitle={POSITIONING}
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "À propos" }]}
        compact
      >
        <Button to="/saatrust" size="lg" variant="onDark" withArrow>
          Notre protocole de vérification
        </Button>
      </PageHero>

      {/* ---------------- Le constat ---------------- */}
      <Section3D variant="up" className="bg-paper-100">
        <section className="bg-paper-100 py-20 sm:py-24" aria-labelledby="problem-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal variant="up" className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-md bg-coral-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-coral-800">
                <AlertTriangle className="size-3.5" aria-hidden="true" />
                Le constat
              </span>
              <h2 id="problem-heading" className="mt-5 text-balance font-display text-3xl font-bold leading-tight text-ink-900 sm:text-4xl">
                La demande existe. L'offre existe. Ce qui manque, c'est la confiance entre les deux.
              </h2>
              <p className="mt-5 leading-relaxed text-ink-900/80">
                À Kinshasa, des centaines de milliers de ménages emploient du personnel, presque toujours hors de tout
                cadre. Le risque pèse sur les familles, la précarité sur les travailleurs. SaaCare supprime ce risque des
                deux côtés.
              </p>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {[
                ["Du côté des familles et des entreprises", PROBLEMS.families],
                ["Du côté des travailleurs", PROBLEMS.workers],
              ].map(([title, items]) => (
                <Reveal key={title} variant="up" className="rounded-3xl bg-white p-6 sm:p-8">
                  <h3 className="font-display text-xl font-bold text-ink-900">{title}</h3>
                  <ul className="mt-5 flex flex-col gap-3">
                    {items.map((line) => (
                      <li key={line} className="flex items-start gap-3 text-sm leading-relaxed text-ink-900">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </Section3D>

      {/* ---------------- Notre réponse ---------------- */}
      <section className="bg-white py-20 sm:py-24" aria-labelledby="value-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Notre promesse" title={<span id="value-heading">{PROMISE}</span>} />
          <Stagger className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3" stagger={0.1}>
            {VALUE.map(({ icon: Icon, who, points }) => (
              <RevealItem key={who} variant="up" className="rounded-3xl border border-ink-900/8 bg-paper-100 p-7">
                <span className="grid size-12 place-items-center rounded-2xl bg-teal-600 text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-ink-900">{who}</h3>
                <ul className="mt-4 flex flex-col gap-2.5">
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

      {/* ---------------- Le symbole ---------------- */}
      <Section3D variant="left" className="bg-navy-800">
        <section className="bg-navy-800 py-20 text-paper-50 sm:py-24" aria-labelledby="symbol-heading">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <Reveal variant="scale" className="mx-auto w-full max-w-sm rounded-3xl bg-white p-8">
              <img src="/icone.png" alt="Le symbole SaaCare : trois personnes, des trajectoires qui convergent et un chevron orange" width={862} height={620} loading="lazy" className="h-auto w-full" />
            </Reveal>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">L'idée directrice</p>
              <h2 id="symbol-heading" className="mt-4 text-balance font-display text-3xl font-bold sm:text-4xl">
                L'élan collectif : plusieurs présences convergent pour soutenir une même trajectoire.
              </h2>
              <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {SYMBOL.map((s) => (
                  <li key={s.title} className="rounded-2xl bg-white/8 p-5">
                    <p className="flex items-center gap-2 font-display font-bold">
                      <span className="size-2.5 rounded-full bg-gold-500" aria-hidden="true" />
                      {s.title}
                    </p>
                    <p className="mt-1.5 text-sm text-paper-50/85">{s.text}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-paper-50/85">Rassurante · Active · Claire · Inclusive · Fiable</p>
            </div>
          </div>
        </section>
      </Section3D>

      <ValuesBento />

      {/* ---------------- Feuille de route ---------------- */}
      <section className="bg-paper-100 py-20 sm:py-24" aria-labelledby="roadmap-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Feuille de route" title={<span id="roadmap-heading">Commencer à Kinshasa, grandir ville par ville</span>} />
          <Stagger as="ol" className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {ROADMAP.map((r) => (
              <RevealItem as="li" key={r.period} variant="up" className="rounded-2xl bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-700">{r.period}</p>
                <p className="mt-2 flex items-center gap-2 font-display text-lg font-bold text-ink-900">
                  <MapPin className="size-4 shrink-0 text-teal-600" aria-hidden="true" />
                  {r.place}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-900/75">{r.goal}</p>
              </RevealItem>
            ))}
          </Stagger>
          <p className="mt-8 text-sm text-ink-900/75">
            Projet porté par Yves Nsimba Buwalala. SaaCare exerce comme service privé de placement, en lien avec l'ONEM,
            l'INPP et la CNSS.
          </p>
        </div>
      </section>

      <StatsBand />
      <CTASection />
    </>
  );
}
