import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CalendarDays, Mail, MapPin, Pencil, Phone, Shield, X } from "lucide-react";
import Seo from "../../lib/Seo";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { useAuth } from "../../lib/auth";

function roleLabel(role) {
  if (role === "prestataire") return "Prestataire";
  if (role === "admin") return "Administrateur";
  return "Client";
}

function formatMemberSince(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const location = useLocation();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [commune, setCommune] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdError, setPwdError] = useState("");

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || "");
    setPhone(user.phone || "");
    setCommune(user.commune || "");
  }, [user]);

  useEffect(() => {
    const openEdit = () => {
      setEditing(true);
      requestAnimationFrame(() => {
        document.getElementById("profile-edit")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    if (location.hash === "#profile-edit") openEdit();

    window.addEventListener("saacare:profile-edit", openEdit);
    return () => window.removeEventListener("saacare:profile-edit", openEdit);
  }, [location.hash, location.key]);

  const initials = (user?.fullName || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const startEdit = () => {
    setFullName(user?.fullName || "");
    setPhone(user?.phone || "");
    setCommune(user?.commune || "");
    setProfileError("");
    setProfileMessage("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setFullName(user?.fullName || "");
    setPhone(user?.phone || "");
    setCommune(user?.commune || "");
    setProfileError("");
    setProfileMessage("");
    setEditing(false);
  };

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileError("");
    setProfileMessage("");
    try {
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        commune: commune.trim(),
      });
      setProfileMessage("Profil mis à jour.");
      setEditing(false);
    } catch (err) {
      setProfileError(err.message || "Impossible d’enregistrer.");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    setPwdSaving(true);
    setPwdError("");
    setPwdMessage("");
    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPwdMessage("Mot de passe mis à jour.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwdError(err.message || "Impossible de changer le mot de passe.");
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <>
      <Seo title="Mon profil" description="Profil SaaCare." path="/prestataire/profil" noindex />

      <div id="profile-edit" className="scroll-mt-24 rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-navy-700 font-mono text-xl font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Compte</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-ink-900">Mon profil</h1>
              <p className="mt-1 text-sm text-ink-900/55">Informations et sécurité de votre compte SaaCare.</p>
            </div>
          </div>

          {!editing ? (
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-paper-200 text-ink-900 transition-colors hover:bg-teal-50 hover:text-teal-800"
              aria-label="Modifier les informations"
              title="Modifier"
            >
              <Pencil className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-paper-200 text-ink-900 transition-colors hover:bg-coral-100 hover:text-coral-800"
              aria-label="Annuler la modification"
              title="Annuler"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {!editing ? (
          <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-ink-900/8 bg-paper-100/70 px-4 py-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
              <div>
                <dt className="font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-ink-900/45">E-mail</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink-900">{user?.email || "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-ink-900/8 bg-paper-100/70 px-4 py-3">
              <Shield className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
              <div>
                <dt className="font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-ink-900/45">Rôle</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink-900">{roleLabel(user?.role)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-ink-900/8 bg-paper-100/70 px-4 py-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
              <div>
                <dt className="font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-ink-900/45">Téléphone</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink-900">{user?.phone || "Non renseigné"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-ink-900/8 bg-paper-100/70 px-4 py-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
              <div>
                <dt className="font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-ink-900/45">Commune</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink-900">{user?.commune || "Non renseignée"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-ink-900/8 bg-paper-100/70 px-4 py-3 sm:col-span-2">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
              <div>
                <dt className="font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-ink-900/45">
                  Membre depuis
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-ink-900">{formatMemberSince(user?.createdAt)}</dd>
              </div>
            </div>
          </dl>
        ) : (
          <form onSubmit={onSaveProfile} className="mt-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="profile-name"
                label="Nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="sm:col-span-2"
              />
              <Field
                id="profile-phone"
                label="Téléphone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+243 …"
                autoComplete="tel"
              />
              <Field
                id="profile-commune"
                label="Commune"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                placeholder="Ex. Gombe, Ngaliema…"
              />
              <Field
                id="profile-email"
                label="E-mail"
                type="email"
                value={user?.email || ""}
                disabled
                hint="L’e-mail ne peut pas être modifié pour le moment."
                className="sm:col-span-2"
              />
            </div>

            {profileError && (
              <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
                {profileError}
              </p>
            )}
            {profileMessage && (
              <p className="mt-4 rounded-lg border border-teal-600/20 bg-teal-50 px-3 py-2 text-sm text-teal-800" role="status">
                {profileMessage}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
              <Button type="button" variant="outline" onClick={cancelEdit} disabled={saving}>
                Annuler
              </Button>
            </div>
          </form>
        )}
      </div>

      {user?.hasPassword !== false && (
        <form
          onSubmit={onChangePassword}
          className="mt-6 rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8"
        >
          <h2 className="font-display text-xl font-bold text-ink-900">Sécurité</h2>
          <p className="mt-1 text-sm text-ink-900/55">Changez votre mot de passe pour sécuriser votre compte.</p>

          <div className="mt-6 flex max-w-lg flex-col gap-4">
            <Field
              id="pwd-current"
              label="Mot de passe actuel"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Field
              id="pwd-new"
              label="Nouveau mot de passe"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              hint="Au moins 8 caractères."
            />
            <Field
              id="pwd-confirm"
              label="Confirmer le mot de passe"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {pwdError && (
            <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
              {pwdError}
            </p>
          )}
          {pwdMessage && (
            <p className="mt-4 rounded-lg border border-teal-600/20 bg-teal-50 px-3 py-2 text-sm text-teal-800" role="status">
              {pwdMessage}
            </p>
          )}

          <Button type="submit" variant="outline" className="mt-6 w-full sm:w-fit" disabled={pwdSaving}>
            {pwdSaving ? "Mise à jour…" : "Changer le mot de passe"}
          </Button>
        </form>
      )}

      {user?.hasPassword === false && (
        <div className="mt-6 rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-ink-900">Sécurité</h2>
          <p className="mt-1 text-sm text-ink-900/55">
            Ce compte est connecté via Google. La gestion du mot de passe se fait dans votre compte Google.
          </p>
        </div>
      )}
    </>
  );
}
