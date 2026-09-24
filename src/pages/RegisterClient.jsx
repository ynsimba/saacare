import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import { homeForRole, useAuth } from "../lib/auth";
import { COMMUNES } from "../data/providerForm";

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

export default function RegisterClient() {
  const { register, loginWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [googleSending, setGoogleSending] = useState(false);
  const [error, setError] = useState("");
  const googleReady = useRef(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    commune: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!loading && user) navigate(homeForRole(user.role), { replace: true });
  }, [loading, user, navigate]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const finishGoogle = useCallback(
    async (credential) => {
      setGoogleSending(true);
      setError("");
      try {
        const nextUser = await loginWithGoogle(credential);
        navigate(homeForRole(nextUser.role), { replace: true });
      } catch (err) {
        setError(err.message || "Inscription Google impossible.");
      } finally {
        setGoogleSending(false);
      }
    },
    [loginWithGoogle, navigate],
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
      .catch(() => {
        /* Google optionnel sur cette page */
      });
    return () => {
      cancelled = true;
    };
  }, [finishGoogle]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setSending(true);
    try {
      const nextUser = await register({
        role: "client",
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        commune: form.commune,
        address: form.address.trim(),
        password: form.password,
      });
      navigate(homeForRole(nextUser.role), { replace: true });
    } catch (err) {
      setError(err.message || "Inscription impossible.");
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
          const host = document.getElementById("google-register-host");
          if (!host) {
            setError("Réessayez ou créez un compte avec e-mail et mot de passe.");
            return;
          }
          host.innerHTML = "";
          window.google.accounts.id.renderButton(host, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signup_with",
            shape: "rectangular",
            width: 320,
          });
          host.querySelector("div[role=button]")?.click();
        }
      });
    } catch (err) {
      setError(err.message || "Inscription Google impossible.");
    }
  };

  return (
    <>
      <Seo
        title="Inscription client"
        description="Créez votre compte client SaaCare pour demander des prestations vérifiées à Kinshasa."
        path="/inscription/client"
      />
      <PageHero
        eyebrow="Compte client"
        title="Créer un compte client"
        subtitle="Inscrivez-vous pour déposer des demandes et suivre vos prestations. La mise en relation reste assurée par SaaCare."
        breadcrumb={[
          { label: "Accueil", to: "/" },
          { label: "Inscription", to: "/inscription" },
          { label: "Client" },
        ]}
        compact
      />

      <section className="bg-paper-100 py-10 sm:py-16">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <Reveal>
            <div className="rounded-2xl border border-ink-900/8 bg-white p-5 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-teal-50 text-teal-700">
                  <UserRound className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-lg font-bold text-ink-900">Inscription client</p>
                  <p className="text-sm text-ink-900/55">Compte gratuit · sans engagement</p>
                </div>
              </div>

              {GOOGLE_CLIENT_ID && (
                <>
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
                      {googleSending ? "Inscription Google…" : "S’inscrire avec Google"}
                    </span>
                  </Button>
                  <div id="google-register-host" className="sr-only" aria-hidden="true" />
                  <div className="my-6 flex items-center gap-3" aria-hidden="true">
                    <span className="h-px flex-1 bg-ink-900/10" />
                    <span className="text-xs font-medium uppercase tracking-wide text-ink-900/40">ou</span>
                    <span className="h-px flex-1 bg-ink-900/10" />
                  </div>
                </>
              )}

              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <Field label="Nom complet" required value={form.fullName} onChange={set("fullName")} autoComplete="name" />
                <Field label="E-mail" type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
                <Field
                  label="Téléphone"
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  autoComplete="tel"
                  hint="Nous vous rappelons à ce numéro"
                />
                <Field
                  label="Commune"
                  as="select"
                  value={form.commune}
                  onChange={set("commune")}
                  options={COMMUNES.map((c) => ({ value: c, label: c }))}
                />
                <Field
                  label="Adresse"
                  value={form.address}
                  onChange={set("address")}
                  autoComplete="street-address"
                  hint="Optionnel — facilite la mise en relation"
                />
                <Field
                  label="Mot de passe"
                  type="password"
                  required
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="new-password"
                  hint="Au moins 8 caractères"
                />
                <Field
                  label="Confirmer le mot de passe"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  autoComplete="new-password"
                />

                {error && (
                  <p className="rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" className="mt-1 w-full" disabled={sending || loading || googleSending}>
                  {sending ? "Création du compte…" : "Créer mon compte client"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-ink-900/60">
                Déjà inscrit ?{" "}
                <Link to="/login" className="font-semibold text-teal-700 hover:underline">
                  Se connecter
                </Link>
              </p>
              <p className="mt-2 text-center text-sm text-ink-900/60">
                Vous souhaitez travailler avec SaaCare ?{" "}
                <Link to="/inscription/prestataire" className="font-semibold text-teal-700 hover:underline">
                  Candidater comme prestataire
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
