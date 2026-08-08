import { motion } from "motion/react";
import { ChevronRight, MapPin, Star, ArrowUp, ArrowDown } from "lucide-react";
import DomainIcon from "./DomainIcon";
import { getDomainBySlug } from "../../data/domains";
import { THEME } from "../../lib/theme";
import { EASE, useIsReducedMotion } from "../../lib/motion";

/**
 * Vue liste des prestataires. Sur grand écran, un vrai tableau : les colonnes
 * alignées permettent de comparer note, disponibilité et tarif d'un coup d'œil,
 * ce qu'une grille de cartes ne permet pas. En dessous de `lg`, les mêmes
 * données sont rendues en lignes empilées — jamais de défilement horizontal.
 *
 * Les en-têtes Note et Tarif pilotent le tri déjà présent dans la barre de
 * filtres : les deux commandes restent synchronisées.
 */
export default function ProviderTable({ providers, sort, onSort, onSelect }) {
  const reduced = useIsReducedMotion();

  return (
    <div className="overflow-hidden rounded-lg border border-ink-900/8 bg-white shadow-soft">
      {/* ---------------- Grand écran : tableau ---------------- */}
      <table className="hidden w-full border-collapse lg:table">
        <caption className="sr-only">
          Liste des prestataires vérifiés. Sélectionnez une ligne pour afficher le détail.
        </caption>
        <thead>
          <tr className="border-b border-ink-900/8 bg-paper-100/60">
            <Th className="w-[30%]">Prestataire</Th>
            <Th>Domaine</Th>
            <Th>Commune</Th>
            <Th sortKey="note" sort={sort} onSort={onSort}>
              Note
            </Th>
            <Th sortKey="prix" sort={sort} onSort={onSort}>
              Tarif / h
            </Th>
            <Th className="w-12">
              <span className="sr-only">Voir le détail</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider, index) => {
            const domain = getDomainBySlug(provider.domainSlug);
            const themeKey = domain?.theme ?? "navy";
            const theme = THEME[themeKey];
            const available = provider.availability === "Disponible aujourd'hui";

            return (
              <motion.tr
                key={provider.id}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.25), ease: EASE }}
                onClick={() => onSelect(provider)}
                className="group cursor-pointer border-b border-ink-900/6 transition-colors duration-200 last:border-b-0 hover:bg-paper-100/70"
              >
                {/* Prestataire */}
                <td className="relative py-3.5 pl-5 pr-3">
                  <span
                    className={`absolute inset-y-0 left-0 w-0.5 origin-center scale-y-0 transition-transform duration-300 group-hover:scale-y-100 ${theme.dot}`}
                    aria-hidden="true"
                  />
                  <span className="flex items-center gap-3">
                    <span className="relative shrink-0">
                      <span
                        className={`grid size-10 place-items-center rounded-full font-display text-sm font-semibold text-white ${theme.bg}`}
                        aria-hidden="true"
                      >
                        {provider.initials}
                      </span>
                      {available && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-teal-500"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(provider);
                          }}
                          className="truncate text-left font-display text-[0.95rem] font-semibold text-ink-900 transition-colors group-hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                        >
                          {provider.name}
                        </button>
                        {provider.topRated && (
                          <span className="shrink-0 rounded-md bg-gold-100 px-1.5 py-0.5 font-mono text-[0.58rem] font-semibold uppercase tracking-wide text-gold-800">
                            Top
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-xs text-ink-900/55">{provider.role}</span>
                    </span>
                  </span>
                </td>

                {/* Domaine */}
                <td className="px-3 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${theme.chip}`}
                  >
                    <DomainIcon name={domain?.icon} className="size-3.5" />
                    {domain?.shortName ?? "—"}
                  </span>
                </td>

                {/* Commune + disponibilité */}
                <td className="px-3 py-3.5">
                  <span className="flex items-center gap-1.5 text-sm text-ink-900/70">
                    <MapPin className="size-3.5 shrink-0 text-ink-900/35" aria-hidden="true" />
                    {provider.commune.replace(", Kinshasa", "")}
                  </span>
                  <span
                    className={`mt-0.5 block text-xs ${available ? "text-teal-700" : "text-ink-900/45"}`}
                  >
                    {provider.availability}
                  </span>
                </td>

                {/* Note */}
                <td className="px-3 py-3.5">
                  <span
                    className="flex items-center gap-1.5"
                    role="img"
                    aria-label={`Note ${provider.rating} sur 5, ${provider.reviews} avis`}
                  >
                    <Star className="size-3.5 shrink-0 fill-gold-500 text-gold-500" aria-hidden="true" />
                    <span className="text-sm font-semibold text-ink-900">
                      {provider.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-ink-900/50">({provider.reviews})</span>
                  </span>
                </td>

                {/* Tarif */}
                <td className="px-3 py-3.5">
                  <span className="whitespace-nowrap text-sm text-ink-900/55">
                    Dès{" "}
                    <span className="font-display text-base font-semibold text-ink-900">
                      {provider.priceFrom}$/Heure
                    </span>
                  </span>
                </td>

                {/* Chevron */}
                <td className="py-3.5 pl-3 pr-5 text-right">
                  <ChevronRight
                    className="ml-auto size-4 text-ink-900/25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-teal-700"
                    aria-hidden="true"
                  />
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>

      {/* ---------------- Mobile et tablette : lignes empilées ---------------- */}
      <ul className="divide-y divide-ink-900/6 lg:hidden">
        {providers.map((provider, index) => {
          const domain = getDomainBySlug(provider.domainSlug);
          const theme = THEME[domain?.theme ?? "navy"];
          const available = provider.availability === "Disponible aujourd'hui";

          return (
            <motion.li
              key={provider.id}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.25), ease: EASE }}
            >
              <button
                type="button"
                onClick={() => onSelect(provider)}
                className="flex min-h-[4.5rem] w-full items-center gap-3 p-4 text-left transition-colors duration-200 hover:bg-paper-100/70 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-500"
              >
                <span className="relative shrink-0">
                  <span
                    className={`grid size-11 place-items-center rounded-full font-display text-sm font-semibold text-white ${theme.bg}`}
                    aria-hidden="true"
                  >
                    {provider.initials}
                  </span>
                  {available && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-teal-500"
                      aria-hidden="true"
                    />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-display text-[0.95rem] font-semibold text-ink-900">
                      {provider.name}
                    </span>
                    {provider.topRated && (
                      <span className="shrink-0 rounded-md bg-gold-100 px-1.5 py-0.5 font-mono text-[0.55rem] font-semibold uppercase text-gold-800">
                        Top
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-ink-900/55">{provider.role}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-900/55">
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3 fill-gold-500 text-gold-500" aria-hidden="true" />
                      {provider.rating.toFixed(1)}
                    </span>
                    <span>{provider.commune.replace(", Kinshasa", "")}</span>
                    <span className="font-semibold text-ink-900">Dès {provider.priceFrom}$/Heure</span>
                  </span>
                </span>

                <ChevronRight className="size-4 shrink-0 text-ink-900/25" aria-hidden="true" />
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/** En-tête de colonne, cliquable lorsqu'un tri lui est associé. */
function Th({ children, className = "", sortKey, sort, onSort }) {
  const active = sortKey && sort === sortKey;
  const label = (
    <span
      className={`font-mono text-[0.62rem] uppercase tracking-[0.14em] ${
        active ? "text-teal-700" : "text-ink-900/45"
      }`}
    >
      {children}
    </span>
  );

  return (
    <th scope="col" className={`px-3 py-3 text-left first:pl-5 last:pr-5 ${className}`}>
      {sortKey ? (
        <button
          type="button"
          onClick={() => onSort(sortKey)}
          aria-sort={active ? "descending" : "none"}
          className="inline-flex items-center gap-1 transition-colors hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
        >
          {label}
          {active ? (
            sortKey === "prix" ? (
              <ArrowUp className="size-3 text-teal-700" aria-hidden="true" />
            ) : (
              <ArrowDown className="size-3 text-teal-700" aria-hidden="true" />
            )
          ) : (
            <ArrowDown className="size-3 text-ink-900/20" aria-hidden="true" />
          )}
        </button>
      ) : (
        label
      )}
    </th>
  );
}
