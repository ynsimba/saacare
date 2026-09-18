import { useEffect, useState } from "react";
import Seo from "../../lib/Seo";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { useAuth } from "../../lib/auth";
import { COMMUNES } from "../../data/providerForm";

function formatMemberSince(value) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export default function ClientProfile() {
  const { user, updateProfile, changePassword } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
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
    setAddress(user.address || "");
  }, [user]);

  useEffect(() => {
    if (window.location.hash === "#client-profile-edit") {
      document.getElementById("client-profile-edit")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

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
        address: address.trim(),
      });
      setProfileMessage("Profil mis à jour.");
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

  const memberSince = formatMemberSince(user?.createdAt);

  return (
    <>
      <Seo title="Mon profil" description="Profil client SaaCare." path="/client/profil" noindex />

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center rounded-lg bg-paper-200 px-3 py-1.5 font-medium text-ink-900">
          {user?.email}
        </span>
        {memberSince && <span className="text-ink-900/50">Membre depuis {memberSince}</span>}
      </div>

      <form
        id="client-profile-edit"
        onSubmit={onSaveProfile}
        className="mt-5 scroll-mt-24 rounded-2xl border border-ink-900/8 bg-white p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">Informations personnelles</h2>
            <p className="mt-0.5 text-sm text-ink-900/55">Modifiables à tout moment.</p>
          </div>
          <Button type="submit" size="sm" className="w-full sm:w-fit" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field
            id="profile-name"
            label="Nom complet"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            className="sm:col-span-3"
          />
          <Field
            id="profile-phone"
            label="Téléphone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+243…"
            autoComplete="tel"
            className="sm:col-span-1"
          />
          <Field
            id="profile-commune"
            label="Commune"
            as="select"
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            options={[{ value: "", label: "Choisir…" }, ...COMMUNES.map((c) => ({ value: c, label: c }))]}
            className="sm:col-span-2"
          />
          <Field
            id="profile-address"
            label="Adresse complète"
            as="textarea"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="N°, avenue ; Quartier, Commune, Ville, Pays"
            hint="Ex. 12, av. des Cliniques ; Socimat, Gombe, Kinshasa, RD Congo"
            autoComplete="street-address"
            className="sm:col-span-3"
          />
        </div>

        {profileError && (
          <p className="mt-3 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
            {profileError}
          </p>
        )}
        {profileMessage && (
          <p className="mt-3 rounded-lg border border-teal-600/20 bg-teal-50 px-3 py-2 text-sm text-teal-800" role="status">
            {profileMessage}
          </p>
        )}
      </form>

      {user?.hasPassword !== false && (
        <form onSubmit={onChangePassword} className="mt-6 rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
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
