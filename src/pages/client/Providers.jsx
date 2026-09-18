import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import Seo from "../../lib/Seo";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";
import { COMMUNES } from "../../data/providerForm";
import { domains } from "../../data/domains";
import { getFavoriteProviderRefs, toggleFavoriteProvider } from "../../lib/favorites";

export default function ClientProviders() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [commune, setCommune] = useState("");
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(null);
  const [favRefs, setFavRefs] = useState(() => getFavoriteProviderRefs());

  const load = () =>
    api
      .clientProviders({ commune, domain })
      .then((d) => setItems(d.items || []))
      .catch((err) => setError(err.message || "Chargement impossible."));

  useEffect(() => {
    load();
  }, [commune, domain]);

  const requestProvider = async (provider) => {
    setBusy(provider.id);
    setError("");
    try {
      await api.createClientOrder({
        domain: provider.domain || domain || "home",
        metier: provider.metier || "",
        commune: commune || provider.commune || "Gombe",
        need: `Demande de mise en relation avec ${provider.fullName || "ce prestataire"} (${provider.metier}).`,
        providerProfileId: provider.id,
      });
      navigate("/client/commandes");
    } catch (err) {
      setError(err.message || "Demande impossible.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Seo title="Prestataires" path="/client/prestataires" noindex />
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold text-ink-900">Prestataires</h1>
        <p className="mt-2 text-sm text-ink-900/60">Profils approuvés. La mise en relation passe par SaaCare.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Commune"
            as="select"
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            options={[{ value: "", label: "Toutes" }, ...COMMUNES.map((c) => ({ value: c, label: c }))]}
          />
          <Field
            label="Pôle"
            as="select"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            options={[{ value: "", label: "Tous" }, ...domains.map((d) => ({ value: d.slug, label: d.name }))]}
          />
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
            {error}
          </p>
        )}

        <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((p) => (
            <li key={p.id} className="flex flex-col rounded-xl border border-ink-900/8 bg-paper-100/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-900">{p.metier || "Prestataire"}</p>
                  <p className="text-xs font-medium tracking-wide text-ink-900/45">{p.reference}</p>
                </div>
                {p.level && (
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-teal-700">
                    {p.level}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-ink-900/60">
                {p.commune || (p.zones || []).join(", ") || "Kinshasa"}
                {p.reviews >= 3 ? ` · ${p.rating}/5 (${p.reviews})` : ""}
              </p>
              {p.bio && <p className="mt-2 flex-1 text-sm text-ink-900/70">{p.bio}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="w-full sm:w-fit"
                  disabled={busy === p.id}
                  onClick={() => requestProvider(p)}
                >
                  {busy === p.id ? "Envoi…" : "Demander ce prestataire"}
                </Button>
                {p.reference && (
                  <button
                    type="button"
                    onClick={async () => setFavRefs(await toggleFavoriteProvider(p.reference))}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                      favRefs.includes(p.reference)
                        ? "border-coral-500/40 bg-coral-100 text-coral-800"
                        : "border-ink-900/10 text-ink-900/60 hover:border-coral-500/30 hover:text-coral-800"
                    }`}
                    aria-pressed={favRefs.includes(p.reference)}
                    aria-label={
                      favRefs.includes(p.reference) ? "Retirer des favoris" : "Ajouter aux favoris"
                    }
                  >
                    <Heart
                      className="size-4"
                      fill={favRefs.includes(p.reference) ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                    Favori
                  </button>
                )}
              </div>
            </li>
          ))}
          {!items.length && !error && (
            <li className="col-span-full rounded-xl border border-dashed border-ink-900/15 px-4 py-10 text-center text-sm text-ink-900/50">
              Aucun prestataire approuvé pour ces filtres.
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
