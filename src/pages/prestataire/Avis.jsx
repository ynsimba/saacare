import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Star } from "lucide-react";
import Seo from "../../lib/Seo";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";

export default function PrestataireAvis() {
  const [items, setItems] = useState([]);
  const [average, setAverage] = useState(null);
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.prestataireAvis();
      setItems(data.items || []);
      setAverage(data.average);
      setCount(data.count || 0);
      setError("");
    } catch (err) {
      setError(err.message || "Impossible de charger les avis.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Seo title="Avis" path="/prestataire/avis" noindex />
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">Avis</h1>
            <p className="mt-2 text-sm text-ink-900/60">Retours des clients sur vos missions terminées.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Actualiser
          </Button>
        </div>

        <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-teal-600/15 bg-teal-50/60 px-4 py-3">
          <Star className="size-5 fill-teal-600 text-teal-600" aria-hidden="true" />
          <div>
            <p className="font-display text-xl font-bold text-teal-900">
              {average != null ? `${average} / 5` : "—"}
            </p>
            <p className="text-xs text-teal-800/70">{count} avis publié{count > 1 ? "s" : ""}</p>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
            {error}
          </p>
        )}

        <ul className="mt-6 flex flex-col gap-3">
          {items.map((r) => (
            <li key={r.id} className="rounded-xl border border-ink-900/8 bg-paper-100/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-ink-900">{r.authorName || "Client"}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
                  <Star className="size-3.5 fill-teal-700 text-teal-700" aria-hidden="true" />
                  {r.rating}/5
                </span>
              </div>
              {r.body && <p className="mt-2 text-sm leading-relaxed text-ink-900/70">{r.body}</p>}
              {r.createdAt && (
                <p className="mt-2 text-xs text-ink-900/45">
                  {new Date(r.createdAt).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
                </p>
              )}
            </li>
          ))}
          {!loading && !items.length && !error && (
            <li className="rounded-xl border border-dashed border-ink-900/15 px-4 py-10 text-center text-sm text-ink-900/50">
              Aucun avis pour le moment.
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
