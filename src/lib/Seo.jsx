import { Helmet } from "react-helmet-async";

const SITE = "https://www.saacare.cd";
const DEFAULT_IMAGE = `${SITE}/og-cover.jpg`;

/**
 * Composant SEO par page : titre, description, canonical, Open Graph,
 * Twitter Card et données structurées JSON-LD optionnelles.
 */
export default function Seo({ title, description, path = "/", image = DEFAULT_IMAGE, jsonLd, noindex = false }) {
  const fullTitle = title ? `${title} · SaaCare` : "SaaCare — Professionnels de confiance à domicile en RDC";
  const url = `${SITE}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />

      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
