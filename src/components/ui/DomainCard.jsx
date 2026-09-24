import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import DomainIcon from "./DomainIcon";
import Spotlight from "./Spotlight";
import { THEME } from "../../lib/theme";
import { EASE, useIsReducedMotion } from "../../lib/motion";

export default function DomainCard({ domain, index = 0 }) {
  const theme = THEME.teal;
  const reduced = useIsReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 30, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.09, ease: EASE }}
      className="h-full"
    >
      <Spotlight
        tone="teal"
        lift={8}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-ink-900/8 bg-white p-3.5 shadow-soft sm:rounded-3xl sm:p-7 transition-[box-shadow,border-color] duration-500 hover:border-ink-900/12 hover:shadow-lifted"
      >
        {/* Pastille décorative qui réagit au survol */}
        <div
          className={`pointer-events-none absolute -right-12 -top-12 size-28 rounded-full sm:size-40 ${theme.bgSoft} opacity-70 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-125`}
          aria-hidden="true"
        />
        {/* Liseré de marque qui se déploie en bas de carte */}
        <span
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 ${theme.dot} transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100`}
          aria-hidden="true"
        />

        <div className="relative">
          <div
            className={`mb-3 flex size-10 items-center justify-center rounded-xl sm:mb-5 sm:size-14 sm:rounded-2xl ${theme.bgSoft} ${theme.text} transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-110`}
          >
            <DomainIcon name={domain.icon} className="size-5 sm:size-7" />
          </div>
          <h3 className="flex flex-wrap items-center gap-1.5 font-display text-[0.95rem] font-bold leading-tight text-ink-900 sm:gap-2 sm:text-xl">
            {domain.name}
            {!domain.available && (
              <span className="rounded-full bg-paper-200 px-2 py-0.5 font-sans text-[0.65rem] font-semibold uppercase tracking-wide text-navy-600">
                {domain.phase}
              </span>
            )}
          </h3>
          <p className="mt-1.5 line-clamp-3 text-xs leading-snug text-ink-900/65 sm:mt-2 sm:line-clamp-none sm:text-sm sm:leading-relaxed">{domain.tagline}</p>
        </div>

        <div className="relative mt-6 hidden items-center justify-between gap-3 border-t border-ink-900/8 pt-4 sm:flex">
          <span className="font-mono text-xs uppercase tracking-wide text-ink-900/60">
            <span className={`font-semibold ${theme.text}`}>{domain.heroStat.value}</span>{" "}
            {domain.heroStat.label}
          </span>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink-900/5 text-ink-900 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-navy-700 group-hover:text-white"
            aria-hidden="true"
          >
            <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>

        {/* Zone cliquable couvrant toute la carte */}
        <Link
          to={`/solutions/${domain.slug}`}
          className="absolute inset-0 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
        >
          <span className="sr-only">Découvrir {domain.name}</span>
        </Link>
      </Spotlight>
    </motion.div>
  );
}
