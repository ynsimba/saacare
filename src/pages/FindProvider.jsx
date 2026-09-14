import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { SearchX, SlidersHorizontal, X, Info, ShieldCheck } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import ProviderCard from "../components/ui/ProviderCard";
import RequestForm from "../components/ui/RequestForm";
import { domains, getDomainBySlug } from "../data/domains";
import { providers, hasPublicRating } from "../data/providers";
import { COMMUNES, LANGUAGES, METIERS } from "../data/providerForm";
import { FREQUENCIES } from "../data/site";
import { EASE } from "../lib/motion";

const PAGE_SIZE = 12;
const LEVEL_WEIGHT = { "Élite": 3, "Certifié": 2, "Vérifié": 1 };
const AVAIL_WEIGHT = { immediate: 2, week: 1, planning: 0 };

const SORTS = [
  { value: "pertinence", label: "Pertinence" },
  { value: "note", label: "Note la plus élevée" },
  { value: "experience", label: "Expérience" },
  { value: "dispo", label: "Disponibilité immédiate" },
];

const EXPERIENCE = [
  { value: "moins-2", label: "Moins de 2 ans", test: (y) => y < 2 },
  { value: "2-5", label: "2 à 5 ans", test: (y) => y >= 2 && y <= 5 },
  { value: "plus-5", label: "Plus de 5 ans", test: (y) => y > 5 },
];

const AVAILABILITIES = [
  { value: "immediate", label: "Immédiatement" },
  { value: "week", label: "Sous 7 jours" },
  { value: "planning", label: "Sur planning" },
];

const GENDERS = [
  { value: "", label: "Indifférent" },
  { value: "F", label: "Femme" },
  { value: "M", label: "Homme" },
];

const LICENCES = ["Permis de conduire", "Véhicule personnel", "Moto"];
const SLOTS = ["Jour", "Nuit", "Jour et nuit en relais"];

const LIST_KEYS = ["commune", "niveau", "langues", "permis", "creneau"];

/** Les filtres vivent dans l'adresse : chaque recherche reste partageable et indexable (§4.2). */
function readFilters(params) {
  const f = Object.fromEntries(params.entries());
  LIST_KEYS.forEach((k) => {
    f[k] = f[k] ? f[k].split(",").filter(Boolean) : [];
  });
  return f;
}

export default function FindProvider() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [panelOpen, setPanelOpen] = useState(false);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    const serialized = Array.isArray(value) ? value.join(",") : value;
    if (serialized === "" || serialized == null) next.delete(key);
    else next.set(key, serialized);
    if (key === "service") next.delete("metier");
    setParams(next, { replace: true });
  };
  const toggle = (key, value) => {
    const list = filters[key];
    update(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };
  const reset = () => setParams(new URLSearchParams(), { replace: true });

  useEffect(() => setVisible(PAGE_SIZE), [params]);

  const domain = getDomainBySlug(filters.service);
  const metiers = METIERS.filter((m) => !filters.service || m.pole === filters.service);
  const metierLabel = METIERS.find((m) => m.value === filters.metier)?.label;

  const results = useMemo(() => {
    const minRating = Number(filters.note) || 0;
    const exp = EXPERIENCE.find((e) => e.value === filters.experience);
    const selectedCommunes = new Set(filters.commune);

    const list = providers.filter((p) => {
      if (filters.service && p.domainSlug !== filters.service) return false;
      if (metierLabel && !p.metier.toLowerCase().startsWith(metierLabel.toLowerCase())) return false;
      if (selectedCommunes.size && !p.zones.some((z) => selectedCommunes.has(z))) return false;
      if (filters.niveau.length && !filters.niveau.includes(p.level)) return false;
      if (minRating && (!hasPublicRating(p) || p.rating < minRating)) return false;
      if (exp && !exp.test(p.experience)) return false;
      if (filters.langues.length && !filters.langues.every((l) => p.languages.includes(l))) return false;
      if (filters.dispo && p.availability !== filters.dispo) return false;
      if (filters.genre && p.gender !== filters.genre) return false;
      if (filters.permis.length && !filters.permis.every((x) => (p.licence ?? []).includes(x))) return false;
      if (filters.creneau.length && !filters.creneau.some((s) => p.slots.includes(s))) return false;
      return true;
    });

    const rating = (p) => (hasPublicRating(p) ? p.rating : 0);
    const communeMatch = (p) => (selectedCommunes.has(p.commune) ? 1 : 0);
    const sorters = {
      pertinence: (a, b) =>
        LEVEL_WEIGHT[b.level] * 2 + rating(b) + communeMatch(b) + AVAIL_WEIGHT[b.availability] -
        (LEVEL_WEIGHT[a.level] * 2 + rating(a) + communeMatch(a) + AVAIL_WEIGHT[a.availability]),
      note: (a, b) => rating(b) - rating(a),
      experience: (a, b) => b.experience - a.experience,
      dispo: (a, b) => AVAIL_WEIGHT[b.availability] - AVAIL_WEIGHT[a.availability],
    };
    return [...list].sort(sorters[filters.tri] ?? sorters.pertinence);
  }, [filters, metierLabel]);

  const activeCount = [...params.keys()].filter((k) => k !== "tri" && k !== "frequence").length;

  const filterPanel = (
    <div className="flex flex-col gap-6">
      <Group label="Service">
        <select value={filters.service ?? ""} onChange={(e) => update("service", e.target.value)} className={selectClass} aria-label="Pôle">
          <option value="">Tous les pôles</option>
          {domains.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
              {d.available ? "" : ` (${d.phase})`}
            </option>
          ))}
        </select>
        <select value={filters.metier ?? ""} onChange={(e) => update("metier", e.target.value)} className={`${selectClass} mt-2`} aria-label="Métier">
          <option value="">Tous les métiers</option>
          {metiers.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </Group>

      <Group label="Langues parlées">
        <Chips options={LANGUAGES.map((l) => ({ value: l, label: l }))} selected={filters.langues} onToggle={(v) => toggle("langues", v)} />
      </Group>

      <Group label="Communes">
        <div className="grid max-h-44 grid-cols-2 gap-x-2 overflow-y-auto rounded-lg border border-ink-900/10 bg-white p-2">
          {COMMUNES.map((c) => (
            <Check key={c} label={c} checked={filters.commune.includes(c)} onChange={() => toggle("commune", c)} />
          ))}
        </div>
      </Group>

      <Group label="Fréquence">
        <Segmented name="frequence" options={[{ value: "", label: "Toutes" }, ...FREQUENCIES]} value={filters.frequence ?? ""} onChange={(v) => update("frequence", v)} />
        <p className="mt-1.5 text-xs text-ink-900/65">Elle détermine le contrat proposé lors de la confirmation.</p>
      </Group>

      <Group label="Niveau de certification">
        {["Vérifié", "Certifié", "Élite"].map((l) => (
          <Check key={l} label={l} checked={filters.niveau.includes(l)} onChange={() => toggle("niveau", l)} />
        ))}
      </Group>

      <Group label={`Note minimale : ${filters.note ? `${Number(filters.note).toFixed(1)} / 5` : "toutes"}`}>
        <input type="range" min="3" max="5" step="0.1" value={filters.note || 3} onChange={(e) => update("note", e.target.value === "3" ? "" : e.target.value)} className="w-full accent-[#01433D]" aria-label="Note minimale" />
        <p className="text-xs text-ink-900/65">Les profils de moins de 3 évaluations sont exclus de ce filtre.</p>
      </Group>

      <Group label="Expérience">
        <Segmented name="experience" options={[{ value: "", label: "Toutes" }, ...EXPERIENCE]} value={filters.experience ?? ""} onChange={(v) => update("experience", v)} />
      </Group>

      <Group label="Disponibilité">
        <Segmented name="dispo" options={[{ value: "", label: "Toutes" }, ...AVAILABILITIES]} value={filters.dispo ?? ""} onChange={(v) => update("dispo", v)} />
      </Group>

      <Group label="Genre du prestataire">
        <Segmented name="genre" options={GENDERS} value={filters.genre ?? ""} onChange={(v) => update("genre", v)} />
      </Group>

      <Group label="Créneau d'intervention">
        {SLOTS.map((s) => (
          <Check key={s} label={s} checked={filters.creneau.includes(s)} onChange={() => toggle("creneau", s)} />
        ))}
      </Group>

      <Group label="Permis et véhicule">
        {LICENCES.map((l) => (
          <Check key={l} label={l} checked={filters.permis.includes(l)} onChange={() => toggle("permis", l)} />
        ))}
      </Group>
    </div>
  );

  return (
    <>
      <Seo
        title={domain ? `${domain.name} — prestataires vérifiés à Kinshasa` : "Trouver un prestataire"}
        description="Recherchez un agent vérifié à Kinshasa par service, commune, langue, niveau de certification et disponibilité. Profils anonymisés, sans inscription."
        path={`/prestataires${params.toString() ? `?${params}` : ""}`}
      />

      <PageHero
        eyebrow="Recherche sans inscription"
        title="Trouver un prestataire"
        subtitle={domain ? `Agents ${domain.shortName} vérifiés, à Kinshasa.` : "Des profils vérifiés et anonymisés. La mise en relation passe toujours par un chargé de clientèle SaaCare."}
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Trouver un prestataire" }]}
        compact
      />

      <section className="bg-paper-100 pb-16 pt-8 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 flex items-start gap-2.5 rounded-xl bg-sky px-4 py-3 text-sm text-ink-900">
            <Info className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
            Profils de démonstration, en attendant l'ouverture du registre. Aucun nom ni aucune coordonnée d'agent n'est jamais publié.
          </p>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[18rem_1fr]">
            {/* ---------------- Filtres ---------------- */}
            <aside className="hidden lg:block" aria-label="Filtres">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-ink-900/8 bg-white p-5 shadow-soft">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-ink-900">Filtres</h2>
                  {activeCount > 0 && (
                    <button type="button" onClick={reset} className="text-sm font-semibold text-teal-700 hover:underline">
                      Tout effacer
                    </button>
                  )}
                </div>
                {filterPanel}
              </div>
            </aside>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-ink-900/80" aria-live="polite">
                  <span className="font-semibold text-ink-900">{results.length}</span> profil{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPanelOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink-900/10 bg-white px-4 text-sm font-semibold text-ink-900 lg:hidden">
                    <SlidersHorizontal className="size-4" aria-hidden="true" />
                    Filtres{activeCount ? ` (${activeCount})` : ""}
                  </button>
                  <label htmlFor="sort" className="sr-only">
                    Trier par
                  </label>
                  <select id="sort" value={filters.tri ?? "pertinence"} onChange={(e) => update("tri", e.target.value === "pertinence" ? "" : e.target.value)} className={`${selectClass} min-h-11 w-auto`}>
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                {results.length === 0 ? (
                  <EmptyState domainSlug={filters.service} hasCommune={filters.commune.length > 0} onWiden={() => update("commune", [])} onReset={reset} />
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {results.slice(0, visible).map((p, i) => (
                        <ProviderCard key={p.reference} provider={p} index={i} />
                      ))}
                    </div>
                    {visible < results.length && (
                      <div className="mt-8 flex justify-center">
                        <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="min-h-12 rounded-lg border border-teal-600 bg-white px-6 text-sm font-semibold text-teal-700 hover:bg-teal-50">
                          Afficher {Math.min(PAGE_SIZE, results.length - visible)} profils de plus
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <p className="mt-10 flex items-start gap-2.5 text-sm text-ink-900/75">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal-600" aria-hidden="true" />
                Tous les profils ont passé les 7 contrôles du protocole SaaTrust. Le filtre de genre est documenté dans nos conditions générales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Panneau de filtres mobile ---------------- */}
      <AnimatePresence>
        {panelOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtres">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanelOpen(false)} className="absolute inset-0 bg-ink-950/50" aria-hidden="true" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.4, ease: EASE }} className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl bg-white">
              <div className="flex items-center justify-between border-b border-ink-900/8 px-5 py-4">
                <h2 className="font-display text-lg font-bold text-ink-900">Filtres</h2>
                <button type="button" onClick={() => setPanelOpen(false)} aria-label="Fermer les filtres" className="grid size-11 place-items-center rounded-full hover:bg-ink-900/5">
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">{filterPanel}</div>
              <div className="flex gap-3 border-t border-ink-900/8 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button type="button" onClick={reset} className="min-h-12 flex-1 rounded-lg border border-ink-900/15 text-sm font-semibold text-ink-900">
                  Effacer
                </button>
                <button type="button" onClick={() => setPanelOpen(false)} className="min-h-12 flex-[2] rounded-lg bg-teal-600 text-sm font-semibold text-white">
                  Voir {results.length} profil{results.length > 1 ? "s" : ""}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

const selectClass =
  "w-full cursor-pointer rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-teal-600";

function Group({ label, children }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-navy-600">{label}</legend>
      {children}
    </fieldset>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm text-ink-900">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 shrink-0 accent-[#01433D]" />
      {label}
    </label>
  );
}

function Chips({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = selected.includes(o.value);
        return (
          <button key={o.value} type="button" aria-pressed={active} onClick={() => onToggle(o.value)} className={`min-h-9 rounded-full border px-3 text-xs font-medium transition-colors ${active ? "border-teal-600 bg-teal-600 text-white" : "border-ink-900/15 bg-white text-ink-900 hover:border-teal-600/50"}`}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Segmented({ name, options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button key={o.value || "all"} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)} className={`min-h-9 rounded-lg border px-3 text-xs font-medium transition-colors ${value === o.value ? "border-teal-600 bg-teal-50 text-teal-700" : "border-ink-900/15 bg-white text-ink-900 hover:border-teal-600/50"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Aucun résultat : élargir aux communes voisines, ou être prévenu (§4.2). */
function EmptyState({ domainSlug, hasCommune, onWiden, onReset }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-ink-900/8 bg-white p-6">
        <SearchX className="size-8 text-navy-500" aria-hidden="true" />
        <p className="font-display text-xl font-bold text-ink-900">Aucun profil ne correspond, pour l'instant</p>
        <p className="text-sm leading-relaxed text-ink-900/75">Élargissez la recherche, ou laissez vos coordonnées : nous vous prévenons dès qu'un agent vérifié correspond.</p>
        <div className="flex flex-wrap gap-3">
          {hasCommune && (
            <button type="button" onClick={onWiden} className="min-h-11 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white">
              Élargir aux communes voisines
            </button>
          )}
          <button type="button" onClick={onReset} className="min-h-11 rounded-lg border border-teal-600 px-4 text-sm font-semibold text-teal-700">
            Effacer les filtres
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6">
        <p className="font-display text-lg font-bold text-ink-900">Prévenez-moi quand un profil correspond</p>
        <RequestForm domainSlug={domainSlug ?? ""} className="mt-4" />
      </div>
    </div>
  );
}
