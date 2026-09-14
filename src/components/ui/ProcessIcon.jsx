import {
  Search,
  ClipboardList,
  PhoneCall,
  ShieldCheck,
  IdCard,
  MapPinHouse,
  FileSearch,
  Users,
  BriefcaseBusiness,
  ClipboardCheck,
  Stethoscope,
  RefreshCcw,
  CalendarCheck,
  Lock,
  UserCheck,
  Scale,
} from "lucide-react";

const ICONS = {
  Search,
  ClipboardList,
  PhoneCall,
  ShieldCheck,
  IdCard,
  MapPinHouse,
  FileSearch,
  Users,
  BriefcaseBusiness,
  ClipboardCheck,
  Stethoscope,
  RefreshCcw,
  CalendarCheck,
  Lock,
  UserCheck,
  Scale,
};

export default function ProcessIcon({ name, className = "" }) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} strokeWidth={2} aria-hidden="true" />;
}
