import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Search, SearchX, X, MessageCircle, Mail, ArrowUpRight, CreditCard, CalendarCheck, ShieldCheck, HelpCircle } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import AccordionItem from "../components/ui/Accordion";
import Reveal, { Stagger, RevealItem } from "../components/ui/Reveal";
import Section3D from "../components/ui/Section3D";
import { faqCategories } from "../data/content";
import { EASE } from "../lib/motion";

/** Icône associée à chaque catégorie, pour rendre les onglets reconnaissables. */
const CATEGORY_ICONS = {
  Réservation: CalendarCheck,
  "Paiement & sécurité": CreditCard,
  Prestataires: ShieldCheck,
};

const PHONE_HREF = "tel:+243816483538";
const WHATSAPP_HREF = "https://wa.me/243816483538";

export default function FAQPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tout");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqCategories.flatMap((cat) =>
      cat.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      }))
    ),
  };

  const totalCount = useMemo(
    () => faqCategories.reduce((total, cat) => total + cat.items.length, 0),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqCategories
      .filter((cat) => category === "Tout" || cat.category === category)
      .map((cat) => ({
        ...cat,
        items: q
          ? cat.items.filter(
              (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
            )
          : cat.items,
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query, category]);

  const resultCount = filtered.reduce((total, cat) => total + cat.items.length, 0);
  const searching = query.trim().length > 0;

  return (
    <>
      <Seo
        title="Questions fréquentes"
        description="Réponses aux questions les plus fréquentes sur la réservation, le paiement sécurisé et la vérification des prestataires SaaCare."
        path="/faq"
        jsonLd={jsonLd}
      />

      <PageHero
        align="center"
        eyebrow="Centre d'aide"
        title="Questions fréquentes"
        subtitle="Réservation, paiement, vérification des prestataires : les réponses aux questions que se posent le plus souvent les familles."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "FAQ" }]}
        compact
      >
        <div className="gradient-border glass-dark mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl px-4 py-3.5">
          <Search className="size-4 shrink-0 text-teal-300" aria-hidden="true" />
          <label className="sr-only" htmlFor="faq-search">
            Rechercher dans la FAQ
          </label>
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Rechercher parmi ${totalCount} questions…`}
            className="w-full border-0 bg-transparent text-sm text-paper-50 outline-none placeholder:text-paper-100/45 [&::-webkit-search-cancel-button]:hidden"
          />
          <AnimatePresence>
            {searching && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={() => setQuery("")}
                aria-label="Effacer la recherche"
                className="grid size-6 shrink-0 place-items-center rounded-full bg-white/10 text-paper-100/70 transition-colors hover:bg-white/20 hover:text-white"
              >
                <X className="size-3.5" aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </PageHero>

      {/* ---------------- Onglets de catégories ---------------- */}
      <section className="sticky top-20 z-30 border-b border-ink-900/8 bg-paper-50/85 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="fade-edges flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Catégories">
            <LayoutGroup id="faq-tabs">
              <Tab active={category === "Tout"} onClick={() => setCategory("Tout")} count={totalCount}>
                <HelpCircle className="size-3.5" aria-hidden="true" />
                Tout
              </Tab>
              {faqCategories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.category] ?? HelpCircle;
                return (
                  <Tab
                    key={cat.category}
                    active={category === cat.category}
                    onClick={() => setCategory(cat.category)}
                    count={cat.items.length}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {cat.category}
                  </Tab>
                );
              })}
            </LayoutGroup>
          </div>

          <p className="shrink-0 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-900/40" aria-live="polite">
            {resultCount} réponse{resultCount > 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* ---------------- Liste des questions ---------------- */}
      <section className="bg-paper-100 py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-ink-900/15 bg-white px-6 py-16 text-center"
              >
                <SearchX className="size-8 text-ink-900/30" aria-hidden="true" />
                <p className="font-display text-lg font-semibold text-ink-900">Aucune réponse trouvée</p>
                <p className="max-w-sm text-sm text-ink-900/60">
                  Reformulez votre recherche, ou posez directement votre question à notre équipe.
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setCategory("Tout");
                    }}
                    className="text-sm font-semibold text-teal-700 underline underline-offset-4"
                  >
                    Réinitialiser
                  </button>
                  <Link
                    to="/contact"
                    className="text-sm font-semibold text-teal-700 underline underline-offset-4"
                  >
                    Contacter le support
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`${category}-${searching}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {filtered.map((cat) => (
                  <Reveal key={cat.category} variant="up" className="mb-8 last:mb-0">
                    {category === "Tout" && (
                      <h2 className="flex items-center gap-2 px-1 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                        <span className="h-px w-5 bg-current opacity-60" aria-hidden="true" />
                        {cat.category}
                      </h2>
                    )}
                    <div
                      className={`flex flex-col gap-1 rounded-3xl border border-ink-900/8 bg-white p-2 shadow-soft sm:p-3 ${
                        category === "Tout" ? "mt-3" : ""
                      }`}
                    >
                      {cat.items.map((item, index) => (
                        <AccordionItem
                          key={item.q}
                          question={item.q}
                          answer={item.a}
                          defaultOpen={searching || (category !== "Tout" && index === 0)}
                        />
                      ))}
                    </div>
                  </Reveal>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ---------------- Support direct ---------------- */}
      <Section3D variant="down" className="bg-white">
        <section className="bg-white py-16 sm:py-20" aria-labelledby="faq-support-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Reveal variant="up" className="text-center">
              <h2
                id="faq-support-heading"
                className="text-balance font-display text-2xl font-semibold text-ink-900 sm:text-3xl"
              >
                Vous n'avez pas trouvé votre réponse ?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-ink-900/60">
                Notre équipe répond sous 24 heures ouvrées, du lundi au samedi de 8 h à 18 h.
              </p>
            </Reveal>

            <Stagger stagger={0.08} className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <RevealItem variant="up">
                <SupportCard
                  href={WHATSAPP_HREF}
                  external
                  icon={MessageCircle}
                  title="WhatsApp"
                  detail="Réponse la plus rapide"
                />
              </RevealItem>
              <RevealItem variant="up">
                <SupportCard to="/contact" icon={Mail} title="Formulaire" detail="Sous 24 h ouvrées" />
              </RevealItem>
              <RevealItem variant="up">
                <SupportCard
                  href={PHONE_HREF}
                  icon={HelpCircle}
                  title="Téléphone"
                  detail="+243 816 483 538"
                />
              </RevealItem>
            </Stagger>
          </div>
        </section>
      </Section3D>
    </>
  );
}

/* ---------------------------------------------------------------- */

/** Onglet de catégorie : la pastille active glisse d'un onglet à l'autre. */
function Tab({ children, active, onClick, count }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 ${
        active ? "text-white" : "text-ink-900/60 hover:text-ink-900"
      }`}
    >
      {active && (
        <motion.span
          layoutId="faq-tab-pill"
          className="absolute inset-0 -z-10 rounded-md bg-navy-700"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      {!active && (
        <span className="absolute inset-0 -z-10 rounded-md bg-paper-200/70" aria-hidden="true" />
      )}
      {children}
      <span className={`font-mono text-[0.62rem] ${active ? "text-white/60" : "text-ink-900/35"}`}>
        {count}
      </span>
    </button>
  );
}

function SupportCard({ to, href, external, icon: Icon, title, detail }) {
  const content = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:bg-teal-600 group-hover:text-white">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink-900">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-ink-900/55">{detail}</span>
      </span>
      <ArrowUpRight
        className="size-4 shrink-0 -translate-x-1 text-ink-900/30 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        aria-hidden="true"
      />
    </>
  );

  const className =
    "group flex h-full items-center gap-3 rounded-2xl border border-ink-900/8 bg-paper-100 p-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-ink-900/15 hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500";

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}
