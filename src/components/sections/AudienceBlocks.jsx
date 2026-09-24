import { Link } from "react-router-dom";
import { Building2, HandCoins, Check, Globe, ArrowUpRight } from "lucide-react";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";
import Section3D from "../ui/Section3D";

/** Bloc entreprises + bloc recrutement de l'accueil (cahier des charges §2.2.1). */
export default function AudienceBlocks() {
  return (
    <Section3D variant="up" className="bg-white">
      <section className="bg-white py-8 sm:py-16" aria-label="Entreprises et recrutement">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 sm:gap-5 sm:px-6 lg:grid-cols-2 lg:px-8">
          {/* Mobile / tablette : les deux publics côte à côte, à glisser. */}
          <div className="snap-row-lg [--snap-w:86%] [--snap-w-sm:62%] lg:contents">
          <Reveal variant="left" className="relative isolate flex flex-col overflow-hidden rounded-3xl bg-navy-800 p-5 text-paper-50 sm:p-8 lg:p-10">
            <div className="pattern-rays pointer-events-none absolute -bottom-16 -right-16 -z-10 size-72 opacity-[0.08]" aria-hidden="true" />
            <span className="grid size-10 place-items-center rounded-2xl bg-white/10 text-gold-500 sm:size-12">
              <Building2 className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold-200 sm:mt-6">Entreprises, ONG, ambassades</p>
            <h2 className="mt-2 text-balance font-display text-xl font-bold leading-tight sm:mt-3 sm:text-3xl">
              La conformité sociale, sans la charge administrative.
            </h2>
            <ul className="mt-4 flex flex-col gap-2 text-[0.8rem] text-paper-50/85 sm:mt-6 sm:gap-2.5 sm:text-sm">
              {[
                "Mise à disposition de chauffeurs, livraisons et personnel d'entretien",
                "SaaCare employeur déclaré : CNSS, INPP, ONEM et IPR gérés",
                "Une facture unique, avec les pièces sociales jointes",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold-500" strokeWidth={3} aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap gap-2 pt-5 sm:gap-3 sm:pt-8">
              <Button to="/entreprises/devis" variant="onDark" size="sm" withArrow className="sm:px-5 sm:py-2.5 sm:text-[0.95rem]">
                Demander un devis
              </Button>
              <Button to="/entreprises" variant="glass" size="sm" className="sm:px-5 sm:py-2.5 sm:text-[0.95rem]">
                L'offre entreprises
              </Button>
            </div>
          </Reveal>

          <Reveal variant="right" className="relative isolate flex flex-col overflow-hidden rounded-3xl bg-peach p-5 sm:p-8 lg:p-10">
            <span className="grid size-10 place-items-center rounded-2xl bg-white text-coral-700 sm:size-12">
              <HandCoins className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-coral-800 sm:mt-6">Devenir prestataire</p>
            <h2 className="mt-2 text-balance font-display text-xl font-bold leading-tight text-ink-900 sm:mt-3 sm:text-3xl">
              Un travail digne, sans jamais payer un franc.
            </h2>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-900/80 sm:mt-4 sm:text-sm">
              Candidature, vérification, formation et missions : tout est gratuit pour vous. Vous gagnez un
              contrat, un revenu régulier et une certification qui fait progresser votre rémunération.
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-5 sm:gap-4 sm:pt-8">
              <Button to="/inscription/prestataire" size="sm" withArrow className="sm:px-5 sm:py-2.5 sm:text-[0.95rem]">
                Postuler gratuitement
              </Button>
              <Link to="/devenir-prestataire" className="text-sm font-semibold text-teal-700 underline-offset-4 hover:underline">
                Conditions et déroulé
              </Link>
            </div>
          </Reveal>
          </div>

          <Reveal variant="up" className="lg:col-span-2">
            <Link
              to="/diaspora"
              className="group flex flex-col gap-2 rounded-2xl border border-ink-900/8 bg-sky px-4 py-3.5 sm:gap-3 sm:px-6 sm:py-5 transition-colors hover:border-teal-600/30 sm:flex-row sm:items-center sm:justify-between"
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
