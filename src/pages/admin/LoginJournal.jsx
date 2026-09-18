import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { DeskAlert, DeskEmpty, DeskHeading } from "../../components/admin/DeskUI";

const cellBase = "bg-desk-canvas px-3 py-3 align-middle text-sm";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export default function AdminLoginJournal() {
  const { query = "" } = useOutletContext() || {};
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .superAdminLoginJournal()
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message || "Chargement impossible."));
  }, []);

  const shown = query
    ? items.filter((l) =>
        [l.email, l.role, l.ipAddress, l.user?.fullName, l.method]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(query))
      )
    : items;

  return (
    <>
      <Seo title="Journal de connexions" path="/admin/journal-connexions" noindex />
      <DeskHeading as="h1" count={items.length}>
        Journal de connexions
      </DeskHeading>
      <p className="mt-2 text-sm text-desk-ink/60">Historique des tentatives de connexion (200 dernières).</p>

      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}

      {shown.length ? (
        <div className="mt-5 overflow-x-auto rounded-3xl bg-white p-3 sm:p-4">
          <table className="w-full min-w-[52rem] border-separate border-spacing-y-2 text-left">
            <thead>
              <tr className="text-xs font-medium uppercase tracking-wide text-desk-ink/55">
                <th className="px-3 pb-1 font-medium">Date</th>
                <th className="px-3 pb-1 font-medium">Compte</th>
                <th className="px-3 pb-1 font-medium">Résultat</th>
                <th className="px-3 pb-1 font-medium">Méthode</th>
                <th className="px-3 pb-1 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((l) => (
                <tr key={l.id}>
                  <td className={`${cellBase} rounded-l-2xl pl-4`}>{formatDate(l.createdAt)}</td>
                  <td className={cellBase}>
                    <p className="font-semibold">{l.user?.fullName || l.email}</p>
                    <p className="text-xs text-desk-ink/50">{l.email}</p>
                  </td>
                  <td className={cellBase}>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        l.success ? "bg-desk-mint" : "bg-desk-pink"
                      }`}
                    >
                      {l.success ? "Succès" : "Échec"}
                    </span>
                  </td>
                  <td className={cellBase}>{l.method === "google" ? "Google" : "Mot de passe"}</td>
                  <td className={`${cellBase} rounded-r-2xl pr-4 font-mono text-xs`}>{l.ipAddress || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !error && (
          <div className="mt-5">
            <DeskEmpty>Aucune entrée de journal.</DeskEmpty>
          </div>
        )
      )}
    </>
  );
}
