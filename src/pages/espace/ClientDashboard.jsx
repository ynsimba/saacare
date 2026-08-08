import { Link } from "react-router-dom";
import { Search, ShieldCheck, MessageSquare, ArrowRight } from "lucide-react";
import Seo from "../../lib/Seo";
import Button from "../../components/ui/Button";
import { useAuth } from "../../lib/auth";

const ACTIONS = [
  {
    to: "/trouver-un-prestataire",
    icon: Search,
    title: "Trouver un prestataire",
    description: "Parcourez les professionnels vérifiés près de chez vous.",
  },
  {
    to: "/contact",
    icon: MessageSquare,
    title: "Contacter le support",
    description: "Une question sur une réservation ou un litige ? Écrivez-nous.",
  },
  {
    to: "/espace/profil",
    icon: ShieldCheck,
    title: "Gérer mon profil",
    description: "Mettez à jour vos informations personnelles.",
  },
];

export default function ClientDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(/\s+/)[0] || "";

  return (
    <>
      <Seo title="Espace client" description="Votre espace SaaCare." path="/espace-client" noindex />

      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Espace client</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">
          Bonjour{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-900/60">
          Bienvenue dans votre espace. Réservez un prestataire vérifié, suivez vos démarches et gérez votre
          compte en toute sécurité.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button to="/trouver-un-prestataire" withArrow>
            Rechercher un prestataire
          </Button>
          <Button to="/comment-ca-marche" variant="outline">
            Comment ça marche
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ACTIONS.map(({ to, icon: Icon, title, description }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-ink-900/8 bg-white p-5 transition-colors hover:border-teal-600/30 hover:bg-teal-50/30"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-600 group-hover:text-white">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-900/55">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
              Ouvrir <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
