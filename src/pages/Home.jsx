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
        description="Trouvez une nounou, un chauffeur, un répétiteur ou un artisan vérifié à Kinshasa. SaaCare sécurise la mise en relation, la réservation et le paiement jusqu'à votre validation."
        path="/"
        image="/hero.png"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "SaaCare",
            url: "https://www.saacare.cd/",
            inLanguage: "fr-CD",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://www.saacare.cd/trouver-un-prestataire?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "SaaCare",
            url: "https://www.saacare.cd/",
            logo: "https://www.saacare.cd/icone.png",
            email: "contact@saacare.com",
            telephone: "+243816483538",
            areaServed: { "@type": "City", name: "Kinshasa" },
          },
        ]}
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
