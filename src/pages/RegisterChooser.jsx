import { Link } from "react-router-dom";
import { UserRound, Briefcase } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import Reveal, { Stagger, RevealItem } from "../components/ui/Reveal";
import Button from "../components/ui/Button";

const OPTIONS = [
  {
    to: "/inscription/client",
    icon: UserRound,
    title: "Je suis un client",
    text: "Créez un compte pour demander un prestataire vérifié et suivre vos prestations.",
    cta: "Inscription client",
  },
  {
    to: "/inscription/prestataire",
    icon: Briefcase,
    title: "Je candidate comme prestataire",
    text: "Ouvrez un dossier : SaaCare valide votre profil avant toute mission.",
    cta: "Candidature prestataire",
  },
];

export default function RegisterChooser() {
  return (
    <>
      <Seo
        title="Inscription"
        description="Créez un compte client ou candidatez comme prestataire sur SaaCare."
        path="/inscription"
      />
      <PageHero
        eyebrow="Rejoindre SaaCare"
        title="Créer un compte"
        subtitle="Choisissez le type de compte adapté à votre besoin."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Inscription" }]}
        compact
      />

      <section className="bg-paper-100 py-10 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {OPTIONS.map(({ to, icon: Icon, title, text, cta }) => (
              <RevealItem key={to}>
                <div className="flex h-full flex-col rounded-2xl border border-ink-900/8 bg-white p-6 shadow-soft">
                  <span className="grid size-11 place-items-center rounded-full bg-teal-50 text-teal-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 font-display text-xl font-bold text-ink-900">{title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-900/65">{text}</p>
                  <Button to={to} className="mt-6 w-full sm:w-auto" withArrow>
                    {cta}
                  </Button>
                </div>
              </RevealItem>
            ))}
          </Stagger>
          <Reveal className="mt-8 text-center text-sm text-ink-900/60">
            Déjà inscrit ?{" "}
            <Link to="/login" className="font-semibold text-teal-700 hover:underline">
              Se connecter
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
