import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Ban, PauseCircle, PlayCircle } from "lucide-react";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { DeskAlert, DeskEmpty, DeskHeading, initials } from "../../components/admin/DeskUI";

const STATUS = {
  pending: { label: "En attente", tone: "bg-desk-butter" },
  approved: { label: "Approuvé", tone: "bg-desk-mint" },
  rejected: { label: "Refusé", tone: "bg-desk-pink" },
  suspended: { label: "Désactivé", tone: "bg-desk-lilac" },
  banned: { label: "Banni", tone: "bg-desk-pink" },
};

const FILTERS = [{ key: "all", label: "Tous" }, ...Object.entries(STATUS).map(([key, s]) => ({ key, label: s.label }))];

const cellBase = "bg-desk-canvas px-3 py-3 align-middle transition-colors duration-200 group-hover:bg-desk-mint/55";

export default function AdminProviders() {
  const navigate = useNavigate();
  const { query = "" } = useOutletContext() || {};
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    api
      .adminPrestataires()
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message || "Chargement impossible."));
  }, []);

  const setStatus = async (id, status) => {
    setBusyId(id);
    setError("");
    try {
      const data = await api.updateProviderStatus(id, status);
      setItems((list) => list.map((item) => (item.id === id ? { ...item, ...data.item } : item)));
    } catch (err) {
      setError(err.message || "Mise à jour impossible.");
    } finally {
      setBusyId(null);
    }
  };

  const shown = items.filter(
    (item) =>
      (filter === "all" || item.status === filter) &&
      (!query ||
        [item.user?.fullName, item.user?.email, item.metier, item.domain]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(query)))
  );

  return (
    <>
      <Seo title="Prestataires" path="/admin/prestataires" noindex />
      <DeskHeading as="h1" count={items.length}>
        Prestataires
      </DeskHeading>
      <p className="mt-2 text-sm text-desk-ink/60">Tous les dossiers prestataires de la plateforme.</p>

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
            <caption className="sr-only">Liste des prestataires</caption>
            <thead>
              <tr className="text-xs font-medium uppercase tracking-wide text-desk-ink/55">
                <th scope="col" className="px-3 pb-1 font-medium">
                  Prestataire
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Métier
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  E-mail
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Statut
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((item) => {
                const status = STATUS[item.status] || { label: item.status, tone: "bg-desk-canvas" };
                const busy = busyId === item.id;
                const canDeactivate = item.status === "approved" || item.status === "pending";
                const canBan = item.status !== "banned";
                const canReactivate = item.status === "suspended" || item.status === "banned" || item.status === "rejected";

                return (
                  <tr
                    key={item.id}
                    role="link"
                    tabIndex={0}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/admin/prestataires/${item.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/admin/prestataires/${item.id}`);
                      }
                    }}
                  >
                    <td className={`${cellBase} rounded-l-2xl pl-4`}>
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold">
                          {initials(item.user?.fullName || "")}
                        </span>
                        <span className="font-semibold text-desk-ink">{item.user?.fullName || "—"}</span>
                      </div>
                    </td>
                    <td className={cellBase}>{item.metier || "Métier non renseigné"}</td>
                    <td className={`${cellBase} max-w-[14rem] truncate text-desk-ink/70`}>{item.user?.email || "—"}</td>
                    <td className={cellBase}>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.tone}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className={`${cellBase} rounded-r-2xl pr-4`}>
                      <div className="flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {canDeactivate && (
                          <button
                            type="button"
                            disabled={busy}
                            title="Désactiver le compte"
                            onClick={() => setStatus(item.id, "suspended")}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-2.5 text-xs font-semibold text-desk-ink transition-opacity hover:bg-desk-lilac disabled:opacity-50"
                          >
                            <PauseCircle className="size-3.5" aria-hidden="true" />
                            Désactiver
                          </button>
                        )}
                        {canBan && (
                          <button
                            type="button"
                            disabled={busy}
                            title="Bannir le prestataire"
                            onClick={() => setStatus(item.id, "banned")}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-desk-ink px-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            <Ban className="size-3.5" aria-hidden="true" />
                            Bannir
                          </button>
                        )}
                        {canReactivate && (
                          <button
                            type="button"
                            disabled={busy}
                            title="Réactiver le compte"
                            onClick={() => setStatus(item.id, "approved")}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-desk-mint px-2.5 text-xs font-semibold text-desk-ink transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            <PlayCircle className="size-3.5" aria-hidden="true" />
                            Réactiver
                          </button>
                        )}
                      </div>
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
            <DeskEmpty>{query || filter !== "all" ? "Aucun prestataire ne correspond." : "Aucun prestataire."}</DeskEmpty>
          </div>
        )
      )}
    </>
  );
}
