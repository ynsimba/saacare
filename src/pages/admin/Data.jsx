import { useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import Seo from "../../lib/Seo";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";
import { DeskAlert, DeskHeading } from "../../components/admin/DeskUI";

const TABLE_LABELS = {
  users: "Utilisateurs",
  provider_profiles: "Profils prestataires",
  orders: "Commandes",
  payments: "Paiements",
  messages: "Messages",
  notifications: "Notifications",
  client_favorites: "Favoris",
  order_trips: "Trajets",
  order_trip_points: "Positions GPS",
  appointments: "Rendez-vous",
  mission_notes: "Notes missions",
  login_logs: "Journal connexions",
};

export default function AdminData() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [purging, setPurging] = useState(false);
  const [purgeMessage, setPurgeMessage] = useState("");
  const [purgeError, setPurgeError] = useState("");

  const load = () =>
    api
      .superAdminDataOverview()
      .then(setOverview)
      .catch((err) => setError(err.message || "Chargement impossible."));

  useEffect(() => {
    load();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    setExportMessage("");
    setError("");
    try {
      await api.superAdminExportBackup();
      setExportMessage("Backup téléchargé.");
    } catch (err) {
      setError(err.message || "Export impossible.");
    } finally {
      setExporting(false);
    }
  };

  const handlePurge = async (e) => {
    e.preventDefault();
    setPurging(true);
    setPurgeError("");
    setPurgeMessage("");
    try {
      const res = await api.superAdminPurgeData({ confirmation, password });
      setPurgeMessage(res.message || "Données supprimées.");
      setConfirmation("");
      setPassword("");
      await load();
    } catch (err) {
      setPurgeError(err.message || "Suppression impossible.");
    } finally {
      setPurging(false);
    }
  };

  const phrase = overview?.purgeConfirmation || "SUPPRIMER TOUT";
  const counts = overview?.counts || {};

  return (
    <>
      <Seo title="Données" path="/admin/donnees" noindex />
      <DeskHeading as="h1">Données</DeskHeading>
      <p className="mt-2 max-w-2xl text-sm text-desk-ink/60">
        Exportez un backup JSON de la plateforme, ou effacez toutes les données métier. Votre compte
        super-admin est toujours conservé après une purge.
      </p>

      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}

      <section className="mt-5 rounded-3xl bg-white p-5">
        <h2 className="text-lg font-semibold">Inventaire</h2>
        {!overview && !error && <p className="mt-3 text-sm text-desk-ink/55">Chargement…</p>}
        {overview && (
          <>
            <p className="mt-2 text-sm text-desk-ink/55">
              {overview.totalRows} ligne{overview.totalRows === 1 ? "" : "s"} au total
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(counts).map(([table, total]) => (
                <li
                  key={table}
                  className="flex items-center justify-between rounded-xl bg-desk-canvas px-3 py-2 text-sm"
                >
                  <span>{TABLE_LABELS[table] || table}</span>
                  <strong>{total}</strong>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="mt-5 rounded-3xl bg-desk-mint/40 p-5">
        <h2 className="text-lg font-semibold">Exporter (backup)</h2>
        <p className="mt-2 text-sm text-desk-ink/65">
          Télécharge un fichier JSON contenant utilisateurs, commandes, paiements, messages et
          journaux.
        </p>
        {exportMessage && <p className="mt-3 text-sm font-medium text-teal-800">{exportMessage}</p>}
        <div className="mt-4">
          <Button type="button" onClick={handleExport} disabled={exporting} withArrow={false}>
            <span className="inline-flex items-center gap-2">
              <Download className="size-4" strokeWidth={1.75} aria-hidden="true" />
              {exporting ? "Export…" : "Télécharger le backup"}
            </span>
          </Button>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-coral-700/25 bg-desk-pink/50 p-5">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-coral-800">
          <Trash2 className="size-5" strokeWidth={1.75} aria-hidden="true" />
          Zone dangereuse
        </h2>
        <p className="mt-2 text-sm text-desk-ink/70">
          Supprime définitivement toutes les données (clients, prestataires, commandes, paiements,
          messages, GPS, journaux). Irréversible. Conservez d’abord un backup.
        </p>

        {purgeMessage && <p className="mt-3 text-sm font-medium text-teal-800">{purgeMessage}</p>}
        {purgeError && (
          <div className="mt-3">
            <DeskAlert>{purgeError}</DeskAlert>
          </div>
        )}

        <form onSubmit={handlePurge} className="mt-4 grid max-w-md gap-3">
          <Field
            label={`Tapez « ${phrase} »`}
            name="confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
            required
          />
          <Field
            label="Mot de passe super-admin"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Button type="submit" variant="accent" disabled={purging || confirmation !== phrase} withArrow={false}>
            {purging ? "Suppression…" : "Supprimer toutes les données"}
          </Button>
        </form>
      </section>
    </>
  );
}
