import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Heart, Trash2 } from "lucide-react";
import Seo from "../../lib/Seo";
import Button from "../../components/ui/Button";
import DomainIcon from "../../components/ui/DomainIcon";
import { api } from "../../lib/api";
import { domains } from "../../data/domains";
import {
  getFavoriteProviderRefs,
  getFavoriteServiceSlugs,
  loadFavorites,
  removeFavoriteProvider,
  removeFavoriteService,
} from "../../lib/favorites";

export default function ClientFavorites() {
  const [tab, setTab] = useState("prestataires");
  const [providerRefs, setProviderRefs] = useState(() => getFavoriteProviderRefs());
  const [serviceSlugs, setServiceSlugs] = useState(() => getFavoriteServiceSlugs());
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.providers(), loadFavorites()])
      .then(([data, favs]) => {
        if (cancelled) return;
        setProviders(data.items || []);
        setProviderRefs(favs.providers || []);
        setServiceSlugs(favs.services || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Impossible de charger les prestataires.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const favoriteProviders = providers.filter((p) => providerRefs.includes(p.reference));
  const favoriteServices = domains.filter((d) => serviceSlugs.includes(d.slug));

  const dropProvider = async (reference) => {
    setProviderRefs(await removeFavoriteProvider(reference));
  };

  const dropService = async (slug) => {
    setServiceSlugs(await removeFavoriteService(slug));
  };

  return (
    <>
      <Seo title="Favoris" path="/client/favoris" noindex />
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">Favoris</h1>
            <p className="mt-2 text-sm text-ink-900/60">Prestataires et services que vous avez enregistrés.</p>
          </div>
          <Button to="/prestataires" variant="outline">
            Parcourir le registre
          </Button>
        </div>

        <div className="mt-6 flex gap-2" role="tablist" aria-label="Type de favoris">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "prestataires"}
            onClick={() => setTab("prestataires")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "prestataires" ? "bg-teal-600 text-white" : "bg-paper-200 text-ink-900/70 hover:bg-teal-50"
            }`}
          >
            <Heart className="size-4" aria-hidden="true" />
            Prestataires
            <span className={`rounded-full px-1.5 font-mono text-[0.65rem] ${tab === "prestataires" ? "bg-white/20" : "bg-white"}`}>
              {providerRefs.length}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "services"}
            onClick={() => setTab("services")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "services" ? "bg-teal-600 text-white" : "bg-paper-200 text-ink-900/70 hover:bg-teal-50"
            }`}
          >
            <Bookmark className="size-4" aria-hidden="true" />
            Services
            <span className={`rounded-full px-1.5 font-mono text-[0.65rem] ${tab === "services" ? "bg-white/20" : "bg-white"}`}>
              {serviceSlugs.length}
            </span>
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
            {error}
          </p>
        )}

        {tab === "prestataires" && (
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {loading && (
              <li className="col-span-full py-8 text-center text-sm text-ink-900/50">Chargement…</li>
            )}
            {!loading &&
              favoriteProviders.map((p) => (
                <li key={p.reference} className="flex flex-col rounded-xl border border-ink-900/8 bg-paper-100/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink-900">{p.metier}</p>
                      <p className="text-xs font-medium tracking-wide text-ink-900/45">{p.reference}</p>
                      <p className="mt-1 text-sm text-ink-900/60">
                        {p.commune}
                        {p.reviews >= 3 ? ` · ${p.rating}/5` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dropProvider(p.reference)}
                      className="grid size-9 place-items-center rounded-lg text-ink-900/45 transition-colors hover:bg-coral-100 hover:text-coral-800"
                      aria-label={`Retirer ${p.metier} des favoris`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <Button to={`/prestataires/${p.reference}`} size="sm" className="mt-4 w-full sm:w-fit" variant="outline">
                    Voir le profil
                  </Button>
                </li>
              ))}
            {!loading && !favoriteProviders.length && (
              <li className="col-span-full rounded-xl border border-dashed border-ink-900/15 px-4 py-10 text-center text-sm text-ink-900/50">
                Aucun prestataire enregistré.{" "}
                <Link to="/prestataires" className="font-semibold text-teal-700 hover:underline">
                  Ajoutez-en depuis le registre
                </Link>
                .
              </li>
            )}
          </ul>
        )}

        {tab === "services" && (
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {favoriteServices.map((d) => (
              <li key={d.slug} className="flex flex-col rounded-xl border border-ink-900/8 bg-paper-100/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                      <DomainIcon name={d.icon} className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-ink-900">{d.name}</p>
                      <p className="mt-0.5 text-sm text-ink-900/60">{d.tagline}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => dropService(d.slug)}
                    className="grid size-9 place-items-center rounded-lg text-ink-900/45 transition-colors hover:bg-coral-100 hover:text-coral-800"
                    aria-label={`Retirer ${d.name} des favoris`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button to={`/solutions/${d.slug}`} size="sm" variant="outline">
                    Voir le pôle
                  </Button>
                  <Button to={`/client/services`} size="sm">
                    Demander
                  </Button>
                </div>
              </li>
            ))}
            {!favoriteServices.length && (
              <li className="col-span-full rounded-xl border border-dashed border-ink-900/15 px-4 py-10 text-center text-sm text-ink-900/50">
                Aucun service enregistré.{" "}
                <Link to="/solutions" className="font-semibold text-teal-700 hover:underline">
                  Parcourir les pôles
                </Link>
                .
              </li>
            )}
          </ul>
        )}
      </div>
    </>
  );
}
