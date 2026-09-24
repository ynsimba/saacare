import { Link } from "react-router-dom";
import { ArrowUpRight, Inbox } from "lucide-react";

/** Teintes pastel des cartes du back-office. */
export const TONES = {
  mint: "bg-desk-mint",
  pink: "bg-desk-pink",
  butter: "bg-desk-butter",
  lilac: "bg-desk-lilac",
  white: "bg-white",
};

export function initials(name = "") {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

/** Pastille blanche ronde avec flèche ↗ — lien ou bouton. */
export function ArrowButton({ to, onClick, label, size = "md", className = "" }) {
  const dims = size === "sm" ? "size-8" : "size-10";
  const cls = `inline-flex shrink-0 items-center justify-center rounded-full bg-white text-desk-ink transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 hover:rotate-12 ${dims} ${className}`;
  const icon = <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden="true" />;

  if (to) {
    return (
      <Link to={to} className={cls} aria-label={label}>
        {icon}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} aria-label={label}>
      {icon}
    </button>
  );
}

/** Flèche décorative quand toute la carte est déjà un lien (évite les liens imbriqués). */
export function ArrowHint({ size = "md", className = "" }) {
  const dims = size === "sm" ? "size-8" : "size-10";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-white text-desk-ink transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:rotate-12 ${dims} ${className}`}
      aria-hidden="true"
    >
      <ArrowUpRight className="size-4" strokeWidth={1.5} />
    </span>
  );
}

/** Carte KPI / widget entièrement cliquable. */
export function DeskWidget({ to, tone = "white", className = "", children, label }) {
  const base = `tap group block rounded-2xl p-4 transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desk-ink ${TONES[tone] || TONES.white} ${className}`;
  if (!to) {
    return <div className={base}>{children}</div>;
  }
  return (
    <Link to={to} className={base} aria-label={label}>
      {children}
    </Link>
  );
}

/** Pile d'avatars à initiales, avec compteur « +N ». */
export function AvatarStack({ names = [], max = 4 }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  const palette = ["bg-desk-ink text-white", "bg-white text-desk-ink", "bg-desk-butter text-desk-ink", "bg-desk-lilac text-desk-ink"];

  if (!names.length) return null;

  return (
    <div className="flex items-center">
      {shown.map((name, i) => (
        <span
          key={`${name}-${i}`}
          title={name}
          className={`-ml-1.5 flex size-8 items-center justify-center rounded-full border-2 border-white text-[0.65rem] font-bold first:ml-0 ${palette[i % palette.length]}`}
        >
          {initials(name)}
        </span>
      ))}
      {rest > 0 && (
        <span className="-ml-1.5 flex size-8 items-center justify-center rounded-full border-2 border-white bg-white/80 text-[0.65rem] font-bold text-desk-ink">
          +{rest}
        </span>
      )}
    </div>
  );
}

/** Titre de section, avec compteur grisé optionnel : « Vos activités (5) ». */
export function DeskHeading({ children, count, action, as: Tag = "h2" }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <Tag className="text-xl font-semibold leading-tight tracking-tight text-desk-ink sm:text-2xl">
        {children}
        {count != null && <span className="ml-2 text-desk-muted">({count})</span>}
      </Tag>
      {action}
    </div>
  );
}

/** Pastille blanche d'information en haut à droite d'une carte (ex. ★ 4.9). */
export function Chip({ icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-desk-ink ${className}`}>
      {Icon && <Icon className="size-3.5" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Message d'erreur aux couleurs du back-office. */
export function DeskAlert({ children }) {
  if (!children) return null;
  return (
    <p className="rounded-2xl bg-desk-pink px-4 py-2.5 text-sm font-medium text-desk-ink" role="alert">
      {children}
    </p>
  );
}

/** État vide composé : pictogramme, message et, si utile, l'action qui remplit la liste. */
export function DeskEmpty({ children, icon: Icon = Inbox, action }) {
  return (
    <div className="screen-in flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-desk-ink/12 bg-white/50 px-5 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-desk-mint text-desk-ink" aria-hidden="true">
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <p className="max-w-sm text-pretty text-sm font-medium text-desk-ink/60">{children}</p>
      {action}
    </div>
  );
}
