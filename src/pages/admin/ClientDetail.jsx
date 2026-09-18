import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { DeskAlert, DeskHeading, initials } from "../../components/admin/DeskUI";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function Field({ label, children }) {
  return (
    <div className="rounded-2xl bg-desk-canvas px-4 py-3">
      <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-desk-ink/45">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-desk-ink">{children || "—"}</dd>
    </div>
  );
}

export default function AdminClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    api
      .adminClient(id)
      .then((data) => {
        setItem(data.item);
        setOrders(data.orders || []);
      })
      .catch((err) => setError(err.message || "Impossible de charger ce client."));
  }, [id]);

  return (
    <>
      <Seo title={item?.fullName ? `${item.fullName} — Client` : "Client"} path={`/admin/clients/${id}`} noindex />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex size-10 items-center justify-center rounded-full bg-white text-desk-ink transition-colors hover:bg-desk-mint"
          aria-label="Retour"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <DeskHeading as="h1">Fiche client</DeskHeading>
      </div>

      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}

      {!item && !error && <p className="mt-6 text-sm text-desk-ink/55">Chargement…</p>}

      {item && (
        <div className="mt-5 space-y-5">
          <section className="rounded-3xl bg-white p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-full bg-desk-butter text-lg font-bold">
                {initials(item.fullName || "")}
              </span>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{item.fullName}</h2>
                <p className="text-sm text-desk-ink/60">Membre depuis {formatDate(item.createdAt)}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold tracking-tight">Coordonnées</h3>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="E-mail">{item.email}</Field>
              <Field label="Téléphone">{item.phone || "Non renseigné"}</Field>
              <Field label="Commune">{item.commune || "Non renseignée"}</Field>
              <Field label="Adresse">{item.address || "Non renseignée"}</Field>
            </dl>
          </section>

          <section>
            <h3 className="text-lg font-semibold tracking-tight">Commandes récentes ({orders.length})</h3>
            {orders.length ? (
              <ul className="mt-3 space-y-2">
                {orders.map((o) => (
                  <li key={o.id}>
                    <Link
                      to={`/admin/commandes/${o.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 text-sm transition-colors hover:bg-desk-mint/40"
                    >
                      <span className="font-semibold">{o.reference}</span>
                      <span className="text-desk-ink/60">{o.metier || o.domain}</span>
                      <span className="rounded-full bg-desk-canvas px-2.5 py-1 text-xs font-semibold">{o.status}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-desk-ink/55">Aucune commande.</p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
