import { Baby, Car, GraduationCap, HeartHandshake, House, HandHelping, Award } from "lucide-react";

const ICONS = { Baby, Car, GraduationCap, HeartHandshake, House, HandHelping, Award };

/** Pictogrammes des pôles : trait arrondi, une seule métaphore par icône (charte §09). */
export default function DomainIcon({ name, className = "", strokeWidth = 2, ...props }) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" {...props} />;
}
