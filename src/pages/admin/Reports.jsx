import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { DeskAlert, DeskHeading, DeskWidget } from "../../components/admin/DeskUI";

const STAT_TONES = ["mint", "butter", "lilac", "pink"];

const REPORT_LINKS = {
  Clients: "/admin/clients",
  Prestataires: "/admin/prestataires",
  "En attente": "/admin/prestataires/validation",
  Approuvés: "/admin/prestataires",
  Commandes: "/admin/commandes",
  "Commandes ouvertes": "/admin/commandes",
  Paiements: "/admin/paiements",
  "CA encaissé (CDF)": "/admin/paiements",
  "Trajets en direct": "/admin/missions",
};

const ORDER_LABELS = {
  nouvelle: "Nouvelles",
  programmee: "Programmées",
  confirmee: "Confirmées",
  en_cours: "En cours",
  terminee: "Terminées",
  annulee: "Annulées",
};

const PAY_LABELS = {
  paye: "Payés",
  en_attente: "En attente",
  echoue: "Échoués",
  annule: "Annulés",
};

function formatAmount(n) {
  return new Intl.NumberFormat("fr-CD", { style: "currency", currency: "CDF", maximumFractionDigits: 0 }).format(n || 0);
}

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .adminReports()
      .then(setData)
      .catch((err) => setError(err.message || "Chargement impossible."));
  }, []);

  const stats = data?.stats || [];
  const ordersByStatus = data?.ordersByStatus || {};
  const paymentsByStatus = data?.paymentsByStatus || {};
  const recent = data?.recentOrders || [];

  return (
    <>
      <Seo title="Rapports" path="/admin/rapports" noindex />
      <DeskHeading as="h1">Rapports</DeskHeading>
      <p className="mt-2 text-sm text-desk-ink/60">Vue d’ensemble de l’activité SaaCare.</p>

      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}

      {!data && !error && <p className="mt-6 text-sm text-desk-ink/55">Chargement…</p>}

      {data && (
        <div className="mt-5 space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {stats.map((s, i) => (
              <DeskWidget
                key={s.label}
                to={REPORT_LINKS[s.label] || "/admin/dashboard"}
                tone={STAT_TONES[i % STAT_TONES.length]}
                label={`Voir : ${s.label}`}
              >
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {String(s.label).includes("CDF") ? formatAmount(s.value) : s.value}
                </p>
              </DeskWidget>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Link
              to="/admin/commandes"
              className="group block rounded-3xl bg-white p-5 transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desk-ink"
            >
              <h2 className="text-lg font-semibold tracking-tight">Commandes par statut</h2>
              <ul className="mt-4 space-y-2">
                {Object.keys(ORDER_LABELS).map((key) => (
                  <li key={key} className="flex items-center justify-between rounded-xl bg-desk-canvas px-3 py-2 text-sm">
                    <span>{ORDER_LABELS[key]}</span>
                    <strong>{ordersByStatus[key] || 0}</strong>
                  </li>
                ))}
              </ul>
            </Link>

            <Link
              to="/admin/paiements"
              className="group block rounded-3xl bg-white p-5 transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desk-ink"
            >
              <h2 className="text-lg font-semibold tracking-tight">Paiements par statut</h2>
              <ul className="mt-4 space-y-2">
                {Object.keys(PAY_LABELS).map((key) => (
                  <li key={key} className="flex items-center justify-between rounded-xl bg-desk-canvas px-3 py-2 text-sm">
                    <span>{PAY_LABELS[key]}</span>
                    <strong>{paymentsByStatus[key] || 0}</strong>
                  </li>
                ))}
              </ul>
            </Link>
          </div>

          <section className="rounded-3xl bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Dernières commandes</h2>
              <Link to="/admin/commandes" className="text-sm font-semibold underline-offset-2 hover:underline">
                Tout voir
              </Link>
            </div>
            <ul className="mt-4 space-y-2">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link
                    to={`/admin/commandes/${o.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-desk-canvas px-3 py-2.5 text-sm transition-colors hover:bg-desk-mint/50"
                  >
                    <span className="font-mono text-xs font-bold">{o.reference}</span>
                    <span>{o.metier || o.domain}</span>
                    <span className="text-desk-ink/60">{o.client?.fullName}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold">{o.status}</span>
                  </Link>
                </li>
              ))}
              {!recent.length && <li className="text-sm text-desk-ink/55">Aucune commande récente.</li>}
            </ul>
          </section>
        </div>
      )}
    </>
  );
}
