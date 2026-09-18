import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { DeskAlert, DeskEmpty, DeskHeading, initials } from "../../components/admin/DeskUI";

const ROLE_LABEL = { client: "Client", prestataire: "Prestataire", admin: "Admin" };
const cellBase = "bg-desk-canvas px-3 py-3 align-middle";

export default function AdminUsers() {
  const { query = "" } = useOutletContext() || {};
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () =>
    api
      .superAdminUsers()
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message || "Chargement impossible."));

  useEffect(() => {
    load();
  }, []);

  const patch = async (id, body) => {
    setBusyId(id);
    setError("");
    try {
      const data = await api.updateSuperAdminUser(id, body);
      setItems((list) => list.map((u) => (u.id === id ? data.item : u)));
    } catch (err) {
      setError(err.message || "Mise à jour impossible.");
    } finally {
      setBusyId(null);
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
      <DeskHeading as="h1" count={items.length}>
        Utilisateurs
      </DeskHeading>
      <p className="mt-2 text-sm text-desk-ink/60">Gestion des comptes (super-admin).</p>

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
