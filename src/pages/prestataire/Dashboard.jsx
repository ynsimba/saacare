import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";

const STATUS_LABEL = {
  pending: { label: "En validation", className: "bg-gold-100 text-gold-800" },
  approved: { label: "Approuvé", className: "bg-teal-50 text-teal-800" },
  rejected: { label: "Refusé", className: "bg-coral-100 text-coral-800" },
  suspended: { label: "Suspendu", className: "bg-ink-900/10 text-ink-900" },
};

const STAT_LINKS = {
  Missions: "/prestataire/missions",
  "Gains du mois": "/prestataire/profil",
  Avis: "/prestataire/profil",
};

export default function PrestataireDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .prestataireDashboard()
      .then(setData)
      .catch((err) => setError(err.message || "Impossible de charger le tableau de bord."));
  }, []);

  const status = data?.providerStatus || user?.providerStatus || "pending";
  const badge = STATUS_LABEL[status] || STATUS_LABEL.pending;

  return (
    <>
      <Seo title="Espace prestataire" description="Votre activité SaaCare." path="/prestataire/dashboard" noindex />
      <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
              Bonjour{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-2 text-sm text-ink-900/60">{data?.message || "Chargement…"}</p>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
            {error}
          </p>
        )}

        {status === "pending" && (
          <div className="mt-6 rounded-xl border border-gold-500/25 bg-gold-100/50 px-4 py-3 text-sm text-ink-900">
            Votre dossier prestataire n’est pas encore actif. Un administrateur SaaCare le valide depuis le back-office.
          </div>
        )}

        <div className="stagger-in mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(data?.stats || []).map((s) => (
            <Link
              key={s.label}
              to={STAT_LINKS[s.label] || "/prestataire/dashboard"}
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
