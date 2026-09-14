import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, Clock, ArrowRight, Languages, BriefcaseBusiness } from "lucide-react";
import Rating from "./Rating";
import Badge from "./Badge";
import Spotlight from "./Spotlight";
import { THEME } from "../../lib/theme";
import { getDomainBySlug } from "../../data/domains";
import { AVAILABILITY, hasPublicRating } from "../../data/providers";
import { EASE, useIsReducedMotion } from "../../lib/motion";

/**
 * Carte prestataire anonymisée (cahier des charges §4.2) : référence, métier,
 * commune, note, niveau de certification, expérience, langues,
 * disponibilité. Aucun nom, aucune photo identifiable, aucune coordonnée.
 */
export default function ProviderCard({ provider, index = 0 }) {
  const domain = getDomainBySlug(provider.domainSlug);
  const themeKey = domain?.theme ?? "teal";
  const theme = THEME[themeKey];
  const reduced = useIsReducedMotion();
  const available = provider.availability === "immediate";

  return (
    <motion.div
      layout
      initial={reduced ? false : { opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.35), ease: EASE }}
      className="h-full"
    >
      <Spotlight
        tone={themeKey}
        lift={6}
        className="group flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-ink-900/8 bg-white p-5 shadow-soft transition-[box-shadow,border-color] duration-500 hover:border-ink-900/15 hover:shadow-lifted"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              {/* Avatar généré à partir de l'initiale du prénom, jamais de photo non traitée */}
              <div
                className={`flex size-12 items-center justify-center rounded-full ${theme.bg} font-display text-lg font-bold text-white`}
                aria-hidden="true"
              >
                {provider.initials}
              </div>
              {available && (
                <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white bg-gold-500" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-bold text-ink-900">{provider.metier}</p>
              <p className="truncate text-xs font-medium tracking-wide text-navy-500">{provider.reference}</p>
            </div>
          </div>
          <Badge label={provider.level} />
        </div>

        {hasPublicRating(provider) ? (
          <Rating value={provider.rating} reviews={provider.reviews} />
        ) : (
          <p className="text-sm text-ink-900/65">Nouveau au registre — moins de 3 évaluations</p>
        )}

        <ul className="flex flex-col gap-1.5 text-sm text-ink-900/75">
          <li className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-teal-600" aria-hidden="true" />
            <span className="truncate">{provider.commune}</span>
          </li>
          <li className="inline-flex items-center gap-1.5">
            <BriefcaseBusiness className="size-3.5 shrink-0 text-teal-600" aria-hidden="true" />
            {provider.experience} ans d'expérience
          </li>
          <li className="inline-flex min-w-0 items-center gap-1.5">
            <Languages className="size-3.5 shrink-0 text-teal-600" aria-hidden="true" />
            <span className="truncate">{provider.languages.join(", ")}</span>
          </li>
          <li className={`inline-flex items-center gap-1.5 ${available ? "font-medium text-teal-700" : ""}`}>
            <Clock className="size-3.5 shrink-0 text-teal-600" aria-hidden="true" />
            {AVAILABILITY[provider.availability]}
          </li>
        </ul>

        <div className="mt-auto flex flex-col gap-3 border-t border-ink-900/8 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <Link
            to={`/prestataires/${provider.reference}`}
            className="group/cta inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-teal-700 sm:w-auto"
          >
            Voir le profil
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5" aria-hidden="true" />
            <span className="sr-only"> {provider.reference}</span>
          </Link>
        </div>
      </Spotlight>
    </motion.div>
  );
}
