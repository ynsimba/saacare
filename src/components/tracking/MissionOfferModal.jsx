import { useCallback, useEffect, useState } from "react";
import { MapPin, Phone, X } from "lucide-react";
import Button from "../ui/Button";
import { api } from "../../lib/api";

function formatAmount(n) {
  if (n == null || n === 0) return "Sur devis";
  return new Intl.NumberFormat("fr-CD", { style: "currency", currency: "CDF", maximumFractionDigits: 0 }).format(n);
}

/**
 * Popup d’acceptation / refus d’une course proposée au prestataire.
 * Poll les offres en attente tant que l’espace prestataire est ouvert.
 */
export default function MissionOfferModal() {
  const [offers, setOffers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [showRefuseForm, setShowRefuseForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.prestatairePendingOffers();
      setOffers(data.items || []);
    } catch {
      /* silencieux : on réessaie au prochain poll */
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 8000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const offer = offers[0] || null;
  if (!offer) return null;

  const order = offer.order || {};
  const client = offer.client || {};
  const destination = offer.destination || {};

  const onAccept = async () => {
    setBusy(true);
    setError("");
    try {
      await api.acceptMission(order.id);
      setShowRefuseForm(false);
      setReason("");
      await load();
      window.dispatchEvent(new CustomEvent("saacare:mission-response", { detail: { action: "accept", orderId: order.id } }));
    } catch (err) {
      setError(err.message || "Impossible d’accepter cette course.");
    } finally {
      setBusy(false);
    }
  };

  const onRefuse = async () => {
    setBusy(true);
    setError("");
    try {
      await api.refuseMission(order.id, { reason: reason.trim() || null });
      setShowRefuseForm(false);
      setReason("");
      await load();
      window.dispatchEvent(new CustomEvent("saacare:mission-response", { detail: { action: "refuse", orderId: order.id } }));
    } catch (err) {
      setError(err.message || "Impossible de refuser cette course.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink-900/45 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="mission-offer-title">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-lifted">
        <div className="flex items-start justify-between gap-3 border-b border-ink-900/8 bg-teal-50 px-5 py-4">
          <div>
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-teal-700">Nouvelle course</p>
            <h2 id="mission-offer-title" className="mt-1 font-display text-xl font-bold text-ink-900">
              Accepter ou refuser ?
            </h2>
          </div>
          {offers.length > 1 && (
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-teal-800">
              {offers.length} en attente
            </span>
          )}
        </div>

        <div className="space-y-3 px-5 py-4">
          <p className="font-mono text-xs font-bold text-teal-700">{order.reference}</p>
          <p className="font-display text-lg font-bold text-ink-900">
            {order.metier || order.domain} · {order.commune}
          </p>
          {offer.need && <p className="text-sm text-ink-900/70">{offer.need}</p>}

          <dl className="grid gap-2 text-sm text-ink-900/75">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-teal-600" aria-hidden="true" />
              <dd>{destination.address || `Commune de ${destination.commune || order.commune}`}</dd>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-teal-600" aria-hidden="true" />
                <dd>
                  {client.fullName ? `${client.fullName} · ` : ""}
                  <a href={`tel:${client.phone}`} className="font-medium text-teal-700 hover:underline">
                    {client.phone}
                  </a>
                </dd>
              </div>
            )}
            <div className="rounded-xl bg-paper-100 px-3 py-2 font-semibold text-ink-900">
              Montant : {formatAmount(offer.amount)}
            </div>
          </dl>

          {error && (
            <p className="rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
              {error}
            </p>
          )}

          {showRefuseForm && (
            <div>
              <label htmlFor="refuse-reason" className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">
                Motif (facultatif)
              </label>
              <textarea
                id="refuse-reason"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink-900/10 bg-paper-100 px-3 py-2 text-sm outline-none focus:border-teal-600/40"
                placeholder="Indisponible, trop loin…"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-ink-900/8 px-5 py-4 sm:flex-row sm:justify-end">
          {!showRefuseForm ? (
            <>
              <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setShowRefuseForm(true)} className="justify-center">
                <X className="size-4" aria-hidden="true" />
                Refuser
              </Button>
              <Button type="button" size="sm" disabled={busy} onClick={onAccept} withArrow={false} className="justify-center">
                {busy ? "…" : "Accepter la course"}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => setShowRefuseForm(false)}>
                Annuler
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onRefuse} className="justify-center border-coral-500/40 text-coral-800">
                {busy ? "…" : "Confirmer le refus"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
