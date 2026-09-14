import { useParams, Navigate, Link } from "react-router-dom";
import { Check, X, ShieldCheck, AlertTriangle, CalendarHeart, ArrowUpRight, Clock, Info } from "lucide-react";
import Seo, { SITE } from "../lib/Seo";
import Button from "../components/ui/Button";
import DomainIcon from "../components/ui/DomainIcon";
import ProviderCard from "../components/ui/ProviderCard";
import PageHero from "../components/ui/PageHero";
import SectionHeading, { Eyebrow } from "../components/ui/SectionHeading";
import AccordionItem from "../components/ui/Accordion";
import RequestForm from "../components/ui/RequestForm";
import Reveal, { Stagger, RevealItem } from "../components/ui/Reveal";
import Section3D from "../components/ui/Section3D";
import { getDomainBySlug, domains } from "../data/domains";
import { getProvidersByDomain } from "../data/providers";
import { THEME } from "../lib/theme";

/**
 * Gabarit unique des pages de pôle (cahier des charges §2.2.2), décliné sept fois
 * par le contenu. Saa Walet ajoute, juste sous le bandeau, le bloc « ce qu'elle
 * fait et ne fait jamais » et la réservation anticipée.
 */
export default function SolutionDetail() {
  const { slug } = useParams();
  const domain = getDomainBySlug(slug);
  if (!domain) return <Navigate to="/404" replace />;

  const theme = THEME[domain.theme];
  const profiles = getProvidersByDomain(domain.slug).slice(0, 6);
  const otherDomains = domains.filter((d) => d.slug !== domain.slug);
  const url = `${SITE}/solutions/${domain.slug}`;

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
        <div className="flex flex-wrap items-center gap-3">
          <Button href="#demande" size="lg" variant="onDark" withArrow>
            Demander ce service
          </Button>
          <Button to={`/prestataires?service=${domain.slug}`} variant="glass" size="lg">
            Voir les prestataires disponibles
          </Button>
          <span className="glass-dark inline-flex items-center gap-3 rounded-2xl px-4 py-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-white/12 text-gold-500">
              <DomainIcon name={domain.icon} className="size-5" />
            </span>
            <span>
              <span className="block font-display text-lg font-bold text-paper-50">{domain.heroStat.value}</span>
              <span className="block text-xs text-paper-50/80">{domain.heroStat.label}</span>
            </span>
          </span>
        </div>
      </PageHero>

      {domain.scope && <WaletScope domain={domain} />}

      {!domain.available && (
        <div className="bg-sky">
          <p className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-4 text-sm text-ink-900 sm:px-6 lg:px-8">
            <Info className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
            {domain.name} ouvre bientôt. Déposez une demande pour être prévenu en priorité.
          </p>
        </div>
      )}

      {/* ---------------- Ce que nous proposons ---------------- */}
      <section className="bg-paper-100 py-16 sm:py-20" aria-labelledby="offers-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Ce que nous proposons" title={<span id="offers-heading">Les prestations {domain.shortName}</span>} subtitle="Prestations proposées à Kinshasa. Demandez un devis pour connaître le montant exact." />
          <Stagger as="ul" className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2" stagger={0.06}>
            {domain.offers.map((offer) => (
              <RevealItem as="li" key={offer.name} variant="up" className="flex flex-col gap-3 rounded-2xl border border-ink-900/8 bg-white p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold text-ink-900">{offer.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-900/75">{offer.description}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-navy-600">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {offer.duration}
                  </p>
                </div>
                <p className="shrink-0 font-display text-base font-semibold text-teal-700 sm:text-right">Sur devis</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------------- Nos formules ---------------- */}
      <Section3D variant="up" className="bg-white">
        <section className="bg-white py-16 sm:py-20" aria-labelledby="formulas-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Nos formules" title={<span id="formulas-heading">À l'heure, à la journée, à la semaine ou au mois</span>} />
            <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.07}>
              {domain.formulas.map((f) => (
                <RevealItem key={f.name} variant="up" className={`flex h-full flex-col rounded-2xl p-6 ${theme.bgSoft}`}>
                  <h3 className="font-display text-lg font-bold text-ink-900">{f.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-900/80">{f.detail}</p>
                  <p className="mt-4 font-display text-lg font-semibold text-ink-900">Sur devis</p>
                </RevealItem>
              ))}
            </Stagger>
          </div>
        </section>
      </Section3D>

      {/* ---------------- Sélection + garanties ---------------- */}
      <section className="bg-paper-100 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <Eyebrow>Comment nous sélectionnons nos agents</Eyebrow>
            <h2 className="mt-4 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Le protocole, appliqué à ce métier</h2>
            <Stagger as="ul" stagger={0.07} className="mt-6 flex flex-col gap-2">
              {domain.selection.map((line) => (
                <RevealItem as="li" key={line} variant="left" className="flex items-start gap-3 rounded-xl bg-white px-4 py-3">
                  <ShieldCheck className="mt-0.5 size-4.5 shrink-0 text-teal-600" aria-hidden="true" />
                  <span className="text-sm text-ink-900">{line}</span>
                </RevealItem>
              ))}
            </Stagger>
            <Link to="/saatrust" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:underline">
              Le protocole SaaTrust en détail <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div>
            <Eyebrow>Nos garanties</Eyebrow>
            <h2 className="mt-4 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Remplacement, assurance, encadrement</h2>
            <Stagger as="ul" stagger={0.07} className="mt-6 flex flex-col gap-3">
              {domain.guarantees.map((g) => (
                <RevealItem as="li" key={g.title} variant="right" className="rounded-2xl border border-ink-900/8 bg-white p-5">
                  <h3 className="font-display text-base font-bold text-ink-900">{g.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-900/75">{g.detail}</p>
                </RevealItem>
              ))}
            </Stagger>
            <p className="mt-4 text-sm text-ink-900/75">{domain.safety}</p>
          </div>
        </div>
      </section>

      {/* ---------------- Profils disponibles ---------------- */}
      <Section3D variant="left" className="bg-white">
        <section className="bg-white py-16 sm:py-20" aria-labelledby="profiles-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <Eyebrow>Profils disponibles</Eyebrow>
                <h2 id="profiles-heading" className="mt-4 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                  Agents {domain.shortName} au registre
                </h2>
              </div>
              {profiles.length > 0 && (
                <Button to={`/prestataires?service=${domain.slug}`} variant="ghost" withArrow>
                  Voir la recherche complète
                </Button>
              )}
            </div>
            {profiles.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {profiles.map((p, i) => (
                  <ProviderCard key={p.reference} provider={p} index={i} />
                ))}
              </div>
            ) : (
              <p className="mt-8 rounded-2xl bg-paper-100 p-6 text-sm leading-relaxed text-ink-900/80">
                Le registre {domain.shortName} se constitue en ce moment. Déposez votre demande ci-dessous : nous vous
                présentons un agent vérifié dès l'ouverture du pôle.
              </p>
            )}
          </div>
        </section>
      </Section3D>

      {/* ---------------- Questions + formulaire ---------------- */}
      <section id="demande" className="scroll-mt-24 bg-paper-100 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <Eyebrow>Questions fréquentes</Eyebrow>
            <h2 className="mt-4 font-display text-2xl font-bold text-ink-900">{domain.name} en questions</h2>
            <div className="mt-6 flex flex-col gap-1 rounded-3xl border border-ink-900/8 bg-white p-2">
              {domain.faq.map((f, i) => (
                <AccordionItem key={f.q} question={f.q} answer={f.a} defaultOpen={i === 0} />
              ))}
            </div>
          </div>
          <Reveal variant="up" className="rounded-3xl border border-ink-900/8 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink-900">Demander ce service</h2>
            <p className="mt-1.5 text-sm text-ink-900/75">Un chargé de clientèle vous rappelle pour confirmer.</p>
            <RequestForm domainSlug={domain.slug} className="mt-6" />
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-12" aria-labelledby="other-domains-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="other-domains-heading" className="font-display text-xl font-bold text-ink-900">Découvrir un autre pôle</h2>
          <ul className="mt-5 flex flex-wrap gap-3">
            {otherDomains.map((d) => (
              <li key={d.slug}>
                <Link to={`/solutions/${d.slug}`} className="flex min-h-11 items-center gap-2 rounded-md border border-ink-900/10 bg-paper-100 px-4 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:border-teal-600/40">
                  <DomainIcon name={d.icon} className="size-4 text-teal-600" />
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

/** Bloc verrouillé Saa Walet : visible dès le haut de page, jamais relégué en bas. */
function WaletScope({ domain }) {
  return (
    <section className="bg-white py-14 sm:py-16" aria-labelledby="scope-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="scope-heading" className="max-w-3xl font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          Ce que notre accompagnante fait, et ce qu'elle ne fait jamais
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-3xl bg-mint p-6 sm:p-8">
            <p className="flex items-center gap-2 font-display text-lg font-bold text-teal-700">
              <Check className="size-5" strokeWidth={3} aria-hidden="true" /> Ce qu'elle fait
            </p>
            <dl className="mt-5 flex flex-col gap-4">
              {domain.scope.does.map((row) => (
                <div key={row.domain}>
                  <dt className="text-sm font-semibold text-ink-900">{row.domain}</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-ink-900/80">{row.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-3xl border-2 border-coral-500 bg-white p-6 sm:p-8">
            <p className="flex items-center gap-2 font-display text-lg font-bold text-coral-800">
              <X className="size-5" strokeWidth={3} aria-hidden="true" /> Ce qu'elle ne fait jamais
            </p>
            <ul className="mt-5 flex flex-col gap-3">
              {domain.scope.never.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-900">
                  <X className="mt-0.5 size-4 shrink-0 text-coral-700" strokeWidth={3} aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <p className="flex items-start gap-3 rounded-2xl bg-paper-100 p-5 text-sm leading-relaxed text-ink-900">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-coral-700" aria-hidden="true" />
            <span>
              <strong className="block">Le protocole d'alerte</strong>
              {domain.scope.alert}
            </span>
          </p>
          <div className="flex flex-col gap-4 rounded-2xl bg-peach p-5 sm:flex-row sm:items-center">
            <CalendarHeart className="size-8 shrink-0 text-coral-700" aria-hidden="true" />
            <p className="flex-1 text-sm leading-relaxed text-ink-900">
              <strong className="block">Réservation anticipée</strong>
              {domain.earlyBooking}
            </p>
            <Button href="#demande" variant="primary" size="sm" className="shrink-0">
              Réserver
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
