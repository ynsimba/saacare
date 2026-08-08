import { motion } from "motion/react";
import { HeartHandshake, ShieldCheck, Scale, Users, Sparkles, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import Spotlight from "../ui/Spotlight";
import Reveal, { Stagger, RevealItem } from "../ui/Reveal";
import Section3D from "../ui/Section3D";
import VerificationSeal from "../ui/VerificationSeal";
import { EASE, useIsReducedMotion } from "../../lib/motion";

/**
 * Chaque valeur porte sa couleur de marque, une preuve concrète et une place
 * propre dans la grille bento : la hiérarchie visuelle raconte la hiérarchie
 * du discours, au lieu de cinq cartes interchangeables.
 */
const VALUES = [
  {
    icon: ShieldCheck,
    title: "Confiance",
    description: "Chaque prestataire présenté au client est vérifié, jamais improvisé.",
    proof: "100 % des profils contrôlés avant mise en ligne",
    tone: "teal",
    span: "lg:col-span-2",
  },
  {
    icon: Sparkles,
    title: "Professionnalisme",
    description: "Des standards de qualité clairs, mesurés et suivis dans la durée.",
    proof: "Formation obligatoire par domaine",
    tone: "navy",
    span: "lg:col-span-1",
  },
  {
    icon: HeartHandshake,
    title: "Sécurité",
    description: "Protection financière et physique pour toutes les parties, à chaque étape.",
    proof: "Paiement séquestré jusqu'à validation",
    tone: "coral",
    span: "lg:col-span-1",
  },
  {
    icon: Scale,
    title: "Équité",
    description: "Des prestataires justement rémunérés, valorisés selon leur mérite réel.",
    proof: "Reversement sous 24 heures",
    tone: "gold",
    span: "lg:col-span-2",
  },
  {
    icon: Users,
    title: "Proximité",
    description: "Un support client réactif et humain, essentiel dans une relation aussi sensible.",
    proof: "Une équipe joignable 6 jours sur 7",
    tone: "teal",
    span: "sm:col-span-2 lg:col-span-2",
  },
];

const ACCENT = {
  teal: {
    chip: "bg-teal-50 text-teal-700",
    chipHover: "group-hover:bg-teal-600 group-hover:text-white",
    text: "text-teal-700",
    rule: "bg-teal-600",
    glow: "bg-teal-100/70",
  },
  navy: {
    chip: "bg-navy-700/8 text-navy-700",
    chipHover: "group-hover:bg-navy-700 group-hover:text-white",
    text: "text-navy-700",
    rule: "bg-navy-700",
    glow: "bg-navy-500/10",
  },
  gold: {
    chip: "bg-gold-100 text-gold-800",
    chipHover: "group-hover:bg-gold-700 group-hover:text-white",
    text: "text-gold-800",
    rule: "bg-gold-600",
    glow: "bg-gold-100/80",
  },
  coral: {
    chip: "bg-coral-100 text-coral-800",
    chipHover: "group-hover:bg-coral-700 group-hover:text-white",
    text: "text-coral-800",
    rule: "bg-coral-600",
    glow: "bg-coral-100/70",
  },
};

export default function ValuesBento() {
  const reduced = useIsReducedMotion();

  return (
    <Section3D variant="left" className="bg-white">
    <section className="relative overflow-hidden bg-white py-20 sm:py-28" aria-labelledby="values-heading">
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 size-[42rem] -translate-x-1/2 rounded-full bg-teal-100/35 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Stagger stagger={0.1} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* ---------------- Tuile d'en-tête ---------------- */}
          <RevealItem
            variant="blur"
            className="sm:col-span-2 lg:col-span-2 lg:row-span-2"
          >
            <div className="noise-overlay relative isolate flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-ink-950 p-8 text-paper-50 sm:p-10">
              {/* Halos */}
              <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
                <div className="aurora-blob -left-16 top-[-20%] size-72 bg-teal-500/22 animate-aurora" />
                <div className="aurora-blob -right-10 bottom-[-25%] size-64 bg-gold-500/12 animate-aurora-slow" />
              </div>
              <div
                className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(70%_70%_at_30%_30%,#000,transparent)]"
                aria-hidden="true"
              />

              <div className="relative">
                <span className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-teal-300">
                  <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
                  Nos valeurs
                </span>
                <h2
                  id="values-heading"
                  className="mt-5 text-balance font-display text-3xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-4xl"
                >
                  Ce qui guide chacune de nos décisions
                </h2>
                <p className="mt-5 max-w-md text-pretty leading-relaxed text-paper-100/65">
                  Cinq principes non négociables. Ils dictent qui entre sur la plateforme, comment
                  l'argent circule et ce que nous faisons quand quelque chose se passe mal.
                </p>
              </div>

              <div className="relative mt-10 flex items-end justify-between gap-6">
                <Link
                  to="/comment-ca-marche"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-paper-50"
                >
                  <span className="link-underline">Voir comment nous les appliquons</span>
                  <ArrowUpRight
                    className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </Link>

                {/* Sceau, ancré dans l'angle et légèrement débordant */}
                <motion.div
                  initial={reduced ? false : { opacity: 0, scale: 0.85, rotate: -12 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
                  className="-mb-6 -mr-4 hidden shrink-0 sm:block"
                  aria-hidden="true"
                >
                  <VerificationSeal size={140} />
                </motion.div>
              </div>
            </div>
          </RevealItem>

          {/* ---------------- Tuiles de valeurs ---------------- */}
          {VALUES.map((value, index) => (
            <ValueTile key={value.title} value={value} index={index} />
          ))}
        </Stagger>

        {/* Note de bas de section */}
        <Reveal
          variant="fade"
          delay={0.15}
          className="mt-8 flex items-center justify-center gap-3 text-center"
        >
          <span className="hidden h-px w-8 bg-ink-900/10 sm:block" aria-hidden="true" />
          <p className="text-sm text-ink-900/50">
            Un manquement à l'un de ces principes entraîne la suspension immédiate du profil concerné.
          </p>
          <span className="hidden h-px w-8 bg-ink-900/10 sm:block" aria-hidden="true" />
        </Reveal>
      </div>
    </section>
    </Section3D>
  );
}

function ValueTile({ value, index }) {
  const { icon: Icon, title, description, proof, tone, span } = value;
  const accent = ACCENT[tone];

  return (
    <RevealItem variant="blur" className={`${span} h-full`}>
      <Spotlight
        tone={tone}
        lift={6}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink-900/8 bg-paper-100 p-6 transition-[box-shadow,border-color] duration-500 hover:border-ink-900/12 hover:shadow-lifted sm:p-7"
      >
        {/* Halo décoratif qui s'étire au survol */}
        <span
          className={`pointer-events-none absolute -right-16 -top-16 size-40 rounded-full ${accent.glow} opacity-60 blur-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-150`}
          aria-hidden="true"
        />

        <div className="relative flex items-start justify-between gap-4">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-105 ${accent.chip} ${accent.chipHover}`}
          >
            <Icon className="size-5" aria-hidden="true" strokeWidth={1.75} />
          </span>
          <span className="font-mono text-xs font-semibold tracking-[0.2em] text-ink-900/20 transition-colors duration-500 group-hover:text-ink-900/35">
            0{index + 1}
          </span>
        </div>

        <h3 className="relative mt-6 font-display text-xl font-semibold text-ink-900">{title}</h3>
        <p className="relative mt-2 text-sm leading-relaxed text-ink-900/60">{description}</p>

        {/* Preuve concrète, séparée par un trait qui se déploie au survol */}
        <div className="relative mt-auto pt-6">
          <span
            className={`mb-3 block h-0.5 w-6 origin-left rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-[2.5] ${accent.rule}`}
            aria-hidden="true"
          />
          <p className={`font-mono text-[0.68rem] uppercase tracking-[0.12em] ${accent.text}`}>
            {proof}
          </p>
        </div>
      </Spotlight>
    </RevealItem>
  );
}
