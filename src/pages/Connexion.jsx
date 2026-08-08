import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, LogIn } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import { homeForRole, useAuth } from "../lib/auth";

const REASSURANCE = [
  { icon: ShieldCheck, label: "Vos données ne sont jamais revendues" },
  { icon: Lock, label: "Connexion chiffrée de bout en bout" },
];

export default function Connexion() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      const target = location.state?.from || homeForRole(user.role);
      navigate(target, { replace: true });
    }
  }, [loading, user, navigate, location.state]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    try {
      const nextUser = await login({ email, password });
      navigate(location.state?.from || homeForRole(nextUser.role), { replace: true });
    } catch (err) {
      setError(err.message || "Impossible de continuer.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Seo
        title="Connexion"
        description="Connectez-vous à votre compte SaaCare pour gérer vos réservations ou votre activité de prestataire."
        path="/connexion"
        noindex
      />

      <PageHero
        eyebrow="Espace membre"
        title="Connexion"
        subtitle="Accédez à votre espace pour suivre vos réservations, échanger avec les prestataires ou gérer votre activité sur SaaCare."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Connexion" }]}
        compact
      />

      <section className="bg-paper-100 py-10 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:px-8">
          <Reveal variant="right" delay={0.05} className="order-1 lg:order-2">
            <div className="rounded-2xl border border-ink-900/8 bg-white p-5 sm:p-8">
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <Field id="login-email" name="email" label="E-mail" type="email" autoComplete="email" required />
                <Field
                  id="login-password"
                  name="password"
                  label="Mot de passe"
                  type="password"
                  autoComplete="current-password"
                  required
                />

                {error && (
                  <p className="rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" className="mt-1 w-full" disabled={sending || loading}>
                  <span className="inline-flex items-center gap-2">
                    <LogIn className="size-4" aria-hidden="true" />
                    {sending ? "Patientez…" : "Se connecter"}
                  </span>
                </Button>
              </form>
            </div>
          </Reveal>

          <Reveal variant="left" className="order-2 lg:order-1">
            <ul className="flex flex-col gap-4">
              {REASSURANCE.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-ink-900/70">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
