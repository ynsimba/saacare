import { Link } from "react-router-dom";
import { BadgeCheck, ClipboardList, ArrowRight, Wallet } from "lucide-react";
import Seo from "../../lib/Seo";
import Button from "../../components/ui/Button";
import { useAuth } from "../../lib/auth";

const ACTIONS = [
  {
    to: "/espace-prestataire/candidature",
    icon: ClipboardList,
    title: "Suivre ma candidature",
    description: "Statut de votre dossier et prochaines étapes qualité.",
  },
  {
    to: "/espace/profil",
    icon: BadgeCheck,
    title: "Mon profil pro",
    description: "Coordonnées et informations visibles par l’équipe SaaCare.",
  },
  {
    to: "/contact",
    icon: Wallet,
    title: "Support prestataire",
    description: "Questions sur la certification, les missions ou le paiement.",
  },
];

export default function ProviderDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(/\s+/)[0] || "";

  return (
    <>
      <Seo
        title="Espace prestataire"
        description="Votre espace prestataire SaaCare."
        path="/espace-prestataire"
        noindex
      />

      <div className="rounded-2xl border border-ink-900/8 bg-gradient-to-br from-navy-800 via-navy-900 to-ink-950 p-6 text-paper-50 sm:p-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">
          Espace prestataire
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold">
          Bonjour{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-paper-100/65">
          Gérez votre activité sur SaaCare : candidature, profil et échanges avec l’équipe qualité.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button to="/espace-prestataire/candidature" variant="onDark" withArrow>
            Voir ma candidature
          </Button>
          <Button to="/devenir-prestataire" variant="glass">
            Mettre à jour mon dossier
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ACTIONS.map(({ to, icon: Icon, title, description }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-ink-900/8 bg-white p-5 transition-colors hover:border-navy-700/25"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-navy-700/8 text-navy-700 transition-colors group-hover:bg-navy-700 group-hover:text-white">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-900/55">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-700">
              Ouvrir <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
