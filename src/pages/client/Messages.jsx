import { useEffect, useRef, useState } from "react";
import Seo from "../../lib/Seo";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";

export default function ClientMessages() {
  const [items, setItems] = useState([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const load = () =>
    api
      .clientMessages("support")
      .then((d) => setItems(d.items || []))
      .catch((err) => setError(err.message || "Chargement impossible."));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError("");
    try {
      const data = await api.sendClientMessage({ body: body.trim(), thread: "support" });
      setItems(data.items || []);
      setBody("");
    } catch (err) {
      setError(err.message || "Envoi impossible.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Seo title="Messages" path="/client/messages" noindex />
      <div className="flex h-[min(70vh,640px)] flex-col rounded-2xl border border-ink-900/8 bg-white">
        <div className="border-b border-ink-900/8 px-5 py-4 sm:px-6">
          <h1 className="font-display text-2xl font-bold text-ink-900">Messages</h1>
          <p className="text-sm text-ink-900/55">Conversation avec le support SaaCare</p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4 sm:px-6">
          {items.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.fromStaff ? "bg-paper-100 text-ink-900" : "ml-auto bg-teal-600 text-white"
              }`}
            >
              {m.body}
            </div>
          ))}
          {!items.length && <p className="text-center text-sm text-ink-900/45">Aucun message. Écrivez-nous ci-dessous.</p>}
          <div ref={endRef} />
        </div>

        {error && <p className="px-5 text-sm text-coral-800 sm:px-6">{error}</p>}

        <form onSubmit={onSubmit} className="flex gap-2 border-t border-ink-900/8 p-4 sm:p-5">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Votre message…"
            className="min-h-11 flex-1 rounded-lg border border-ink-900/10 bg-paper-100 px-3.5 text-sm outline-none focus:border-teal-600/40 focus:bg-white"
          />
          <Button type="submit" disabled={sending || !body.trim()}>
            {sending ? "…" : "Envoyer"}
          </Button>
        </form>
      </div>
    </>
  );
}
