import { ShieldCheck, BookOpenCheck, Award, Crown } from "lucide-react";

const ICONS = {
  "Vérifié": ShieldCheck,
  "Vérifiée": ShieldCheck,
  "Formé": BookOpenCheck,
  "Formée": BookOpenCheck,
  "Certifié métier": Award,
  "Certifiée métier": Award,
  "Top prestataire": Crown,
};

const TONE = {
  "Vérifié": "bg-teal-50 text-teal-700",
  "Vérifiée": "bg-teal-50 text-teal-700",
  "Formé": "bg-navy-700/5 text-navy-700",
  "Formée": "bg-navy-700/5 text-navy-700",
  "Certifié métier": "bg-gold-100 text-gold-800",
  "Certifiée métier": "bg-gold-100 text-gold-800",
  "Top prestataire": "bg-coral-100 text-coral-800",
};

export default function Badge({ label, size = "sm" }) {
  const Icon = ICONS[label] ?? ShieldCheck;
  const tone = TONE[label] ?? "bg-navy-700/5 text-navy-700";
  const sizeClasses = size === "sm" ? "text-[0.7rem] px-2 py-1 gap-1" : "text-xs px-2.5 py-1.5 gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-medium uppercase tracking-wide ring-1 ring-inset ring-ink-900/5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 ${tone} ${sizeClasses}`}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden="true" strokeWidth={2.25} />
      {label}
    </span>
  );
}
