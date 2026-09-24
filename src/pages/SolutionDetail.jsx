import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Check, X, ShieldCheck, AlertTriangle, CalendarHeart, ArrowUpRight, Info, ChevronDown } from "lucide-react";
import Seo, { SITE } from "../lib/Seo";
import Button from "../components/ui/Button";
import DomainIcon from "../components/ui/DomainIcon";
import ProviderCard from "../components/ui/ProviderCard";
import PageHero from "../components/ui/PageHero";
import { Eyebrow } from "../components/ui/SectionHeading";
import { getDomainBySlug, domains } from "../data/domains";
import { api } from "../lib/api";

/**
 * Gabarit des pages de pôle — optimisé mobile :
 * hero compact → (scope Walé repliable) → sélection/garanties → profils → autres pôles.
 */
export default function SolutionDetail() {
  const { slug } = useParams();
  const domain = getDomainBySlug(slug);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    if (!domain) return undefined;
    let cancelled = false;
    api
      .providers({ domaine: domain.slug })
      .then((data) => {
        if (!cancelled) setProfiles((data.items || []).slice(0, 1));
      })
      .catch(() => {
        if (!cancelled) setProfiles([]);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, domain]);

  if (!domain) return <Navigate to="/404" replace />;

  const otherDomains = domains.filter((d) => d.slug !== domain.slug);
  const url = `${SITE}/solutions/${domain.slug}`;
  const selectionPreview = domain.selection.slice(0, 3);

  return (
    <>
      <Seo
        title={`${domain.name} — ${domain.tagline}`}
        description={`${domain.description} Agents vérifiés en 7 étapes à Kinshasa.`}
        path={`/solutions/${domain.slug}`}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: domain.name,
            serviceType: domain.tagline,
            description: domain.description,
            provider: { "@type": "LocalBusiness", name: "SaaCare", url: SITE },
            areaServed: { "@type": "City", name: "Kinshasa" },
            url,
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: domain.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE}/` },
              { "@type": "ListItem", position: 2, name: "Nos solutions", item: `${SITE}/solutions` },
              { "@type": "ListItem", position: 3, name: domain.name, item: url },
            ],
          },
        ]}
      />

      <PageHero
        key={domain.slug}
        eyebrow={domain.available ? domain.name : `${domain.name} · ${domain.phase}`}
        title={domain.tagline}
        subtitle={domain.description}
        tone={domain.theme === "coral" ? "coral" : "teal"}
        breadcrumb={[
          { label: "Accueil", to: "/" },
          { label: "Nos solutions", to: "/solutions" },
          { label: domain.shortName },
        ]}
        compact
      >
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <Button to="/contact" size="md" variant="onDark" withArrow className="w-full sm:w-auto">
            Demander ce service
          </Button>
          <Button to={`/prestataires?service=${domain.slug}`} variant="glass" size="md" className="w-full sm:w-auto">
            Voir les prestataires
          </Button>
          <span className="glass-capsule hidden items-center gap-3 rounded-full py-2 pl-2 pr-5 sm:inline-flex">
            <span className="grid size-9 place-items-center rounded-full bg-gold-500 text-white">
              <DomainIcon name={domain.icon} className="size-5" />
            </span>
            <span>
              <span className="block font-display text-lg font-extrabold text-ink-900">{domain.heroStat.value}</span>
              <span className="block text-xs text-ink-900/60">{domain.heroStat.label}</span>
            </span>
          </span>
        </div>
      </PageHero>

      {domain.scope && <WaleScope domain={domain} />}

      {!domain.available && (
        <div className="bg-sky">
          <p className="mx-auto flex max-w-7xl items-start gap-2.5 px-4 py-2.5 text-sm text-ink-900 sm:px-6 lg:px-8">
            <Info className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
            {domain.name} ouvre bientôt. Déposez une demande pour être prévenu en priorité.
          </p>
        </div>
      )}

      <section className="bg-white py-6 sm:py-10" aria-labelledby="trust-heading">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:gap-8 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
          <div>
            <Eyebrow>Sélection</Eyebrow>
            <h2 id="trust-heading" className="mt-1.5 font-display text-lg font-bold text-ink-900 sm:mt-2 sm:text-2xl">
              Le protocole, appliqué à ce métier
            </h2>
            <ul className="mt-3 flex flex-col gap-1 sm:mt-4 sm:gap-1.5">
              {selectionPreview.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm leading-snug text-ink-900">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-teal-600 sm:size-4" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
            <Link to="/saatrust" className="mt-2.5 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline sm:mt-3">
              {domain.selection.length > 3 ? "Voir les contrôles SaaTrust" : "SaaTrust en détail"}{" "}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div>
            <Eyebrow>Garanties</Eyebrow>
            <h2 className="mt-1.5 font-display text-lg font-bold text-ink-900 sm:mt-2 sm:text-2xl">
              Remplacement, assurance, encadrement
            </h2>
            <ul className="mt-3 flex flex-col gap-1.5 sm:mt-4 sm:gap-2.5">
              {domain.guarantees.map((g) => (
                <li key={g.title} className="rounded-lg border border-ink-900/8 px-3 py-2 sm:rounded-xl sm:px-3.5 sm:py-2.5">
                  <h3 className="text-sm font-bold text-ink-900">{g.title}</h3>
                  <p className="mt-0.5 hidden text-sm leading-snug text-ink-900/70 sm:block">{g.detail}</p>
                </li>
              ))}
            </ul>
            {domain.safety && (
              <p className="mt-2.5 text-xs leading-snug text-ink-900/65 sm:mt-3 sm:text-sm sm:text-ink-900/70">{domain.safety}</p>
            )}
          </div>
        </div>
      </section>

      {profiles.length > 0 && (
        <section className="bg-paper-100 py-6 sm:py-10" aria-labelledby="profiles-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-3">
              <div>
                <Eyebrow>Profils</Eyebrow>
                <h2 id="profiles-heading" className="mt-1.5 font-display text-lg font-bold text-ink-900 sm:text-2xl">
                  Agents {domain.shortName}
                </h2>
              </div>
              <Button to={`/prestataires?service=${domain.slug}`} variant="ghost" size="sm" withArrow>
                Voir tous
              </Button>
            </div>
            <div className="mt-4 sm:mt-6">
              {profiles.map((p, i) => (
                <ProviderCard key={p.reference || p.id} provider={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-ink-900/6 bg-white py-5 sm:py-8" aria-labelledby="other-domains-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="other-domains-heading" className="font-display text-sm font-bold text-ink-900 sm:text-base">
            Autres pôles
          </h2>
          <ul className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
            {otherDomains.map((d) => (
              <li key={d.slug}>
                <Link
                  to={`/solutions/${d.slug}`}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-ink-900/10 bg-paper-100 px-2.5 py-1.5 text-xs font-medium text-ink-900 transition-colors hover:border-teal-600/40 sm:min-h-10 sm:px-3 sm:py-2 sm:text-sm"
                >
                  <DomainIcon name={d.icon} className="size-3.5 text-teal-600" />
                  {d.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

/** Walé : listes repliables sur mobile, ouvertes sur desktop. */
function WaleScope({ domain }) {
  return (
    <section className="bg-white py-5 sm:py-10" aria-labelledby="scope-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="scope-heading" className="font-display text-lg font-bold text-ink-900 sm:text-2xl">
          Ce qu&apos;elle fait — et ne fait jamais
        </h2>
        {domain.scope.intro && domain.scope.intro !== domain.description && (
          <p className="mt-1.5 max-w-3xl text-pretty text-sm leading-snug text-ink-900/70 sm:mt-2 sm:leading-relaxed">
            {domain.scope.intro}
          </p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:mt-6 sm:gap-4 lg:grid-cols-2">
          <MobileFold
            tone="mint"
            icon={<Check className="size-4" strokeWidth={3} aria-hidden="true" />}
            label="Son rôle"
            count={domain.scope.does.length}
          >
            <ul className="mt-2 flex flex-col gap-1.5 sm:mt-3 sm:columns-2 sm:gap-x-6">
              {domain.scope.does.map((row) => (
                <li key={row.domain} className="break-inside-avoid text-sm leading-snug text-ink-900">
                  <span className="font-semibold">{row.domain}</span>
                  <span className="text-ink-900/70"> — {row.detail}</span>
                </li>
              ))}
            </ul>
          </MobileFold>

          <MobileFold
            tone="coral"
            icon={<X className="size-4" strokeWidth={3} aria-hidden="true" />}
            label="Jamais"
            count={domain.scope.never.length}
          >
            <ul className="mt-2 flex flex-col gap-1.5 sm:mt-3 sm:gap-2">
              {domain.scope.never.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm leading-snug text-ink-900">
                  <X className="mt-0.5 size-3.5 shrink-0 text-coral-700" strokeWidth={3} aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </MobileFold>
        </div>

        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3">
          <p className="flex items-start gap-2 rounded-lg bg-paper-100 px-3 py-2.5 text-xs leading-snug text-ink-900 sm:rounded-xl sm:px-3.5 sm:py-3 sm:text-sm">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-coral-700 sm:size-4" aria-hidden="true" />
            <span>
              <strong className="font-semibold">Alerte · </strong>
              {domain.scope.alert}
            </span>
          </p>
          <div className="flex flex-col gap-2 rounded-lg bg-peach px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3 sm:rounded-xl sm:px-3.5 sm:py-3">
            <div className="flex flex-1 items-start gap-2">
              <CalendarHeart className="mt-0.5 size-4 shrink-0 text-coral-700 sm:size-5" aria-hidden="true" />
              <p className="text-xs leading-snug text-ink-900 sm:text-sm">
                <strong className="font-semibold">Réservation · </strong>
                {domain.earlyBooking}
              </p>
            </div>
            <Button to="/contact" variant="primary" size="sm" className="w-full shrink-0 sm:w-auto">
              Réserver
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileFold({ tone, icon, label, count, children }) {
  const shell =
    tone === "coral"
      ? "border-2 border-coral-500 bg-white text-coral-800"
      : "bg-mint text-teal-700";

  return (
    <>
      {/* Mobile : replié par défaut */}
      <details className={`group rounded-xl p-3 sm:hidden ${shell}`}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-bold [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            {icon}
            {label}
            <span className="font-mono text-xs font-medium opacity-60">({count})</span>
          </span>
          <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        {children}
      </details>

      {/* Desktop : toujours visible */}
      <div className={`hidden rounded-2xl p-5 sm:block ${shell}`}>
        <p className="flex items-center gap-2 text-sm font-bold">
          {icon}
          {label}
        </p>
        {children}
      </div>
    </>
  );
}
