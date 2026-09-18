/**
 * Classes Tailwind associées au thème de chaque pôle.
 * teal = vert SaaCare, navy = encre / vert profond, coral et gold = orange SaaCare.
 * Les fonds pleins orange utilisent la teinte 700 pour garder un texte blanc lisible (AA).
 */
export const THEME = {
  teal: {
    accent: "bg-teal-400",
    bg: "bg-teal-600",
    bgSoft: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    ring: "ring-teal-500/30",
    chip: "bg-teal-100 text-teal-700",
    dot: "bg-teal-500",
  },
  navy: {
    accent: "bg-navy-600",
    bg: "bg-ink-900",
    bgSoft: "bg-sky",
    text: "text-navy-700",
    border: "border-navy-700/15",
    ring: "ring-navy-700/25",
    chip: "bg-sky text-ink-900",
    dot: "bg-navy-600",
  },
  gold: {
    accent: "bg-gold-500",
    bg: "bg-gold-700",
    bgSoft: "bg-gold-100",
    text: "text-gold-800",
    border: "border-gold-200",
    ring: "ring-gold-500/30",
    chip: "bg-gold-100 text-gold-800",
    dot: "bg-gold-500",
  },
  coral: {
    accent: "bg-coral-500",
    bg: "bg-coral-700",
    bgSoft: "bg-coral-100",
    text: "text-coral-800",
    border: "border-coral-100",
    ring: "ring-coral-500/30",
    chip: "bg-coral-100 text-coral-800",
    dot: "bg-coral-500",
  },
};
