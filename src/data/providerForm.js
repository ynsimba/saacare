/**
 * Référentiels du formulaire de candidature en six étapes (cahier des charges §5).
 * Vocabulaire courant, compétences en cases à cocher par métier — jamais en texte libre.
 */

export const COMMUNES = [
  "Bandalungwa",
  "Barumbu",
  "Bumbu",
  "Gombe",
  "Kalamu",
  "Kasa-Vubu",
  "Kimbanseke",
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

export const GENDERS = [
  { value: "F", label: "Femme" },
  { value: "M", label: "Homme" },
];

export const CIVIL_STATUSES = [
  { value: "celibataire", label: "Célibataire" },
  { value: "marie", label: "Marié(e)" },
  { value: "divorce", label: "Divorcé(e)" },
  { value: "veuf", label: "Veuf / Veuve" },
  { value: "union-libre", label: "Union libre" },
];

export const RELIGIONS = [
  { value: "chretien", label: "Chrétien(ne)" },
  { value: "musulman", label: "Musulman(e)" },
  { value: "kimbanguiste", label: "Kimbanguiste" },
  { value: "autre", label: "Autre" },
  { value: "aucune", label: "Aucune / préfère ne pas dire" },
];

export const ID_TYPES = [
  { value: "carte-electeur", label: "Carte d'électeur" },
  { value: "passeport", label: "Passeport" },
  { value: "permis", label: "Permis de conduire" },
];

export const EMERGENCY_RELATIONS = [
  { value: "conjoint", label: "Conjoint(e)" },
  { value: "parent", label: "Parent" },
  { value: "frere-soeur", label: "Frère / Sœur" },
  { value: "enfant", label: "Enfant" },
  { value: "ami", label: "Ami(e)" },
  { value: "autre", label: "Autre" },
];

export const LANGUAGES = ["Français", "Lingala", "Swahili", "Tshiluba", "Kikongo", "Anglais"];

export const EXPERIENCE_RANGES = [
  { value: "moins-2", label: "Moins de 2 ans" },
  { value: "2-5", label: "2 à 5 ans" },
  { value: "plus-5", label: "Plus de 5 ans" },
];

/** Métiers recherchés, rattachés à leur pôle, avec les compétences cochables. */
export const METIERS = [
  { value: "nounou", label: "Nounou", pole: "kids-care", skills: ["Garde de nourrisson", "Garde de nuit", "Sortie d'école", "Aide aux devoirs", "Préparation des repas de l'enfant", "Éveil et jeux"] },
  { value: "accompagnante-wale", label: "Accompagnante Walé", pole: "wale", skills: ["Repos post-partum", "Soins de bien-être non médicaux", "Massages corporels", "Repas adaptés", "Soutien émotionnel", "Aide au quotidien"] },
  { value: "aide-menagere", label: "Aide-ménagère", pole: "home", skills: ["Entretien courant", "Nettoyage complet", "Repassage", "Lessive", "Courses du quotidien"] },
  { value: "cuisinier", label: "Cuisinier", pole: "home", skills: ["Cuisine congolaise", "Cuisine internationale", "Pâtisserie", "Réceptions", "Gestion des courses"] },
  { value: "chauffeur", label: "Chauffeur", pole: "driver", skills: ["Conduite en ville", "Trajets aéroport", "Conduite de direction", "Conduite de nuit", "Entretien du véhicule"] },
  {
    value: "courtier",
    label: "Courtier",
    pole: "driver",
    skills: [
      "Courses au marché",
      "Récupération et dépôt",
      "Courses du quotidien",
      "Documents et colis",
      "Consignes client",
    ],
  },
  {
    value: "livreur",
    label: "Livreur",
    pole: "driver",
    skills: [
      "Livraison particuliers",
      "Livraison entreprises",
      "Tournées en ville",
      "Suivi des colis",
      "Remise contre signature",
    ],
  },
  { value: "electricien", label: "Électricien", pole: "home", skills: ["Installation électrique", "Tableau électrique", "Groupe électrogène", "Éclairage", "Panneaux solaires"] },
  { value: "plombier", label: "Plombier", pole: "home", skills: ["Recherche de fuite", "Installation sanitaire", "Débouchage", "Pompe et réservoir"] },
  { value: "carreleur", label: "Carreleur", pole: "home", skills: ["Pose de carrelage", "Faïence", "Ragréage"] },
  { value: "macon", label: "Maçon", pole: "home", skills: ["Maçonnerie", "Enduit", "Fondations", "Réparations"] },
  { value: "charpentier", label: "Charpentier", pole: "home", skills: ["Charpente", "Menuiserie", "Portes et fenêtres"] },
  { value: "tolier", label: "Tôlier", pole: "home", skills: ["Toiture en tôle", "Gouttières", "Soudure"] },
  { value: "ajusteur", label: "Ajusteur", pole: "home", skills: ["Ajustage", "Usinage", "Maintenance mécanique"] },
  { value: "jardinier", label: "Jardinier", pole: "home", skills: ["Entretien du jardin", "Taille", "Arrosage", "Potager"] },
  { value: "repetiteur", label: "Répétiteur", pole: "tutora", skills: ["Primaire", "Secondaire", "Examen d'État", "Anglais", "Alphabétisation"] },
  { value: "accompagnant-personne-agee", label: "Accompagnant de personne âgée", pole: "assist", skills: ["Aide au lever et à la toilette", "Accompagnement aux rendez-vous", "Préparation des repas", "Démarches administratives"] },
];

export const getMetier = (value) => METIERS.find((m) => m.value === value);

export const DRIVING = ["Permis de conduire", "Véhicule personnel", "Moto"];

export const EMPLOYER_TYPES = [
  { value: "famille", label: "Une famille" },
  { value: "entreprise", label: "Une entreprise" },
  { value: "ong", label: "Une ONG ou une ambassade" },
  { value: "independant", label: "À mon compte" },
  { value: "autre", label: "Autre" },
];

export const GUARANTOR_LINKS = [
  { value: "famille", label: "Famille" },
  { value: "ancien-employeur", label: "Ancien employeur" },
  { value: "voisin", label: "Voisin" },
  { value: "eglise", label: "Église ou association" },
  { value: "autre", label: "Autre" },
];

export const AVAILABILITY_TYPES = [
  { value: "plein-temps", label: "Plein temps" },
  { value: "temps-partiel", label: "Temps partiel" },
  { value: "missions", label: "Missions ponctuelles" },
  { value: "nuit", label: "Nuit" },
];

export const HEARD_FROM = [
  { value: "agent", label: "Un agent SaaCare (parrainage)" },
  { value: "affiche", label: "Une affiche" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "reseaux", label: "Facebook ou Instagram" },
  { value: "eglise", label: "Église ou association" },
  { value: "radio", label: "Radio" },
  { value: "autre", label: "Autre" },
];

export const APPLICATION_DOCUMENTS = [
  { id: "idRecto", label: "Pièce d'identité — recto", hint: "Carte d'électeur ou passeport, bien lisible", required: true },
  { id: "idVerso", label: "Pièce d'identité — verso", hint: "L'autre face de la même pièce", required: true },
  { id: "face", label: "Photo de votre visage", hint: "De face, sans lunettes ni chapeau", required: true },
  { id: "certificates", label: "Certificats", hint: "Si vous en avez : formation, permis, diplôme", required: false },
];
