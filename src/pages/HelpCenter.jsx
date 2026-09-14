import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Search, SearchX, X, MessageCircle, Mail, Phone, ArrowUpRight, ChevronDown } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import AccordionItem from "../components/ui/Accordion";
import { faqCategories } from "../data/content";
import { PHONE, PHONE_HREF, WHATSAPP_HREF } from "../data/site";
import { EASE } from "../lib/motion";

/** Centre d'aide : questions par catégorie, avec moteur de recherche (cahier des charges §2). */
export default function HelpCenter() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tout");

  const totalCount = faqCategories.reduce((t, c) => t + c.items.length, 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqCategories
      .filter((cat) => category === "Tout" || cat.category === category)
      .map((cat) => ({
        ...cat,
        items: q
          ? cat.items.filter((i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q))
          : cat.items,
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query, category]);

  const resultCount = filtered.reduce((t, c) => t + c.items.length, 0);
  const searching = query.trim().length > 0;

  return (
    <>
      <Seo
        title="Centre d'aide"
        description="Demander un service, tarifs et contrats, vérification des agents, candidature, entreprises et diaspora : les réponses aux questions fréquentes sur SaaCare."
        path="/aide"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqCategories.flatMap((cat) =>
            cat.items.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            }))
          ),
        }}
      />

      <PageHero
        align="center"
        eyebrow="Centre d'aide"
        title="Comment pouvons-nous vous aider ?"
        subtitle="Des réponses courtes, sans jargon. Et une équipe joignable du lundi au samedi."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Aide" }]}
        compact
      >
        <div className="mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl bg-white px-4 py-2">
          <Search className="size-4 shrink-0 text-teal-600" aria-hidden="true" />
          <label className="sr-only" htmlFor="help-search">
            Rechercher dans l'aide
          </label>
          <input
            id="help-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Rechercher parmi ${totalCount} questions…`}
            className="min-h-11 w-full border-0 bg-transparent text-sm text-ink-900 outline-none placeholder:text-navy-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Effacer la recherche"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-paper-200 text-ink-900"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </PageHero>

      <section className="bg-paper-100 py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14 lg:px-8">
          {/* ---------- Catégories : select mobile, liste desktop ---------- */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-navy-500">
              Catégories
            </p>

            <label className="relative block lg:hidden">
              <span className="sr-only">Choisir une catégorie</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="min-h-12 w-full appearance-none rounded-xl border border-ink-900/10 bg-white py-3 pl-4 pr-11 text-sm font-medium text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-teal-600/30"
              >
                <option value="Tout">Toutes les questions ({totalCount})</option>
                {faqCategories.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category} ({cat.items.length})
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-900/40"
                aria-hidden="true"
              />
            </label>

            <nav className="hidden lg:block" aria-label="Catégories d'aide">
              <ul className="flex flex-col gap-0.5">
                <li>
                  <CategoryLink
                    active={category === "Tout"}
                    onClick={() => setCategory("Tout")}
                    count={totalCount}
                  >
                    Toutes les questions
                  </CategoryLink>
                </li>
                {faqCategories.map((cat) => (
                  <li key={cat.category}>
                    <CategoryLink
                      active={category === cat.category}
                      onClick={() => setCategory(cat.category)}
                      count={cat.items.length}
                    >
                      {cat.category}
                    </CategoryLink>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* ---------- FAQ ---------- */}
          <div>
            <div className="mb-6 flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink-900 sm:text-2xl">
                {category === "Tout" ? "Questions fréquentes" : category}
              </h2>
              <p className="shrink-0 text-sm text-ink-900/50" aria-live="polite">
                {resultCount} réponse{resultCount > 1 ? "s" : ""}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-ink-900/15 bg-white px-6 py-14 text-center"
                >
                  <SearchX className="size-7 text-navy-500" aria-hidden="true" />
                  <p className="font-display text-lg font-bold text-ink-900">Aucune réponse trouvée</p>
                  <p className="max-w-sm text-sm text-ink-900/70">
                    Reformulez votre question, ou posez-la directement à notre équipe.
                  </p>
                  <Link
                    to="/contact"
                    className="text-sm font-semibold text-teal-700 underline underline-offset-4"
                  >
                    Contacter l'équipe
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key={`${category}-${query}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="rounded-2xl border border-ink-900/8 bg-white"
                >
                  {filtered.map((cat, catIndex) => (
                    <div
                      key={cat.category}
                      className={catIndex > 0 ? "border-t border-ink-900/8" : ""}
                    >
                      {category === "Tout" && (
                        <h3 className="border-b border-ink-900/6 px-5 pb-2 pt-5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-teal-700 sm:px-6">
                          {cat.category}
                        </h3>
                      )}
                      <ul className="divide-y divide-ink-900/6">
                        {cat.items.map((item, index) => (
                          <li key={item.q}>
                            <AccordionItem
                              key={`${category}-${item.q}`}
                              question={item.q}
                              answer={item.a}
                              defaultOpen={searching || (category !== "Tout" && index === 0)}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16" aria-labelledby="support-heading">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 id="support-heading" className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ink-900/75">
            Notre équipe répond sous 24 heures ouvrées, du lundi au samedi de 8 h à 18 h.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            <SupportCard
              href={WHATSAPP_HREF}
              external
              icon={MessageCircle}
              title="WhatsApp"
              detail="Réponse la plus rapide"
            />
            <SupportCard to="/contact" icon={Mail} title="Formulaire" detail="Sous 24 h ouvrées" />
            <SupportCard href={PHONE_HREF} icon={Phone} title="Téléphone" detail={PHONE} />
          </div>
        </div>
      </section>
    </>
  );
}

function CategoryLink({ children, active, onClick, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
        active
          ? "bg-teal-600 font-semibold text-white"
          : "font-medium text-ink-900/70 hover:bg-ink-900/4 hover:text-ink-900"
      }`}
    >
      <span className="min-w-0 leading-snug">{children}</span>
      <span className={`tabular-nums text-xs ${active ? "text-white/75" : "text-ink-900/40"}`}>
        {count}
      </span>
    </button>
  );
}

function SupportCard({ to, href, external, icon: Icon, title, detail }) {
  const className =
    "group flex h-full items-center gap-3 rounded-2xl border border-ink-900/8 bg-paper-100 p-4 transition-colors hover:border-teal-600/40";
  const content = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink-900">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-ink-900/70">{detail}</span>
      </span>
      <ArrowUpRight className="size-4 shrink-0 text-ink-900/40" aria-hidden="true" />
    </>
  );
  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <a href={href} className={className} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {content}
    </a>
  );
}
