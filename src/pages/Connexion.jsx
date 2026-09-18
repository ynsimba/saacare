import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GIS_SRC = "https://accounts.google.com/gsi/client";

function GoogleMark({ className = "size-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function loadGisScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("Navigateur requis."));
  if (window.google?.accounts?.id) return Promise.resolve();
  const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Impossible de charger Google.")), {
        once: true,
      });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Impossible de charger Google."));
    document.head.appendChild(script);
  });
}

export default function Connexion() {
  const { login, loginWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sending, setSending] = useState(false);
  const [googleSending, setGoogleSending] = useState(false);
  const [error, setError] = useState("");
  const googleReady = useRef(false);

  useEffect(() => {
    if (!loading && user) {
      const target = location.state?.from || homeForRole(user.role);
      navigate(target, { replace: true });
    }
  }, [loading, user, navigate, location.state]);

  const finishGoogle = useCallback(
    async (credential) => {
      setGoogleSending(true);
      setError("");
      try {
        const nextUser = await loginWithGoogle(credential);
        navigate(location.state?.from || homeForRole(nextUser.role), { replace: true });
      } catch (err) {
        setError(err.message || "Connexion Google impossible.");
      } finally {
        setGoogleSending(false);
      }
    },
    [loginWithGoogle, navigate, location.state]
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || googleReady.current) return;
    let cancelled = false;

    loadGisScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response?.credential) finishGoogle(response.credential);
            else setError("Réponse Google incomplète.");
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        googleReady.current = true;
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Google indisponible.");
      });

    return () => {
      cancelled = true;
    };
  }, [finishGoogle]);

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

  const onGoogleClick = async () => {
    setError("");
    if (!GOOGLE_CLIENT_ID) {
      setError("La connexion Google n'est pas configurée.");
      return;
    }
    try {
      await loadGisScript();
      if (!window.google?.accounts?.id) {
        setError("Google Identity Services indisponible.");
        return;
      }
      if (!googleReady.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response?.credential) finishGoogle(response.credential);
            else setError("Réponse Google incomplète.");
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        googleReady.current = true;
      }
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback : bouton GIS officiel rendu hors écran puis clic programmatique
          const host = document.getElementById("google-btn-host");
          if (!host) {
            setError("Utilisez un compte Google autorisé (mode test) ou réessayez.");
            return;
          }
          host.innerHTML = "";
          window.google.accounts.id.renderButton(host, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: 320,
          });
          const btn = host.querySelector("div[role=button]");
          btn?.click();
        }
      });
    } catch (err) {
      setError(err.message || "Connexion Google impossible.");
    }
  };

  return (
    <>
      <Seo
        title="Connexion"
        description="Connectez-vous à votre compte SaaCare pour gérer vos réservations ou votre activité de prestataire."
        path="/login"
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

                <Button type="submit" size="lg" className="mt-1 w-full" disabled={sending || loading || googleSending}>
                  <span className="inline-flex items-center gap-2">
                    <LogIn className="size-4" aria-hidden="true" />
                    {sending ? "Patientez…" : "Se connecter"}
                  </span>
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-ink-900/10" />
                <span className="text-xs font-medium uppercase tracking-wide text-ink-900/40">ou</span>
                <span className="h-px flex-1 bg-ink-900/10" />
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                disabled={sending || loading || googleSending}
                onClick={onGoogleClick}
              >
                <span className="inline-flex items-center gap-2.5">
                  <GoogleMark />
                  {googleSending ? "Connexion Google…" : "Continuer avec Google"}
                </span>
              </Button>
              <div id="google-btn-host" className="sr-only" aria-hidden="true" />

              <p className="mt-6 text-center text-sm text-ink-900/60">
                Pas encore de compte ?{" "}
                <Link to="/inscription" className="font-semibold text-teal-700 hover:underline">
                  S’inscrire
                </Link>
              </p>
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
