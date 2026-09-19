import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Wallet } from "lucide-react";
import Seo from "../../lib/Seo";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";

function formatCdf(n) {
  return `${Number(n || 0).toLocaleString("fr-CD")} CDF`;
}

export default function PrestataireGains() {
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.prestataireGains();
      setSummary(data.summary || null);
      setItems(data.items || []);
      setError("");
    } catch (err) {
      setError(err.message || "Impossible de charger vos gains.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Seo title="Gains" path="/prestataire/gains" noindex />
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">Gains</h1>
            <p className="mt-2 text-sm text-ink-900/60">Paiements confirmés liés à vos missions.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Actualiser
          </Button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-teal-600/15 bg-teal-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-800/70">Ce mois</p>
            <p className="mt-2 font-display text-2xl font-bold text-teal-900">
              {summary?.monthFormatted || formatCdf(summary?.month)}
            </p>
          </div>
          <div className="rounded-xl border border-ink-900/8 bg-paper-100/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/45">Total</p>
            <p className="mt-2 font-display text-2xl font-bold text-ink-900">
              {summary?.totalFormatted || formatCdf(summary?.total)}
            </p>
          </div>
          <div className="rounded-xl border border-ink-900/8 bg-paper-100/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/45">Missions terminées</p>
            <p className="mt-2 font-display text-2xl font-bold text-ink-900">
              {summary?.completedMissions ?? 0}
            </p>
          </div>
        </div>

        <ul className="mt-6 flex flex-col gap-3">
          {items.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-900/8 bg-paper-100/50 px-4 py-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 place-items-center rounded-lg bg-teal-50 text-teal-700">
                  <Wallet className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-mono text-xs font-semibold text-teal-700">{p.reference}</p>
                  <p className="text-sm text-ink-900">
                    {formatCdf(p.amount)} · {p.method}
                    {p.orderReference ? ` · ${p.orderReference}` : ""}
                  </p>
                  {p.createdAt && (
                    <p className="mt-0.5 text-xs text-ink-900/45">
                      {new Date(p.createdAt).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
                    </p>
                  )}
                </div>
              </div>
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold uppercase text-teal-800">
                payé
              </span>
            </li>
          ))}
          {!loading && !items.length && !error && (
            <li className="rounded-xl border border-dashed border-ink-900/15 px-4 py-10 text-center text-sm text-ink-900/50">
              Aucun gain confirmé pour le moment.
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
