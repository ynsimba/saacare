import { useEffect, useState } from "react";
import Seo from "../../lib/Seo";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";

const STATUS = {
  en_attente: "bg-gold-100 text-gold-800",
  paye: "bg-teal-50 text-teal-800",
  echoue: "bg-coral-100 text-coral-800",
  rembourse: "bg-ink-900/10 text-ink-900",
};

export default function ClientPayments() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [instructions, setInstructions] = useState(null);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ orderId: "", amount: "", method: "mobile_money", note: "" });

  const load = async () => {
    try {
      const [pay, ord] = await Promise.all([api.clientPayments(), api.clientOrders()]);
      setItems(pay.items || []);
      setOrders((ord.items || []).filter((o) => o.status !== "annulee"));
    } catch (err) {
      setError(err.message || "Chargement impossible.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    setOk("");
    setInstructions(null);
    try {
      const data = await api.createClientPayment({
        orderId: Number(form.orderId),
        amount: Number(form.amount),
        method: form.method,
        note: form.note,
      });
      setOk("Paiement enregistré (en attente de confirmation).");
      if (data.paymentInstructions) setInstructions(data.paymentInstructions);
      setForm({ orderId: "", amount: "", method: "mobile_money", note: "" });
      await load();
    } catch (err) {
      setError(err.message || "Paiement impossible.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Seo title="Paiements" path="/client/paiements" noindex />
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold text-ink-900">Paiements</h1>
        <p className="mt-2 text-sm text-ink-900/60">Déclarez un paiement lié à une commande. Confirmation par SaaCare.</p>

        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4 border-b border-ink-900/8 pb-6 sm:grid-cols-2">
          <Field
            label="Commande"
            as="select"
            required
            value={form.orderId}
            onChange={set("orderId")}
            options={orders.map((o) => ({ value: String(o.id), label: `${o.reference} — ${o.metier || o.domain}` }))}
            className="sm:col-span-2"
          />
          <Field label="Montant (CDF)" type="number" required value={form.amount} onChange={set("amount")} />
          <Field
            label="Mode"
            as="select"
            required
            value={form.method}
            onChange={set("method")}
            options={[
              { value: "mobile_money", label: "Mobile money" },
              { value: "cash", label: "Espèces" },
              { value: "bank", label: "Virement" },
            ]}
          />
          <Field label="Note" value={form.note} onChange={set("note")} className="sm:col-span-2" placeholder="Réf. transaction…" />
          <Button type="submit" disabled={sending || !orders.length} className="sm:col-span-2 sm:w-fit">
            {sending ? "Enregistrement…" : "Déclarer un paiement"}
          </Button>
        </form>

        {error && <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">{error}</p>}
        {ok && <p className="mt-4 rounded-lg border border-teal-600/20 bg-teal-50 px-3 py-2 text-sm text-teal-800" role="status">{ok}</p>}

        {instructions && (
          <div className="mt-4 rounded-xl border border-teal-600/20 bg-teal-50/70 px-4 py-3 text-sm text-teal-900" role="status">
            <p className="font-semibold">Instructions de paiement</p>
            {instructions.mobileMoneyNumber && (
              <p className="mt-1">
                Mobile Money : <strong className="font-mono">{instructions.mobileMoneyNumber}</strong>
              </p>
            )}
            {instructions.supportPhone && (
              <p className="mt-1">Support : {instructions.supportPhone}</p>
            )}
            {instructions.supportEmail && (
              <p className="mt-1">E-mail : {instructions.supportEmail}</p>
            )}
            <p className="mt-2 text-teal-800/80">
              Indiquez la référence du paiement dans le libellé du transfert, puis attendez la confirmation SaaCare.
            </p>
          </div>
        )}

        <ul className="mt-6 flex flex-col gap-3">
          {items.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-900/8 bg-paper-100/50 px-4 py-3">
              <div>
                <p className="font-mono text-xs font-semibold text-teal-700">{p.reference}</p>
                <p className="text-sm text-ink-900">
                  {p.amount.toLocaleString("fr-CD")} CDF · {p.method}
                  {p.orderReference ? ` · ${p.orderReference}` : ""}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${STATUS[p.status] || ""}`}>{p.status}</span>
            </li>
          ))}
          {!items.length && <li className="py-8 text-center text-sm text-ink-900/50">Aucun paiement.</li>}
        </ul>
      </div>
    </>
  );
}
