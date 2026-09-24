import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";

const STAT_LINKS = {
  Commandes: "/client/commandes",
  Messages: "/client/messages",
  Notifications: "/client/notifications",
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .clientDashboard()
      .then(setData)
      .catch((err) => setError(err.message || "Impossible de charger le tableau de bord."));
  }, []);

  return (
    <>
      <Seo title="Espace client" description="Votre espace SaaCare." path="/client/dashboard" noindex />
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Espace client</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink-900">Bonjour{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}</h1>
        <p className="mt-2 text-sm text-ink-900/60">{data?.message || "Chargement…"}</p>

        {error && (
          <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
            {error}
          </p>
        )}

        <div className="stagger-in mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.stats || []).map((s) => (
            <Link
              key={s.label}
              to={STAT_LINKS[s.label] || "/client/dashboard"}
              className="tap rounded-xl border border-ink-900/8 bg-paper-100/70 px-4 py-4 transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-ink-900/45">{s.label}</p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums text-ink-900">{s.value}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
