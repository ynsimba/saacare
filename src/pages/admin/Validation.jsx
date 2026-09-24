import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Check, X } from "lucide-react";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { DeskAlert, DeskEmpty, DeskHeading, initials } from "../../components/admin/DeskUI";

const cellBase = "bg-desk-canvas px-3 py-3 align-middle transition-colors duration-200 group-hover:bg-desk-mint/55";

function DocsBadge({ submitted }) {
  const flags = submitted || {};
  const keys = [
    ["photo", "Photo"],
    ["identity", "ID"],
    ["cv", "CV"],
    ["motivationLetter", "LM"],
  ];
  const ok = keys.filter(([k]) => flags[k]).length;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-desk-ink">
        {ok}/{keys.length} pièces
      </p>
      <div className="flex flex-wrap gap-1">
        {keys.map(([k, label]) => (
          <span
            key={k}
            className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
              flags[k] ? "bg-desk-mint text-desk-ink" : "bg-desk-pink/70 text-desk-ink/70"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminValidation() {
  const navigate = useNavigate();
  const { query = "" } = useOutletContext() || {};
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    api
      .adminPrestatairesPending()
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message || "Chargement impossible."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id, status) => {
    setBusyId(id);
    setError("");
    try {
      await api.updateProviderStatus(id, status);
      setItems((list) => list.filter((i) => i.id !== id));
    } catch (err) {
      setError(err.message || "Mise à jour impossible.");
    } finally {
      setBusyId(null);
    }
  };

  const shown = query
    ? items.filter((item) =>
        [item.user?.fullName, item.user?.email, item.metier, item.domain, item.bio]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(query))
      )
    : items;

  return (
    <>
      <Seo title="Validation prestataires" path="/admin/prestataires/validation" noindex />
      <DeskHeading as="h1" count={items.length}>
        Validation
      </DeskHeading>
      <p className="mt-2 text-sm text-desk-ink/60">
        Ouvrez un dossier pour consulter la fiche d’inscription complète et les documents, puis approuvez ou refusez.
      </p>

      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}

      {shown.length ? (
        <div className="mt-5 overflow-x-auto rounded-3xl bg-white p-3 sm:p-4">
          <table className="w-full min-w-[48rem] border-separate border-spacing-y-2 text-left text-sm">
            <caption className="sr-only">Dossiers prestataires en attente de validation</caption>
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
                  Documents
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((item) => (
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
                  <td className={cellBase}>
                    <p className="font-medium">{item.metier || "Métier —"}</p>
                    <p className="text-xs text-desk-ink/55">{item.domain || "Domaine —"}</p>
                  </td>
                  <td className={`${cellBase} max-w-[14rem] truncate text-desk-ink/70`}>{item.user?.email || "—"}</td>
                  <td className={`${cellBase} max-w-[12rem]`}>
                    <DocsBadge submitted={item.documentsSubmitted} />
                  </td>
                  <td className={`${cellBase} rounded-r-2xl pr-4`}>
                    <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => setStatus(item.id, "approved")}
                        className="inline-flex h-9 items-center gap-2 rounded-full bg-desk-ink pl-3.5 pr-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        Approuver
                        <span className="flex size-7 items-center justify-center rounded-full bg-white text-desk-ink">
                          <Check className="size-3.5" aria-hidden="true" />
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => setStatus(item.id, "rejected")}
                        className="inline-flex h-9 items-center gap-2 rounded-full bg-white pl-3.5 pr-1.5 text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                      >
                        Refuser
                        <span className="flex size-7 items-center justify-center rounded-full bg-desk-canvas">
                          <X className="size-3.5" aria-hidden="true" />
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !error && (
          <div className="mt-5">
            <DeskEmpty>{query ? "Aucun dossier ne correspond à la recherche." : "Aucun dossier en attente."}</DeskEmpty>
          </div>
        )
      )}
    </>
  );
}
