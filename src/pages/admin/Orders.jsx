import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { DeskAlert, DeskEmpty, DeskHeading } from "../../components/admin/DeskUI";

const STATUS = {
  nouvelle: { label: "Nouvelle", tone: "bg-desk-lilac" },
  proposee: { label: "Proposée", tone: "bg-desk-butter" },
  programmee: { label: "Programmée", tone: "bg-desk-butter" },
  confirmee: { label: "Confirmée", tone: "bg-desk-mint" },
  en_cours: { label: "En cours", tone: "bg-desk-pink" },
  terminee: { label: "Terminée", tone: "bg-desk-canvas" },
  annulee: { label: "Annulée", tone: "bg-desk-pink" },
};

const FILTERS = [{ key: "all", label: "Toutes" }, ...Object.entries(STATUS).map(([key, s]) => ({ key, label: s.label }))];

const cellBase =
  "bg-desk-canvas px-3 py-3 align-middle transition-colors duration-200 group-hover:bg-desk-mint/55";

function formatAmount(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-CD", { style: "currency", currency: "CDF", maximumFractionDigits: 0 }).format(n);
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const { query = "" } = useOutletContext() || {};
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api
      .adminOrders()
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message || "Chargement impossible."));
  }, []);

  const shown = items.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      (!query ||
        [o.reference, o.metier, o.domain, o.commune, o.client?.fullName, o.provider?.fullName]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(query)))
  );

  return (
    <>
      <Seo title="Commandes" path="/admin/commandes" noindex />
      <DeskHeading as="h1" count={items.length}>
        Commandes
      </DeskHeading>
      <p className="mt-2 text-sm text-desk-ink/60">Toutes les réservations et missions de la plateforme.</p>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filtrer par statut">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.key ? "bg-desk-ink text-white" : "bg-white text-desk-ink hover:bg-desk-mint"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}

      {shown.length ? (
        <div className="mt-5 overflow-x-auto rounded-3xl bg-white p-3 sm:p-4">
          <table className="w-full min-w-[52rem] border-separate border-spacing-y-2 text-left text-sm">
            <caption className="sr-only">Liste des commandes</caption>
            <thead>
              <tr className="text-xs font-medium uppercase tracking-wide text-desk-ink/55">
                <th scope="col" className="px-3 pb-1 font-medium">
                  Référence
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Service
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Client
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Prestataire
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Montant
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => {
                const st = STATUS[o.status] || { label: o.status, tone: "bg-white" };
                return (
                  <tr
                    key={o.id}
                    role="link"
                    tabIndex={0}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/admin/commandes/${o.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/admin/commandes/${o.id}`);
                      }
                    }}
                  >
                    <td className={`${cellBase} rounded-l-2xl pl-4 font-mono text-xs font-bold`}>{o.reference}</td>
                    <td className={cellBase}>
                      <p className="font-medium">{o.metier || o.domain || "—"}</p>
                      <p className="text-xs text-desk-ink/50">{o.commune || ""}</p>
                    </td>
                    <td className={cellBase}>{o.client?.fullName || "—"}</td>
                    <td className={cellBase}>{o.provider?.fullName || "Non assigné"}</td>
                    <td className={cellBase}>{formatAmount(o.amount)}</td>
                    <td className={`${cellBase} rounded-r-2xl pr-4`}>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${st.tone}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !error && (
          <div className="mt-5">
            <DeskEmpty>{query || filter !== "all" ? "Aucune commande ne correspond." : "Aucune commande."}</DeskEmpty>
          </div>
        )
      )}
    </>
  );
}
