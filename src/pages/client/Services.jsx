import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import Seo from "../../lib/Seo";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";
import { COMMUNES } from "../../data/providerForm";
import { domains } from "../../data/domains";
import { getFavoriteServiceSlugs, toggleFavoriteService } from "../../lib/favorites";

export default function ClientServices() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [favSlugs, setFavSlugs] = useState(() => getFavoriteServiceSlugs());
  const [form, setForm] = useState({
    domain: "",
    metier: "",
    commune: "",
    frequency: "",
    desiredDate: "",
    need: "",
  });

  useEffect(() => {
    api.clientServices().then((d) => setCatalog(d.items || [])).catch(() => {
      setCatalog(domains.map((x) => ({ slug: x.slug, name: x.name, tagline: x.tagline })));
    });
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const selected = (catalog.length ? catalog : domains).find((d) => d.slug === form.domain);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.domain) {
      setError("Choisissez un pôle ci-dessus.");
      return;
    }
    setSending(true);
    setError("");
    setOk("");
    try {
      const data = await api.createClientOrder({
        domain: form.domain,
        metier: form.metier,
        commune: form.commune,
        frequency: form.frequency,
        desiredDate: form.desiredDate || null,
        need: form.need,
      });
      setOk(`Commande ${data.item.reference} créée.`);
      setTimeout(() => navigate("/client/commandes"), 800);
    } catch (err) {
      setError(err.message || "Impossible de créer la demande.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Seo title="Services" path="/client/services" noindex />
      <div className="rounded-2xl border border-ink-900/8 bg-white p-4 sm:p-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">Services</h1>
        <p className="mt-1 text-sm text-ink-900/60">Choisissez un pôle, puis précisez votre besoin.</p>

        <ul className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
          {catalog.map((s) => {
            const saved = favSlugs.includes(s.slug);
            const active = form.domain === s.slug;
            return (
              <li key={s.slug} className="relative">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, domain: s.slug }))}
                  title={s.tagline}
                  className={`w-full rounded-lg border px-2.5 py-2 pr-9 text-left transition-colors ${
                    active ? "border-teal-600 bg-teal-50" : "border-ink-900/8 hover:border-ink-900/15"
                  }`}
                >
                  <p className="truncate text-sm font-semibold text-ink-900">{s.name}</p>
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    setFavSlugs(await toggleFavoriteService(s.slug));
                  }}
                  className={`absolute right-1 top-1 grid size-7 place-items-center rounded-md transition-colors ${
                    saved ? "bg-teal-50 text-teal-700" : "text-ink-900/35 hover:bg-paper-200 hover:text-teal-700"
                  }`}
                  aria-pressed={saved}
                  aria-label={saved ? `Retirer ${s.name} des favoris` : `Enregistrer ${s.name}`}
                >
                  <Bookmark className="size-3.5" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>

        {selected && (
          <p className="mt-2 text-xs text-ink-900/55">
            Pôle sélectionné : <span className="font-semibold text-teal-700">{selected.name}</span>
            {selected.tagline ? ` — ${selected.tagline}` : ""}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 gap-3 border-t border-ink-900/8 pt-5 sm:grid-cols-2">
          <Field label="Métier souhaité" value={form.metier} onChange={set("metier")} placeholder="Ex. Nounou, chauffeur…" />
          <Field
            label="Commune"
            as="select"
            required
            value={form.commune}
            onChange={set("commune")}
            options={COMMUNES.map((c) => ({ value: c, label: c }))}
          />
          <Field
            label="Fréquence"
            as="select"
            value={form.frequency}
            onChange={set("frequency")}
            options={[
              { value: "ponctuel", label: "Ponctuel" },
              { value: "hebdomadaire", label: "Hebdomadaire" },
              { value: "mensuel", label: "Mensuel" },
              { value: "temps-plein", label: "Temps plein" },
            ]}
          />
          <Field label="Date souhaitée" type="date" value={form.desiredDate} onChange={set("desiredDate")} />
          <div className="sm:col-span-2">
            <Field label="Décrivez votre besoin" as="textarea" rows={3} required value={form.need} onChange={set("need")} />
          </div>

          {error && (
            <p className="rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800 sm:col-span-2" role="alert">
              {error}
            </p>
          )}
          {ok && (
            <p className="rounded-lg border border-teal-600/20 bg-teal-50 px-3 py-2 text-sm text-teal-800 sm:col-span-2" role="status">
              {ok}
            </p>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={sending} className="w-full sm:w-fit">
              {sending ? "Envoi…" : "Créer une commande"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
