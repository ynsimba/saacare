import { useIsReducedMotion } from "../../lib/motion";

/**
 * Bandeau défilant à l'infini. Le contenu est dupliqué une fois : l'animation
 * translate de -50 %, ce qui rend la boucle invisible. En mouvement réduit,
 * le bandeau devient une simple liste défilable horizontalement.
 */
export default function Marquee({ items, speed = 34, className = "", renderItem }) {
  const reduced = useIsReducedMotion();
  const content = reduced ? items : [...items, ...items];

  return (
    <div className={`fade-edges relative overflow-hidden ${className}`}>
      <ul
        className={`flex w-max items-center gap-3 ${reduced ? "overflow-x-auto" : "animate-marquee"}`}
        style={reduced ? undefined : { animationDuration: `${speed}s` }}
      >
        {content.map((item, index) => (
          <li key={`${typeof item === "string" ? item : item.label}-${index}`} className="shrink-0">
            {renderItem ? renderItem(item, index) : <DefaultChip label={item} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DefaultChip({ label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-ink-900/8 bg-white px-4 py-2 text-sm text-ink-900/70">
      {label}
    </span>
  );
}
