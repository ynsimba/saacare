/**
 * Les sept pôles SaaCare (plan d'affaires §4, cahier des charges §2.2.2).
 * Une seule structure de page, déclinée sept fois par le contenu.
 */

const COMMON_GUARANTEES = [
  { title: "Remplacement sous 24 h", detail: "Un agent jugé non conforme est remplacé sous 24 heures ouvrées." },
  { title: "Assurance", detail: "Responsabilité civile pour les dommages chez vous, et garantie vol sous conditions." },
  { title: "Encadrement", detail: "Visite qualité d'un superviseur à J+7, puis chaque mois pour les contrats permanents." },
];

export const domains = [
  {
    slug: "kids-care",
    name: "Saa Kids Care",
    shortName: "Kids Care",
    icon: "Baby",
    theme: "teal",
    phase: "Disponible",
    available: true,
    tagline: "Une nounou vérifiée, au bon moment",
    description:
      "Nounous et gardes d'enfants à la journée, à la semaine ou au mois, garde de nuit, garde d'urgence, sortie d'école et accompagnement des devoirs.",
    heroStat: { value: "8 h", label: "journée de garde type" },
    services: [
      "Nounou à temps plein",
      "Garde à la journée",
      "Garde de nuit",
      "Garde d'urgence",
      "Sortie d'école et devoirs",
    ],
    offers: [
      { name: "Garde d'enfants à la journée", description: "Présence à domicile pour la journée.", duration: "8 heures", price: "Sur devis" },
      { name: "Garde de nuit", description: "Surveillance du sommeil et réveils de nuit.", duration: "Une nuit", price: "Sur devis" },
      { name: "Placement d'une nounou permanente", description: "Recrutement, vérification, présentation et suivi. Vous êtes l'employeur.", duration: "Poste permanent", price: "Sur devis" },
      { name: "SaaPaie", description: "Contrat écrit, bulletin de paie, déclarations CNSS et IPR, suivi des congés.", duration: "Par mois", price: "Sur devis" },
    ],
    formulas: [
      { name: "À l'heure", detail: "Garde ponctuelle ou d'urgence.", price: "Sur devis" },
      { name: "À la journée", detail: "8 heures de garde à domicile.", price: "Sur devis" },
      { name: "À la semaine", detail: "Garde régulière avec la même nounou.", price: "Sur devis" },
      { name: "Au mois", detail: "Placement permanent ou mise à disposition.", price: "Sur devis" },
    ],
    selection: [
      "Protocole SaaTrust complet en 7 étapes",
      "Mise en situation de garde d'enfant, notée sur grille",
      "Formation au socle SaaCare : sécurité domestique, hygiène, premiers secours",
      "Garants appelés et références vérifiées",
    ],
    safety: "Visite qualité à J+7 et remplacement gratuit si le contrat est rompu dans les 90 jours.",
    guarantees: COMMON_GUARANTEES,
    faq: [
      { q: "Puis-je choisir une nounou qui parle lingala ?", a: "Oui. Filtrez les profils par langue parlée : français, lingala, swahili, tshiluba, kikongo ou anglais." },
      { q: "Qui est l'employeur d'une nounou placée ?", a: "Pour un placement permanent, c'est vous. SaaCare recrute, vérifie et accompagne. L'option SaaPaie gère le contrat et les déclarations à votre place." },
      { q: "Et si la nounou quitte le poste ?", a: "Si le contrat est rompu dans les 90 jours, nous la remplaçons gratuitement, quel que soit le motif." },
    ],
  },
  {
    slug: "wale",
    name: "Saa Walé",
    shortName: "Walé",
    icon: "HeartHandshake",
    theme: "coral",
    phase: "Disponible",
    available: true,
    tagline: "Accompagnement post-partum inspiré de la tradition du Walé",
    description:
      "Accompagnante post-partum à domicile, en séjour ou bien-être, avec option diaspora pour les familles à l'étranger.",
    heroStat: { value: "Post-partum", label: "accompagnement à domicile ou en séjour" },
    services: [
      "Walé à domicile",
      "Walé séjour",
      "Walé bien-être",
      "Option diaspora",
    ],
    offers: [
      {
        name: "Walé à domicile",
        description: "L'accompagnante vient chez la maman pendant la durée convenue.",
        duration: "Selon le nombre de jours convenu",
        price: "Sur devis",
      },
      {
        name: "Walé séjour",
        description: "La maman séjourne dans un espace aménagé pour son repos post-partum.",
        duration: "Séjour selon la formule",
        price: "Sur devis",
      },
      {
        name: "Walé bien-être",
        description: "Massages, soins corporels et alimentation — hors actes médicaux.",
        duration: "Séances ou forfait",
        price: "Sur devis",
      },
      {
        name: "Option diaspora",
        description: "Compte rendu quotidien écrit et vocal pour le payeur à l'étranger.",
        duration: "Selon la formule",
        price: "Sur devis",
      },
    ],
    formulas: [
      {
        name: "Quelques jours",
        detail: "Accompagnement court après la sortie de maternité.",
        price: "Sur devis",
      },
      {
        name: "Une à deux semaines",
        detail: "La durée la plus demandée pour le repos post-partum.",
        price: "Sur devis",
      },
      {
        name: "Un mois et plus",
        detail: "Suivi prolongé jusqu'à la reprise du quotidien.",
        price: "Sur devis",
      },
    ],
    selection: [
      "Protocole SaaTrust complet, plus trois contrôles propres au pôle",
      "Expérience personnelle ou professionnelle de la maternité",
      "Entretien approfondi sur la confidentialité et le respect de l'intimité",
      "Visite médicale renforcée, avec mise à jour vaccinale",
      "Formation obligatoire de 5 jours, conçue avec une sage-femme diplômée",
      "Recertification annuelle et visite de contrôle à J+2",
    ],
    safety:
      "Aucun acte médical. En cas de doute, alerte immédiate : famille, professionnel de santé et permanence SaaCare.",
    guarantees: [
      { title: "Remplacement sous 24 h", detail: "Une accompagnante jugée non conforme est remplacée sous 24 heures ouvrées." },
      { title: "Assurance renforcée", detail: "Une couverture dédiée au pôle, en plus de la responsabilité civile." },
      { title: "Supervision renforcée", detail: "Visite de contrôle à J+2 pour toute mission de plus de sept jours, superviseur joignable la nuit." },
    ],
    scope: {
      intro:
        "L'accompagnante Walé offre un cadre de repos, de bien-être et de transmission inspiré des pratiques traditionnelles du Walé — sans jamais remplacer un professionnel de santé.",
      does: [
        {
          domain: "Repos et adaptation",
          detail: "Accompagner la mère dans son repos et son adaptation après l'accouchement.",
        },
        {
          domain: "Soins de bien-être",
          detail: "Assurer des soins de bien-être et du confort du corps selon les pratiques traditionnelles encadrées.",
        },
        {
          domain: "Massages et soins corporels",
          detail: "Réaliser, lorsque cela est approprié, des massages et soins corporels non médicaux.",
        },
        {
          domain: "Alimentation post-partum",
          detail: "Préparer ou organiser des repas adaptés à la période post-partum, selon les habitudes et recommandations de la famille.",
        },
        {
          domain: "Aide au quotidien",
          detail: "Aider dans certaines tâches quotidiennes afin de permettre à la mère de se consacrer à sa récupération et à son bébé.",
        },
        {
          domain: "Soutien émotionnel",
          detail: "Apporter une présence, une écoute et un soutien émotionnel à la jeune mère.",
        },
        {
          domain: "Reprise progressive",
          detail: "Accompagner progressivement la mère vers la reprise de ses activités quotidiennes.",
        },
        {
          domain: "Complémentarité médicale",
          detail: "Travailler en complémentarité avec les professionnels de santé lorsque cela est nécessaire.",
        },
      ],
      never: [
        "Aucun acte médical : pas d'examen de la mère, pas de prise de tension, pas de soins de cicatrice, pas de soins du cordon ombilical.",
        "Aucun médicament : ni administration, ni recommandation, ni achat, y compris pour un antidouleur courant.",
        "Aucune manœuvre médicale sur le corps de la mère ou de l'enfant.",
        "Aucun conseil médical, aucun diagnostic, aucune interprétation d'un symptôme : elle décrit ce qu'elle observe, elle ne conclut jamais.",
        "Aucune décision à la place de la mère : le choix du mode d'alimentation, du rythme et des visites appartient à la famille.",
        "Aucune photographie, aucune diffusion d'information sur la famille : confidentialité absolue, inscrite au contrat.",
      ],
      alert:
        "Face à une situation inhabituelle, l'accompagnante réagit toujours de la même façon : elle prévient la famille, appelle le professionnel de santé ou la maternité qui a suivi l'accouchement, et prévient la permanence SaaCare. Elle n'évalue pas la gravité, elle ne temporise pas.",
    },
    earlyBooking:
      "Réservez dès le 3e trimestre, avec la date prévue de l'accouchement. Un acompte de 50 % confirme la réservation ; nous ajustons les dates si bébé arrive plus tôt ou plus tard.",
    faq: [
      {
        q: "Qu'est-ce que Saa Walé ?",
        a: "Un accompagnement post-partum à domicile ou en séjour. L'accompagnante soutient la mère au quotidien ; elle ne remplace jamais un professionnel de santé.",
      },
      {
        q: "Quelle est la différence entre Walé à domicile, séjour et bien-être ?",
        a: "Domicile : l'accompagnante vient chez vous. Séjour : la maman se repose dans un espace aménagé. Bien-être : massages et soins corporels, hors actes médicaux.",
      },
      {
        q: "Quand faut-il réserver ?",
        a: "Dès le 3e trimestre, idéalement au 7e ou 8e mois. Les dates sont ajustées si bébé arrive plus tôt ou plus tard.",
      },
      {
        q: "L'accompagnante remplace-t-elle une sage-femme ?",
        a: "Non. Aucun acte ni conseil médical : elle aide au quotidien et alerte le professionnel de santé en cas de doute.",
      },
      {
        q: "Je vis à l'étranger, puis-je réserver pour ma sœur ?",
        a: "Oui. Ajoutez l'option diaspora pour un compte rendu quotidien écrit et vocal.",
      },
    ],
  },
  {
    slug: "home",
    name: "Saa Home",
    shortName: "Home",
    icon: "House",
    theme: "navy",
    phase: "Disponible",
    available: true,
    tagline: "Entretien et métiers du bâtiment, sans mauvaise surprise",
    description:
      "Aides-ménagères, cuisiniers, nettoyage de bureaux, électriciens, plombiers, carreleurs, maçons, charpentiers, tôliers, ajusteurs, jardiniers et aide aux courses.",
    heroStat: { value: "3 h", label: "minimum pour un ménage" },
    services: [
      "Aide-ménagère",
      "Cuisinier",
      "Nettoyage de bureaux",
      "Plomberie et électricité",
      "Carrelage, maçonnerie, charpente",
      "Jardinage et aide aux courses",
    ],
    offers: [
      { name: "Ménage à l'heure", description: "Entretien courant de votre domicile.", duration: "3 heures minimum", price: "Sur devis" },
      { name: "Nettoyage complet de domicile", description: "Grand nettoyage, pièce par pièce.", duration: "Demi-journée", price: "Sur devis" },
      { name: "Intervention plomberie ou électricité", description: "Diagnostic et intervention par un technicien vérifié.", duration: "Diagnostic + 2 heures", price: "Sur devis" },
      { name: "Placement d'un domestique permanent", description: "Aide-ménagère, cuisinier ou jardinier à demeure.", duration: "Poste permanent", price: "Sur devis" },
      { name: "Entretien de bureaux et d'immeubles", description: "Contrat B2B avec personnel déclaré par SaaCare.", duration: "12 à 24 mois", price: "Sur devis" },
    ],
    formulas: [
      { name: "À l'heure", detail: "Ménage ou dépannage ponctuel.", price: "Sur devis" },
      { name: "À la journée", detail: "Nettoyage complet ou chantier court.", price: "Sur devis" },
      { name: "À la semaine", detail: "Passages réguliers, même agent.", price: "Sur devis" },
      { name: "Au mois", detail: "Placement permanent ou contrat d'entretien.", price: "Sur devis" },
    ],
    selection: [
      "Protocole SaaTrust complet en 7 étapes",
      "Test de cuisine pour les cuisiniers",
      "Diagnostic technique sur cas réel pour les métiers du bâtiment",
      "Formation au socle SaaCare : savoir-être, produits, sécurité domestique",
    ],
    safety: "Plafond de 80 heures par mois chez un même client en mission ; au-delà, bascule vers un contrat écrit.",
    guarantees: COMMON_GUARANTEES,
    faq: [
      { q: "Le matériel est-il fourni ?", a: "Pour le ménage, les produits du foyer sont utilisés. Pour les métiers techniques, le diagnostic précise le matériel à prévoir avant l'intervention." },
      { q: "Proposez-vous l'entretien de bureaux ?", a: "Oui, en contrat B2B : SaaCare emploie et déclare le personnel, vous recevez une facture unique. Demandez un devis entreprise." },
    ],
  },
  {
    slug: "driver",
    name: "Saa Driver",
    shortName: "Driver",
    icon: "Car",
    theme: "teal",
    phase: "Disponible",
    available: true,
    tagline: "Chauffeurs, courses du quotidien et livraisons",
    description:
      "Chauffeurs à la journée ou au mois, courtiers pour vos courses du quotidien (marché, récupération et dépôt), et livraison de produits pour particuliers et entreprises à Kinshasa.",
    heroStat: { value: "10 h", label: "journée de chauffeur type" },
    services: [
      "Chauffeur à la journée",
      "Courses du quotidien",
      "Livraison de produits",
      "Chauffeur au mois",
      "Chauffeur de direction",
      "Livraison entreprises",
      "Mise à disposition entreprises",
    ],
    offers: [
      { name: "Chauffeur à la journée", description: "Votre véhicule, un chauffeur vérifié.", duration: "10 heures", price: "Sur devis" },
      { name: "Placement d'un chauffeur privé", description: "Chauffeur à demeure, vous êtes l'employeur.", duration: "Poste permanent", price: "Sur devis" },
      { name: "Chauffeur au mois, mise à disposition", description: "SaaCare emploie et déclare le chauffeur : CNSS, INPP, ONEM, IPR.", duration: "Contrat de 12 à 24 mois", price: "Sur devis" },
      {
        name: "Courses du quotidien",
        description: "Un courtier vérifié fait le marché, récupère ou dépose un colis, un document ou un objet pour vous.",
        duration: "À la course ou à la demi-journée",
        price: "Sur devis",
      },
      {
        name: "Livraison de produits",
        description: "Aide aux particuliers et aux entreprises pour livrer leurs produits en ville — ponctuel ou régulier.",
        duration: "À la tournée ou au forfait",
        price: "Sur devis",
      },
    ],
    formulas: [
      { name: "À l'heure", detail: "Course, livraison ou rendez-vous ponctuel.", price: "Sur devis" },
      { name: "À la journée", detail: "10 heures de disponibilité.", price: "Sur devis" },
      { name: "À la semaine", detail: "Même agent, horaires convenus.", price: "Sur devis" },
      { name: "Au mois", detail: "Mise à disposition entreprise.", price: "Sur devis" },
    ],
    selection: [
      "Protocole SaaTrust complet en 7 étapes",
      "Vérification du permis de conduire (chauffeurs et livreurs motorisés)",
      "Épreuve de conduite sur parcours, notée sur grille",
      "Formation à la conduite défensive et aux consignes de livraison",
    ],
    safety: "Chauffeur, courtier ou livreur mis à disposition : contrat écrit, remis avant le début de la mission.",
    guarantees: COMMON_GUARANTEES,
    faq: [
      { q: "Le chauffeur fournit-il le véhicule ?", a: "Non, par défaut le chauffeur conduit votre véhicule. Certains profils déclarent un véhicule personnel ou une moto : filtrez-les dans la recherche." },
      { q: "Mon ONG a besoin de trois chauffeurs pour un an.", a: "C'est une mise à disposition : SaaCare est l'employeur déclaré et vous facture un montant unique par mois. Demandez un devis entreprise." },
      {
        q: "Qu'est-ce qu'un courtier Saa Driver ?",
        a: "Un agent vérifié qui gère vos courses du quotidien : aller au marché, récupérer ou déposer un colis, un document ou un objet, selon vos consignes.",
      },
      {
        q: "Proposez-vous la livraison pour mon commerce ?",
        a: "Oui. Saa Driver aide les particuliers et les entreprises à livrer leurs produits en ville, en mission ponctuelle ou en forfait régulier. Demandez un devis.",
      },
    ],
  },
  {
    slug: "tutora",
    name: "Saa Tutora",
    shortName: "Tutora",
    icon: "GraduationCap",
    theme: "coral",
    phase: "Disponible",
    available: true,
    tagline: "Le bon répétiteur, au bon rythme",
    description:
      "Cours de rattrapage à domicile, alphabétisation, anglais, préparation à l'examen d'État et aux concours.",
    heroStat: { value: "1 h 30", label: "cours à domicile type" },
    services: [
      "Cours de rattrapage",
      "Préparation à l'examen d'État",
      "Anglais",
      "Alphabétisation",
    ],
    offers: [
      { name: "Cours à domicile", description: "Un répétiteur vérifié, chez vous.", duration: "1 h 30", price: "Sur devis" },
      { name: "Préparation à l'examen d'État", description: "Programme régulier pour les classes d'examen.", duration: "Au trimestre", price: "Sur devis" },
    ],
    formulas: [
      { name: "À la séance", detail: "Cours de 1 h 30.", price: "Sur devis" },
      { name: "À la semaine", detail: "Plusieurs séances, même répétiteur.", price: "Sur devis" },
      { name: "Au mois", detail: "Suivi régulier jusqu'à l'examen.", price: "Sur devis" },
      { name: "Anglais et alphabétisation", detail: "Pour enfants et adultes.", price: "Sur devis" },
    ],
    selection: [
      "Protocole SaaTrust complet en 7 étapes",
      "Vérification des diplômes",
      "Séance d'essai évaluée sur grille pédagogique",
    ],
    safety: "Chaque répétiteur est vérifié avant toute mise en relation.",
    guarantees: COMMON_GUARANTEES,
    faq: [
      { q: "Comment trouver un répétiteur ?", a: "Déposez une demande ou parcourez les profils vérifiés : un chargé de clientèle confirme la disponibilité dans votre commune." },
    ],
  },
  {
    slug: "assist",
    name: "Saa Assist",
    shortName: "Assist",
    icon: "HandHelping",
    theme: "navy",
    phase: "Disponible",
    available: true,
    tagline: "Accompagner nos aînés, avec respect",
    description:
      "Accompagnement des personnes âgées, des personnes à mobilité réduite, des convalescents et des femmes en fin de grossesse ; aide aux démarches administratives.",
    heroStat: { value: "Abonnement", label: "mensuel, avec rapport de visite" },
    services: [
      "Accompagnement des personnes âgées",
      "Aide aux personnes à mobilité réduite",
      "Soutien des convalescents",
      "Aide aux démarches administratives",
    ],
    offers: [
      { name: "Accompagnement à domicile", description: "Présence, aide au quotidien, courses et rendez-vous.", duration: "Abonnement mensuel", price: "Sur devis" },
      { name: "Offre diaspora", description: "Rapport de visite mensuel avec photos horodatées et appel de contrôle.", duration: "Abonnement mensuel", price: "Sur devis" },
    ],
    formulas: [
      { name: "Visites ponctuelles", detail: "Accompagnement à un rendez-vous.", price: "Sur devis" },
      { name: "À la semaine", detail: "Passages réguliers.", price: "Sur devis" },
      { name: "Au mois", detail: "Abonnement avec rapport de visite.", price: "Sur devis" },
      { name: "Diaspora", detail: "Paiement en devises, suivi à distance.", price: "Sur devis" },
    ],
    selection: [
      "Protocole SaaTrust complet en 7 étapes",
      "Mise en situation d'accompagnement",
      "Formation à l'accompagnement des personnes âgées",
    ],
    safety: "L'accompagnant n'effectue aucun acte médical.",
    guarantees: COMMON_GUARANTEES,
    faq: [
      { q: "Mes parents vivent à Kinshasa, je vis en Belgique.", a: "C'est exactement l'offre diaspora : paiement en devises, rapport de visite mensuel avec photos, et un interlocuteur joignable." },
    ],
  },
  {
    slug: "academy",
    name: "Saa Academy",
    shortName: "Academy",
    icon: "Award",
    theme: "teal",
    phase: "Disponible",
    available: true,
    tagline: "Une formation qui se termine par du travail",
    description:
      "Formation certifiante : auto-école, esthétique, informatique, métiers de la garde d'enfants et du service domestique. Tout diplômé entre au registre avec le statut Certifié.",
    heroStat: { value: "Certifiant", label: "cycles de formation métier" },
    services: [
      "Socle SaaCare (gratuit pour les agents)",
      "Spécialisations métier",
      "Cycles certifiants payants",
    ],
    offers: [
      { name: "Socle SaaCare", description: "Savoir-être, hygiène, sécurité domestique, premiers secours. Condition d'entrée au registre.", duration: "1 journée", price: "Sur devis" },
      { name: "Spécialisations métier", description: "Accompagnement Walé (5 jours), garde de nourrisson, cuisine, repassage, nettoyage de bureaux, conduite défensive, accompagnement des aînés.", duration: "2 à 5 jours", price: "Sur devis" },
      { name: "Cycles certifiants", description: "Auto-école, coiffure, maquillage, bureautique, développement web et mobile, préparation aux examens.", duration: "1 à 6 mois", price: "Sur devis" },
    ],
    formulas: [
      { name: "Socle", detail: "Une journée, pour tous les agents.", price: "Sur devis" },
      { name: "Spécialisation", detail: "2 à 5 jours par métier.", price: "Sur devis" },
      { name: "Cycle court", detail: "Formation certifiante courte.", price: "Sur devis" },
      { name: "Cycle long", detail: "Jusqu'à 6 mois.", price: "Sur devis" },
    ],
    selection: [
      "Formations conduites avec des centres partenaires et l'INPP",
      "Tout diplômé entre au registre avec le statut Certifié",
    ],
    safety: "Formations d'abord en partenariat avec des centres existants.",
    guarantees: [
      { title: "Débouché", detail: "Les diplômés rejoignent le registre SaaCare au niveau Certifié." },
      { title: "Formateurs qualifiés", detail: "Modules conçus avec des professionnels, dont une sage-femme pour l'accompagnement Walé." },
      { title: "Certificat", detail: "Un certificat délivré à chaque cycle validé." },
    ],
    faq: [
      { q: "La formation est-elle payante pour les agents ?", a: "Non. Le socle et les spécialisations métier sont gratuits pour les agents. Seuls les cycles certifiants ouverts au public sont payants." },
    ],
  },
];

export const launchDomains = domains.filter((d) => d.available);
export const getDomainBySlug = (slug) => domains.find((d) => d.slug === slug);
