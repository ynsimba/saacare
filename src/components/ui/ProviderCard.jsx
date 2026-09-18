import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Rating from "./Rating";
import Badge from "./Badge";
import Spotlight from "./Spotlight";
import { getDomainBySlug } from "../../data/domains";
import { hasPublicRating } from "../../data/providers";
import { EASE, useIsReducedMotion } from "../../lib/motion";

/**
 * Carte prestataire compacte (cahier des charges §4.2) : photo/initiale,
 * métier, pôle, badge, avis. Fond teal unique pour toutes les cartes.
 * Le détail reste sur la fiche profil.
 */
export default function ProviderCard({ provider, index = 0 }) {
  const domain = getDomainBySlug(provider.domainSlug);
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
        as="article"
        tone="light"
        lift={6}
        className="flex h-full flex-col items-center overflow-hidden rounded-2xl bg-teal-600 px-4 pb-5 pt-0 text-center shadow-soft transition-shadow duration-500 hover:shadow-lifted"
      >
        <span className="h-1 w-3/5 shrink-0 rounded-b-2xl bg-teal-400" aria-hidden="true" />

        <div className="relative mt-5">
          <div
            className="flex h-16 w-14 items-center justify-center rounded-2xl bg-teal-400 font-display text-xl font-bold text-white"
            aria-hidden="true"
          >
            {provider.initials}
          </div>
          {available && (
            <span
              className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-gold-500 ring-2 ring-white/40"
              aria-hidden="true"
            />
          )}
        </div>

        <h3 className="mt-3 text-balance font-display text-base font-bold leading-snug text-white">
          {provider.metier}
        </h3>
        <p className="mt-0.5 text-xs font-medium text-white/65">{domain?.name ?? provider.domainSlug}</p>

        <div className="mt-2.5">
          <Badge label={provider.level} onDark />
        </div>

        <div className="mt-2.5 flex min-h-6 items-center justify-center">
          {hasPublicRating(provider) ? (
            <Rating value={provider.rating} reviews={provider.reviews} onDark />
          ) : (
            <p className="text-xs text-white/65">Nouveau au registre</p>
          )}
        </div>

        <div className="mt-auto pt-4">
          <Link
            to={`/prestataires/${provider.reference}`}
            className="group/cta inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md bg-white px-5 py-2 text-sm font-semibold text-teal-700 shadow-soft transition-colors duration-300 hover:bg-paper-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
