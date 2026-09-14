/**
 * Contenus éditoriaux. Voix de marque (charte §16) : phrases courtes, verbes
 * d'action, bénéfice concret avant la preuve ; « nous, vous, ensemble ».
 * Témoignages : prénom, commune et service uniquement (cahier des charges §2.2.1).
 * À remplacer par des témoignages réels, avec autorisation écrite de diffusion.
 */

export const testimonials = [
  {
    name: "Aline",
    role: "Gombe",
    domain: "Saa Kids Care",
    initials: "A",
    quote:
      "On m'a expliqué chaque contrôle avant de me présenter la nounou. Pour la première fois, je laisse mes enfants sans inquiétude.",
  },
  {
    name: "Nadège",
    role: "Limete",
    domain: "Saa Walet",
    initials: "N",
    quote:
      "Ma mère était loin. L'accompagnante a pris le relais la nuit pendant deux semaines. J'ai pu me reposer, et elle savait exactement ce qu'elle pouvait faire ou non.",
  },
  {
    name: "Didier",
    role: "Gombe",
    domain: "Saa Driver",
    initials: "D",
    quote:
      "Un chauffeur ponctuel, un contrat clair, et un interlocuteur qui répond. Quand il a été malade, le remplaçant était là le lendemain.",
  },
];

/** Parcours client en quatre étapes (cahier des charges §3.1). */
export const processSteps = [
  {
    number: "01",
    title: "Cherchez",
    description:
      "Sans inscription. Filtrez par service, commune et fréquence, puis consultez des profils vérifiés et anonymisés.",
    icon: "Search",
  },
  {
    number: "02",
    title: "Déposez votre demande",
    description:
      "Un formulaire court : votre besoin, votre adresse, la date et la fréquence. Vous recevez aussitôt un numéro de demande.",
    icon: "ClipboardList",
  },
  {
    number: "03",
    title: "Nous confirmons",
    description:
      "Un chargé de clientèle vous rappelle, confirme la disponibilité de l'agent et prépare le contrat adapté à votre besoin.",
    icon: "PhoneCall",
  },
  {
    number: "04",
    title: "Nous restons à vos côtés",
    description:
      "L'agent intervient. Un superviseur passe à J+7, vous notez la mission, et nous remplaçons l'agent sous 24 h si besoin.",
    icon: "ShieldCheck",
  },
];

/** Le protocole SaaTrust en sept étapes (plan d'affaires §19, cahier des charges §2.2.3). */
export const saatrustSteps = [
  {
    number: "01",
    title: "Identité",
    icon: "IdCard",
    control: "Carte d'électeur ou passeport, contrôle de cohérence, photographie prise sur place.",
    proof: "Copie certifiée et photo horodatée.",
    refusal: "Identité non vérifiable, ou âge inférieur à 18 ans.",
  },
  {
    number: "02",
    title: "Domicile",
    icon: "MapPinHouse",
    control: "Visite physique du lieu de résidence et attestation du chef de quartier ou de l'autorité locale.",
    proof: "Attestation, coordonnées GPS et photo de l'habitation.",
    refusal: "Domicile introuvable ou attestation impossible à obtenir.",
  },
  {
    number: "03",
    title: "Antécédents",
    icon: "FileSearch",
    control: "Extrait de casier judiciaire ou attestation de bonne conduite.",
    proof: "Document original numérisé.",
    refusal: "Antécédents judiciaires bloquants.",
  },
  {
    number: "04",
    title: "Garants",
    icon: "Users",
    control: "Deux garants indépendants et joignables, dont un hors de la famille, appelés et enregistrés.",
    proof: "Fiche d'entretien signée.",
    refusal: "Aucun garant joignable.",
  },
  {
    number: "05",
    title: "Références",
    icon: "BriefcaseBusiness",
    control: "Appel d'au moins un ancien employeur lorsqu'il existe, avec une grille d'évaluation standardisée.",
    proof: "Compte rendu daté.",
    refusal: "Non bloquant pour une première expérience ; incohérences dans le dossier.",
  },
  {
    number: "06",
    title: "Compétence",
    icon: "ClipboardCheck",
    control: "Épreuve pratique par métier : conduite sur parcours, test de cuisine, mise en situation de garde, diagnostic technique.",
    proof: "Grille notée et signée par l'évaluateur.",
    refusal: "Test pratique non concluant.",
  },
  {
    number: "07",
    title: "Aptitude",
    icon: "Stethoscope",
    control: "Visite médicale d'aptitude auprès d'un centre partenaire.",
    proof: "Certificat d'aptitude.",
    refusal: "Inaptitude au poste.",
  },
];

export const certificationLevels = [
  {
    name: "Vérifié",
    criteria: "Les 7 contrôles du protocole SaaTrust sont validés, pièces à l'appui.",
  },
  {
    name: "Certifié",
    criteria: "Vérifié, avec une formation Saa Academy validée dans son métier.",
  },
  {
    name: "Élite",
    criteria: "Au moins 200 heures effectuées, avec une note moyenne supérieure à 4,6 sur 5.",
  },
];

/** Engagements de service (plan d'affaires §22). */
export const guarantees = [
  {
    icon: "RefreshCcw",
    title: "Remplacement sous 24 heures",
    detail: "Tout agent en mission jugé non conforme est remplacé sous 24 heures ouvrées.",
  },
  {
    icon: "CalendarCheck",
    title: "Garantie placement de 90 jours",
    detail: "Si le contrat d'un agent placé est rompu dans les 90 jours, nous le remplaçons gratuitement, quel que soit le motif.",
  },
  {
    icon: "ShieldCheck",
    title: "Assurance responsabilité civile",
    detail: "Les dommages matériels causés chez vous sont couverts par une police souscrite auprès d'un assureur congolais.",
  },
  {
    icon: "Lock",
    title: "Garantie vol",
    detail: "Une franchise et un plafond définis au contrat, sous réserve du dépôt d'une plainte.",
  },
  {
    icon: "UserCheck",
    title: "Visite qualité",
    detail: "Un superviseur passe à J+7, puis chaque mois pour les contrats permanents (J+2 pour Saa Walet).",
  },
  {
    icon: "Scale",
    title: "Notation croisée et médiation",
    detail: "Client et agent se notent après chaque mission. En cas de litige, notre équipe qualité intervient.",
  },
];

/**
 * Engagements chiffrés affichés en bandeau. Les compteurs d'activité (agents
 * vérifiés, missions, note moyenne, communes) seront alimentés par
 * GET /api/stats/public — jamais saisis à la main (cahier des charges, annexe A).
 */
export const commitments = [
  { value: 7, label: "contrôles avant toute mise en relation" },
  { value: 15, suffix: " %", label: "des candidats admis au registre, environ" },
  { value: 24, suffix: " h", label: "pour remplacer un agent non conforme" },
  { value: 0, label: "frais demandé aux agents, sans exception" },
];

export const faqCategories = [
  {
    category: "Demander un service",
    items: [
      {
        q: "Faut-il créer un compte pour chercher un prestataire ?",
        a: "Non. La recherche est libre. Vous consultez des profils vérifiés et anonymisés, puis vous déposez une demande avec votre prénom et votre téléphone.",
      },
      {
        q: "Comment se passe la mise en relation ?",
        a: "Un chargé de clientèle SaaCare qualifie votre demande, confirme la disponibilité de l'agent et vous rappelle. Les coordonnées de l'agent vous sont communiquées une fois la mission validée.",
      },
      {
        q: "Pourquoi les profils sont-ils anonymisés ?",
        a: "Pour protéger les agents : ni nom de famille, ni téléphone, ni adresse ne sont publiés. Chaque profil porte une référence, par exemple SAA-KC-0412.",
      },
      {
        q: "Puis-je demander une femme pour garder mes enfants ?",
        a: "Oui. Le filtre « genre du prestataire » est proposé pour la garde d'enfants et l'accompagnement des personnes âgées.",
      },
    ],
  },
  {
    category: "Tarifs et contrats",
    items: [
      {
        q: "Les tarifs sont-ils publics ?",
        a: "Non. Chaque devis est établi selon le besoin, la durée et le niveau de l'agent. Votre chargé de clientèle confirme le montant avant toute intervention.",
      },
      {
        q: "Quels types de contrats proposez-vous ?",
        a: "La mission, pour les interventions courtes. Le placement, pour un poste permanent dont vous êtes l'employeur. La mise à disposition, où SaaCare est l'employeur déclaré de l'agent.",
      },
      {
        q: "Qu'est-ce que SaaPaie ?",
        a: "Une option pour les postes placés : contrat écrit, bulletin de paie, affiliation CNSS, calcul de l'IPR et suivi des congés. Le montant est précisé au devis.",
      },
    ],
  },
  {
    category: "Confiance et sécurité",
    items: [
      {
        q: "Comment les agents sont-ils vérifiés ?",
        a: "Par le protocole SaaTrust en 7 étapes : identité, domicile, antécédents, garants, références, test pratique et aptitude médicale. Sur 100 candidatures, environ 15 agents sont admis.",
      },
      {
        q: "Puis-je vérifier moi-même un agent ?",
        a: "Oui. Chaque agent porte un sceau SaaTrust numéroté. Saisissez ce numéro sur la page « Vérifier un agent » pour connaître son statut.",
      },
      {
        q: "Que se passe-t-il si l'agent ne convient pas ?",
        a: "Signalez-le à votre chargé de clientèle. Nous remplaçons l'agent sous 24 heures ouvrées.",
      },
    ],
  },
  {
    category: "Devenir prestataire",
    items: [
      {
        q: "Combien coûte la candidature ?",
        a: "Rien. SaaCare ne demande aucun frais aux agents, ni à l'inscription, ni à la formation, ni sur les missions. Toute demande d'argent au nom de SaaCare est une fraude.",
      },
      {
        q: "Quelles pièces faut-il fournir ?",
        a: "Une pièce d'identité (recto et verso), une photo de votre visage et, si vous en avez, vos certificats. Vous pouvez tout photographier avec votre téléphone.",
      },
      {
        q: "Combien de temps dure la sélection ?",
        a: "Les vérifications se font sous 7 jours ouvrés après l'entretien. Vous suivez l'avancement de votre dossier par SMS.",
      },
    ],
  },
  {
    category: "Entreprises et diaspora",
    items: [
      {
        q: "Mon entreprise peut-elle externaliser son personnel ?",
        a: "Oui. En mise à disposition, SaaCare est l'employeur déclaré : CNSS, INPP, ONEM et IPR sont gérés, vous recevez une facture unique avec les pièces sociales.",
      },
      {
        q: "Je vis à l'étranger. Puis-je payer pour ma famille à Kinshasa ?",
        a: "Oui. L'offre diaspora accepte le paiement en devises, une adresse de facturation étrangère et un contact local distinct, avec un rapport de visite mensuel.",
      },
    ],
  },
];

/** Les six questions de l'accueil. */
export const homeFaq = [
  faqCategories[0].items[0],
  faqCategories[0].items[1],
  faqCategories[2].items[0],
  faqCategories[1].items[0],
  faqCategories[2].items[2],
  faqCategories[3].items[0],
];
