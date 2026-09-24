import StatCounter from "../ui/StatCounter";
import { Eyebrow } from "../ui/SectionHeading";
import Section3D from "../ui/Section3D";
import { commitments } from "../../data/content";

/**
 * Bandeau d'engagements chiffrés. Les compteurs d'activité réels (agents vérifiés,
 * missions, note moyenne, communes couvertes) le remplaceront dès qu'ils seront
 * servis par GET /api/stats/public.
 */
export default function StatsBand({ items = commitments, title = "Nos engagements, en chiffres" }) {
  return (
    <Section3D variant="up" className="bg-paper-100">
      {/* Panneau flottant (même langage que la navigation et le cadre photo du hero) */}
      <section className="bg-paper-100 px-3 pb-6 sm:px-5 sm:pb-10">
        <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy-800 to-navy-900 px-5 py-6 shadow-[0_30px_60px_-30px_rgba(1,67,61,0.6)] sm:rounded-[2.5rem] sm:px-10 sm:py-14 lg:px-14">
        <div className="pattern-rays pointer-events-none absolute -right-16 -top-10 -z-10 h-64 w-96 opacity-[0.07]" aria-hidden="true" />
        <div className="relative">
          <Eyebrow tone="text-gold-200">{title}</Eyebrow>
          <div className="mt-5 grid grid-cols-2 items-stretch gap-x-5 gap-y-4 sm:mt-10 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8">
            {items.map((stat) => (
              <StatCounter key={stat.label} value={stat.value} suffix={stat.suffix} decimals={stat.decimals} label={stat.label} />
            ))}
          </div>
        </div>
        </div>
      </section>
    </Section3D>
  );
}
