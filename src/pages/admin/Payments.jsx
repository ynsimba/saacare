import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, X } from "lucide-react";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { DeskAlert, DeskEmpty, DeskHeading } from "../../components/admin/DeskUI";

const STATUS = {
  paye: { label: "Payé", tone: "bg-desk-mint" },
  en_attente: { label: "En attente", tone: "bg-desk-butter" },
  echoue: { label: "Échoué", tone: "bg-desk-pink" },
  rembourse: { label: "Remboursé", tone: "bg-desk-lilac" },
  annule: { label: "Annulé", tone: "bg-desk-lilac" },
};

const METHODS = {
  mobile_money: "Mobile Money",
  cash: "Espèces",
  bank: "Virement bancaire",
  carte: "Carte",
  virement: "Virement",
};

const METHOD_OPTIONS = [
  { value: "mobile_money", label: "Mobile Money" },
  { value: "cash", label: "Espèces" },
  { value: "bank", label: "Virement bancaire" },
  { value: "carte", label: "Carte" },
];

const STATUS_OPTIONS = [
  { value: "en_attente", label: "En attente" },
  { value: "paye", label: "Payé (encaissé)" },
  { value: "echoue", label: "Échoué" },
];

const FILTERS = [{ key: "all", label: "Tous" }, ...Object.entries(STATUS).map(([key, s]) => ({ key, label: s.label }))];

const cellBase = "bg-desk-canvas px-3 py-3 align-middle transition-colors duration-200 group-hover:bg-desk-mint/55";

function formatAmount(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-CD", { style: "currency", currency: "CDF", maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

const emptyForm = {
  clientId: "",
  orderId: "",
  amount: "",
  method: "mobile_money",
  status: "en_attente",
  note: "",
};

export default function AdminPayments() {
  const { query = "" } = useOutletContext() || {};
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([api.adminPayments(), api.adminClients(), api.adminOrders()])
      .then(([pay, cli, ord]) => {
        setItems(pay.items || []);
        setClients(cli.items || []);
        setOrders((ord.items || []).filter((o) => o.status !== "annulee"));
      })
      .catch((err) => setError(err.message || "Chargement impossible."));

  useEffect(() => {
    load();
  }, []);

  const ordersForClient = useMemo(() => {
    if (!form.clientId) return orders;
    return orders.filter((o) => String(o.client?.id) === String(form.clientId));
  }, [orders, form.clientId]);

  const set = (k) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: value };
      if (k === "clientId") {
        const stillValid = orders.some(
          (o) => String(o.id) === String(f.orderId) && String(o.client?.id) === String(value)
        );
        if (!stillValid) next.orderId = "";
      }
      if (k === "orderId" && value) {
        const order = orders.find((o) => String(o.id) === String(value));
        if (order?.client?.id) next.clientId = String(order.client.id);
        if (order?.amount && !f.amount) next.amount = String(order.amount);
      }
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    try {
      const body = {
        amount: Number(form.amount),
        method: form.method,
        status: form.status,
        note: form.note.trim() || null,
      };
      if (form.clientId) body.clientId = Number(form.clientId);
      if (form.orderId) body.orderId = Number(form.orderId);

      const res = await api.createAdminPayment(body);
      setItems((prev) => [res.item, ...prev]);
      setOk(`Paiement ${res.item.reference} enregistré.`);
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const shown = items.filter(
    (p) =>
      (filter === "all" || p.status === filter) &&
      (!query ||
        [p.reference, p.orderReference, p.client?.fullName, p.client?.email, p.method]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(query)))
  );

  const totalPaid = items.filter((p) => p.status === "paye").reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <>
      <Seo title="Paiements" path="/admin/paiements" noindex />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <DeskHeading as="h1" count={items.length}>
            Paiements
          </DeskHeading>
          <p className="mt-2 text-sm text-desk-ink/60">
            Suivi des transactions. Encaissé :{" "}
            <strong className="text-desk-ink">{formatAmount(totalPaid)}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setOk("");
            setError("");
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-desk-ink px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          aria-expanded={showForm}
        >
          {showForm ? <X className="size-4" strokeWidth={1.75} aria-hidden="true" /> : <Plus className="size-4" strokeWidth={1.75} aria-hidden="true" />}
          {showForm ? "Fermer" : "Nouveau paiement"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="mt-5 space-y-3 rounded-3xl bg-white p-4 sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight">Enregistrer un paiement</h2>
          <p className="text-sm text-desk-ink/55">Liez un client et/ou une commande, puis indiquez le montant et le statut.</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Client"
              as="select"
              searchable
              value={form.clientId}
              onChange={set("clientId")}
              placeholder="Nom ou e-mail…"
              options={[
                { value: "", label: "— Choisir —" },
                ...clients.map((c) => ({
                  value: String(c.id),
                  label: `${c.fullName || c.email}${c.email ? ` (${c.email})` : ""}`,
                })),
              ]}
            />
            <Field
              label="Commande (opt.)"
              as="select"
              searchable
              value={form.orderId}
              onChange={set("orderId")}
              placeholder="Référence ou métier…"
              options={[
                { value: "", label: "— Sans commande —" },
                ...ordersForClient.map((o) => ({
                  value: String(o.id),
                  label: `${o.reference} — ${o.metier || o.domain || "commande"}${o.amount ? ` · ${formatAmount(o.amount)}` : ""}`,
                })),
              ]}
            />
            <Field label="Montant (CDF)" type="number" min="1" required value={form.amount} onChange={set("amount")} />
            <Field label="Méthode" as="select" required value={form.method} onChange={set("method")} options={METHOD_OPTIONS} />
            <Field label="Statut" as="select" required value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
            <Field label="Note" value={form.note} onChange={set("note")} />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" disabled={saving || !form.amount || (!form.clientId && !form.orderId)} withArrow={false}>
              {saving ? "Enregistrement…" : "Enregistrer le paiement"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              withArrow={false}
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
              }}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}

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

      {ok && <p className="mt-4 text-sm font-medium text-teal-800">{ok}</p>}
      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}

      {shown.length ? (
        <div className="mt-5 overflow-x-auto rounded-3xl bg-white p-3 sm:p-4">
          <table className="w-full min-w-[48rem] border-separate border-spacing-y-2 text-left text-sm">
            <caption className="sr-only">Liste des paiements</caption>
            <thead>
              <tr className="text-xs font-medium uppercase tracking-wide text-desk-ink/55">
                <th scope="col" className="px-3 pb-1 font-medium">
                  Référence
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Client
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Commande
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Méthode
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Montant
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Statut
                </th>
                <th scope="col" className="px-3 pb-1 font-medium">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const st = STATUS[p.status] || { label: p.status, tone: "bg-white" };
                return (
                  <tr key={p.id} className="group">
                    <td className={`${cellBase} rounded-l-2xl pl-4 font-mono text-xs font-bold`}>{p.reference}</td>
                    <td className={cellBase}>{p.client?.fullName || "—"}</td>
                    <td className={cellBase}>{p.orderReference || "—"}</td>
                    <td className={cellBase}>{METHODS[p.method] || p.method || "—"}</td>
                    <td className={`${cellBase} font-semibold`}>{formatAmount(p.amount)}</td>
                    <td className={cellBase}>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${st.tone}`}>{st.label}</span>
                    </td>
                    <td className={`${cellBase} rounded-r-2xl pr-4`}>{formatDate(p.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !error && (
          <div className="mt-5">
            <DeskEmpty>
              {query || filter !== "all" ? (
                "Aucun paiement ne correspond."
              ) : (
                <>
                  Aucun paiement.{" "}
                  <button type="button" onClick={() => setShowForm(true)} className="font-semibold underline-offset-2 hover:underline">
                    En enregistrer un
                  </button>
                </>
              )}
            </DeskEmpty>
          </div>
        )
      )}
    </>
  );
}
