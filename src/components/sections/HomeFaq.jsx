import SectionHeading from "../ui/SectionHeading";
import AccordionItem from "../ui/Accordion";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";
import Section3D from "../ui/Section3D";
import { homeFaq } from "../../data/content";

/** Grand écran : la première réponse est dépliée ; sur mobile tout reste replié. */
const IS_WIDE = typeof window !== "undefined" && window.matchMedia?.("(min-width: 1024px)").matches;

/** Six questions repliables (cahier des charges §2.2.1). */
export default function HomeFaq({ items = homeFaq, title = "Vos questions, nos réponses" }) {
  return (
    <Section3D variant="left" className="bg-paper-100">
      <section className="bg-paper-100 py-8 sm:py-20" aria-labelledby="home-faq-heading">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
          <div>
            <SectionHeading eyebrow="Questions fréquentes" title={<span id="home-faq-heading">{title}</span>} subtitle="Les réponses les plus demandées. Pour le reste, notre équipe répond sous 24 heures ouvrées." />
            <Reveal variant="up" delay={0.2} className="mt-8 hidden lg:block">
              <Button to="/aide" variant="outline" withArrow>
                Centre d'aide
              </Button>
            </Reveal>
          </div>
          <Reveal variant="up" className="flex flex-col gap-1 rounded-3xl border border-ink-900/8 bg-white p-2 shadow-soft sm:p-3">
            {(IS_WIDE ? items : items.slice(0, 4)).map((item, index) => (
              <AccordionItem key={item.q} question={item.q} answer={item.a} defaultOpen={index === 0 && IS_WIDE} />
            ))}
          </Reveal>
          <Button to="/aide" variant="outline" size="sm" withArrow className="w-full lg:hidden">
            Toutes les questions
          </Button>
        </div>
      </section>
    </Section3D>
  );
}
