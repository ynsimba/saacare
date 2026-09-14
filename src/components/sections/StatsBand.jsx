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
    <Section3D variant="up" className="bg-navy-800">
      <section className="relative isolate overflow-hidden bg-navy-800 py-16 sm:py-20">
        <div className="pattern-rays pointer-events-none absolute -left-20 -top-16 -z-10 size-80 opacity-[0.06]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Eyebrow tone="text-gold-200">{title}</Eyebrow>
          <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4 lg:gap-6">
            {items.map((stat) => (
              <StatCounter key={stat.label} value={stat.value} suffix={stat.suffix} decimals={stat.decimals} label={stat.label} />
            ))}
          </div>
        </div>
      </section>
    </Section3D>
  );
}
