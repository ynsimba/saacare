import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Search, SearchX, X, MessageCircle, Mail, Phone, ArrowUpRight, Receipt, ShieldCheck, UserPlus, Building2, HelpCircle } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import AccordionItem from "../components/ui/Accordion";
import Reveal from "../components/ui/Reveal";
import { faqCategories } from "../data/content";
import { PHONE, PHONE_HREF, WHATSAPP_HREF } from "../data/site";
import { EASE } from "../lib/motion";

const CATEGORY_ICONS = {
  "Demander un service": Search,
  "Tarifs et contrats": Receipt,
  "Confiance et sécurité": ShieldCheck,
  "Devenir prestataire": UserPlus,
  "Entreprises et diaspora": Building2,
};

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
        items: q ? cat.items.filter((i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)) : cat.items,
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
            cat.items.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } }))
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
            <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche" className="grid size-9 shrink-0 place-items-center rounded-full bg-paper-200 text-ink-900">
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </PageHero>

      <section className="sticky top-16 z-30 border-b border-ink-900/8 bg-white/90 py-3 backdrop-blur-md sm:top-20">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="fade-edges flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Catégories">
            <LayoutGroup id="help-tabs">
              <Tab active={category === "Tout"} onClick={() => setCategory("Tout")} count={totalCount} icon={HelpCircle}>
                Tout
              </Tab>
              {faqCategories.map((cat) => (
                <Tab key={cat.category} active={category === cat.category} onClick={() => setCategory(cat.category)} count={cat.items.length} icon={CATEGORY_ICONS[cat.category] ?? HelpCircle}>
                  {cat.category}
                </Tab>
              ))}
            </LayoutGroup>
          </div>
          <p className="hidden shrink-0 text-xs text-ink-900/70 sm:block" aria-live="polite">
            {resultCount} réponse{resultCount > 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <section className="bg-paper-100 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-ink-900/20 bg-white px-6 py-14 text-center">
                <SearchX className="size-8 text-navy-500" aria-hidden="true" />
                <p className="font-display text-lg font-bold text-ink-900">Aucune réponse trouvée</p>
                <p className="max-w-sm text-sm text-ink-900/75">Reformulez votre question, ou posez-la directement à notre équipe.</p>
                <Link to="/contact" className="text-sm font-semibold text-teal-700 underline underline-offset-4">
                  Contacter l'équipe
                </Link>
              </motion.div>
            ) : (
              <motion.div key={`${category}-${searching}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {filtered.map((cat) => (
                  <Reveal key={cat.category} variant="up" className="mb-8 last:mb-0">
                    {category === "Tout" && <h2 className="px-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{cat.category}</h2>}
                    <div className={`flex flex-col gap-1 rounded-3xl border border-ink-900/8 bg-white p-2 shadow-soft sm:p-3 ${category === "Tout" ? "mt-3" : ""}`}>
                      {cat.items.map((item, index) => (
                        <AccordionItem key={item.q} question={item.q} answer={item.a} defaultOpen={searching || (category !== "Tout" && index === 0)} />
                      ))}
                    </div>
                  </Reveal>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16" aria-labelledby="support-heading">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 id="support-heading" className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Vous n'avez pas trouvé votre réponse ?</h2>
          <p className="mx-auto mt-3 max-w-md text-ink-900/75">Notre équipe répond sous 24 heures ouvrées, du lundi au samedi de 8 h à 18 h.</p>
          <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            <SupportCard href={WHATSAPP_HREF} external icon={MessageCircle} title="WhatsApp" detail="Réponse la plus rapide" />
            <SupportCard to="/contact" icon={Mail} title="Formulaire" detail="Sous 24 h ouvrées" />
            <SupportCard href={PHONE_HREF} icon={Phone} title="Téléphone" detail={PHONE} />
          </div>
        </div>
      </section>
    </>
  );
}

function Tab({ children, active, onClick, count, icon: Icon }) {
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`relative inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium transition-colors ${active ? "text-white" : "text-ink-900/80 hover:text-ink-900"}`}>
      {active ? (
        <motion.span layoutId="help-tab-pill" className="absolute inset-0 -z-10 rounded-md bg-teal-600" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
      ) : (
        <span className="absolute inset-0 -z-10 rounded-md bg-paper-200" aria-hidden="true" />
      )}
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
      <span className={`text-[0.68rem] ${active ? "text-white/80" : "text-ink-900/60"}`}>{count}</span>
    </button>
  );
}

function SupportCard({ to, href, external, icon: Icon, title, detail }) {
  const className = "group flex h-full items-center gap-3 rounded-2xl border border-ink-900/8 bg-paper-100 p-4 transition-colors hover:border-teal-600/40";
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
