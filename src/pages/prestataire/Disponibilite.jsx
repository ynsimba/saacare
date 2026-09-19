import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Seo from "../../lib/Seo";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";

const WEEKDAYS = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 0, label: "Dimanche" },
];

const emptySlot = () => ({ weekday: 1, startTime: "08:00", endTime: "17:00", isAvailable: true });

export default function PrestataireDisponibilite() {
  const [slots, setSlots] = useState([emptySlot()]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.prestataireDisponibilite();
      const items = data.items || [];
      setSlots(items.length ? items.map((s) => ({
        weekday: s.weekday,
        startTime: s.startTime,
        endTime: s.endTime,
        isAvailable: s.isAvailable !== false,
      })) : [emptySlot()]);
      setError("");
    } catch (err) {
      setError(err.message || "Impossible de charger vos créneaux.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (index, key, value) => {
    setSlots((list) => list.map((s, i) => (i === index ? { ...s, [key]: value } : s)));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    try {
      const data = await api.updatePrestataireDisponibilite(slots);
      const items = data.items || [];
      setSlots(items.length ? items.map((s) => ({
        weekday: s.weekday,
        startTime: s.startTime,
        endTime: s.endTime,
        isAvailable: s.isAvailable !== false,
      })) : [emptySlot()]);
      setOk("Disponibilités enregistrées.");
    } catch (err) {
      setError(err.message || "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Seo title="Disponibilité" path="/prestataire/disponibilite" noindex />
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold text-ink-900">Disponibilité</h1>
        <p className="mt-2 text-sm text-ink-900/60">Indiquez vos créneaux habituels pour faciliter l’affectation des missions.</p>

        {loading ? (
          <p className="mt-8 text-sm text-ink-900/50">Chargement…</p>
        ) : (
          <form onSubmit={onSave} className="mt-6 space-y-4">
            {slots.map((slot, index) => (
              <div
                key={index}
                className="grid grid-cols-1 items-end gap-3 rounded-xl border border-ink-900/8 bg-paper-100/50 p-4 sm:grid-cols-[1.2fr_1fr_1fr_auto_auto]"
              >
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-900/45">Jour</span>
                  <select
                    value={slot.weekday}
                    onChange={(e) => update(index, "weekday", Number(e.target.value))}
                    className="h-11 w-full rounded-lg border border-ink-900/10 bg-white px-3 text-sm outline-none focus:border-teal-600/40"
                  >
                    {WEEKDAYS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-900/45">Début</span>
                  <input
                    type="time"
                    required
                    value={slot.startTime}
                    onChange={(e) => update(index, "startTime", e.target.value)}
                    className="h-11 w-full rounded-lg border border-ink-900/10 bg-white px-3 text-sm outline-none focus:border-teal-600/40"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-900/45">Fin</span>
                  <input
                    type="time"
                    required
                    value={slot.endTime}
                    onChange={(e) => update(index, "endTime", e.target.value)}
                    className="h-11 w-full rounded-lg border border-ink-900/10 bg-white px-3 text-sm outline-none focus:border-teal-600/40"
                  />
                </label>
                <label className="flex h-11 items-center gap-2 text-sm text-ink-900/70">
                  <input
                    type="checkbox"
                    checked={slot.isAvailable}
                    onChange={(e) => update(index, "isAvailable", e.target.checked)}
                    className="size-4 rounded border-ink-900/20 text-teal-600 focus:ring-teal-600/30"
                  />
                  Disponible
                </label>
                <button
                  type="button"
                  onClick={() => setSlots((list) => (list.length <= 1 ? list : list.filter((_, i) => i !== index)))}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-ink-900/10 text-ink-900/50 transition-colors hover:border-coral-500/30 hover:bg-coral-100/40 hover:text-coral-800"
                  aria-label="Supprimer le créneau"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setSlots((list) => [...list, emptySlot()])}>
                <Plus className="size-4" aria-hidden="true" />
                Ajouter un créneau
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </form>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
            {error}
          </p>
        )}
        {ok && (
          <p className="mt-4 rounded-lg border border-teal-600/20 bg-teal-50 px-3 py-2 text-sm text-teal-800" role="status">
            {ok}
          </p>
        )}
      </div>
    </>
  );
}
