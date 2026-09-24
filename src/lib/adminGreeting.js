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
  "fatou",
  "aisha",
  "amina",
]);

function resolveIdentity(user) {
  const email = String(user?.email || "").toLowerCase();
  const known = ADMIN_TITLES[email];
  if (known) return known;

  const parts = String(user?.fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { title: "", name: "" };

  const first = parts[0];
  const title = FEMALE_FIRST_NAMES.has(first.toLowerCase()) ? "Mme" : "M.";
  return { title, name: first };
}

function helloForHour(hour) {
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

/**
 * Salutation admin selon l’heure et la civilité.
 * Ex. « Bonjour M. Yves », « Bon après-midi Mme Sephora ».
 */
export function adminDayGreeting(user, now = new Date()) {
  const parts = adminDayGreetingParts(user, now);
  if (!parts.name) return parts.hello;
  return `${parts.hello} ${parts.title} ${parts.name}`.replace(/\s+/g, " ").trim();
}

/** Parties séparées pour un rendu typographique plus riche (mobile). */
export function adminDayGreetingParts(user, now = new Date()) {
  const hello = helloForHour(now.getHours());
  const { title, name } = resolveIdentity(user);
  return { hello, title, name };
}
