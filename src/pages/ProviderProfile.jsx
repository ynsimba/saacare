import { useParams, Navigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, Languages, BriefcaseBusiness, CheckCircle2, Clock, Award, BadgeCheck, CalendarDays, ArrowUpRight } from "lucide-react";
import Seo, { SITE } from "../lib/Seo";
import Rating from "../components/ui/Rating";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import ProviderCard from "../components/ui/ProviderCard";
import RequestForm from "../components/ui/RequestForm";
import { Eyebrow } from "../components/ui/SectionHeading";
import { providers, getProviderByReference, AVAILABILITY, LEVELS, hasPublicRating } from "../data/providers";
import { getDomainBySlug } from "../data/domains";
import { saatrustSteps } from "../data/content";
import { THEME } from "../lib/theme";
import { fadeUp } from "../lib/motion";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const HALF_DAYS = ["Matin", "Après-midi"];

/** Calendrier simplifié par demi-journées, sans aucun détail sur les clients (§4.4). */
function weekGrid(provider) {
  const seed = [...provider.reference].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const base = provider.availability === "immediate" ? 0.75 : provider.availability === "week" ? 0.5 : 0.3;
  return DAYS.map((_, d) => HALF_DAYS.map((__, h) => ((seed * (d + 3) * (h + 7)) % 100) / 100 < base));
}

export default function ProviderProfile() {
  const { reference } = useParams();
  const provider = getProviderByReference(reference);
  if (!provider) return <Navigate to="/404" replace />;

  const domain = getDomainBySlug(provider.domainSlug);
  const theme = THEME[domain.theme];
  const metierRoot = provider.metier.split(" — ")[0];
  const similar = providers
    .filter((p) => p.reference !== provider.reference && p.metier.startsWith(metierRoot))
    .sort((a, b) => (b.commune === provider.commune) - (a.commune === provider.commune))
    .slice(0, 3);
  const grid = weekGrid(provider);
  const publicRating = hasPublicRating(provider);

  return (
    <>
      <Seo
        title={`${provider.metier} vérifié à ${provider.commune} — ${provider.reference}`}
        description={`${provider.metier} ${provider.level.toLowerCase()} SaaCare à ${provider.commune}, ${provider.experience} ans d'expérience, langues : ${provider.languages.join(", ")}. Profil anonymisé, mise en relation par SaaCare.`}
        path={`/prestataires/${provider.reference}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `${provider.metier} — ${provider.reference}`,
          provider: { "@type": "LocalBusiness", name: "SaaCare", url: SITE },
          areaServed: provider.zones.map((z) => ({ "@type": "Place", name: `${z}, Kinshasa` })),
          ...(publicRating && {
            aggregateRating: { "@type": "AggregateRating", ratingValue: provider.rating, reviewCount: provider.reviews },
          }),
        }}
      />

      {/* ---------------- En-tête ---------------- */}
      <section className="border-b border-ink-900/8 bg-white pb-10 pt-12 sm:pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-ink-900/70">
            <Link to="/" className="hover:text-ink-900">Accueil</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/prestataires?service=${domain.slug}`} className="hover:text-ink-900">{domain.name}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink-900">{provider.reference}</span>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className={`flex size-20 shrink-0 items-center justify-center rounded-3xl ${theme.bg} font-display text-3xl font-bold text-white`} aria-hidden="true">
                {provider.initials}
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-navy-500">{provider.reference}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{provider.metier}</h1>
                  <Badge label={provider.level} size="md" />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-900/80">
                  {publicRating ? <Rating value={provider.rating} reviews={provider.reviews} size="md" /> : <span>Moins de 3 évaluations</span>}
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-teal-600" aria-hidden="true" />
                    {provider.commune}
                  </span>
                </div>
              </div>
            </div>
            <Button href="#demande" size="lg" withArrow>
              Demander ce prestataire
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-paper-100 py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
          <div className="flex flex-col gap-6">
            {/* Faits clés */}
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-900/8 bg-ink-900/8 sm:grid-cols-4">
              <Fact icon={BriefcaseBusiness} term="Expérience" detail={`${provider.experience} ans`} />
              <Fact icon={Languages} term="Langues" detail={provider.languages.join(", ")} />
              <Fact icon={Clock} term="Disponibilité" detail={AVAILABILITY[provider.availability]} />
              <Fact icon={Award} term="Niveau" detail={provider.level} />
            </dl>

            {/* Bloc vérification */}
            <Card title="Vérification SaaTrust" eyebrow={`Sceau ${provider.seal}`}>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {saatrustSteps.map((s) => (
                  <li key={s.number} className="flex items-center gap-2.5 rounded-lg bg-paper-100 px-3 py-2.5 text-sm text-ink-900">
                    <CheckCircle2 className="size-4 shrink-0 text-teal-600" aria-hidden="true" />
                    <span className="flex-1">{s.title}</span>
                    <span className="text-xs text-navy-600">{provider.verifiedAt}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-col gap-2 border-t border-ink-900/8 pt-4 text-sm text-ink-900/80 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  {LEVELS[provider.level]} Prochaine revérification : <strong className="text-ink-900">{provider.nextCheck}</strong>.
                </p>
                <Link to={`/verifier?sceau=${provider.seal}`} className="inline-flex shrink-0 items-center gap-1 font-semibold text-teal-700 hover:underline">
                  Vérifier ce sceau <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card title="Compétences validées" eyebrow={`Test pratique · ${provider.verifiedAt}`}>
                <ul className="flex flex-wrap gap-2">
                  {provider.skills.map((s) => (
                    <li key={s} className="rounded-full bg-teal-50 px-3 py-1.5 text-sm text-teal-700">{s}</li>
                  ))}
                </ul>
              </Card>
              <Card title="Formations" eyebrow="Saa Academy">
                <ul className="flex flex-col gap-2">
                  {provider.trainings.map((t) => (
                    <li key={t} className="flex items-center gap-2 text-sm text-ink-900">
                      <BadgeCheck className="size-4 text-gold-600" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card title="Expérience au registre">
              <dl className="grid grid-cols-3 gap-4 text-center">
                {[
                  [provider.missions, "missions réalisées"],
                  [provider.hours, "heures cumulées"],
                  [provider.since, "entrée au registre"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dd className="font-display text-2xl font-bold text-teal-700">{value}</dd>
                    <dt className="text-xs text-ink-900/70">{label}</dt>
                  </div>
                ))}
              </dl>
            </Card>

            <Card title="Disponibilité" eyebrow="Semaine type, par demi-journée">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[26rem] border-separate border-spacing-1 text-center text-xs">
                  <caption className="sr-only">Disponibilités par demi-journée</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="sr-only">Créneau</th>
                      {DAYS.map((d) => (
                        <th key={d} scope="col" className="font-semibold text-navy-600">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HALF_DAYS.map((h, hi) => (
                      <tr key={h}>
                        <th scope="row" className="pr-2 text-left font-medium text-ink-900">{h}</th>
                        {grid.map((day, di) => (
                          <td key={DAYS[di]} className={`h-9 rounded-md ${day[hi] ? "bg-teal-600 text-white" : "bg-paper-200 text-ink-900/60"}`}>
                            {day[hi] ? "Libre" : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-900/70">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                Créneaux : {provider.slots.join(", ")}. Confirmés par votre chargé de clientèle.
              </p>
            </Card>

            <Card title="Avis clients">
              {provider.reviewsList.length ? (
                <ul className="flex flex-col gap-3">
                  {provider.reviewsList.slice(0, 3).map((r) => (
                    <li key={`${r.firstName}-${r.date}`} className="rounded-xl bg-paper-100 p-4">
                      <p className="text-sm leading-relaxed text-ink-900">« {r.text} »</p>
                      <p className="mt-2 text-xs font-medium text-navy-600">
                        {r.firstName}, {r.commune} · {r.date}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-900/75">Pas encore d'avis publié pour ce profil.</p>
              )}
            </Card>
          </div>

          {/* Demande de mise en relation */}
          <motion.div id="demande" variants={fadeUp} initial="hidden" animate="show" className="h-fit scroll-mt-24 rounded-2xl border border-ink-900/8 bg-white p-5 shadow-soft sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-bold text-ink-900">Demander ce prestataire</h2>
            <p className="mt-1 text-sm text-ink-900/75">Nous confirmons sa disponibilité et vous rappelons.</p>
            <RequestForm domainSlug={provider.domainSlug} providerReference={provider.reference} detailed className="mt-5" />
          </motion.div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="bg-white py-16" aria-labelledby="similar-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Eyebrow>Profils similaires</Eyebrow>
            <h2 id="similar-heading" className="mt-4 font-display text-2xl font-bold text-ink-900">Autres profils {metierRoot.toLowerCase()}</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p, i) => (
                <ProviderCard key={p.reference} provider={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Card({ title, eyebrow, children }) {
  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
        {eyebrow && <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">{eyebrow}</span>}
      </div>
      {children}
    </div>
  );
}

function Fact({ icon: Icon, term, detail }) {
  return (
    <div className="bg-white p-4">
      <dt className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-navy-600">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        {term}
      </dt>
      <dd className="mt-1 text-sm text-ink-900">{detail}</dd>
    </div>
  );
}
