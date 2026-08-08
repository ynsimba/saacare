import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { X, MapPin, Clock, BriefcaseBusiness, Languages, ArrowRight, ShieldAlert } from "lucide-react";
import Rating from "./Rating";
import Badge from "./Badge";
import DomainIcon from "./DomainIcon";
import { getDomainBySlug } from "../../data/domains";
import { THEME } from "../../lib/theme";
import { EASE, useIsReducedMotion } from "../../lib/motion";

/**
 * Aperçu détaillé d'un prestataire, ouvert depuis la liste. Il évite de quitter
 * les résultats pour consulter un profil, tout en laissant l'accès à la fiche
 * complète.
 *
 * Rendu via un portail sur `document.body` : la transition de page applique un
 * `filter`, ce qui créerait un bloc conteneur et rendrait `position: fixed`
 * relatif à la page plutôt qu'à la fenêtre.
 */
export default function ProviderDrawer({ provider, onClose }) {
  const panelRef = useRef(null);
  const reduced = useIsReducedMotion();

  /* Verrou du défilement, focus initial et fermeture au clavier. */
  useEffect(() => {
    if (!provider) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("button, a")?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [provider, onClose]);

  const domain = provider ? getDomainBySlug(provider.domainSlug) : null;
  const theme = THEME[domain?.theme ?? "navy"];
  const available = provider?.availability === "Disponible aujourd'hui";

  return createPortal(
    <AnimatePresence>
      {provider && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={`Profil de ${provider.name}`}>
          {/* Voile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panneau */}
          <motion.div
            ref={panelRef}
            initial={reduced ? { opacity: 0 } : { x: "100%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-lifted"
          >
            {/* En-tête coloré selon le domaine */}
            <div className={`relative shrink-0 px-6 pb-6 pt-6 text-white ${theme.bg}`}>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer le détail"
                className="absolute right-4 top-4 grid size-11 place-items-center rounded-md bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X className="size-4" aria-hidden="true" />
              </button>

              <div className="flex items-start gap-4 pr-12">
                <span className="relative shrink-0">
                  <span
                    className="grid size-14 place-items-center rounded-full bg-white/15 font-display text-lg font-semibold"
                    aria-hidden="true"
                  >
                    {provider.initials}
                  </span>
                  {available && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-white bg-teal-400"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-semibold leading-tight">{provider.name}</h2>
                  <p className="mt-0.5 text-sm text-white/75">{provider.role}</p>
                  {domain && (
                    <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1 text-xs font-medium">
                      <DomainIcon name={domain.icon} className="size-3.5" />
                      {domain.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Corps défilant */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <Rating value={provider.rating} reviews={provider.reviews} size="md" />

              <div className="mt-5 flex flex-wrap gap-1.5">
                {provider.badges.map((b) => (
                  <Badge key={b} label={b} />
                ))}
              </div>

              <p className="mt-5 text-sm leading-relaxed text-ink-900/70">{provider.bio}</p>

              <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-ink-900/8 bg-ink-900/6 sm:grid-cols-2">
                <Fact icon={MapPin} term="Zone d'intervention" detail={provider.commune} />
                <Fact icon={Clock} term="Disponibilité" detail={provider.availability} highlight={available} />
                <Fact icon={BriefcaseBusiness} term="Expérience" detail={`${provider.experience} ans`} />
                <Fact icon={Languages} term="Langues" detail={provider.languages.join(", ")} />
              </dl>

              {domain?.safety && (
                <div className="mt-5 flex gap-3 rounded-md border border-gold-200 bg-gold-100/50 p-4">
                  <ShieldAlert className="size-4 shrink-0 text-gold-700" aria-hidden="true" />
                  <p className="text-xs leading-relaxed text-ink-900/70">{domain.safety}</p>
                </div>
              )}
            </div>

            {/* Pied d'action */}
            <div className="shrink-0 border-t border-ink-900/8 bg-paper-100 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink-900/60">
                  Dès{" "}
                  <span className="font-display text-xl font-semibold text-ink-900">
                    {provider.priceFrom}$/Heure
                  </span>
                </p>
                <Link
                  to={`/prestataires/${provider.id}`}
                  className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 sm:w-auto"
                >
                  Voir le profil
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
              <p className="mt-2 text-center text-xs text-ink-900/45">
                Aucun paiement n'est débité avant confirmation du devis.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function Fact({ icon: Icon, term, detail, highlight = false }) {
  return (
    <div className="bg-white p-3.5">
      <dt className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink-900/40">
        <Icon className="size-3 shrink-0" aria-hidden="true" />
        {term}
      </dt>
      <dd className={`mt-1 text-sm ${highlight ? "font-medium text-teal-700" : "text-ink-900"}`}>
        {detail}
      </dd>
    </div>
  );
}
