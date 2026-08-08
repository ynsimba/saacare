import Seo from "../lib/Seo";
import Hero from "../components/sections/Hero";
import StatsBand from "../components/sections/StatsBand";
import DomainsGrid from "../components/sections/DomainsGrid";
import HowItWorks from "../components/sections/HowItWorks";
import WhyChoose from "../components/sections/WhyChoose";
import Testimonials from "../components/sections/Testimonials";
import CTASection from "../components/sections/CTASection";

export default function Home() {
  return (
    <>
      <Seo
        title="Accueil"
        description="SaaCare met en relation les familles de Kinshasa avec des nounous, chauffeurs, répétiteurs et artisans vérifiés, formés et notés. Réservez et payez en toute sécurité."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SaaCare",
          url: "https://www.saacare.cd/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://www.saacare.cd/trouver-un-prestataire?domaine={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <Hero />
      <StatsBand />
      <DomainsGrid />
      <HowItWorks compact />
      <WhyChoose />
      <Testimonials />
      <CTASection />
    </>
  );
}
