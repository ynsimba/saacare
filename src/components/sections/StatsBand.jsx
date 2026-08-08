import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import StatCounter from "../ui/StatCounter";
import { Eyebrow } from "../ui/SectionHeading";
import Section3D from "../ui/Section3D";
import { useIsReducedMotion } from "../../lib/motion";

const STATS = [
  { value: 1234, label: "Prestataires vérifiés" },
  { value: 9600, suffix: "+", label: "Missions réalisées" },
  { value: 4.8, suffix: "/5", label: "Note moyenne des clients", decimals: 1 },
  { value: 24, suffix: "h", label: "Délai moyen de reversement" },
];

export default function StatsBand() {
  const ref = useRef(null);
  const reduced = useIsReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glowY = useTransform(scrollYProgress, [0, 1], ["18%", "-18%"]);

  return (
    <Section3D variant="up" className="bg-navy-900">
    <section ref={ref} className="noise-overlay relative isolate overflow-hidden bg-navy-900 py-16 sm:py-24">
      {/* Halo qui remonte doucement au scroll */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[28rem]"
        style={reduced ? undefined : { y: glowY }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_100%,rgba(159,26,74,0.30),transparent)]" />
        <div className="aurora-blob left-[12%] bottom-[-10%] size-80 bg-gold-500/10 animate-aurora-slow" />
      </motion.div>

      {/* Trame fine */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:120px_100%]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Eyebrow tone="text-teal-300">SaaCare en chiffres</Eyebrow>
        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4 lg:gap-6">
          {STATS.map((stat) => (
            <StatCounter
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              decimals={stat.decimals}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
    </Section3D>
  );
}
