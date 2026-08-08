import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import Rating from "./Rating";
import Badge from "./Badge";
import Spotlight from "./Spotlight";
import { THEME } from "../../lib/theme";
import { getDomainBySlug } from "../../data/domains";
import { EASE, useIsReducedMotion } from "../../lib/motion";

export default function ProviderCard({ provider, index = 0 }) {
  const domain = getDomainBySlug(provider.domainSlug);
  const themeKey = domain?.theme ?? "navy";
  const theme = THEME[themeKey];
  const reduced = useIsReducedMotion();
  const available = provider.availability === "Disponible aujourd'hui";

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
        className="group flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-ink-900/8 bg-white p-5 shadow-soft transition-[box-shadow,border-color] duration-500 hover:border-ink-900/12 hover:shadow-lifted"
      >
        {provider.topRated && (
          <span
            className="pointer-events-none absolute right-0 top-0 rounded-bl-2xl bg-gold-700 px-3 py-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-wide text-white"
            aria-label="Top prestataire"
          >
            Top
          </span>
        )}

        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div
              className={`flex size-12 items-center justify-center rounded-full ${theme.bg} font-display text-base font-semibold text-white transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105`}
              aria-hidden="true"
            >
              {provider.initials}
            </div>
            {available && (
              <span
                className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full border-2 border-white bg-teal-500"
                aria-hidden="true"
              >
                <span className="absolute inline-flex size-2 rounded-full bg-teal-500 animate-pulse-ring" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold text-ink-900">{provider.name}</p>
            <p className="truncate text-sm text-ink-900/65">{provider.role}</p>
          </div>
        </div>

        <Rating value={provider.rating} reviews={provider.reviews} />

        <div className="flex flex-wrap gap-1.5">
          {provider.badges.slice(0, 2).map((b) => (
            <Badge key={b} label={b} />
          ))}
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-ink-900/65">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-ink-900/40" aria-hidden="true" />
            <span className="truncate">{provider.commune}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0 text-ink-900/40" aria-hidden="true" /> {provider.availability}
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-ink-900/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-900/65">
            Dès{" "}
            <span className="font-display text-lg font-semibold text-ink-900">
              {provider.priceFrom}$/Heure
            </span>
          </p>
          <Link
            to={`/prestataires/${provider.id}`}
            className={`group/cta inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-semibold transition-all duration-300 sm:w-auto sm:min-h-0 sm:py-2 ${theme.chip} hover:brightness-95 focus-visible:outline-2 focus-visible:outline-gold-500`}
          >
            Voir le profil
            <ArrowRight
              className="size-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </Spotlight>
    </motion.div>
  );
}
