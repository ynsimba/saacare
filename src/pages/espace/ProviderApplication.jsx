import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, FileSearch } from "lucide-react";
import Seo from "../../lib/Seo";
import Button from "../../components/ui/Button";

const STEPS = [
  { icon: FileSearch, title: "Dossier reçu", detail: "Votre candidature est enregistrée côté équipe qualité." },
  { icon: Clock3, title: "Vérification", detail: "Contrôle d’identité, références et spécialités déclarées." },
  { icon: CheckCircle2, title: "Activation", detail: "Entretien, formation, puis mise en ligne du profil." },
];

export default function ProviderApplication() {
  return (
    <>
      <Seo
        title="Ma candidature"
        description="Suivi de candidature prestataire SaaCare."
        path="/espace-prestataire/candidature"
        noindex
      />

      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Candidature</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">Suivi de dossier</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-900/60">
          Le détail temps réel des dossiers sera branché dès que les candidatures seront liées à votre compte.
          En attendant, vous pouvez déposer ou compléter un dossier via le formulaire public.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold-100 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-gold-800">
          Statut indicatif · En cours de déploiement
        </div>

        <ol className="mt-8 flex flex-col gap-3">
          {STEPS.map(({ icon: Icon, title, detail }, i) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-xl border border-ink-900/8 bg-paper-100/60 px-4 py-3.5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-teal-600 font-mono text-xs font-semibold text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="flex items-center gap-2 font-display text-base font-semibold text-ink-900">
                  <Icon className="size-4 text-teal-700" aria-hidden="true" />
                  {title}
                </span>
                <span className="mt-1 block text-sm text-ink-900/55">{detail}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/devenir-prestataire" withArrow>
            Compléter ma candidature
          </Button>
          <Button to="/contact" variant="outline">
            Contacter l’équipe
          </Button>
        </div>

        <p className="mt-6 text-xs text-ink-900/45">
          Besoin d’aide ?{" "}
          <Link to="/faq" className="font-semibold text-teal-700 hover:text-teal-800">
            Consulter la FAQ
          </Link>
        </p>
      </div>
    </>
  );
}
