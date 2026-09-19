import { useCallback, useEffect, useState } from "react";
import { CalendarDays, MapPin, Phone, RefreshCw } from "lucide-react";
import Seo from "../../lib/Seo";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";

const STATUS = {
  confirmee: { label: "Confirmée", className: "bg-sky/80 text-navy-800" },
  programmee: { label: "Programmée", className: "bg-sky/80 text-navy-800" },
  en_cours: { label: "En cours", className: "bg-teal-50 text-teal-800" },
};

export default function PrestatairePlanning() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.prestatairePlanning();
      setItems(data.items || []);
      setError("");
    } catch (err) {
      setError(err.message || "Impossible de charger le planning.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Seo title="Planning" path="/prestataire/planning" noindex />
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">Planning</h1>
            <p className="mt-2 text-sm text-ink-900/60">Missions confirmées, programmées ou en cours.</p>
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

        <ul className="mt-6 flex flex-col gap-3">
          {items.map((o) => {
            const st = STATUS[o.status] || { label: o.status, className: "bg-ink-900/10 text-ink-900" };
            return (
              <li key={o.id} className="rounded-xl border border-ink-900/8 bg-paper-100/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-semibold text-teal-700">{o.reference}</p>
                    <p className="mt-1 font-semibold text-ink-900">
                      {o.metier || o.domain} · {o.commune}
                    </p>
                    {o.desiredDate && (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-900/70">
                        <CalendarDays className="size-4 text-teal-700" aria-hidden="true" />
                        {new Date(o.desiredDate).toLocaleDateString("fr-FR", { dateStyle: "long" })}
                      </p>
                    )}
                    {o.address && (
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-900/60">
                        <MapPin className="size-4" aria-hidden="true" />
                        {o.address}
                      </p>
                    )}
                    {o.client?.fullName && (
                      <p className="mt-2 text-sm text-ink-900/70">
                        Client : {o.client.fullName}
                        {o.client.phone ? (
                          <span className="ml-2 inline-flex items-center gap-1 text-ink-900/55">
                            <Phone className="size-3.5" aria-hidden="true" />
                            {o.client.phone}
                          </span>
                        ) : null}
                      </p>
                    )}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${st.className}`}>
                    {st.label}
                  </span>
                </div>
              </li>
            );
          })}
          {!loading && !items.length && !error && (
            <li className="rounded-xl border border-dashed border-ink-900/15 px-4 py-10 text-center text-sm text-ink-900/50">
              Aucune mission planifiée pour le moment.
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
