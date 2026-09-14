import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Search, CheckCircle2, AlertTriangle, Phone } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import Badge from "../components/ui/Badge";
import { getProviderBySeal } from "../data/providers";
import { saatrustSteps } from "../data/content";
import { PHONE, PHONE_HREF } from "../data/site";
import { EASE } from "../lib/motion";

/**
 * Vérification publique d'un sceau SaaTrust (cahier des charges §2, GET /api/seals/{seal}).
 * N'affiche que le statut et les données publiques du profil anonymisé.
 */
export default function Verifier() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("sceau") ?? "";
  const [value, setValue] = useState(initial);
  const [query, setQuery] = useState(initial);

  const result = query ? getProviderBySeal(query) : null;

  const onSubmit = (e) => {
    e.preventDefault();
    const seal = value.trim().toUpperCase();
    setQuery(seal);
    setParams(seal ? { sceau: seal } : {}, { replace: true });
  };

  return (
    <>
      <Seo
        title="Vérifier un agent SaaCare"
        description="Saisissez le numéro de sceau SaaTrust d'un agent pour vérifier son statut, son niveau de certification et sa date de revérification."
        path="/verifier"
      />

      <PageHero
        align="center"
        eyebrow="Vérifier un agent"
        title="Un doute ? Vérifiez le sceau."
        subtitle="Le numéro figure sur la carte professionnelle de l'agent. Il commence par ST."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Vérifier un agent" }]}
        compact
      >
        <form onSubmit={onSubmit} role="search" className="mx-auto flex w-full max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 sm:flex-row">
          <label htmlFor="seal" className="sr-only">
            Numéro de sceau
          </label>
          <input
            id="seal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Exemple : ST-26-0412"
            autoComplete="off"
            className="min-h-12 flex-1 rounded-xl px-4 text-base uppercase text-ink-900 outline-none placeholder:normal-case placeholder:text-navy-500"
          />
          <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white hover:bg-teal-700">
            <Search className="size-4" aria-hidden="true" />
            Vérifier
          </button>
        </form>
      </PageHero>

      <section className="bg-paper-100 py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8" aria-live="polite">
          <AnimatePresence mode="wait">
            {query && result && (
              <motion.div key={`ok-${query}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden rounded-3xl border border-ink-900/8 bg-white shadow-soft">
                <div className="flex items-center gap-3 bg-teal-600 px-6 py-4 text-white">
                  <CheckCircle2 className="size-6" aria-hidden="true" />
                  <p className="font-display text-lg font-bold">Sceau valide · agent actif</p>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-navy-500">{result.reference}</p>
                      <p className="font-display text-xl font-bold text-ink-900">{result.metier}</p>
                    </div>
                    <Badge label={result.level} size="md" />
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-ink-900/8 pt-5 text-sm">
                    <div>
                      <dt className="text-ink-900/70">Vérifié le</dt>
                      <dd className="font-semibold text-ink-900">{result.verifiedAt}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-900/70">Revérification</dt>
                      <dd className="font-semibold text-ink-900">{result.nextCheck}</dd>
                    </div>
                  </dl>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {saatrustSteps.map((s) => (
                      <li key={s.number} className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                        {s.title}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/prestataires/${result.reference}`} className="mt-6 inline-flex text-sm font-semibold text-teal-700 hover:underline">
                    Voir le profil public
                  </Link>
                </div>
              </motion.div>
            )}

            {query && !result && (
              <motion.div key={`ko-${query}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="rounded-3xl border-2 border-coral-500 bg-white p-6" role="alert">
                <p className="flex items-center gap-2 font-display text-lg font-bold text-coral-800">
                  <AlertTriangle className="size-5" aria-hidden="true" />
                  Aucun agent actif avec le sceau {query}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-900">
                  Vérifiez la saisie. Si une personne se présente chez vous avec ce numéro, ne la laissez pas entrer et
                  appelez-nous immédiatement.
                </p>
                <a href={PHONE_HREF} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-coral-700 px-4 text-sm font-semibold text-white">
                  <Phone className="size-4" aria-hidden="true" />
                  {PHONE}
                </a>
              </motion.div>
            )}

            {!query && (
              <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm leading-relaxed text-ink-900/75">
                Le sceau garantit que l'agent a passé les 7 contrôles du{" "}
                <Link to="/saatrust" className="font-semibold text-teal-700 underline underline-offset-2">
                  protocole SaaTrust
                </Link>{" "}
                et qu'il n'est pas suspendu.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
