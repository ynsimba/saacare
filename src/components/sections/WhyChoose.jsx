import { Fragment, useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Clock, Activity, Headset, Lock, X, Check, Sparkles } from "lucide-react";
import { Eyebrow } from "../ui/SectionHeading";
import Button from "../ui/Button";
import Reveal, { Stagger, RevealItem } from "../ui/Reveal";
import Section3D from "../ui/Section3D";
import VerificationSeal from "../ui/VerificationSeal";
import { EASE, useIsReducedMotion } from "../../lib/motion";

/**
 * L'argumentaire est présenté en comparaison directe : pour chaque critère, la
 * situation du marché informel face à l'engagement SaaCare. Montrer l'écart est
 * plus convaincant que d'énumérer des qualités.
 */
const CRITERIA = [
  {
    icon: ShieldCheck,
    label: "Vérification du professionnel",
    without: "Bouche-à-oreille, aucun contrôle d'identité ni d'antécédents.",
    with: "Identité, antécédents et références contrôlés avant toute mise en relation.",
  },
  {
    icon: Clock,
    label: "Engagement et ponctualité",
    without: "Aucun cadre : ni contrat, ni recours en cas d'absence.",
    with: "Engagement contractuel avec SaaCare et délais convenus à l'avance.",
  },
  {
    icon: Activity,
    label: "Qualité dans la durée",
    without: "Impossible de savoir si le professionnel reste fiable dans le temps.",
    with: "Notes, ponctualité et taux de complétion suivis en continu.",
  },
  {
    icon: Lock,
    label: "Paiement",
    without: "Payé d'avance, sans garantie si la prestation n'est pas réalisée.",
    with: "Fonds protégés, libérés uniquement après votre validation.",
  },
  {
    icon: Headset,
    label: "En cas de problème",
    without: "Vous êtes seul face au litige.",
    with: "Une équipe qui traite l'incident et vous accompagne jusqu'au bout.",
  },
];

export default function WhyChoose() {
  const [hovered, setHovered] = useState(null);
  const reduced = useIsReducedMotion();

  return (
    <Section3D variant="left" className="bg-paper-100">
      <section
        className="relative overflow-hidden bg-paper-100 py-20 sm:py-28"
        aria-labelledby="why-choose-heading"
      >
        <div
          className="pointer-events-none absolute -left-40 top-1/3 -z-10 size-[34rem] rounded-full bg-teal-100/60 blur-3xl"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ---------------- En-tête ---------------- */}
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <Reveal variant="blur" className="max-w-2xl">
              <Eyebrow>Pourquoi SaaCare</Eyebrow>
              <h2
                id="why-choose-heading"
                className="mt-5 text-balance font-display text-3xl font-semibold leading-[1.15] tracking-[-0.015em] text-ink-900 sm:text-4xl"
              >
                Aucune famille ne devrait prendre de risque en{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">confiant son foyer.</span>
                  <span
                    className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-sm bg-gold-200/70"
                    aria-hidden="true"
                  />
                </span>
              </h2>
              <p className="mt-5 text-pretty text-base leading-relaxed text-ink-900/65">
                En RDC, la majorité des services à domicile restent non encadrés. Voici,
                concrètement, ce que change le passage par une plateforme.
              </p>
            </Reveal>

            <Reveal variant="right" delay={0.15} className="flex shrink-0 items-center gap-6">
              <Button to="/a-propos" variant="secondary" withArrow magnetic>
                Notre mission
              </Button>
              <div className="hidden xl:block">
                <VerificationSeal size={104} />
              </div>
            </Reveal>
          </div>

          {/* ---------------- Comparatif — grand écran ---------------- */}
          <Reveal
            variant="up"
            delay={0.1}
            className="relative mt-14 hidden overflow-hidden rounded-3xl border border-ink-900/8 bg-white shadow-soft lg:block"
          >
            <div className="relative grid grid-cols-3">
              {/* Colonne SaaCare mise en relief */}
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-b from-navy-800 via-navy-900 to-ink-950"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(159,26,74,0.28),transparent)]" />
              </div>

              {/* En-têtes de colonnes */}
              <HeadCell>
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ink-900/35">
                  Le critère
                </span>
              </HeadCell>
              <HeadCell>
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ink-900/35">
                  Sans plateforme
                </span>
              </HeadCell>
              <HeadCell>
                <span className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/8 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-teal-300">
                  <Sparkles className="size-3" aria-hidden="true" />
                  Avec SaaCare
                </span>
              </HeadCell>

              {/* Lignes */}
              {CRITERIA.map((row, index) => {
                const active = hovered === index;
                const Icon = row.icon;
                // Une « ligne » n'existe pas en CSS grid : les trois cellules sont
                // des sœurs, on les éclaire ensemble via un état partagé.
                const rowHandlers = reduced
                  ? {}
                  : {
                      onMouseEnter: () => setHovered(index),
                      onMouseLeave: () => setHovered(null),
                    };

                return (
                  <Fragment key={row.label}>
                    {/* Critère */}
                    <Cell active={active} first {...rowHandlers}>
                      <span className="flex items-center gap-3.5">
                        <span
                          className={`grid size-10 shrink-0 place-items-center rounded-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                            active ? "-rotate-6 bg-teal-600 text-white" : "bg-teal-50 text-teal-700"
                          }`}
                        >
                          <Icon className="size-5" aria-hidden="true" strokeWidth={1.75} />
                        </span>
                        <span className="font-display text-[1.05rem] font-semibold leading-snug text-ink-900">
                          {row.label}
                        </span>
                      </span>
                    </Cell>

                    {/* Sans plateforme */}
                    <Cell active={active} {...rowHandlers}>
                      <span className="flex items-start gap-3">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ink-900/6 text-ink-900/35">
                          <X className="size-3" strokeWidth={3} aria-hidden="true" />
                        </span>
                        <span className="text-sm leading-relaxed text-ink-900/50">{row.without}</span>
                      </span>
                    </Cell>

                    {/* Avec SaaCare */}
                    <Cell active={active} dark {...rowHandlers}>
                      <span className="flex items-start gap-3">
                        <motion.span
                          animate={{ scale: active && !reduced ? 1.12 : 1 }}
                          transition={{ type: "spring", stiffness: 320, damping: 18 }}
                          className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-teal-500 text-white"
                        >
                          <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />
                        </motion.span>
                        <span className="text-sm leading-relaxed text-paper-100/85">{row.with}</span>
                      </span>
                    </Cell>
                  </Fragment>
                );
              })}
            </div>
          </Reveal>

          {/* ---------------- Comparatif — mobile et tablette ---------------- */}
          <Stagger as="ul" stagger={0.09} className="mt-12 flex flex-col gap-4 lg:hidden">
            {CRITERIA.map((row) => {
              const Icon = row.icon;
              return (
                <RevealItem
                  as="li"
                  key={row.label}
                  variant="up"
                  className="overflow-hidden rounded-2xl border border-ink-900/8 bg-white shadow-soft"
                >
                  <div className="flex items-center gap-3 border-b border-ink-900/8 p-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                      <Icon className="size-5" aria-hidden="true" strokeWidth={1.75} />
                    </span>
                    <h3 className="font-display text-base font-semibold text-ink-900">{row.label}</h3>
                  </div>

                  <div className="flex items-start gap-3 p-5">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ink-900/6 text-ink-900/35">
                      <X className="size-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-900/35">
                        Sans plateforme
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-ink-900/55">
                        {row.without}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3 bg-gradient-to-br from-navy-800 to-ink-950 p-5">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-teal-500 text-white">
                      <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-mono text-[0.62rem] uppercase tracking-[0.14em] text-teal-300">
                        Avec SaaCare
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-paper-100/85">
                        {row.with}
                      </span>
                    </span>
                  </div>
                </RevealItem>
              );
            })}
          </Stagger>
        </div>
      </section>
    </Section3D>
  );
}

/* ---------------------------------------------------------------- */

function HeadCell({ children }) {
  return <div className="relative z-10 px-7 pb-5 pt-7">{children}</div>;
}

function Cell({ children, active, dark = false, first = false, ...props }) {
  return (
    <div
      {...props}
      className={`relative z-10 border-t px-7 py-6 transition-colors duration-300 ${
        dark
          ? `border-white/10 ${active ? "bg-white/6" : ""}`
          : `border-ink-900/8 ${active ? "bg-paper-100/70" : ""}`
      }`}
    >
      {first && (
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ scaleY: active ? 1 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="absolute inset-y-3 left-0 w-0.5 origin-center rounded-full bg-teal-600"
        />
      )}
      {children}
    </div>
  );
}
