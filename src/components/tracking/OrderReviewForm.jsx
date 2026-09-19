import { useState } from "react";
import { Star } from "lucide-react";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";

/** Formulaire d’avis client sur une commande terminée. */
export default function OrderReviewForm({ order, onDone }) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  if (order.hasReview || order.review) {
    return (
      <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-teal-800">
        <Star className="size-4 fill-teal-700 text-teal-700" aria-hidden="true" />
        Avis laissé{order.review?.rating ? ` · ${order.review.rating}/5` : ""}
      </p>
    );
  }

  if (!open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Star className="size-4" aria-hidden="true" />
        Laisser un avis
      </Button>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api.reviewClientOrder(order.id, { rating, body: body.trim() || null });
      onDone?.(data.order || { ...order, hasReview: true, review: data.item });
      setOpen(false);
    } catch (err) {
      setError(err.message || "Impossible d’envoyer l’avis.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-3 w-full max-w-sm rounded-xl border border-teal-600/20 bg-teal-50/40 p-3">
      <p className="text-sm font-semibold text-ink-900">Noter cette mission</p>
      <div className="mt-2 flex gap-1" role="group" aria-label="Note">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className="rounded-md p-1 transition-colors hover:bg-white"
            aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            aria-pressed={rating === n}
          >
            <Star
              className={`size-5 ${n <= rating ? "fill-teal-600 text-teal-600" : "text-ink-900/25"}`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        placeholder="Commentaire (optionnel)"
        className="mt-2 w-full rounded-lg border border-ink-900/10 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600/40"
      />
      {error && <p className="mt-2 text-xs text-coral-800">{error}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Envoi…" : "Envoyer"}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
