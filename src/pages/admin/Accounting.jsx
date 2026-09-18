import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { DeskAlert, DeskHeading, DeskWidget } from "../../components/admin/DeskUI";

const METHOD_LABEL = {
  mobile_money: "Mobile Money",
  carte: "Carte",
  cash: "Espèces",
  virement: "Virement",
  bank: "Virement bancaire",
  autre: "Autre",
};

function formatAmount(n) {
  return new Intl.NumberFormat("fr-CD", { style: "currency", currency: "CDF", maximumFractionDigits: 0 }).format(n || 0);
}

const WIDGETS = [
  { key: "revenue", label: "CA encaissé", tone: "mint", to: "/admin/paiements", format: "amount" },
  { key: "paidCount", label: "Paiements payés", tone: "butter", to: "/admin/paiements", format: "number" },
  { key: "pendingAmount", label: "En attente", tone: "lilac", to: "/admin/paiements", format: "amount" },
  { key: "avgTicket", label: "Ticket moyen", tone: "pink", to: "/admin/paiements", format: "amount" },
  { key: "ordersTotal", label: "Commandes", tone: "mint", to: "/admin/commandes", format: "number" },
  { key: "pendingCount", label: "Paiements en attente", tone: "butter", to: "/admin/paiements", format: "number" },
];

export default function AdminAccounting() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .superAdminAccounting()
      .then(setData)
      .catch((err) => setError(err.message || "Chargement impossible."));
  }, []);

  const s = data?.summary || {};

  return (
    <>
      <Seo title="Comptabilité" path="/admin/comptabilite" noindex />
      <DeskHeading as="h1">Comptabilité</DeskHeading>
      <p className="mt-2 text-sm text-desk-ink/60">Encaissements et répartition des paiements.</p>

      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}
      {!data && !error && <p className="mt-6 text-sm text-desk-ink/55">Chargement…</p>}

      {data && (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {WIDGETS.map((w) => (
              <DeskWidget key={w.key} to={w.to} tone={w.tone} label={`Voir : ${w.label}`}>
                <p className="text-sm font-semibold">{w.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {w.format === "amount" ? formatAmount(s[w.key]) : s[w.key]}
                </p>
              </DeskWidget>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Link
              to="/admin/paiements"
              className="group block rounded-3xl bg-white p-5 transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desk-ink"
            >
              <h2 className="text-lg font-semibold">Par méthode</h2>
              <ul className="mt-3 space-y-2">
                {(data.byMethod || []).map((row) => (
                  <li key={row.method} className="flex justify-between rounded-xl bg-desk-canvas px-3 py-2 text-sm">
                    <span>{METHOD_LABEL[row.method] || row.method}</span>
                    <strong>
                      {row.count} · {formatAmount(row.amount)}
                    </strong>
                  </li>
                ))}
                {!data.byMethod?.length && <li className="text-sm text-desk-ink/50">Aucune donnée.</li>}
              </ul>
            </Link>
            <Link
              to="/admin/paiements"
              className="group block rounded-3xl bg-white p-5 transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desk-ink"
            >
              <h2 className="text-lg font-semibold">Par mois</h2>
              <ul className="mt-3 space-y-2">
                {(data.byMonth || []).map((row) => (
                  <li key={row.month} className="flex justify-between rounded-xl bg-desk-canvas px-3 py-2 text-sm">
                    <span>{row.month}</span>
                    <strong>
                      {row.count} · {formatAmount(row.amount)}
                    </strong>
                  </li>
                ))}
                {!data.byMonth?.length && <li className="text-sm text-desk-ink/50">Aucune donnée.</li>}
              </ul>
            </Link>
          </div>

          <section className="overflow-x-auto rounded-3xl bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Derniers paiements</h2>
              <Link to="/admin/paiements" className="text-sm font-semibold underline-offset-2 hover:underline">
                Tout voir
              </Link>
            </div>
            <table className="mt-3 w-full min-w-[40rem] border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-desk-ink/55">
                  <th className="px-3 pb-1 font-medium">Réf.</th>
                  <th className="px-3 pb-1 font-medium">Client</th>
                  <th className="px-3 pb-1 font-medium">Montant</th>
                  <th className="px-3 pb-1 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {(data.recent || []).map((p) => (
                  <tr key={p.id} className="group">
                    <td className="rounded-l-2xl bg-desk-canvas px-3 py-3 font-mono text-xs transition-colors group-hover:bg-desk-mint/55">
                      <Link to="/admin/paiements" className="font-bold">
                        {p.reference}
                      </Link>
                    </td>
                    <td className="bg-desk-canvas px-3 py-3 transition-colors group-hover:bg-desk-mint/55">{p.client || "—"}</td>
                    <td className="bg-desk-canvas px-3 py-3 font-semibold transition-colors group-hover:bg-desk-mint/55">
                      {formatAmount(p.amount)}
                    </td>
                    <td className="rounded-r-2xl bg-desk-canvas px-3 py-3 transition-colors group-hover:bg-desk-mint/55">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </>
  );
}
