import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { DeskAlert, DeskEmpty, DeskHeading, initials } from "../../components/admin/DeskUI";

const cellBase =
  "bg-desk-canvas px-3 py-3 align-middle transition-colors duration-200 group-hover:bg-desk-mint/55";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export default function AdminClients() {
  const navigate = useNavigate();
  const { query = "" } = useOutletContext() || {};
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .adminClients()
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message || "Chargement impossible."));
  }, []);

  const shown = query
    ? items.filter((c) =>
        [c.fullName, c.email, c.phone, c.commune].filter(Boolean).some((v) => String(v).toLowerCase().includes(query))
      )
    : items;

  return (
    <>
      <Seo title="Clients" path="/admin/clients" noindex />
      <DeskHeading as="h1" count={items.length}>
        Clients
      </DeskHeading>
      <p className="mt-2 text-sm text-desk-ink/60">Comptes clients inscrits sur SaaCare.</p>

      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}

      {shown.length ? (
        <div className="mt-5 overflow-x-auto rounded-3xl bg-white p-3 sm:p-4">
          <table className="w-full min-w-[42rem] border-separate border-spacing-y-2 text-left text-sm">
            <caption className="sr-only">Liste des clients</caption>
            <thead>
              <tr className="text-xs font-medium uppercase tracking-wide text-desk-ink/55">
                <th scope="col" className="px-3 pb-1 font-medium">
                  Client
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Contact
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Commune
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Commandes
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Inscrit le
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr
                  key={c.id}
                  role="link"
                  tabIndex={0}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/admin/clients/${c.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/admin/clients/${c.id}`);
                    }
                  }}
                >
                  <td className={`${cellBase} rounded-l-2xl pl-4`}>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold">
                        {initials(c.fullName || "")}
                      </span>
                      <span className="font-semibold">{c.fullName || "—"}</span>
                    </div>
                  </td>
                  <td className={cellBase}>
                    <p className="truncate text-desk-ink/80">{c.email}</p>
                    <p className="text-xs text-desk-ink/50">{c.phone || "—"}</p>
                  </td>
                  <td className={cellBase}>{c.commune || "—"}</td>
                  <td className={cellBase}>
                    <span className="inline-flex rounded-full bg-desk-butter px-2.5 py-1 text-xs font-semibold">
                      {c.ordersCount}
                    </span>
                  </td>
                  <td className={`${cellBase} rounded-r-2xl pr-4`}>{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !error && (
          <div className="mt-5">
            <DeskEmpty>{query ? "Aucun client ne correspond." : "Aucun client."}</DeskEmpty>
          </div>
        )
      )}
    </>
  );
}
