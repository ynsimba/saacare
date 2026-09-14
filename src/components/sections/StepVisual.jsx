import { motion } from "motion/react";
import { Search, Star, ShieldCheck, PhoneCall, Check, FileSignature, CalendarCheck, RefreshCcw, UserCheck } from "lucide-react";
import Badge from "../ui/Badge";
import { EASE } from "../../lib/motion";

/**
 * Maquettes simplifiées illustrant chacune des quatre étapes du parcours client.
 * Décoratives et masquées à l'accessibilité : le texte de l'étape porte l'information.
 */
const list = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.18 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } };

function Frame({ children, label }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1.5 border-b border-ink-900/6 px-5 py-3.5">
        <span className="size-2.5 rounded-full bg-gold-500/70" />
        <span className="size-2.5 rounded-full bg-teal-100" />
        <span className="size-2.5 rounded-full bg-teal-600/60" />
        <span className="ml-3 truncate text-[0.66rem] font-medium uppercase tracking-[0.16em] text-navy-500">{label}</span>
      </div>
      <div className="flex-1 p-5 sm:p-6">{children}</div>
    </div>
  );
}

function StepFind() {
  const results = [
    { initials: "G", ref: "SAA-KC-0412", role: "Nounou", level: "Élite", rating: "4,9", commune: "Gombe" },
    { initials: "E", ref: "SAA-WL-0121", role: "Accompagnante post-natale", level: "Élite", rating: "5,0", commune: "Gombe" },
    { initials: "R", ref: "SAA-HM-0231", role: "Aide-ménagère", level: "Vérifié", rating: "4,7", commune: "Bandalungwa" },
  ];
  return (
    <Frame label="Recherche sans inscription">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="flex items-center gap-2.5 rounded-xl border border-teal-600/30 bg-paper-100 px-3.5 py-3">
        <Search className="size-4 shrink-0 text-teal-600" />
        <span className="text-sm text-ink-900/75">Nounou · Gombe · Mois</span>
        <motion.span className="ml-auto h-4 w-px bg-teal-600" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.1, repeat: Infinity }} />
      </motion.div>
      <motion.ul variants={list} initial="hidden" animate="show" className="mt-4 flex flex-col gap-2.5">
        {results.map((r) => (
          <motion.li key={r.ref} variants={item} className="flex items-center gap-3 rounded-xl border border-ink-900/6 bg-white p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-600 font-display text-sm font-bold text-white">{r.initials}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink-900">{r.role}</span>
              <span className="block truncate text-xs text-navy-500">{r.ref} · {r.commune}</span>
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

function StepRequest() {
  const fields = [
    ["Service", "Saa Kids Care"],
    ["Commune", "Gombe"],
    ["Fréquence", "Mois"],
    ["Prénom", "Aline"],
  ];
  return (
    <Frame label="Demande en 1 minute">
      <motion.div variants={list} initial="hidden" animate="show" className="grid grid-cols-2 gap-2.5">
        {fields.map(([label, value]) => (
          <motion.div key={label} variants={item} className="rounded-lg border border-ink-900/8 bg-paper-100 px-3 py-2">
            <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-navy-500">{label}</span>
            <span className="block text-sm text-ink-900">{value}</span>
          </motion.div>
        ))}
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.5, ease: EASE }} className="mt-4 flex items-center gap-3 rounded-xl bg-teal-50 p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-600">
          <Check className="size-5 text-white" strokeWidth={3} />
        </span>
        <span>
          <span className="block font-display text-sm font-bold text-ink-900">Demande reçue</span>
          <span className="block text-xs text-ink-900/70">N° DEM-26-1048 · confirmé par SMS</span>
        </span>
      </motion.div>
    </Frame>
  );
}

function StepConfirm() {
  const checks = ["Disponibilité de l'agent confirmée", "Régime adapté : placement", "Contrat préparé"];
  return (
    <Frame label="Votre chargé de clientèle">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="flex items-center gap-3 rounded-xl border border-ink-900/6 bg-white p-4">
        <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-800">
          <PhoneCall className="size-5" />
          <span className="absolute inset-0 rounded-full bg-gold-500/25 animate-pulse-ring" />
        </span>
        <span>
          <span className="block font-display text-base font-bold text-ink-900">Appel en cours</span>
          <span className="block text-xs text-ink-900/65">Nous confirmons votre demande</span>
        </span>
      </motion.div>
      <motion.ul variants={list} initial="hidden" animate="show" className="mt-3 flex flex-col gap-2">
        {checks.map((c) => (
          <motion.li key={c} variants={item} className="flex items-center gap-2.5 rounded-lg bg-paper-100 px-3 py-2.5 text-sm text-ink-900">
            <Check className="size-4 shrink-0 text-teal-600" strokeWidth={3} />
            {c}
          </motion.li>
        ))}
      </motion.ul>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-3 flex items-center gap-2 text-xs text-ink-900/65">
        <FileSignature className="size-4 text-teal-600" />
        Les coordonnées de l'agent vous sont transmises après validation.
      </motion.p>
    </Frame>
  );
}

function StepFollow() {
  const rows = [
    { icon: UserCheck, label: "Première mission accompagnée", detail: "Superviseur présent" },
    { icon: CalendarCheck, label: "Visite qualité à J+7", detail: "Planifiée" },
    { icon: RefreshCcw, label: "Remplacement sous 24 h", detail: "Si besoin" },
  ];
  return (
    <Frame label="Suivi de la mission">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="flex items-center justify-between gap-3 rounded-xl border border-ink-900/6 bg-white p-4">
        <span className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-teal-600 font-display font-bold text-white">G</span>
          <span>
            <span className="block text-sm font-semibold text-ink-900">SAA-KC-0412</span>
            <span className="block text-xs text-navy-500">Nounou · en mission</span>
          </span>
        </span>
        <Badge label="Élite" />
      </motion.div>
      <motion.ul variants={list} initial="hidden" animate="show" className="mt-3 flex flex-col gap-2">
        {rows.map(({ icon: Icon, label, detail }) => (
          <motion.li key={label} variants={item} className="flex items-center gap-3 rounded-lg bg-paper-100 px-3 py-2.5">
            <Icon className="size-4 shrink-0 text-teal-600" />
            <span className="flex-1 text-sm text-ink-900">{label}</span>
            <span className="text-xs font-medium text-teal-700">{detail}</span>
          </motion.li>
        ))}
      </motion.ul>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-gold-500/40 px-3 py-2.5">
        <ShieldCheck className="size-4 text-gold-600" />
        <span className="text-xs text-ink-900/75">Vous notez la mission, l'agent vous note aussi.</span>
      </div>
    </Frame>
  );
}

const VISUALS = [StepFind, StepRequest, StepConfirm, StepFollow];

export default function StepVisual({ index }) {
  const Visual = VISUALS[index] ?? StepFind;
  return <Visual />;
}
