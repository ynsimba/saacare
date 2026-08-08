export const domains = [
  {
    slug: "kids-care",
    name: "Saa Kids Care",
    shortName: "Kids Care",
    icon: "Baby",
    theme: "teal",
    tagline: "Garde d'enfants, en toute confiance",
    description:
      "Nounous, babysitters et accompagnantes vérifiées, formées aux premiers secours et à l'éveil de l'enfant, pour une garde ponctuelle ou régulière.",
    heroStat: { value: "312", label: "gardes vérifiées à Kinshasa" },
    services: [
      "Nounou à domicile",
      "Babysitting ponctuel (soirée, week-end)",
      "Garde spécialisée (nourrissons, besoins particuliers)",
      "Accompagnement école et activités",
    ],
    verification: [
      "Vérification d'identité et des antécédents",
      "Entretien individuel avec le service qualité",
      "Formation premiers secours pédiatriques",
      "Formation éveil et sécurité de l'enfant",
    ],
    safety: "Bouton d'urgence et partage de position accessibles depuis l'espace client pendant toute la garde.",
  },
  {
    slug: "driver",
    name: "Saa Driver",
    shortName: "Driver",
    icon: "Car",
    theme: "navy",
    tagline: "Un chauffeur professionnel, à l'heure",
    description:
      "Chauffeurs vérifiés, formés à la conduite défensive, pour vos trajets ponctuels, vos déplacements professionnels ou une mise à disposition longue durée.",
    heroStat: { value: "204", label: "chauffeurs actifs" },
    services: [
      "Trajet ponctuel en ville",
      "Mise à disposition à la journée",
      "Chauffeur attitré (semaine, mois)",
      "Trajets aéroport et déplacements professionnels",
    ],
    verification: [
      "Vérification du permis et de l'expérience de conduite",
      "Contrôle des antécédents",
      "Formation conduite défensive et code de la route",
      "Audit aléatoire de ponctualité",
    ],
    safety: "Partage de trajet en temps réel avec un proche et suivi GPS pendant la course.",
  },
  {
    slug: "tutora",
    name: "Saa Tutora",
    shortName: "Tutora",
    icon: "GraduationCap",
    theme: "gold",
    tagline: "Le bon soutien scolaire, au bon rythme",
    description:
      "Répétiteurs et enseignants vérifiés pour l'aide aux devoirs, la préparation aux examens et le coaching scolaire, à domicile ou en ligne.",
    heroStat: { value: "178", label: "répétiteurs certifiés" },
    services: [
      "Aide aux devoirs (primaire, secondaire)",
      "Préparation aux examens d'État",
      "Cours particuliers par matière",
      "Coaching méthodologie et orientation",
    ],
    verification: [
      "Vérification des diplômes et références pédagogiques",
      "Entretien pédagogique avec le superviseur Tutora",
      "Formation à l'accompagnement individualisé",
      "Compte-rendu de suivi après chaque séance",
    ],
    safety: "Compte-rendu de progression visible par le parent après chaque séance, en toute transparence.",
  },
  {
    slug: "home-service",
    name: "Saa Home Service",
    shortName: "Home Service",
    icon: "Hammer",
    theme: "coral",
    tagline: "Entretien et dépannage, sans mauvaise surprise",
    description:
      "Plombiers, électriciens, menuisiers, jardiniers et main d'œuvre qualifiée pour l'entretien, le dépannage et l'aménagement de votre domicile.",
    heroStat: { value: "540", label: "interventions réalisées" },
    services: [
      "Cleaning",
      "Nettoyage fauteuils",
      "Électricité",
      "Plomberie",
      "Décoration intérieure",
      "Peinture",
    ],
    verification: [
      "Vérification d'identité et des références professionnelles",
      "Contrôle des réalisations précédentes (photos)",
      "Formation sécurité et normes métier",
      "Devis photo validé avant toute intervention",
    ],
    safety: "Devis détaillé avec photos, validé par vous avant paiement — aucune surprise à l'arrivée.",
  },
];

export const getDomainBySlug = (slug) => domains.find((d) => d.slug === slug);
