import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Camera, Pencil, Trash2, X } from "lucide-react";
import Seo from "../../lib/Seo";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import { DeskAlert, DeskHeading, initials } from "../../components/admin/DeskUI";
import { fileToDataUrl, onMediaChange, readMedia, writeMedia } from "../../lib/userMedia";

const MAX_BYTES = 2.5 * 1024 * 1024;

const PLATFORM_FIELDS = [
  { key: "company_name", label: "Nom de l’entreprise" },
  { key: "mobile_money_number", label: "Numéro Mobile Money" },
  { key: "support_phone", label: "Téléphone support" },
  { key: "support_email", label: "E-mail support" },
];

export default function AdminSettings() {
  const { user, updateProfile, changePassword } = useAuth();
  const location = useLocation();
  const avatarInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdError, setPwdError] = useState("");

  const [platform, setPlatform] = useState({
    company_name: "",
    mobile_money_number: "",
    support_phone: "",
    support_email: "",
  });
  const [platformSaving, setPlatformSaving] = useState(false);
  const [platformMessage, setPlatformMessage] = useState("");
  const [platformError, setPlatformError] = useState("");

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || "");
    setPhone(user.phone || "");
    setAvatarUrl(readMedia(user.id, "avatar"));
  }, [user]);

  useEffect(() => {
    api
      .adminPlatformSettings()
      .then((data) => {
        const s = data.settings || {};
        setPlatform({
          company_name: s.company_name || "",
          mobile_money_number: s.mobile_money_number || "",
          support_phone: s.support_phone || "",
          support_email: s.support_email || "",
        });
      })
      .catch((err) => setPlatformError(err.message || "Impossible de charger les paramètres plateforme."));
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;
    return onMediaChange(({ userId, kind, value }) => {
      if (String(userId) === String(user.id) && kind === "avatar") setAvatarUrl(value || "");
    });
  }, [user?.id]);

  useEffect(() => {
    if (location.hash !== "#admin-profile-edit" && location.hash !== "#plateforme") return;
    requestAnimationFrame(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.hash, location.key]);

  const startEdit = () => {
    setFullName(user?.fullName || "");
    setPhone(user?.phone || "");
    setProfileError("");
    setProfileMessage("");
    setEditing(true);
    requestAnimationFrame(() => document.getElementById("admin-name")?.focus());
  };

  const cancelEdit = () => {
    setFullName(user?.fullName || "");
    setPhone(user?.phone || "");
    setProfileError("");
    setEditing(false);
  };

  const onPickAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    setAvatarError("");
    if (!file || !user?.id) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Choisissez une image (JPG, PNG, WebP…).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setAvatarError("Image trop lourde (max. 2,5 Mo).");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      writeMedia(user.id, "avatar", dataUrl);
      setAvatarUrl(dataUrl);
      setProfileMessage("Photo de profil mise à jour.");
    } catch {
      setAvatarError("Impossible de lire cette image.");
    }
  };

  const onRemoveAvatar = () => {
    if (!user?.id) return;
    writeMedia(user.id, "avatar", "");
    setAvatarUrl("");
    setAvatarError("");
    setProfileMessage("Photo de profil retirée.");
  };

  const onSaveProfile = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setProfileError("");
    setProfileMessage("");
    try {
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        commune: user?.commune || "",
      });
      setProfileMessage("Profil administrateur mis à jour.");
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
      await changePassword({ currentPassword, newPassword, confirmPassword });
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

  const onSavePlatform = async (e) => {
    e.preventDefault();
    setPlatformSaving(true);
    setPlatformError("");
    setPlatformMessage("");
    try {
      const data = await api.updateAdminPlatformSettings(platform);
      const s = data.settings || {};
      setPlatform({
        company_name: s.company_name || "",
        mobile_money_number: s.mobile_money_number || "",
        support_phone: s.support_phone || "",
        support_email: s.support_email || "",
      });
      setPlatformMessage("Paramètres plateforme enregistrés.");
    } catch (err) {
      setPlatformError(err.message || "Impossible d’enregistrer.");
    } finally {
      setPlatformSaving(false);
    }
  };

  return (
    <>
      <Seo title="Paramètres" path="/admin/parametres" noindex />
      <DeskHeading as="h1">Paramètres</DeskHeading>
      <p className="mt-2 text-sm text-desk-ink/60">
        Compte administrateur, sécurité et{" "}
        <Link to="#plateforme" className="font-semibold text-teal-800 underline-offset-2 hover:underline">
          paramètres plateforme
        </Link>
        .
      </p>

      <form
        id="plateforme"
        onSubmit={onSavePlatform}
        className="mt-5 scroll-mt-24 rounded-3xl bg-white p-5 sm:p-6"
      >
        <h2 className="text-lg font-semibold tracking-tight">Plateforme</h2>
        <p className="mt-1 text-sm text-desk-ink/55">
          Coordonnées affichées aux clients pour les paiements Mobile Money.
        </p>

        <div className="mt-5 grid max-w-xl gap-3 sm:grid-cols-2">
          {PLATFORM_FIELDS.map((f) => (
            <label key={f.key} className={`block ${f.key === "company_name" || f.key === "support_email" ? "sm:col-span-2" : ""}`}>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-desk-ink/45">
                {f.label}
              </span>
              <input
                type={f.key.includes("email") ? "email" : "text"}
                value={platform[f.key] || ""}
                onChange={(e) => setPlatform((p) => ({ ...p, [f.key]: e.target.value }))}
                className="h-12 w-full rounded-2xl bg-desk-canvas px-4 text-sm font-medium text-desk-ink outline-none transition-[background-color] focus:bg-white focus-visible:outline-none"
              />
            </label>
          ))}
        </div>

        {platformError && (
          <div className="mt-4">
            <DeskAlert>{platformError}</DeskAlert>
          </div>
        )}
        {platformMessage && (
          <p className="mt-4 rounded-2xl bg-desk-mint px-4 py-2.5 text-sm font-medium" role="status">
            {platformMessage}
          </p>
        )}

        <Button type="submit" className="mt-5" disabled={platformSaving}>
          {platformSaving ? "Enregistrement…" : "Enregistrer la plateforme"}
        </Button>
      </form>

      <form
        id="admin-profile-edit"
        onSubmit={onSaveProfile}
        className="mt-5 scroll-mt-24 rounded-3xl bg-white p-5 sm:p-6"
      >
        <h2 className="text-lg font-semibold tracking-tight">Profil</h2>
        <p className="mt-1 text-sm text-desk-ink/55">Photo et informations visibles dans le back-office.</p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <div className="relative">
            <span className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-desk-butter text-xl font-bold text-desk-ink">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                initials(user?.fullName || "Admin")
              )}
            </span>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full bg-desk-ink text-white shadow-soft transition-transform hover:scale-105"
              aria-label="Changer la photo de profil"
              title="Changer la photo"
            >
              <Camera className="size-4" aria-hidden="true" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={onPickAvatar}
            />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-tight text-desk-ink">
              {fullName.trim() || user?.fullName || "Administrateur"}
            </p>
            <p className="mt-0.5 text-sm text-desk-ink/55">Photo de profil · JPG, PNG ou WebP — 2,5 Mo max.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="rounded-full bg-desk-canvas px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-desk-mint"
              >
                Choisir une image
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={onRemoveAvatar}
                  className="inline-flex items-center gap-1.5 rounded-full bg-desk-pink/70 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-desk-pink"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Retirer
                </button>
              )}
            </div>
            {avatarError && (
              <p className="mt-2 text-xs font-medium text-coral-800" role="alert">
                {avatarError}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-desk-ink">Informations</h3>
            {!editing ? (
              <button
                type="button"
                onClick={startEdit}
                className="inline-flex size-9 items-center justify-center rounded-full bg-desk-canvas text-desk-ink transition-colors hover:bg-desk-mint"
                aria-label="Modifier les informations"
                title="Modifier"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex size-9 items-center justify-center rounded-full bg-desk-canvas text-desk-ink transition-colors hover:bg-desk-pink"
                aria-label="Annuler la modification"
                title="Annuler"
                disabled={saving}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {!editing ? (
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-desk-canvas px-4 py-3 sm:col-span-2">
                <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-desk-ink/45">Nom complet</dt>
                <dd className="mt-1 text-sm font-medium text-desk-ink">{user?.fullName || "—"}</dd>
              </div>
              <div className="rounded-2xl bg-desk-canvas px-4 py-3">
                <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-desk-ink/45">Téléphone</dt>
                <dd className="mt-1 text-sm font-medium text-desk-ink">{user?.phone || "Non renseigné"}</dd>
              </div>
              <div className="rounded-2xl bg-desk-canvas px-4 py-3">
                <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-desk-ink/45">E-mail</dt>
                <dd className="mt-1 text-sm font-medium text-desk-ink">{user?.email || "—"}</dd>
              </div>
            </dl>
          ) : (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-desk-ink/45">
                  Nom complet
                </span>
                <input
                  id="admin-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  className="h-12 w-full rounded-2xl bg-desk-canvas px-4 text-sm font-medium text-desk-ink outline-none transition-[background-color] focus:bg-white focus-visible:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-desk-ink/45">
                  Téléphone
                </span>
                <input
                  id="admin-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+243…"
                  className="h-12 w-full rounded-2xl bg-desk-canvas px-4 text-sm font-medium text-desk-ink outline-none transition-[background-color] placeholder:text-desk-ink/35 focus:bg-white focus-visible:outline-none"
                />
              </label>
              <div className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-desk-ink/45">
                  E-mail
                </span>
                <p className="flex h-12 items-center rounded-2xl bg-desk-canvas/70 px-4 text-sm font-medium text-desk-ink/55">
                  {user?.email || "—"}
                </p>
                <span className="mt-1.5 block text-xs text-desk-ink/45">Non modifiable pour le moment.</span>
              </div>
            </div>
          )}
        </div>

        {profileError && (
          <div className="mt-4">
            <DeskAlert>{profileError}</DeskAlert>
          </div>
        )}
        {profileMessage && (
          <p className="mt-4 rounded-2xl bg-desk-mint px-4 py-2.5 text-sm font-medium" role="status">
            {profileMessage}
          </p>
        )}

        {editing && (
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Button type="button" variant="outline" onClick={cancelEdit} disabled={saving}>
              Annuler
            </Button>
          </div>
        )}
      </form>

      {user?.hasPassword !== false && (
        <form onSubmit={onChangePassword} className="mt-5 rounded-3xl bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">Sécurité</h2>
          <p className="mt-1 text-sm text-desk-ink/55">Changez le mot de passe du compte admin.</p>

          <div className="mt-5 flex max-w-md flex-col gap-3">
            <Field
              id="admin-pwd-current"
              label="Mot de passe actuel"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Field
              id="admin-pwd-new"
              label="Nouveau mot de passe"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              hint="Au moins 8 caractères."
            />
            <Field
              id="admin-pwd-confirm"
              label="Confirmer"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {pwdError && (
            <div className="mt-4">
              <DeskAlert>{pwdError}</DeskAlert>
            </div>
          )}
          {pwdMessage && (
            <p className="mt-4 rounded-2xl bg-desk-mint px-4 py-2.5 text-sm font-medium" role="status">
              {pwdMessage}
            </p>
          )}

          <Button type="submit" variant="outline" className="mt-5" disabled={pwdSaving}>
            {pwdSaving ? "Mise à jour…" : "Changer le mot de passe"}
          </Button>
        </form>
      )}
    </>
  );
}
