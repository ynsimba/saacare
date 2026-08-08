import { Helmet } from "react-helmet-async";

export const SITE = "https://www.saacare.cd";
const DEFAULT_IMAGE = `${SITE}/hero.png`;
const DEFAULT_TITLE = "SaaCare — Prestataires vérifiés à domicile à Kinshasa (RDC)";

/**
 * Composant SEO par page : titre, description, canonical, Open Graph,
 * Twitter Card et données structurées JSON-LD optionnelles.
 */
export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  jsonLd,
  noindex = false,
}) {
  const isHome = path === "/";
  const fullTitle = title ? (isHome ? DEFAULT_TITLE : `${title} · SaaCare`) : DEFAULT_TITLE;
  const url = `${SITE}${path === "/" ? "/" : path}`;
  const robots = noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  return (
    <Helmet htmlAttributes={{ lang: "fr-CD" }}>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image.startsWith("http") ? image : `${SITE}${image}`} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="SaaCare" />
      <meta property="og:locale" content="fr_CD" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith("http") ? image : `${SITE}${image}`} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
