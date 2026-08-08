import { motion } from "motion/react";
import {
  Search,
  Star,
  BadgeCheck,
  ShieldCheck,
  Lock,
  Smartphone,
  CreditCard,
  Navigation,
  Sparkles,
  Check,
} from "lucide-react";
import { EASE } from "../../lib/motion";

/**
 * Maquettes d'interface illustrant chaque étape du parcours SaaCare.
 * Ce sont des reproductions simplifiées et non interactives — masquées
 * à l'accessibilité, le texte de l'étape portant déjà l'information.
 */

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.18 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

function Frame({ children, label }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1.5 border-b border-ink-900/6 px-5 py-3.5">
        <span className="size-2.5 rounded-full bg-coral-500/60" />
        <span className="size-2.5 rounded-full bg-gold-500/60" />
        <span className="size-2.5 rounded-full bg-teal-500/60" />
        <span className="ml-3 truncate font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-900/35">
          {label}
        </span>
      </div>
      <div className="flex-1 p-5 sm:p-6">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- 01 */
function StepFind() {
  const results = [
    { initials: "MK", name: "Marie Kabeya", role: "Nounou diplômée", rating: "4,9", commune: "Gombe" },
    { initials: "JT", name: "Joseph Tshilombo", role: "Chauffeur pro", rating: "4,8", commune: "Limete" },
    { initials: "AN", name: "Alice Ndaya", role: "Répétitrice", rating: "5,0", commune: "Lemba" },
  ];

  return (
    <Frame label="Recherche de prestataires">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center gap-2.5 rounded-xl border border-teal-500/30 bg-paper-100 px-3.5 py-3 shadow-[0_0_0_4px_rgba(184,40,91,0.08)]"
      >
        <Search className="size-4 shrink-0 text-teal-600" />
        <span className="text-sm text-ink-900/70">Nounou · Gombe</span>
        <motion.span
          className="ml-auto h-4 w-px bg-teal-600"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
      </motion.div>

      <motion.ul variants={list} initial="hidden" animate="show" className="mt-4 flex flex-col gap-2.5">
        {results.map((r) => (
          <motion.li
            key={r.name}
            variants={item}
            className="flex items-center gap-3 rounded-xl border border-ink-900/6 bg-white p-3"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy-700 font-display text-xs font-semibold text-white">
              {r.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-sm font-semibold text-ink-900">
                {r.name}
                <BadgeCheck className="size-3.5 text-teal-600" />
              </span>
              <span className="block truncate text-xs text-ink-900/50">
                {r.role} · {r.commune}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ink-900">
              <Star className="size-3 fill-gold-500 text-gold-500" />
              {r.rating}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </Frame>
  );
}

/* ---------------------------------------------------------------- 02 */
function StepBook() {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const selected = 17;
  const slots = ["08:00", "12:00", "16:00"];

  return (
    <Frame label="Choix de la date">
      <div className="rounded-xl border border-ink-900/6 bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-ink-900">Février 2026</span>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-900/35">
            Journée
          </span>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1" aria-hidden="true">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <span key={i} className="text-center font-mono text-[0.58rem] text-ink-900/30">
              {d}
            </span>
          ))}
          {days.map((d, i) => (
            <motion.span
              key={d}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.012, ease: EASE }}
              className={`grid aspect-square place-items-center rounded-md text-[0.68rem] ${
                d === selected
                  ? "bg-teal-600 font-semibold text-white shadow-[0_6px_16px_-6px_rgba(159,26,74,0.9)]"
                  : d < 12
                    ? "text-ink-900/20"
                    : "text-ink-900/60"
              }`}
            >
              {d}
            </motion.span>
          ))}
        </div>
      </div>

      <motion.div variants={list} initial="hidden" animate="show" className="mt-3 flex gap-2">
        {slots.map((s, i) => (
          <motion.span
            key={s}
            variants={item}
            className={`flex-1 rounded-lg border px-2 py-2 text-center text-xs font-medium ${
              i === 1
                ? "border-teal-500/40 bg-teal-50 text-teal-700"
                : "border-ink-900/8 bg-white text-ink-900/50"
            }`}
          >
            {s}
          </motion.span>
        ))}
      </motion.div>
    </Frame>
  );
}

/* ---------------------------------------------------------------- 03 */
function StepPay() {
  return (
    <Frame label="Paiement sécurisé">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="rounded-xl border border-ink-900/6 bg-white p-4"
      >
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-900/35">
          Montant du devis
        </p>
        <p className="mt-1 font-display text-3xl font-semibold text-ink-900">
          45 <span className="text-lg font-normal text-ink-900/45">USD</span>
        </p>
      </motion.div>

      <motion.div variants={list} initial="hidden" animate="show" className="mt-3 flex flex-col gap-2">
        <motion.span
          variants={item}
          className="flex items-center gap-3 rounded-xl border border-teal-500/40 bg-teal-50 p-3"
        >
          <Smartphone className="size-4 shrink-0 text-teal-700" />
          <span className="text-sm font-medium text-ink-900">Mobile Money</span>
          <span className="ml-auto grid size-5 place-items-center rounded-full bg-teal-600">
            <Check className="size-3 text-white" strokeWidth={3} />
          </span>
        </motion.span>
        <motion.span
          variants={item}
          className="flex items-center gap-3 rounded-xl border border-ink-900/8 bg-white p-3"
        >
          <CreditCard className="size-4 shrink-0 text-ink-900/40" />
          <span className="text-sm text-ink-900/55">Carte bancaire</span>
        </motion.span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-4 flex items-start gap-2.5 rounded-xl border border-dashed border-gold-200 bg-gold-100/50 p-3"
      >
        <Lock className="mt-0.5 size-3.5 shrink-0 text-gold-700" />
        <p className="text-[0.72rem] leading-relaxed text-ink-900/65">
          Fonds bloqués en séquestre — libérés uniquement après votre validation.
        </p>
      </motion.div>
    </Frame>
  );
}

/* ---------------------------------------------------------------- 04 */
function StepVisit() {
  return (
    <Frame label="Suivi de l'intervention">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center gap-3 rounded-xl border border-ink-900/6 bg-white p-4"
      >
        <span className="relative shrink-0">
          <span className="grid size-12 place-items-center rounded-full bg-teal-700 font-display text-sm font-semibold text-white">
            MK
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full border-2 border-white bg-teal-500">
            <span className="absolute size-2 rounded-full bg-teal-500 animate-pulse-ring" />
          </span>
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1 font-display text-base font-semibold text-ink-900">
            Marie K.
            <BadgeCheck className="size-4 text-teal-600" />
          </span>
          <span className="block text-xs text-ink-900/50">Nounou diplômée · 6 ans d'expérience</span>
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
        className="mt-3 overflow-hidden rounded-xl border border-ink-900/6 bg-white"
      >
        <div className="flex items-center gap-2.5 px-4 py-3">
          <Navigation className="size-4 shrink-0 text-teal-600" />
          <span className="text-sm font-medium text-ink-900">En route vers votre adresse</span>
          <span className="ml-auto font-mono text-xs text-teal-700">12 min</span>
        </div>
        <div className="h-1 w-full bg-ink-900/6">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-600 to-teal-400"
            initial={{ width: "0%" }}
            animate={{ width: "68%" }}
            transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
          />
        </div>
      </motion.div>

      <motion.ul variants={list} initial="hidden" animate="show" className="mt-3 flex flex-wrap gap-1.5">
        {["Identité contrôlée", "Antécédents vérifiés", "Formation validée"].map((b) => (
          <motion.li
            key={b}
            variants={item}
            className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wide text-teal-700"
          >
            <ShieldCheck className="size-3" strokeWidth={2.25} />
            {b}
          </motion.li>
        ))}
      </motion.ul>
    </Frame>
  );
}

/* ---------------------------------------------------------------- 05 */
function StepReview() {
  return (
    <Frame label="Validation & avis">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="flex flex-col items-center gap-2 rounded-xl border border-teal-500/25 bg-teal-50/60 px-4 py-5 text-center"
      >
        <motion.span
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 280, damping: 15 }}
          className="grid size-11 place-items-center rounded-full bg-teal-600"
        >
          <Check className="size-6 text-white" strokeWidth={3} />
        </motion.span>
        <p className="font-display text-base font-semibold text-ink-900">Prestation validée</p>
        <p className="text-xs text-ink-900/55">Paiement de 45 USD libéré au prestataire</p>
      </motion.div>

      <div className="mt-4 rounded-xl border border-ink-900/6 bg-white p-4">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-900/35">
          Votre évaluation
        </p>
        <div className="mt-2 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.3, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.35 + i * 0.1, type: "spring", stiffness: 300, damping: 14 }}
            >
              <Star className="size-6 fill-gold-500 text-gold-500" />
            </motion.span>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-3 text-sm leading-relaxed text-ink-900/60"
        >
          « Ponctuelle, douce avec les enfants et très professionnelle. »
        </motion.p>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="mt-3 flex items-center justify-center gap-1.5 text-[0.7rem] text-ink-900/45"
      >
        <Sparkles className="size-3.5 text-gold-600" />
        Votre avis alimente la note publique du prestataire
      </motion.p>
    </Frame>
  );
}

const VISUALS = [StepFind, StepBook, StepPay, StepVisit, StepReview];

export default function StepVisual({ index }) {
  const Visual = VISUALS[index] ?? StepFind;
  return <Visual />;
}
