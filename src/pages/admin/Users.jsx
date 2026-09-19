import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, X } from "lucide-react";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { DeskAlert, DeskEmpty, DeskHeading, initials } from "../../components/admin/DeskUI";

const ROLE_LABEL = { client: "Client", prestataire: "Prestataire", admin: "Admin" };
const ROLE_OPTIONS = Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }));
const cellBase = "bg-desk-canvas px-3 py-3 align-middle";

const emptyForm = {
  fullName: "",
  email: "",
  password: "",
  role: "client",
  isSuperAdmin: false,
  phone: "",
  commune: "",
};

export default function AdminUsers() {
  const { query = "" } = useOutletContext() || {};
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () =>
    api
      .superAdminUsers()
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message || "Chargement impossible."));

  useEffect(() => {
    load();
  }, []);

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const patch = async (id, body) => {
    setBusyId(id);
    setError("");
    setOk("");
    try {
      const data = await api.updateSuperAdminUser(id, body);
      setItems((list) => list.map((u) => (u.id === id ? data.item : u)));
    } catch (err) {
      setError(err.message || "Mise à jour impossible.");
    } finally {
      setBusyId(null);
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    try {
      const body = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        phone: form.phone.trim() || undefined,
        commune: form.commune.trim() || undefined,
      };
      if (form.role === "admin") {
        body.isSuperAdmin = Boolean(form.isSuperAdmin);
      }
      const data = await api.createSuperAdminUser(body);
      setItems((list) => [data.item, ...list]);
      setForm(emptyForm);
      setShowForm(false);
      setOk("Utilisateur créé.");
    } catch (err) {
      setError(err.message || "Création impossible.");
    } finally {
      setSaving(false);
    }
  };

  const shown = query
    ? items.filter((u) =>
        [u.fullName, u.email, u.role, u.phone].filter(Boolean).some((v) => String(v).toLowerCase().includes(query))
      )
    : items;

  return (
    <>
      <Seo title="Utilisateurs" path="/admin/utilisateurs" noindex />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <DeskHeading as="h1" count={items.length}>
            Utilisateurs
          </DeskHeading>
          <p className="mt-2 text-sm text-desk-ink/60">Gestion des comptes (super-admin).</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setOk("");
            setError("");
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-desk-ink px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          aria-expanded={showForm}
        >
          {showForm ? <X className="size-4" strokeWidth={1.75} aria-hidden="true" /> : <Plus className="size-4" strokeWidth={1.75} aria-hidden="true" />}
          {showForm ? "Fermer" : "Nouvel utilisateur"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onCreate} className="mt-5 space-y-3 rounded-3xl bg-white p-4 sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight">Créer un utilisateur</h2>
          <p className="text-sm text-desk-ink/55">Compte immédiat — le prestataire reçoit un profil en attente de validation.</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nom complet" required value={form.fullName} onChange={set("fullName")} autoComplete="name" />
            <Field label="E-mail" type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
            <Field
              label="Mot de passe"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={set("password")}
              autoComplete="new-password"
            />
            <Field label="Rôle" as="select" required value={form.role} onChange={set("role")} options={ROLE_OPTIONS} />
            <Field label="Téléphone" value={form.phone} onChange={set("phone")} autoComplete="tel" />
            <Field label="Commune" value={form.commune} onChange={set("commune")} />
          </div>

          {form.role === "admin" && (
            <label className="flex items-center gap-2 text-sm font-medium text-desk-ink">
              <input
                type="checkbox"
                checked={form.isSuperAdmin}
                onChange={(e) => setForm((f) => ({ ...f, isSuperAdmin: e.target.checked }))}
                className="size-4 rounded border-desk-ink/20"
              />
              Super-admin
            </label>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" disabled={saving || !form.fullName.trim() || !form.email.trim() || form.password.length < 8} withArrow={false}>
              {saving ? "Création…" : "Créer l’utilisateur"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              withArrow={false}
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
              }}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}

      {ok && <p className="mt-4 text-sm font-medium text-teal-800">{ok}</p>}
      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}

      {shown.length ? (
        <div className="mt-5 overflow-x-auto rounded-3xl bg-white p-3 sm:p-4">
          <table className="w-full min-w-[48rem] border-separate border-spacing-y-2 text-left text-sm">
            <caption className="sr-only">Liste des utilisateurs</caption>
            <thead>
              <tr className="text-xs font-medium uppercase tracking-wide text-desk-ink/55">
                <th className="px-3 pb-1 font-medium">Utilisateur</th>
                <th className="px-3 pb-1 font-medium">Rôle</th>
                <th className="px-3 pb-1 font-medium">Super-admin</th>
                <th className="px-3 pb-1 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.id}>
                  <td className={`${cellBase} rounded-l-2xl pl-4`}>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-white text-xs font-bold">
                        {initials(u.fullName || "")}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold">{u.fullName}</p>
                        <p className="truncate text-xs text-desk-ink/55">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={cellBase}>
                    <select
                      value={u.role}
                      disabled={busyId === u.id}
                      onChange={(e) => patch(u.id, { role: e.target.value })}
                      className="h-9 rounded-full bg-white px-3 text-xs font-semibold outline-none"
                    >
                      {Object.entries(ROLE_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={cellBase}>
                    {u.role === "admin" ? (
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => patch(u.id, { isSuperAdmin: !u.isSuperAdmin })}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          u.isSuperAdmin ? "bg-desk-ink text-white" : "bg-white text-desk-ink"
                        }`}
                      >
                        {u.isSuperAdmin ? "Oui" : "Non"}
                      </button>
                    ) : (
                      <span className="text-desk-ink/40">—</span>
                    )}
                  </td>
                  <td className={`${cellBase} rounded-r-2xl pr-4 text-xs text-desk-ink/50`}>#{u.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !error && (
          <div className="mt-5">
            <DeskEmpty>Aucun utilisateur.</DeskEmpty>
          </div>
        )
      )}
    </>
  );
}
