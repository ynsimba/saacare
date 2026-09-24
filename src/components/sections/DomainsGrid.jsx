import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import DomainIcon from "../ui/DomainIcon";
import Reveal, { Stagger, RevealItem } from "../ui/Reveal";
import Section3D from "../ui/Section3D";
import { domains } from "../../data/domains";

/**
 * Les sept pôles en mosaïque : une grande tuile photo donne le ton, puis une
 * tuile par pôle. Mobile : tuiles à glisser ; tablette : 4 colonnes ;
 * grand écran : bento avec la photo sur 2 × 2 cases.
 */
export default function DomainsGrid() {
  return (
    <Section3D variant="up" className="bg-white">
      <section className="relative isolate bg-white py-8 sm:py-20" aria-labelledby="domains-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end sm:gap-8">
            <SectionHeading
              eyebrow="Nos solutions"
              title={<span id="domains-heading">Sept pôles, un seul registre d'agents vérifiés</span>}
              subtitle="Enfants, naissance, maison, conduite, cours, aînés et formation : chaque pôle applique le même protocole SaaTrust."
            />
            <Reveal variant="right" delay={0.2} className="shrink-0">
              <Link
                to="/solutions"
                className="group inline-flex items-center gap-2 rounded-full border border-teal-600/20 bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-soft transition-colors hover:border-teal-600/50"
              >
                Voir toutes nos solutions
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          <Stagger
            as="ul"
            stagger={0.06}
            aria-label="Les sept pôles"
            className="snap-row mt-5 grid [--snap-w:44%] [--snap-w-sm:30%] sm:mt-12 md:grid-cols-4 md:gap-3 lg:auto-rows-[minmax(11.5rem,auto)] lg:gap-4"
          >
            {/* Tuile photo : grand écran uniquement */}
            <RevealItem as="li" variant="scale" className="relative hidden overflow-hidden rounded-[2rem] lg:col-span-2 lg:row-span-2 lg:block">
              <img src="/hero-3.png" alt="" className="absolute inset-0 size-full object-cover [object-position:70%_45%]" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent" aria-hidden="true" />
              <div className="relative flex h-full flex-col justify-end p-8 text-paper-50">
                <span className="glass-capsule w-fit rounded-full px-3 py-1 text-xs font-semibold text-teal-700">Protocole SaaTrust</span>
                <p className="mt-4 max-w-sm font-display text-3xl font-extrabold leading-tight">
                  Le même niveau d’exigence, quel que soit le service.
                </p>
                <Link
                  to="/saatrust"
                  className="group mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 transition-transform hover:-translate-y-0.5"
                >
                  Découvrir le protocole
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </RevealItem>

            {domains.map((domain, index) => (
              <RevealItem as="li" key={domain.slug} variant="up" className="h-full">
                <Link
                  to={`/solutions/${domain.slug}`}
                  className="tap group relative flex h-full flex-col gap-3 overflow-hidden rounded-[1.6rem] border border-ink-900/8 bg-paper-100 p-4 transition-[translate,background-color,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-teal-600/20 hover:bg-white hover:shadow-[0_24px_48px_-24px_rgba(1,67,61,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:p-5"
                >
                  <span className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-white text-teal-700 shadow-soft transition-[background-color,color,rotate] duration-300 group-hover:-rotate-6 group-hover:bg-teal-600 group-hover:text-white sm:size-12">
                      <DomainIcon name={domain.icon} className="size-5 sm:size-6" />
                    </span>
                    <span className="font-display text-sm font-bold tabular-nums text-ink-900/20">0{index + 1}</span>
                  </span>
                  <span className="mt-auto">
                    <span className="block font-display text-base font-extrabold leading-tight text-ink-900 sm:text-lg">{domain.name}</span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-snug text-ink-900/55 sm:text-[0.8rem]">
                      {domain.available ? domain.tagline : domain.phase}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="absolute bottom-4 right-4 hidden size-4 text-teal-700 opacity-0 transition-[opacity,translate] duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100 sm:block"
                    aria-hidden="true"
                  />
                </Link>
              </RevealItem>
            ))}

            {/* Dernière case : raccourci vers la recherche */}
            <RevealItem as="li" variant="up" className="hidden h-full md:block">
              <Link
                to="/prestataires"
                className="tap group flex h-full flex-col justify-between gap-3 rounded-[1.6rem] bg-teal-600 p-5 text-white transition-[translate,background-color] duration-300 hover:-translate-y-1 hover:bg-teal-700"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-white/15">
                  <ArrowUpRight className="size-6 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <span className="font-display text-lg font-extrabold leading-tight">Trouver un prestataire vérifié</span>
              </Link>
            </RevealItem>
          </Stagger>
        </div>
      </section>
    </Section3D>
  );
}
