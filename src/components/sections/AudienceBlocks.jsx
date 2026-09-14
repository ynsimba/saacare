import { Link } from "react-router-dom";
import { Building2, HandCoins, Check, Globe, ArrowUpRight } from "lucide-react";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";
import Section3D from "../ui/Section3D";

/** Bloc entreprises + bloc recrutement de l'accueil (cahier des charges §2.2.1). */
export default function AudienceBlocks() {
  return (
    <Section3D variant="up" className="bg-white">
      <section className="bg-white py-20 sm:py-24" aria-label="Entreprises et recrutement">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal variant="left" className="relative isolate flex flex-col overflow-hidden rounded-3xl bg-navy-800 p-8 text-paper-50 sm:p-10">
            <div className="pattern-rays pointer-events-none absolute -bottom-16 -right-16 -z-10 size-72 opacity-[0.08]" aria-hidden="true" />
            <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-gold-500">
              <Building2 className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">Entreprises, ONG, ambassades</p>
            <h2 className="mt-3 text-balance font-display text-2xl font-bold leading-tight sm:text-3xl">
              La conformité sociale, sans la charge administrative.
            </h2>
            <ul className="mt-6 flex flex-col gap-2.5 text-sm text-paper-50/85">
              {[
                "Mise à disposition de chauffeurs et de personnel d'entretien",
                "SaaCare employeur déclaré : CNSS, INPP, ONEM et IPR gérés",
                "Une facture unique, avec les pièces sociales jointes",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold-500" strokeWidth={3} aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3 pt-2">
              <Button to="/entreprises/devis" variant="onDark" withArrow>
                Demander un devis
              </Button>
              <Button to="/entreprises" variant="glass">
                L'offre entreprises
              </Button>
            </div>
          </Reveal>

          <Reveal variant="right" className="relative isolate flex flex-col overflow-hidden rounded-3xl bg-peach p-8 sm:p-10">
            <span className="grid size-12 place-items-center rounded-2xl bg-white text-coral-700">
              <HandCoins className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-coral-800">Devenir prestataire</p>
            <h2 className="mt-3 text-balance font-display text-2xl font-bold leading-tight text-ink-900 sm:text-3xl">
              Un travail digne, sans jamais payer un franc.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-900/80">
              Candidature, vérification, formation et missions : tout est gratuit pour vous. Vous gagnez un
              contrat, un revenu régulier et une certification qui fait progresser votre rémunération.
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-4 pt-8">
              <Button to="/devenir-prestataire/postuler" withArrow>
                Postuler gratuitement
              </Button>
              <Link to="/devenir-prestataire" className="text-sm font-semibold text-teal-700 underline-offset-4 hover:underline">
                Conditions et déroulé
              </Link>
            </div>
          </Reveal>

          <Reveal variant="up" className="lg:col-span-2">
            <Link
              to="/diaspora"
              className="group flex flex-col gap-3 rounded-2xl border border-ink-900/8 bg-sky px-6 py-5 transition-colors hover:border-teal-600/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex items-center gap-3">
                <Globe className="size-5 shrink-0 text-teal-700" aria-hidden="true" />
                <span className="text-sm text-ink-900">
                  <strong>Vous vivez à l'étranger ?</strong> Offrez un service fiable à votre famille à Kinshasa, avec un rapport de visite mensuel.
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                L'offre diaspora
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>
    </Section3D>
  );
}
