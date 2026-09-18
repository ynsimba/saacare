/**
 * Registre public — helpers et libellés (cahier des charges §4.3).
 * Les profils viennent de GET /api/providers (base Laravel).
 */

export const LEVELS = {
  Vérifié: "Les 7 contrôles du protocole SaaTrust validés.",
  Certifié: "Vérifié, avec une formation Saa Academy validée.",
  Élite: "Au moins 200 heures effectuées et une note moyenne supérieure à 4,6/5.",
};

export const AVAILABILITY = {
  immediate: "Disponible immédiatement",
  week: "Disponible sous 7 jours",
  planning: "Sur planning",
};

/** Une note n'est publiée qu'à partir de 3 évaluations. */
export const MIN_REVIEWS_FOR_RATING = 3;

export const getProvidersByDomain = (list, slug) =>
  (list || []).filter((p) => p.domainSlug === slug || p.domain === slug);

/** Un profil représentatif par pôle (conserve l’ordre de la liste source). */
export const pickOnePerDomain = (list = []) => {
  const seen = new Set();
  return list.filter((p) => {
    const key = p.domainSlug || p.domain;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const hasPublicRating = (p) => (p?.reviews || 0) >= MIN_REVIEWS_FOR_RATING;
export const formatPrice = () => "Sur devis";
