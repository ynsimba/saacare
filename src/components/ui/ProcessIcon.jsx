import { Search, CalendarCheck, ShieldCheck, UserCheck, Star } from "lucide-react";

const ICONS = { Search, CalendarCheck, ShieldCheck, UserCheck, Star };

export default function ProcessIcon({ name, className = "" }) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
}
