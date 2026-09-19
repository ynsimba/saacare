/**
 * Coordonnées et informations institutionnelles, centralisées.
 * Les numéros d'agrément, RCCM et NIF sont à renseigner dès leur obtention
 * (cahier des charges §2.1 et annexe A) : tant qu'ils manquent, le site
 * affiche « en cours » plutôt qu'un numéro inventé.
 */
export const SITE_URL = "https://app.saacare.com";
export const TAGLINE = "Des services qui vous accompagnent";
export const PROMISE = "Des services qui simplifient le quotidien et restent présents au bon moment.";
export const POSITIONING =
  "Le premier réseau congolais d'agents de service à la personne vérifiés, formés et assurés.";

export const PHONE = "+243 816 483 538";
export const PHONE_HREF = "tel:+243816483538";
export const WHATSAPP_HREF = "https://wa.me/243816483538";
export const EMAIL = "hello@saacare.com";
export const ADDRESS = "Concession COTEX N° 63, Ave Colonel Mondjiba";
export const CITY = "Kinshasa, RDC";
export const HOURS = "Lun – Sam, 8 h – 18 h";

export const SITE_VERSION = "1.0";

export const LEGAL_IDS = [
  { label: "Agrément service privé de placement", value: "en cours d'obtention" },
  { label: "RCCM", value: "en cours d'immatriculation" },
  { label: "NIF", value: "en cours" },
  { label: "Affiliations", value: "CNSS · INPP · ONEM" },
];

export const FREQUENCIES = [
  { value: "ponctuel", label: "Ponctuel" },
  { value: "journee", label: "Journée" },
  { value: "semaine", label: "Semaine" },
  { value: "mois", label: "Mois" },
  { value: "permanent", label: "Permanent" },
];
