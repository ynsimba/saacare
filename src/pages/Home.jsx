import Seo, { SITE } from "../lib/Seo";
import Hero from "../components/sections/Hero";
import StatsBand from "../components/sections/StatsBand";
import DomainsGrid from "../components/sections/DomainsGrid";
import SaaTrustTimeline from "../components/sections/SaaTrustTimeline";
import HowItWorks from "../components/sections/HowItWorks";
import WhyChoose from "../components/sections/WhyChoose";
import Testimonials from "../components/sections/Testimonials";
import AudienceBlocks from "../components/sections/AudienceBlocks";
import HomeFaq from "../components/sections/HomeFaq";
import CTASection from "../components/sections/CTASection";
import { homeFaq } from "../data/content";

/**
 * Accueil (cahier des charges §2.2.1) : promesse, recherche rapide, sept pôles,
 * protocole en sept étapes, preuves, parcours, témoignages, entreprises,
 * recrutement, questions fréquentes et double appel à l'action.
 */
export default function Home() {
  return (
    <>
      <Seo
        description="Nounou, accompagnante Walé, aide-ménagère, artisan ou chauffeur : des agents vérifiés en 7 étapes, formés et assurés à Kinshasa. Recherche sans inscription."
        path="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "SaaCare",
            url: `${SITE}/`,
            inLanguage: "fr-CD",
            potentialAction: {
              "@type": "SearchAction",
              target: { "@type": "EntryPoint", urlTemplate: `${SITE}/prestataires?service={search_term_string}` },
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: homeFaq.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          },
        ]}
      />
      <Hero />
      <StatsBand />
      <DomainsGrid />
      <SaaTrustTimeline />
      <HowItWorks compact />
      <WhyChoose />
      <Testimonials />
      <AudienceBlocks />
      <HomeFaq />
      <CTASection />
    </>
  );
}
