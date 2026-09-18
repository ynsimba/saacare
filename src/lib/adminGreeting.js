/** Civilités connues pour les comptes admin équipe. */
const ADMIN_TITLES = {
  "yvesnsimba@saacare.com": { title: "M.", name: "Yves" },
  "sephorasoki@saacare.com": { title: "Mme", name: "Sephora" },
  "bellezajohncy@saacare.com": { title: "M.", name: "Johncy" },
};

const FEMALE_FIRST_NAMES = new Set([
  "aline",
  "sephora",
  "belleza",
  "marie",
  "grace",
  "grace",
  "fatou",
  "aisha",
  "amina",
]);

/**
 * Salutation admin selon l’heure et la civilité.
 * Ex. « Bonjour M. Yves », « Bon après-midi Mme Sephora ».
 */
export function adminDayGreeting(user, now = new Date()) {
  const hour = now.getHours();
  const hello = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const email = String(user?.email || "").toLowerCase();
  const known = ADMIN_TITLES[email];
  if (known) return `${hello} ${known.title} ${known.name}`;

  const parts = String(user?.fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return hello;

  const first = parts[0];
  const title = FEMALE_FIRST_NAMES.has(first.toLowerCase()) ? "Mme" : "M.";
  return `${hello} ${title} ${first}`;
}
