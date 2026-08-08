import { motion } from "motion/react";
import { Compass } from "lucide-react";
import Seo from "../lib/Seo";
import Button from "../components/ui/Button";
import { EASE, useIsReducedMotion, usePointerParallax } from "../lib/motion";
import { useDeclareNavTheme } from "../lib/navTheme";

export default function NotFound() {
  const reduced = useIsReducedMotion();
  const parallax = usePointerParallax(1);
  useDeclareNavTheme("dark");

  return (
    <>
      <Seo title="Page introuvable" description="Cette page n'existe pas ou plus." path="/404" noindex />

      <section className="noise-overlay relative isolate -mt-20 flex min-h-[100svh] items-center justify-center overflow-hidden bg-gradient-to-br from-navy-800 via-navy-900 to-ink-950 px-4 pt-20 text-center">
        <motion.div
          className="absolute inset-0 -z-10"
          style={reduced ? undefined : { x: parallax.x, y: parallax.y }}
          aria-hidden="true"
        >
          <div className="aurora-blob left-[15%] top-[10%] size-[28rem] bg-teal-500/22 animate-aurora" />
          <div className="aurora-blob bottom-[5%] right-[12%] size-80 bg-coral-500/16 animate-aurora-slow" />
        </motion.div>

        <div
          className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(60%_60%_at_50%_50%,#000,transparent)]"
          aria-hidden="true"
        />

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative max-w-lg"
        >
          <motion.span
            animate={reduced ? undefined : { rotate: [0, 12, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto grid size-16 place-items-center rounded-2xl bg-white/8 text-teal-300 ring-1 ring-white/12"
          >
            <Compass className="size-8" aria-hidden="true" />
          </motion.span>

          <p className="mt-8 font-mono text-sm font-medium uppercase tracking-[0.28em] text-paper-100/45">
            Erreur 404
          </p>
          <h1 className="mt-4 text-balance font-display text-4xl font-semibold leading-tight text-paper-50 sm:text-5xl">
            Cette page n'existe pas <span className="text-gradient">ou plus</span>.
          </h1>
          <p className="mt-5 leading-relaxed text-paper-100/65">
            Vérifiez l'adresse saisie, ou repartez depuis l'accueil pour trouver un prestataire de confiance.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button to="/" size="lg" withArrow magnetic>
              Retour à l'accueil
            </Button>
            <Button to="/trouver-un-prestataire" variant="glass" size="lg" magnetic>
              Trouver un prestataire
            </Button>
          </div>
        </motion.div>
      </section>
    </>
  );
}
