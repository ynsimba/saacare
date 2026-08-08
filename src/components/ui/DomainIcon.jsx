import { Baby, Car, GraduationCap, Hammer } from "lucide-react";

const ICONS = { Baby, Car, GraduationCap, Hammer };

export default function DomainIcon({ name, className = "", strokeWidth = 1.75, ...props }) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" {...props} />;
}
