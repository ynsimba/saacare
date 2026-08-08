import { Navigate } from "react-router-dom";
import Seo from "../../lib/Seo";
import PageHero from "../../components/ui/PageHero";
import Reveal from "../../components/ui/Reveal";
import { legalPages } from "../../data/legal";

export default function LegalPage({ slug }) {
  const page = legalPages[slug];
  if (!page) return <Navigate to="/404" replace />;

  return (
    <>
      <Seo title={page.title} description={`${page.title} de la plateforme SaaCare.`} path={`/${slug}`} />

      <PageHero
        eyebrow={`Dernière mise à jour · ${page.updated}`}
        title={page.title}
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: page.title }]}
        compact
      />

      <section className="bg-paper-100 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Sommaire ancré */}
          <Reveal variant="up" className="mb-12 rounded-2xl border border-ink-900/8 bg-white p-5 shadow-soft">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-900/45">Sommaire</p>
            <ol className="mt-3 flex flex-col gap-1.5">
              {page.sections.map((section, index) => (
                <li key={section.heading}>
                  <a
                    href={`#section-${index}`}
                    className="group inline-flex items-baseline gap-2 text-sm text-ink-900/70 transition-colors hover:text-teal-700"
                  >
                    <span className="font-mono text-xs text-ink-900/35">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="link-underline">{section.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </Reveal>

          <div className="flex flex-col gap-10">
            {page.sections.map((section, index) => (
              <Reveal key={section.heading} variant="up" id={`section-${index}`} className="scroll-mt-28">
                <h2 className="font-display text-xl font-semibold text-ink-900">{section.heading}</h2>
                <div className="mt-3 flex flex-col gap-3">
                  {section.body.map((paragraph, i) => (
                    <p key={i} className="leading-relaxed text-ink-900/70">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal
            variant="fade"
            className="mt-14 rounded-2xl border border-gold-200 bg-gold-100/50 p-5 text-sm leading-relaxed text-ink-900/70"
          >
            Ce document est un modèle fourni à titre indicatif pour la mise en ligne de la plateforme. Il doit
            être relu et validé par un conseil juridique avant publication officielle.
          </Reveal>
        </div>
      </section>
    </>
  );
}
