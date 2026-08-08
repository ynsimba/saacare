import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Search, SearchX, SlidersHorizontal, X, LayoutGrid, List } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import ProviderCard from "../components/ui/ProviderCard";
import ProviderTable from "../components/ui/ProviderTable";
import ProviderDrawer from "../components/ui/ProviderDrawer";
import DomainIcon from "../components/ui/DomainIcon";
import { domains } from "../data/domains";
import { providers } from "../data/providers";
import { EASE, useIsReducedMotion } from "../lib/motion";

const SORTS = [
  { value: "note", label: "Mieux notés" },
  { value: "pertinence", label: "Pertinence" },
  { value: "prix", label: "Prix croissant" },
  { value: "experience", label: "Plus expérimentés" },
];

/** Communes déduites des données : la liste reste juste si le jeu de données évolue. */
const COMMUNES = [...new Set(providers.map((p) => p.commune))].sort((a, b) =>
  a.localeCompare(b, "fr")
);

const VIEW_STORAGE_KEY = "saacare:providers-view";

/**
 * Préférence d'affichage conservée d'une visite à l'autre.
 * La liste est le mode par défaut : elle aligne note, commune et tarif, ce qui
 * rend la comparaison immédiate. La grille reste disponible d'un clic.
 */
function readStoredView() {
  if (typeof window === "undefined") return "list";
  try {
    return window.localStorage.getItem(VIEW_STORAGE_KEY) === "grid" ? "grid" : "list";
  } catch {
    return "list";
  }
}

function readSearch(search) {
  const params = new URLSearchParams(search);
  return {
    domaine: params.get("domaine") ?? "",
    commune: params.get("commune") ?? "",
    q: params.get("q") ?? "",
  };
}

export default function FindProvider() {
  const location = useLocation();
  const navigate = useNavigate();
  const initial = readSearch(location.search);

  const [query, setQuery] = useState(initial.q);
  const [domainSlug, setDomainSlug] = useState(initial.domaine);
  const [commune, setCommune] = useState(initial.commune);
  const [sort, setSort] = useState("note");
  const [view, setView] = useState(readStoredView);
  const [selected, setSelected] = useState(null);
  const reduced = useIsReducedMotion();

  const changeView = (next) => {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      /* Stockage indisponible (navigation privée) : la préférence reste locale à la session. */
    }
  };

  /* L'URL reflète la recherche pour qu'elle reste partageable et navigable. */
  const syncUrl = (next = {}) => {
    const state = { q: query, domaine: domainSlug, commune, ...next };
    const params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.domaine) params.set("domaine", state.domaine);
    if (state.commune) params.set("commune", state.commune);
    const qs = params.toString();
    navigate(qs ? `${location.pathname}?${qs}` : location.pathname, { replace: true });
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = providers.filter((p) => {
      const matchDomain = !domainSlug || p.domainSlug === domainSlug;
      const matchCommune = !commune || p.commune === commune;
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.commune.toLowerCase().includes(q);
      return matchDomain && matchCommune && matchQuery;
    });

    if (sort === "note") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "prix") list = [...list].sort((a, b) => a.priceFrom - b.priceFrom);
    if (sort === "experience") list = [...list].sort((a, b) => b.experience - a.experience);
    if (sort === "pertinence") {
      list = [...list].sort((a, b) =>
        b.topRated === a.topRated ? b.rating - a.rating : b.topRated ? 1 : -1
      );
    }
    return list;
  }, [query, domainSlug, commune, sort]);

  const applyDomain = (slug) => {
    setDomainSlug(slug);
    syncUrl({ domaine: slug });
  };

  const resetFilters = () => {
    setQuery("");
    setDomainSlug("");
    setCommune("");
    setSort("note");
    navigate(location.pathname, { replace: true });
  };

  const activeDomain = domains.find((d) => d.slug === domainSlug);
  const hasFilters = Boolean(query.trim() || domainSlug || commune);

  return (
    <>
      <Seo
        title="Trouver un prestataire"
        description="Recherchez un prestataire vérifié par domaine, commune et disponibilité à Kinshasa : garde d'enfants, chauffeur, soutien scolaire, services à domicile."
        path="/trouver-un-prestataire"
      />

      <PageHero
        eyebrow="Recherche"
        title="Trouver un prestataire"
        subtitle={
          activeDomain
            ? `Prestataires ${activeDomain.shortName} vérifiés, disponibles à Kinshasa.`
            : "Parcourez nos prestataires vérifiés dans les quatre domaines SaaCare."
        }
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Trouver un prestataire" }]}
        compact
      />

      <section className="bg-paper-100 pb-16 pt-8 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ---------------- Barre de recherche ---------------- */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              syncUrl();
              e.currentTarget.querySelector("input")?.blur();
            }}
            role="search"
            aria-label="Rechercher un prestataire"
            className="rounded-lg border border-ink-900/8 bg-white p-3 shadow-soft sm:p-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              {/* Recherche libre */}
              <div className="flex flex-1 items-center gap-2.5 rounded-md border border-ink-900/10 bg-paper-100/70 px-3.5 transition-[border-color,background-color,box-shadow] duration-300 focus-within:border-teal-600/40 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(159,26,74,0.10)]">
                <Search className="size-4 shrink-0 text-ink-900/35" aria-hidden="true" />
                <label className="sr-only" htmlFor="search-query">
                  Rechercher par nom ou ville
                </label>
                <input
                  id="search-query"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher par nom, ville…"
                  className="w-full border-0 bg-transparent py-3 text-sm text-ink-900 outline-none placeholder:text-ink-900/40 [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      syncUrl({ q: "" });
                    }}
                    aria-label="Effacer la recherche"
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-ink-900/8 text-ink-900/50 transition-colors hover:bg-ink-900/15 hover:text-ink-900"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Sélecteurs */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:flex lg:shrink-0">
                <SelectFilter
                  id="filter-domain"
                  label="Domaine"
                  value={domainSlug}
                  onChange={(v) => {
                    setDomainSlug(v);
                    syncUrl({ domaine: v });
                  }}
                >
                  <option value="">Tous les domaines</option>
                  {domains.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.shortName}
                    </option>
                  ))}
                </SelectFilter>

                <SelectFilter
                  id="filter-commune"
                  label="Commune"
                  value={commune}
                  onChange={(v) => {
                    setCommune(v);
                    syncUrl({ commune: v });
                  }}
                >
                  <option value="">Toutes les communes</option>
                  {COMMUNES.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(", Kinshasa", "")}
                    </option>
                  ))}
                </SelectFilter>

                <SelectFilter id="filter-sort" label="Trier par" value={sort} onChange={setSort}>
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </SelectFilter>
              </div>

              <motion.button
                type="submit"
                whileHover={reduced ? undefined : { scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="shine relative inline-flex w-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-md bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-colors duration-300 hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 sm:w-auto"
              >
                <SlidersHorizontal className="relative z-10 size-4 lg:hidden" aria-hidden="true" />
                <span className="relative z-10">Filtrer</span>
              </motion.button>
            </div>
          </form>

          {/* ---------------- Compteur + onglets de domaine ---------------- */}
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-900/70" aria-live="polite">
                <span>
                  <span className="font-semibold text-ink-900">{results.length}</span> prestataire
                  {results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
                </span>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex min-h-10 items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50 hover:text-teal-800"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                    Réinitialiser
                  </button>
                )}
              </p>

              {/* Bascule grille / liste — visible partout, y compris mobile */}
              <div
                className="flex shrink-0 items-center gap-1 rounded-lg border border-ink-900/8 bg-paper-100/80 p-1"
                role="group"
                aria-label="Mode d'affichage"
              >
                <ViewToggle
                  active={view === "grid"}
                  onClick={() => changeView("grid")}
                  label="Affichage en grille"
                >
                  <LayoutGrid className="size-4" aria-hidden="true" />
                </ViewToggle>
                <ViewToggle
                  active={view === "list"}
                  onClick={() => changeView("list")}
                  label="Affichage en liste"
                >
                  <List className="size-4" aria-hidden="true" />
                </ViewToggle>
              </div>
            </div>

            <div
              className="min-w-0 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]"
              role="group"
              aria-label="Filtrer par domaine"
            >
              <LayoutGroup id="domain-filter">
                <div className="inline-flex min-w-min gap-1 rounded-lg border border-ink-900/8 bg-paper-100/80 p-1">
                  <DomainChip active={domainSlug === ""} onClick={() => applyDomain("")}>
                    Tous
                  </DomainChip>
                  {domains.map((d) => (
                    <DomainChip
                      key={d.slug}
                      active={domainSlug === d.slug}
                      onClick={() => applyDomain(d.slug)}
                      icon={<DomainIcon name={d.icon} className="size-3.5" />}
                    >
                      {d.shortName}
                    </DomainChip>
                  ))}
                </div>
              </LayoutGroup>
            </div>
          </div>

          {/* ---------------- Résultats ---------------- */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              {results.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="flex flex-col items-center gap-5 rounded-lg border border-ink-900/6 bg-paper-200/50 px-6 py-20 text-center"
                >
                  <motion.span
                    animate={reduced ? undefined : { y: [0, -6, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="grid size-16 place-items-center rounded-full bg-white shadow-soft"
                  >
                    <SearchX className="size-8 text-ink-900/30" aria-hidden="true" />
                  </motion.span>
                  <div>
                    <p className="font-display text-2xl font-semibold text-teal-700">
                      Aucun prestataire trouvé
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-ink-900/60">
                      Essayez d'élargir vos critères ou parcourez tous nos professionnels vérifiés.
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={resetFilters}
                    whileHover={reduced ? undefined : { scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-1 rounded-md bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition-colors duration-300 hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                  >
                    Voir tous les prestataires
                  </motion.button>
                </motion.div>
              ) : view === "list" ? (
                <motion.div
                  key={`list-${domainSlug}-${commune}-${sort}-${query}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ProviderTable
                    providers={results}
                    sort={sort}
                    onSort={setSort}
                    onSelect={setSelected}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`grid-${domainSlug}-${commune}-${sort}-${query}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {results.map((p, i) => (
                    <ProviderCard key={p.id} provider={p} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Détail du prestataire, ouvert au clic sur une ligne */}
      <ProviderDrawer provider={selected} onClose={() => setSelected(null)} />
    </>
  );
}

/* ---------------------------------------------------------------- */

/** Bouton de bascule grille / liste. */
function ViewToggle({ children, active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`grid size-10 place-items-center rounded-md transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 ${
        active ? "bg-white text-teal-700 shadow-soft" : "text-ink-900/45 hover:bg-white/70 hover:text-ink-900"
      }`}
    >
      {children}
    </button>
  );
}

/** Sélecteur compact de la barre de filtres. Le libellé reste accessible. */
function SelectFilter({ id, label, value, onChange, children }) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer rounded-md border border-ink-900/10 bg-white py-3 pl-3.5 pr-9 text-sm text-ink-900 outline-none transition-[border-color,box-shadow] duration-300 hover:border-ink-900/20 focus:border-teal-600/40 focus:shadow-[0_0_0_3px_rgba(159,26,74,0.10)] lg:w-auto"
      >
        {children}
      </select>
    </div>
  );
}

/** Onglet de domaine avec pastille active partagée (effet de glissement). */
function DomainChip({ children, icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "relative z-0 inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-md px-3.5 py-2.5 text-sm font-medium",
        "transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
        active
          ? "text-white"
          : "text-ink-900/60 hover:bg-white hover:text-ink-900 hover:shadow-sm active:bg-white active:text-ink-900",
      ].join(" ")}
    >
      {active && (
        <motion.span
          layoutId="domain-chip-pill"
          className="absolute inset-0 -z-10 rounded-md bg-teal-600 shadow-soft"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <span className={active ? "text-white" : "text-current"}>{icon}</span>
      <span className="relative">{children}</span>
    </button>
  );
}
