import { useEffect, useState } from "react";
import { Navigation } from "lucide-react";
import Seo from "../../lib/Seo";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";
import { formatEta, tripPresentation } from "../../lib/tripFormat";

const STATUS = {
  nouvelle: "bg-gold-100 text-gold-800",
  confirmee: "bg-sky/80 text-navy-800",
  en_cours: "bg-teal-50 text-teal-800",
  terminee: "bg-ink-900/10 text-ink-900",
  annulee: "bg-coral-100 text-coral-800",
};

export default function ClientOrders() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  const load = () =>
    api
      .clientOrders()
      .then((d) => setItems(d.items || []))
      .catch((err) => setError(err.message || "Chargement impossible."));

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    setBusy(id);
    try {
      await api.cancelClientOrder(id);
      await load();
    } catch (err) {
      setError(err.message || "Annulation impossible.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Seo title="Commandes" path="/client/commandes" noindex />
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">Commandes</h1>
            <p className="mt-2 text-sm text-ink-900/60">Suivi de vos demandes de prestation.</p>
          </div>
          <Button to="/client/services" withArrow>
            Nouvelle demande
          </Button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
            {error}
          </p>
        )}

        <ul className="mt-6 flex flex-col gap-3">
          {items.map((o) => (
            <li key={o.id} className="rounded-xl border border-ink-900/8 bg-paper-100/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-semibold text-teal-700">{o.reference}</p>
                  <p className="mt-1 font-semibold text-ink-900">
                    {o.metier || o.domain} · {o.commune}
                  </p>
                  <p className="mt-1 text-sm text-ink-900/60">{o.need}</p>
                  {o.provider && (
                    <p className="mt-2 text-sm text-ink-900/70">Prestataire : {o.provider.fullName || o.provider.metier}</p>
                  )}
                  {o.trip?.isActive && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700">
                      <Navigation className="size-4" aria-hidden="true" />
                      {tripPresentation(o.trip).title}
                      {o.trip.route?.etaSeconds != null && (
                        <span className="font-normal text-ink-900/70">
                          · arrivée {formatEta(o.trip.route.etaSeconds)}
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${STATUS[o.status] || ""}`}>
                    {o.status}
                  </span>
                  {/* Trajet en cours : le client accède au suivi en un geste (§8) */}
                  {o.trip?.isActive && (
                    <Button to={`/client/commandes/${o.id}/suivi`} size="sm">
                      <Navigation className="size-4" aria-hidden="true" />
                      Suivre l’arrivée
                    </Button>
                  )}
                  {["nouvelle", "confirmee", "programmee"].includes(o.status) && (
                    <Button type="button" size="sm" variant="outline" disabled={busy === o.id} onClick={() => cancel(o.id)}>
                      Annuler
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
          {!items.length && !error && (
            <li className="rounded-xl border border-dashed border-ink-900/15 px-4 py-10 text-center text-sm text-ink-900/50">
              Aucune commande pour le moment.
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
