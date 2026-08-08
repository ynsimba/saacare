import { useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Languages, BriefcaseBusiness, ShieldAlert, CheckCircle2 } from "lucide-react";
import Seo from "../lib/Seo";
import Rating from "../components/ui/Rating";
import Badge from "../components/ui/Badge";
import ProviderCard from "../components/ui/ProviderCard";
import { Eyebrow } from "../components/ui/SectionHeading";
import { getProviderById, getProvidersByDomain } from "../data/providers";
import { getDomainBySlug } from "../data/domains";
import { THEME } from "../lib/theme";
import { fadeUp } from "../lib/motion";

const REVIEW_POOL = [
  { author: "Client SaaCare", text: "Prestation impeccable, ponctuel et très professionnel. Je recommande sans hésiter." },
  { author: "Client SaaCare", text: "Communication claire du début à la fin, exactement ce qui était convenu dans le devis." },
  { author: "Client SaaCare", text: "Deuxième réservation avec ce prestataire, toujours aussi sérieux et à l'écoute." },
];

const DURATIONS = ["Journée", "Semaine", "Mois", "Durée indéterminée"];

export default function ProviderProfile() {
  const { id } = useParams();
  const provider = getProviderById(id);
  const [submitted, setSubmitted] = useState(false);
  const [duration, setDuration] = useState("Journée");

  if (!provider) return <Navigate to="/404" replace />;

  const domain = getDomainBySlug(provider.domainSlug);
  const theme = THEME[domain.theme];
  const similar = getProvidersByDomain(provider.domainSlug).filter((p) => p.id !== provider.id).slice(0, 3);

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Seo
        title={`${provider.name} — ${provider.role}`}
        description={`${provider.bio} Prestataire ${domain.name} vérifié, basé à ${provider.commune}.`}
        path={`/prestataires/${provider.id}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: provider.name,
          jobTitle: provider.role,
          address: provider.commune,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: provider.rating,
            reviewCount: provider.reviews,
          },
        }}
      />

      <section className="border-b border-ink-900/8 bg-white pb-10 pt-16 sm:pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-ink-900/65">
            <Link to="/" className="hover:text-ink-900">Accueil</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/domaines/${domain.slug}`} className="hover:text-ink-900">{domain.name}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink-900/70">{provider.name}</span>
          </nav>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div
                className={`flex size-20 shrink-0 items-center justify-center rounded-3xl ${theme.bg} font-display text-2xl font-semibold text-white shadow-lifted`}
                aria-hidden="true"
              >
                {provider.initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{provider.name}</h1>
                  {provider.topRated && <Badge label="Top prestataire" />}
                </div>
                <p className="mt-1 text-ink-900/65">{provider.role} · {domain.name}</p>
                <div className="mt-3">
                  <Rating value={provider.rating} reviews={provider.reviews} size="md" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {provider.badges.map((b) => (
              <Badge key={b} label={b} size="md" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper-100 py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div className="order-2 flex flex-col gap-10 lg:order-1">
            <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-ink-900">À propos</h2>
              <p className="mt-3 leading-relaxed text-ink-900/70">{provider.bio}</p>

              <ul className="mt-6 grid grid-cols-1 gap-4 border-t border-ink-900/8 pt-6 sm:grid-cols-3">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-teal-600" aria-hidden="true" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-900/65">Zone</p>
                    <p className="text-sm text-ink-900">{provider.commune}</p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-teal-600" aria-hidden="true" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-900/65">Expérience</p>
                    <p className="text-sm text-ink-900">{provider.experience} ans</p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Languages className="mt-0.5 size-4 shrink-0 text-teal-600" aria-hidden="true" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-900/65">Langues</p>
                    <p className="text-sm text-ink-900">{provider.languages.join(", ")}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex gap-3 rounded-2xl border border-gold-200 bg-gold-100/50 p-5">
              <ShieldAlert className="size-5 shrink-0 text-gold-700" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-ink-900/75">{domain.safety}</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink-900">Avis clients</h2>
              <div className="mt-5 flex flex-col gap-4">
                {REVIEW_POOL.map((review, i) => (
                  <div key={i} className="rounded-2xl border border-ink-900/8 bg-white p-5">
                    <Rating value={5} size="sm" />
                    <p className="mt-3 text-sm leading-relaxed text-ink-900/70">« {review.text} »</p>
                    <p className="mt-3 text-xs font-medium text-ink-900/65">{review.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Carte de réservation — en premier sur mobile pour rester accessible */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="order-1 h-fit rounded-2xl border border-ink-900/8 bg-white p-5 shadow-soft sm:p-6 lg:order-2 lg:sticky lg:top-28">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 py-6 text-center"
                  role="status"
                >
                  <CheckCircle2 className="size-10 text-teal-600" aria-hidden="true" />
                  <p className="font-display text-lg font-semibold text-ink-900">Demande envoyée</p>
                  <p className="text-sm leading-relaxed text-ink-900/65">
                    Notre équipe confirme la disponibilité de {provider.name.split(" ")[0]} et vous transmet un
                    devis avant tout paiement. Vous recevrez une notification dans votre espace client.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-2 text-sm font-semibold text-teal-700 underline underline-offset-4"
                  >
                    Modifier la demande
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={onSubmit} className="flex flex-col gap-5">
                  <div>
                    <p className="text-sm text-ink-900/65">Tarif indicatif</p>
                    <p className="font-display text-3xl font-semibold text-ink-900">
                      {provider.priceFrom}$
                      <span className="text-base font-normal text-ink-900/65">/Heure</span>
                    </p>
                  </div>

                  <fieldset>
                    <legend className="text-xs font-semibold uppercase tracking-wide text-ink-900/65">Type de contrat</legend>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {DURATIONS.map((d) => (
                        <label
                          key={d}
                          className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition-colors ${
                            duration === d ? "border-teal-600 bg-teal-50 text-teal-700" : "border-ink-900/10 text-ink-900/65 hover:border-ink-900/25"
                          }`}
                        >
                          <input
                            type="radio"
                            name="duration"
                            value={d}
                            checked={duration === d}
                            onChange={() => setDuration(d)}
                            className="sr-only"
                          />
                          {d}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <label htmlFor="booking-date" className="text-xs font-semibold uppercase tracking-wide text-ink-900/65">
                      Date souhaitée
                    </label>
                    <input
                      id="booking-date"
                      type="date"
                      required
                      className="mt-2 w-full rounded-xl border border-ink-900/10 bg-paper-100 px-3.5 py-2.5 text-sm text-ink-900 focus-visible:outline-2 focus-visible:outline-gold-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="booking-address" className="text-xs font-semibold uppercase tracking-wide text-ink-900/65">
                      Adresse d'intervention
                    </label>
                    <input
                      id="booking-address"
                      type="text"
                      required
                      placeholder="Commune, quartier, référence"
                      className="mt-2 w-full rounded-xl border border-ink-900/10 bg-paper-100 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-900/35 focus-visible:outline-2 focus-visible:outline-gold-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-md bg-coral-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral-600 focus-visible:outline-2 focus-visible:outline-gold-500"
                  >
                    Demander une réservation
                  </button>
                  <p className="text-center text-xs text-ink-900/65">
                    Aucun paiement n'est débité avant confirmation du devis.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="bg-white py-16 sm:py-20" aria-labelledby="similar-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Eyebrow tone={theme.text}>À découvrir aussi</Eyebrow>
            <h2 id="similar-heading" className="mt-4 font-display text-2xl font-semibold text-ink-900">
              Autres prestataires {domain.shortName}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p, i) => (
                <ProviderCard key={p.id} provider={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
