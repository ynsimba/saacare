import { ShieldCheck, Award, Crown } from "lucide-react";

/**
 * Badge de certification SaaTrust en trois variantes : Vérifié, Certifié, Élite.
 * Le niveau est toujours écrit en toutes lettres — jamais porté par la seule couleur.
 */
const LEVELS = {
  "Vérifié": { icon: ShieldCheck, tone: "bg-teal-50 text-teal-700 ring-teal-600/15" },
  "Certifié": { icon: Award, tone: "bg-teal-600 text-white ring-teal-700/20" },
  "Élite": { icon: Crown, tone: "bg-gold-100 text-gold-800 ring-gold-500/30" },
};

export default function Badge({ label, size = "sm", onDark = false }) {
  const { icon: Icon, tone } = LEVELS[label] ?? { icon: ShieldCheck, tone: "bg-paper-200 text-ink-900 ring-ink-900/10" };
  const sizeClasses = size === "sm" ? "text-[0.7rem] px-2 py-1 gap-1" : "text-xs px-2.5 py-1.5 gap-1.5";
  /* Sur une carte pleine couleur, le niveau reste lisible en blanc sur voile clair. */
  const toneClasses = onDark ? "bg-white/15 text-white ring-white/30" : tone;

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wide ring-1 ring-inset ${toneClasses} ${sizeClasses}`}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden="true" strokeWidth={2.25} />
      {label}
    </span>
  );
}
