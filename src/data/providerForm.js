/**
 * Référentiels du dossier de candidature prestataire.
 * Regroupés ici pour que le formulaire reste lisible et que ces listes puissent
 * être alimentées plus tard par l'API sans toucher aux composants.
 */

export const GENDERS = [
  { value: "F", label: "Femme" },
  { value: "M", label: "Homme" },
  { value: "AUTRE", label: "Autre" },
  { value: "NSP", label: "Je préfère ne pas répondre" },
];

export const ID_DOCUMENT_TYPES = [
  { value: "CNI", label: "Carte nationale d'identité" },
  { value: "PASSEPORT", label: "Passeport" },
  { value: "PERMIS", label: "Permis de conduire" },
  { value: "CARTE_ELECTEUR", label: "Carte d'électeur" },
  { value: "AUTRE", label: "Autre pièce officielle" },
];

export const COMMUNES = [
  "Bandalungwa",
  "Barumbu",
  "Bumbu",
  "Gombe",
  "Kalamu",
  "Kasa-Vubu",
  "Kinshasa",
  "Kintambo",
  "Kisenso",
  "Lemba",
  "Limete",
  "Lingwala",
  "Makala",
  "Maluku",
  "Masina",
  "Matete",
  "Mont-Ngafula",
  "Ndjili",
  "Ngaba",
  "Ngaliema",
  "Ngiri-Ngiri",
  "Nsele",
  "Selembao",
];

export const EXPERIENCE_YEARS = [
  { value: "0-1", label: "Moins d'un an" },
  { value: "1-3", label: "1 à 3 ans" },
  { value: "3-6", label: "3 à 6 ans" },
  { value: "6-10", label: "6 à 10 ans" },
  { value: "10+", label: "Plus de 10 ans" },
];

export const EXPERIENCE_LEVELS = [
  { value: "DEBUTANT", label: "Débutant", hint: "Première expérience professionnelle" },
  { value: "INTERMEDIAIRE", label: "Intermédiaire", hint: "Autonome sur les missions courantes" },
  { value: "CONFIRME", label: "Confirmé", hint: "Autonome sur les missions complexes" },
  { value: "EXPERT", label: "Expert", hint: "Référent, capable de former d'autres prestataires" },
];

export const AVAILABILITY_STATUS = [
  { value: "DISPONIBLE", label: "Disponible", tone: "teal", hint: "J'accepte des missions dès maintenant" },
  { value: "OCCUPE", label: "Occupé", tone: "gold", hint: "Je termine une mission en cours" },
  { value: "INDISPONIBLE", label: "Indisponible", tone: "navy", hint: "Je ne prends pas de mission" },
];

export const WEEK_DAYS = [
  { value: "LUN", label: "Lundi", short: "Lun" },
  { value: "MAR", label: "Mardi", short: "Mar" },
  { value: "MER", label: "Mercredi", short: "Mer" },
  { value: "JEU", label: "Jeudi", short: "Jeu" },
  { value: "VEN", label: "Vendredi", short: "Ven" },
  { value: "SAM", label: "Samedi", short: "Sam" },
  { value: "DIM", label: "Dimanche", short: "Dim" },
];

export const TIME_SLOTS = [
  { value: "MATIN", label: "Matin", hint: "6 h – 12 h" },
  { value: "APRES_MIDI", label: "Après-midi", hint: "12 h – 18 h" },
  { value: "SOIR", label: "Soirée", hint: "18 h – 22 h" },
  { value: "NUIT", label: "Nuit", hint: "22 h – 6 h" },
];

export const RESPONSE_TIMES = [
  { value: "2H", label: "Moins de 2 heures" },
  { value: "DEMI_JOURNEE", label: "Dans la demi-journée" },
  { value: "24H", label: "Sous 24 heures" },
  { value: "48H", label: "Sous 48 heures" },
];

export const LANGUAGES = ["Français", "Lingala", "Swahili", "Tshiluba", "Kikongo", "Anglais"];

export const MOBILE_MONEY_OPERATORS = [
  { value: "MPESA", label: "M-Pesa (Vodacom)" },
  { value: "AIRTEL", label: "Airtel Money" },
  { value: "ORANGE", label: "Orange Money" },
];

export const CARD_NETWORKS = [
  { value: "VISA", label: "Visa" },
  { value: "MASTERCARD", label: "Mastercard" },
];

/**
 * Pièces demandées. `required` conditionne la validation ; les autres restent
 * facultatives mais renforcent le dossier — c'est indiqué au candidat.
 */
export const DOCUMENT_TYPES = [
  {
    id: "identite",
    label: "Pièce d'identité",
    hint: "Recto-verso, lisible et en cours de validité",
    required: true,
  },
  {
    id: "diplomes",
    label: "Diplômes et certificats",
    hint: "Formations, attestations de réussite",
    required: false,
  },
  {
    id: "attestations",
    label: "Attestations professionnelles",
    hint: "Anciens employeurs, lettres de recommandation",
    required: false,
  },
  {
    id: "assurance",
    label: "Assurance professionnelle",
    hint: "Si vous en détenez une",
    required: false,
  },
  {
    id: "registre",
    label: "Registre de commerce",
    hint: "Uniquement si vous candidatez en tant qu'entreprise",
    required: false,
  },
  {
    id: "portfolio",
    label: "Portfolio / réalisations",
    hint: "Photos de chantiers, travaux, références visuelles",
    required: false,
  },
];

/** Étapes de la vérification menée par l'équipe qualité après dépôt du dossier. */
export const VERIFICATION_CHECKS = [
  { key: "identite", label: "Identité", detail: "Pièce officielle contrôlée et rapprochée de votre photo" },
  { key: "adresse", label: "Adresse", detail: "Commune de résidence confirmée" },
  { key: "expertise", label: "Expertise", detail: "Diplômes, certificats et mise en situation" },
  { key: "references", label: "Références", detail: "Anciens employeurs ou clients contactés" },
];
