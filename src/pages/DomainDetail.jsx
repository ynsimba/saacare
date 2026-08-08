import { useParams, Navigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Check, ShieldAlert, ArrowUpRight } from "lucide-react";
import Seo from "../lib/Seo";
import Button from "../components/ui/Button";
import DomainIcon from "../components/ui/DomainIcon";
import ProviderCard from "../components/ui/ProviderCard";
import PageHero from "../components/ui/PageHero";
import Reveal, { Stagger, RevealItem } from "../components/ui/Reveal";
import Section3D from "../components/ui/Section3D";
import CTASection from "../components/sections/CTASection";
import { Eyebrow } from "../components/ui/SectionHeading";
import { getDomainBySlug, domains } from "../data/domains";
import { getProvidersByDomain } from "../data/providers";
import { THEME } from "../lib/theme";
import { EASE } from "../lib/motion";

const HERO_TONE = { teal: "teal", coral: "coral", gold: "navy", navy: "navy" };

export default function DomainDetail() {
  const { slug } = useParams();
  const domain = getDomainBySlug(slug);

  if (!domain) return <Navigate to="/404" replace />;

  const theme = THEME[domain.theme];
  const relatedProviders = getProvidersByDomain(domain.slug);
  const otherDomains = domains.filter((d) => d.slug !== domain.slug);

  return (
    <>
      <Seo
        title={domain.name}
        description={`${domain.description} Consultez les prestataires vérifiés disponibles à Kinshasa.`}
        path={`/domaines/${domain.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: domain.name,
          provider: { "@type": "Organization", name: "SaaCare" },
          areaServed: "Kinshasa, RDC",
          description: domain.description,
        }}
      />

      <PageHero
        key={domain.slug}
        eyebrow={domain.name}
        title={domain.tagline}
        subtitle={domain.description}
        tone={HERO_TONE[domain.theme] ?? "navy"}
        breadcrumb={[
          { label: "Accueil", to: "/" },
          { label: "Nos domaines", to: "/comment-ca-marche" },
          { label: domain.shortName },
        ]}
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button to="/trouver-un-prestataire" size="lg" withArrow magnetic>
            Voir les prestataires disponibles
          </Button>
          <Button to="/devenir-prestataire" variant="glass" size="lg" magnetic>
            Devenir prestataire
          </Button>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
            className="glass-dark flex items-center gap-3 rounded-2xl px-5 py-3"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-teal-300">
              <DomainIcon name={domain.icon} className="size-5" />
            </span>
            <span>
              <span className="block font-display text-xl font-semibold text-paper-50">
                {domain.heroStat.value}
              </span>
              <span className="block text-xs text-paper-100/60">{domain.heroStat.label}</span>
            </span>
          </motion.div>
        </div>
      </PageHero>

      <Section3D variant="up" className="bg-white">
      <section className="bg-white py-20 sm:py-24" aria-labelledby="services-heading">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <Reveal variant="up">
              <h2 id="services-heading" className="font-display text-2xl font-semibold text-ink-900">
                Services proposés
              </h2>
            </Reveal>
            <Stagger as="ul" stagger={0.08} className="mt-6 flex flex-col gap-2">
              {domain.services.map((service) => (
                <RevealItem
                  as="li"
                  key={service}
                  variant="left"
                  className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300 hover:bg-paper-100"
                >
                  <span
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 ${theme.chip}`}
                  >
                    <Check className="size-3.5" aria-hidden="true" strokeWidth={2.5} />
                  </span>
                  <span className="text-ink-900/75">{service}</span>
                </RevealItem>
              ))}
            </Stagger>
          </div>

          <div>
            <Reveal variant="up">
              <h2 className="font-display text-2xl font-semibold text-ink-900">
                Comment nous vérifions ce domaine
              </h2>
            </Reveal>
            <Stagger as="ul" stagger={0.08} className="mt-6 flex flex-col gap-2">
              {domain.verification.map((step) => (
                <RevealItem
                  as="li"
                  key={step}
                  variant="left"
                  className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300 hover:bg-paper-100"
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-navy-700/8 text-navy-700 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
                    <Check className="size-3.5" aria-hidden="true" strokeWidth={2.5} />
                  </span>
                  <span className="text-ink-900/75">{step}</span>
                </RevealItem>
              ))}
            </Stagger>

            <Reveal
              variant="scale"
              className="mt-8 flex gap-3 rounded-2xl border border-gold-200 bg-gold-100/50 p-5"
            >
              <ShieldAlert className="size-5 shrink-0 text-gold-700" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-ink-900/75">{domain.safety}</p>
            </Reveal>
          </div>
        </div>
      </section>
      </Section3D>

      {relatedProviders.length > 0 && (
        <Section3D variant="left" className="bg-paper-100">
        <section className="bg-paper-100 py-20 sm:py-24" aria-labelledby="providers-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal variant="up" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <Eyebrow tone={theme.text}>Disponibles maintenant</Eyebrow>
                <h2
                  id="providers-heading"
                  className="mt-4 font-display text-2xl font-semibold text-ink-900 sm:text-3xl"
                >
                  Prestataires {domain.shortName}
                </h2>
              </div>
              <Button to="/trouver-un-prestataire" variant="ghost" withArrow>
                Voir tous les prestataires
              </Button>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProviders.map((p, i) => (
                <ProviderCard key={p.id} provider={p} index={i} />
              ))}
            </div>
          </div>
        </section>
        </Section3D>
      )}

      <Section3D variant="right" className="bg-white">
      <section className="bg-white py-16" aria-labelledby="other-domains-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <h2 id="other-domains-heading" className="font-display text-xl font-semibold text-ink-900">
              Découvrir un autre domaine
            </h2>
          </Reveal>
          <Stagger className="mt-6 flex flex-wrap gap-3" stagger={0.07}>
            {otherDomains.map((d) => (
              <RevealItem key={d.slug} variant="scale">
                <Link
                  to={`/domaines/${d.slug}`}
                  className="group flex items-center gap-2 rounded-md border border-ink-900/10 bg-paper-100 px-4 py-2.5 text-sm font-medium text-ink-900 transition-all duration-500 hover:-translate-y-0.5 hover:border-ink-900/25 hover:shadow-soft"
                >
                  <DomainIcon
                    name={d.icon}
                    className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110"
                  />
                  {d.shortName}
                  <ArrowUpRight
                    className="size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-60"
                    aria-hidden="true"
                  />
                </Link>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>
      </Section3D>

      <CTASection
        title={`Réservez un prestataire ${domain.shortName} en quelques minutes.`}
        subtitle="Paiement protégé jusqu'à validation de la prestation."
      />
    </>
  );
}
