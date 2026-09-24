import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, Navigate, Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, Languages, BriefcaseBusiness, Clock, ShieldCheck, ArrowUpRight, X } from "lucide-react";
import Seo, { SITE } from "../lib/Seo";
import Rating from "../components/ui/Rating";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import RequestForm from "../components/ui/RequestForm";
import { AVAILABILITY, hasPublicRating } from "../data/providers";
import { getDomainBySlug } from "../data/domains";
import { api } from "../lib/api";
import { THEME } from "../lib/theme";
import { EASE } from "../lib/motion";
import { SkeletonPage } from "../components/ui/Skeleton";

export default function ProviderProfile() {
  const { reference } = useParams();
  const [provider, setProvider] = useState(null);
  const [status, setStatus] = useState("loading");
  const [demandeOpen, setDemandeOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!reference || reference === "null" || reference === "undefined") {
      setStatus("missing");
      return undefined;
    }
    let cancelled = false;
    setStatus("loading");
    api
      .provider(reference)
      .then((data) => {
        if (cancelled) return;
        setProvider(data.item);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
  }, [reference]);

  useEffect(() => {
    if (!demandeOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setDemandeOpen(false);
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [demandeOpen]);

  if (status === "missing") return <Navigate to="/404" replace />;
  if (status === "loading" || !provider) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <SkeletonPage label="Chargement du profil" />
      </div>
    );
  }

  const domain = getDomainBySlug(provider.domainSlug);
  const theme = THEME[domain?.theme ?? "teal"];
  const publicRating = hasPublicRating(provider);
  const languages = provider.languages || [];
  const zones = provider.zones || [];
  const skills = (provider.skills || []).slice(0, 4);
  const review = (provider.reviewsList || [])[0];

  return (
    <>
      <Seo
        title={`${provider.metier} vérifié à ${provider.commune} — ${provider.reference}`}
        description={`${provider.metier} ${provider.level.toLowerCase()} SaaCare à ${provider.commune}, ${provider.experience} ans d'expérience. Profil anonymisé, mise en relation par SaaCare.`}
        path={`/prestataires/${provider.reference}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `${provider.metier} — ${provider.reference}`,
          provider: { "@type": "LocalBusiness", name: "SaaCare", url: SITE },
          areaServed: zones.map((z) => ({ "@type": "Place", name: `${z}, Kinshasa` })),
          ...(publicRating && {
            aggregateRating: { "@type": "AggregateRating", ratingValue: provider.rating, reviewCount: provider.reviews },
          }),
        }}
      />

      <section className="border-b border-ink-900/8 bg-white py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-ink-900/70">
            <Link to="/prestataires" className="hover:text-ink-900">
              Prestataires
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink-900">{provider.reference}</span>
          </nav>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div
                className={`grid size-16 shrink-0 place-items-center rounded-2xl ${theme.bg} font-display text-2xl font-bold text-white`}
                aria-hidden="true"
              >
                {provider.initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wide text-navy-500">{provider.reference}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-xl font-bold text-ink-900 sm:text-2xl">{provider.metier}</h1>
                  <Badge label={provider.level} size="sm" />
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-900/75">
                  {publicRating ? <Rating value={provider.rating} reviews={provider.reviews} size="sm" /> : null}
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5 text-teal-600" aria-hidden="true" />
                    {provider.commune}
                  </span>
                </div>
              </div>
            </div>
            <Button type="button" size="md" withArrow className="w-full shrink-0 sm:w-auto" onClick={() => setDemandeOpen(true)}>
              Demander
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-paper-100 py-8 sm:py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Fact icon={BriefcaseBusiness} term="Expérience" detail={`${provider.experience} ans`} />
            <Fact icon={Languages} term="Langues" detail={languages.slice(0, 2).join(", ")} />
            <Fact icon={Clock} term="Dispo." detail={AVAILABILITY[provider.availability]} />
            <Fact icon={ShieldCheck} term="Sceau" detail={provider.seal} />
          </dl>

          <div className="rounded-2xl border border-ink-900/8 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-ink-900">SaaTrust</h2>
              <Link
                to={`/verifier?sceau=${provider.seal}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline"
              >
                Vérifier <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-2 text-sm text-ink-900/70">
              Identité, domicile et références contrôlés · revérification {provider.nextCheck}
            </p>
            {skills.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <li key={s} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                    {s}
                  </li>
                ))}
              </ul>
            )}
            {review && (
              <blockquote className="mt-3 border-t border-ink-900/8 pt-3 text-sm text-ink-900/80">
                « {review.text} »
                <footer className="mt-1 text-xs text-navy-600">
                  {review.firstName}, {review.commune}
                </footer>
              </blockquote>
            )}
          </div>

          <Button type="button" size="md" withArrow className="w-full sm:w-fit" onClick={() => setDemandeOpen(true)}>
            Demander ce prestataire
          </Button>
        </div>
      </section>

      {createPortal(
        <AnimatePresence>
          {demandeOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
              <motion.button
                type="button"
                aria-label="Fermer"
                className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setDemandeOpen(false)}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="relative z-10 flex max-h-[min(92vh,40rem)] w-full flex-col overflow-hidden rounded-t-2xl border border-ink-900/8 bg-white shadow-lifted sm:max-w-md sm:rounded-2xl"
              >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-ink-900/8 px-4 py-3.5">
                  <div>
                    <h2 id={titleId} className="font-display text-base font-bold text-ink-900">
                      Demander
                    </h2>
                    <p className="mt-0.5 text-xs text-ink-900/60">Disponibilité confirmée, rappel sous 24 h.</p>
                  </div>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={() => setDemandeOpen(false)}
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-900/50 transition-colors hover:bg-paper-200 hover:text-ink-900"
                    aria-label="Fermer la demande"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="overflow-y-auto px-4 py-3.5">
                  <RequestForm
                    domainSlug={provider.domainSlug}
                    providerReference={provider.reference}
                    defaultCommune={provider.commune || ""}
                    compact
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

function Fact({ icon: Icon, term, detail }) {
  return (
    <div className="rounded-xl border border-ink-900/8 bg-white px-3 py-3">
      <dt className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-navy-600">
        <Icon className="size-3 shrink-0" aria-hidden="true" />
        {term}
      </dt>
      <dd className="mt-1 truncate text-sm text-ink-900">{detail}</dd>
    </div>
  );
}
