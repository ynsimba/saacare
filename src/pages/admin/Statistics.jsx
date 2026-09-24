import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { DeskAlert, DeskHeading, DeskWidget } from "../../components/admin/DeskUI";
import { SkeletonPage } from "../../components/ui/Skeleton";

const ROLE_LABEL = { client: "Clients", prestataire: "Prestataires", admin: "Admins" };
const STAT_TONES = ["mint", "butter", "lilac", "pink"];

const KPI_LINKS = {
  Utilisateurs: "/admin/utilisateurs",
  "Nouveaux (7 j)": "/admin/utilisateurs",
  "Commandes (7 j)": "/admin/commandes",
  "Connexions OK (7 j)": "/admin/journal-connexions",
  "Échecs login (7 j)": "/admin/journal-connexions",
  "CA encaissé": "/admin/paiements",
};

function formatAmount(n) {
  return new Intl.NumberFormat("fr-CD", { style: "currency", currency: "CDF", maximumFractionDigits: 0 }).format(n || 0);
}

export default function AdminStatistics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .superAdminStatistics()
      .then(setData)
      .catch((err) => setError(err.message || "Chargement impossible."));
  }, []);

  return (
    <>
      <Seo title="Statistiques" path="/admin/statistiques" noindex />
      <DeskHeading as="h1">Statistiques</DeskHeading>
      <p className="mt-2 text-sm text-desk-ink/60">Indicateurs globaux de la plateforme.</p>

      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}
      {!data && !error && <SkeletonPage tone="desk" className="mt-6" label="Chargement des statistiques" />}

      {data && (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {(data.kpis || []).map((k, i) => (
              <DeskWidget
                key={k.label}
                to={KPI_LINKS[k.label] || "/admin/dashboard"}
                tone={STAT_TONES[i % STAT_TONES.length]}
                label={`Voir : ${k.label}`}
              >
                <p className="text-sm font-semibold">{k.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {String(k.label).includes("CA") ? formatAmount(k.value) : k.value}
                </p>
              </DeskWidget>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Link
              to="/admin/utilisateurs"
              className="group block rounded-3xl bg-white p-5 transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desk-ink"
            >
              <h2 className="text-lg font-semibold">Utilisateurs</h2>
              <ul className="mt-3 space-y-2">
                {Object.entries(data.usersByRole || {}).map(([role, total]) => (
                  <li key={role} className="flex justify-between rounded-xl bg-desk-canvas px-3 py-2 text-sm">
                    <span>{ROLE_LABEL[role] || role}</span>
                    <strong>{total}</strong>
                  </li>
                ))}
              </ul>
            </Link>
            <Link
              to="/admin/prestataires"
              className="group block rounded-3xl bg-white p-5 transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desk-ink"
            >
              <h2 className="text-lg font-semibold">Prestataires</h2>
              <ul className="mt-3 space-y-2">
                {Object.entries(data.providersByStatus || {}).map(([status, total]) => (
                  <li key={status} className="flex justify-between rounded-xl bg-desk-canvas px-3 py-2 text-sm">
                    <span>{status}</span>
                    <strong>{total}</strong>
                  </li>
                ))}
              </ul>
            </Link>
            <Link
              to="/admin/commandes"
              className="group block rounded-3xl bg-white p-5 transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desk-ink"
            >
              <h2 className="text-lg font-semibold">Commandes</h2>
              <ul className="mt-3 space-y-2">
                {Object.entries(data.ordersByStatus || {}).map(([status, total]) => (
                  <li key={status} className="flex justify-between rounded-xl bg-desk-canvas px-3 py-2 text-sm">
                    <span>{status}</span>
                    <strong>{total}</strong>
                  </li>
                ))}
              </ul>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
