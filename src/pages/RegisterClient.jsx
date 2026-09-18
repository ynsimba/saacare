import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import { homeForRole, useAuth } from "../lib/auth";
import { COMMUNES } from "../data/providerForm";

export default function RegisterClient() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    commune: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!loading && user) navigate(homeForRole(user.role), { replace: true });
  }, [loading, user, navigate]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
        password: form.password,
      });
      navigate(homeForRole(nextUser.role), { replace: true });
    } catch (err) {
      setError(err.message || "Inscription impossible.");
    } finally {
      setSending(false);
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

              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <Field label="Nom complet" required value={form.fullName} onChange={set("fullName")} autoComplete="name" />
                <Field label="E-mail" type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
                <Field label="Téléphone" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" hint="Nous vous rappelons à ce numéro" />
                <Field
                  label="Commune"
                  as="select"
                  value={form.commune}
                  onChange={set("commune")}
                  options={COMMUNES.map((c) => ({ value: c, label: c }))}
                />
                <Field label="Mot de passe" type="password" required value={form.password} onChange={set("password")} autoComplete="new-password" hint="Au moins 8 caractères" />
                <Field label="Confirmer le mot de passe" type="password" required value={form.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" />

                {error && (
                  <p className="rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" className="mt-1 w-full" disabled={sending || loading}>
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
