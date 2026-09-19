import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../../lib/Seo";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";

export default function PrestataireNotifications() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState("");

  const load = () =>
    api
      .prestataireNotifications()
      .then((d) => {
        setItems(d.items || []);
        setUnread(d.unread || 0);
      })
      .catch((err) => setError(err.message || "Chargement impossible."));

  useEffect(() => {
    load();
  }, []);

  const markOne = async (id) => {
    await api.markPrestataireNotificationRead(id);
    await load();
  };

  const markAll = async () => {
    await api.markAllPrestataireNotificationsRead();
    await load();
  };

  return (
    <>
      <Seo title="Notifications" path="/prestataire/notifications" noindex />
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">Notifications</h1>
            <p className="mt-2 text-sm text-ink-900/60">
              {unread > 0 ? `${unread} non lue${unread > 1 ? "s" : ""}` : "Tout est à jour"}
            </p>
          </div>
          {unread > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={markAll}>
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
            {error}
          </p>
        )}

        <ul className="mt-6 flex flex-col gap-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border px-4 py-3 ${n.readAt ? "border-ink-900/8 bg-white" : "border-teal-600/20 bg-teal-50/60"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-900">{n.title}</p>
                  {n.body && <p className="mt-1 text-sm text-ink-900/65">{n.body}</p>}
                  {n.link && (
                    <Link to={n.link} className="mt-2 inline-block text-sm font-semibold text-teal-700 hover:underline">
                      Voir
                    </Link>
                  )}
                </div>
                {!n.readAt && (
                  <Button type="button" size="sm" variant="ghost" onClick={() => markOne(n.id)}>
                    Lu
                  </Button>
                )}
              </div>
            </li>
          ))}
          {!items.length && !error && (
            <li className="rounded-xl border border-dashed border-ink-900/15 px-4 py-10 text-center text-sm text-ink-900/50">
              Aucune notification pour le moment.
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
