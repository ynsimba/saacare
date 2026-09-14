import { Link } from "react-router-dom";
import {
  HandCoins,
  FileSignature,
  GraduationCap,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Camera,
  AlertTriangle,
  Smartphone,
  Check,
} from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import SectionHeading from "../components/ui/SectionHeading";
import Button from "../components/ui/Button";
import AccordionItem from "../components/ui/Accordion";
import DomainIcon from "../components/ui/DomainIcon";
import Reveal, { Stagger, RevealItem } from "../components/ui/Reveal";
import Section3D from "../components/ui/Section3D";
import { domains } from "../data/domains";
import { METIERS, APPLICATION_DOCUMENTS } from "../data/providerForm";
import { faqCategories } from "../data/content";

/** Ce que gagne l'agent (plan d'affaires §3). */
const BENEFITS = [
  { icon: HandCoins, title: "Zéro frais, sans exception", text: "Vous ne payez jamais un franc : ni pour postuler, ni pour être formé, ni pour obtenir une mission." },
  { icon: FileSignature, title: "Un contrat écrit", text: "Et une attestation d'expérience que vous gardez, d'un employeur à l'autre." },
  { icon: Wallet, title: "Un revenu régulier", text: "Des missions proposées près de chez vous, et un paiement sous 48 heures." },
  { icon: GraduationCap, title: "Formation gratuite", text: "Le socle SaaCare puis une spécialisation dans votre métier, sans frais." },
  { icon: ShieldCheck, title: "Une protection", text: "Affiliation sociale pour les postes en mise à disposition, et un fonds de solidarité." },
  { icon: TrendingUp, title: "Une progression", text: "Vérifié, Certifié, puis Élite : votre niveau et vos notes font progresser votre rémunération." },
];

/** Déroulé de la sélection (cahier des charges §3.2, plan d'affaires §20). */
const STEPS = [
  { title: "Vous postulez", text: "Formulaire en 6 étapes depuis votre téléphone. Comptez moins de 8 minutes." },
  { title: "Vous recevez un SMS", text: "Avec votre numéro de candidature et un lien pour suivre votre dossier." },
  { title: "Entretien téléphonique", text: "Dix minutes avec un recruteur : votre métier, vos disponibilités, votre commune." },
  { title: "Vérification SaaTrust", text: "Identité, domicile, antécédents, garants, références et visite médicale, sous 7 jours ouvrés." },
  { title: "Test pratique", text: "Une mise en situation dans votre métier, notée sur une grille." },
  { title: "Journée d'intégration", text: "Règles de savoir-être, sécurité, hygiène. Vous recevez votre numéro de sceau." },
  { title: "Première mission accompagnée", text: "Un superviseur vous accompagne chez le premier client." },
];

const CONDITIONS = [
  "Avoir 18 ans ou plus",
  "Une pièce d'identité : carte d'électeur ou passeport",
  "Au moins un garant joignable, hors de votre famille de préférence",
  "Un téléphone qui reçoit les SMS",
];

export default function BecomeProvider() {
  const faq = faqCategories.find((c) => c.category === "Devenir prestataire")?.items ?? [];
  const poles = domains.filter((d) => METIERS.some((m) => m.pole === d.slug));

  return (
    <>
      <Seo
        title="Devenir prestataire — candidature gratuite"
        description="Nounou, accompagnante post-natale, aide-ménagère, cuisinier, chauffeur, électricien, plombier… Rejoignez le registre SaaCare à Kinshasa. Candidature 100 % gratuite."
        path="/devenir-prestataire"
      />

      <PageHero
        eyebrow="Devenir prestataire"
        title="Un travail digne, sans jamais payer un franc."
        subtitle="Rejoignez le registre SaaCare : un contrat, des missions régulières, une formation gratuite et une certification qui fait progresser votre rémunération."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Devenir prestataire" }]}
        compact
      >
        <div className="flex flex-wrap gap-3">
          <Button to="/devenir-prestataire/postuler" size="lg" variant="onDark" withArrow>
            Postuler gratuitement
          </Button>
          <Button href="#deroule" size="lg" variant="glass">
            Voir le déroulé
          </Button>
        </div>
      </PageHero>

      {/* ---------------- Engagement de gratuité ---------------- */}
      <div className="bg-peach">
        <p className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-4 text-sm font-medium text-ink-900 sm:items-center sm:px-6 lg:px-8">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-coral-700 sm:mt-0" aria-hidden="true" />
          La candidature est entièrement gratuite. Si quelqu'un vous demande de l'argent au nom de SaaCare, c'est une fraude : signalez-le-nous.
        </p>
      </div>

      {/* ---------------- Ce que vous gagnez ---------------- */}
      <section className="bg-paper-100 py-16 sm:py-20" aria-labelledby="benefits-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Ce que vous gagnez" title={<span id="benefits-heading">Plus qu'une mission : un métier reconnu</span>} />
          <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <RevealItem key={title} variant="up" className="rounded-2xl border border-ink-900/8 bg-white p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-900/75">{text}</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------------- Métiers recherchés ---------------- */}
      <Section3D variant="up" className="bg-white">
        <section className="bg-white py-16 sm:py-20" aria-labelledby="metiers-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Métiers recherchés" title={<span id="metiers-heading">Nous recrutons dans quinze métiers</span>} />
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {poles.map((pole) => (
                <Reveal key={pole.slug} variant="up" className="rounded-2xl bg-paper-100 p-5">
                  <p className="flex items-center gap-2 font-display font-bold text-ink-900">
                    <DomainIcon name={pole.icon} className="size-5 text-teal-600" />
                    {pole.name}
                    {!pole.available && <span className="text-xs font-medium text-navy-600">· {pole.phase}</span>}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {METIERS.filter((m) => m.pole === pole.slug).map((m) => (
                      <li key={m.value} className="rounded-full bg-white px-3 py-1.5 text-sm text-ink-900">
                        {m.label}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </Section3D>

      {/* ---------------- Conditions + pièces ---------------- */}
      <section className="bg-paper-100 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal variant="left" className="rounded-3xl bg-white p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink-900">Les conditions</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {CONDITIONS.map((c) => (
                <li key={c} className="flex items-start gap-3 text-sm text-ink-900">
                  <Check className="mt-0.5 size-4 shrink-0 text-teal-600" strokeWidth={3} aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-xl bg-mint p-4 text-sm leading-relaxed text-ink-900">
              Pas d'attestation de résidence ou d'extrait de casier ? Nous vous accompagnons pour les obtenir, à nos frais.
            </p>
          </Reveal>
          <Reveal variant="right" className="rounded-3xl bg-white p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink-900">Les pièces à préparer</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {APPLICATION_DOCUMENTS.map((d) => (
                <li key={d.id} className="flex items-start gap-3 text-sm text-ink-900">
                  <Camera className="mt-0.5 size-4 shrink-0 text-teal-600" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold">{d.label}</strong>
                    {!d.required && " (si vous en avez)"}
                    <span className="block text-ink-900/70">{d.hint}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-start gap-2.5 text-sm text-ink-900/80">
              <Smartphone className="mt-0.5 size-4 shrink-0 text-teal-600" aria-hidden="true" />
              Prenez les photos directement avec votre téléphone : elles sont allégées avant l'envoi.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Déroulé ---------------- */}
      <Section3D variant="left" className="bg-white">
        <section id="deroule" className="scroll-mt-24 bg-white py-16 sm:py-20" aria-labelledby="steps-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Le déroulé de la sélection" title={<span id="steps-heading">Voici les prochaines étapes</span>} />
            <Stagger as="ol" className="relative mt-10 flex flex-col gap-4 border-l-2 border-teal-100 pl-6" stagger={0.07}>
              {STEPS.map((s, i) => (
                <RevealItem as="li" key={s.title} variant="left" className="relative">
                  <span className="absolute -left-[2.35rem] top-0 grid size-7 place-items-center rounded-full bg-teal-600 text-xs font-bold text-white">{i + 1}</span>
                  <h3 className="font-display text-lg font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-900/75">{s.text}</p>
                </RevealItem>
              ))}
            </Stagger>
            <Reveal variant="up" className="mt-10 flex flex-col items-start gap-4 rounded-3xl bg-navy-800 p-6 text-paper-50 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <p className="font-display text-xl font-bold">Prêt ? Nous restons à vos côtés à chaque étape.</p>
              <Button to="/devenir-prestataire/postuler" variant="onDark" size="lg" withArrow className="shrink-0">
                Postuler gratuitement
              </Button>
            </Reveal>
          </div>
        </section>
      </Section3D>

      <section className="bg-paper-100 py-16" aria-labelledby="provider-faq-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 id="provider-faq-heading" className="font-display text-2xl font-bold text-ink-900">Vos questions</h2>
          <div className="mt-6 flex flex-col gap-1 rounded-3xl border border-ink-900/8 bg-white p-2">
            {faq.map((f, i) => (
              <AccordionItem key={f.q} question={f.q} answer={f.a} defaultOpen={i === 0} />
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-900/75">
            Une autre question ?{" "}
            <Link to="/contact" className="font-semibold text-teal-700 underline underline-offset-2">
              Contactez-nous
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
