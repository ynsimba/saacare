import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { DeskAlert, DeskEmpty, DeskHeading } from "../../components/admin/DeskUI";

const STATUS = {
  nouvelle: { label: "Nouvelle", tone: "bg-desk-lilac" },
  en_cours: { label: "En cours", tone: "bg-desk-butter" },
  traitee: { label: "Traitée", tone: "bg-desk-mint" },
  annulee: { label: "Annulée", tone: "bg-desk-pink" },
};

const FILTERS = [{ key: "all", label: "Toutes" }, ...Object.entries(STATUS).map(([key, s]) => ({ key, label: s.label }))];

const cellBase =
  "bg-desk-canvas px-3 py-3 align-middle transition-colors duration-200 group-hover:bg-desk-mint/55";

export default function AdminDevis() {
  const { query = "" } = useOutletContext() || {};
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(null);

  const load = () =>
    api
      .adminQuoteRequests()
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message || "Chargement impossible."));

  useEffect(() => {
    load();
  }, []);

  const patchStatus = async (id, status) => {
    setBusy(id);
    setError("");
    try {
      const data = await api.patchAdminQuoteRequest(id, { status });
      setItems((list) => list.map((r) => (r.id === id ? data.item : r)));
    } catch (err) {
      setError(err.message || "Mise à jour impossible.");
    } finally {
      setBusy(null);
    }
  };

  const shown = items.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (!query ||
        [r.reference, r.company, r.contactName, r.email, r.phone, r.needType, r.location]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(query.toLowerCase())))
  );

  return (
    <>
      <Seo title="Devis entreprises" path="/admin/devis" noindex />
      <DeskHeading as="h1" count={items.length}>
        Devis entreprises
      </DeskHeading>
      <p className="mt-2 text-sm text-desk-ink/60">Demandes B2B reçues via /entreprises/devis.</p>

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
          <table className="w-full min-w-[56rem] border-separate border-spacing-y-2 text-left text-sm">
            <caption className="sr-only">Liste des demandes de devis</caption>
            <thead>
              <tr className="text-xs font-medium uppercase tracking-wide text-desk-ink/55">
                <th scope="col" className="px-3 pb-1 font-medium">Référence</th>
                <th scope="col" className="px-3 pb-1 font-medium">Entreprise</th>
                <th scope="col" className="px-3 pb-1 font-medium">Contact</th>
                <th scope="col" className="px-3 pb-1 font-medium">Besoin</th>
                <th scope="col" className="px-3 pb-1 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const st = STATUS[r.status] || { label: r.status, tone: "bg-white" };
                const positions = (r.positions || [])
                  .filter((p) => p.metier)
                  .map((p) => `${p.metier} × ${p.qty || 1}`)
                  .join(", ");
                return (
                  <tr key={r.id} className="group">
                    <td className={`${cellBase} rounded-l-2xl font-mono text-xs font-semibold text-teal-800`}>
                      {r.reference}
                      <p className="mt-1 font-sans text-[0.7rem] font-normal text-desk-ink/45">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("fr-FR") : ""}
                      </p>
                    </td>
                    <td className={cellBase}>
                      <p className="font-semibold">{r.company}</p>
                      <p className="text-desk-ink/55">{r.needType}{r.location ? ` · ${r.location}` : ""}</p>
                    </td>
                    <td className={cellBase}>
                      <p className="font-semibold">{r.contactName}</p>
                      <p className="text-desk-ink/55">{r.phone}</p>
                      <p className="text-desk-ink/45">{r.email}</p>
                    </td>
                    <td className={`${cellBase} max-w-xs`}>
                      <p className="text-desk-ink/70">{positions || r.message || "—"}</p>
                      {r.duration && <p className="mt-1 text-xs text-desk-ink/45">Durée : {r.duration}</p>}
                    </td>
                    <td className={`${cellBase} rounded-r-2xl`}>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${st.tone}`}>
                        {st.label}
                      </span>
                      <select
                        className="mt-2 block h-9 w-full rounded-xl bg-white px-2 text-xs font-medium outline-none"
                        value={r.status}
                        disabled={busy === r.id}
                        onChange={(e) => patchStatus(r.id, e.target.value)}
                        aria-label={`Statut de ${r.reference}`}
                      >
                        {Object.entries(STATUS).map(([key, s]) => (
                          <option key={key} value={key}>{s.label}</option>
                        ))}
                      </select>
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
            <DeskEmpty>Aucune demande de devis pour le moment.</DeskEmpty>
          </div>
        )
      )}
    </>
  );
}
