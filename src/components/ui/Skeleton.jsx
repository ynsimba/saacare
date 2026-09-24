/**
 * Squelettes de chargement : la forme du contenu apparaît tout de suite,
 * ce qui paraît plus rapide qu'un texte « Chargement… » et évite les sauts
 * de mise en page à l'arrivée des données.
 */
const TONES = {
  desk: "bg-desk-ink/[0.07]",
  app: "bg-ink-900/[0.07]",
};

export function Skeleton({ className = "", tone = "app" }) {
  return <span aria-hidden="true" className={`skeleton block rounded-xl ${TONES[tone] ?? TONES.app} ${className}`} />;
}

/** En-tête + rangée de chiffres + une carte : couvre la plupart des écrans de détail. */
export function SkeletonPage({ tone = "app", className = "", label = "Chargement en cours" }) {
  const card = tone === "desk" ? "rounded-3xl bg-white p-5" : "rounded-2xl border border-ink-900/8 bg-white p-5";
  return (
    <div role="status" aria-live="polite" className={`stagger-in space-y-4 ${className}`}>
      <span className="sr-only">{label}…</span>
      <div className={card} aria-hidden="true">
        <div className="flex items-center gap-4">
          <Skeleton tone={tone} className="size-14 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2.5">
            <Skeleton tone={tone} className="h-4 w-2/5" />
            <Skeleton tone={tone} className="h-3 w-3/5" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={card}>
            <Skeleton tone={tone} className="h-3 w-1/2" />
            <Skeleton tone={tone} className="mt-3 h-6 w-3/4" />
          </div>
        ))}
      </div>
      <div className={card} aria-hidden="true">
        <Skeleton tone={tone} className="h-4 w-1/3" />
        <div className="mt-4 space-y-2.5">
          <Skeleton tone={tone} className="h-3 w-full" />
          <Skeleton tone={tone} className="h-3 w-11/12" />
          <Skeleton tone={tone} className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  );
}

/** Liste de lignes (tableaux, notifications, missions). */
export function SkeletonList({ rows = 4, tone = "app", className = "", label = "Chargement en cours" }) {
  const row = tone === "desk" ? "rounded-2xl bg-white" : "rounded-2xl border border-ink-900/8 bg-white";
  return (
    <div role="status" aria-live="polite" className={`stagger-in space-y-2.5 ${className}`}>
      <span className="sr-only">{label}…</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} aria-hidden="true" className={`flex items-center gap-3 p-4 ${row}`}>
          <Skeleton tone={tone} className="size-10 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton tone={tone} className="h-3.5 w-1/3" />
            <Skeleton tone={tone} className="h-3 w-2/3" />
          </div>
          <Skeleton tone={tone} className="h-8 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
