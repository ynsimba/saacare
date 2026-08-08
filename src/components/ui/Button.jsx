import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useMagnetic } from "../../lib/motion";

const VARIANTS = {
  primary:
    "bg-coral-500 text-white shadow-soft hover:bg-coral-600 hover:shadow-[0_18px_45px_-18px_rgba(141,24,69,0.75)] focus-visible:bg-coral-600",
  secondary:
    "bg-navy-700 text-white shadow-soft hover:bg-navy-800 hover:shadow-[0_18px_45px_-18px_rgba(3,41,76,0.8)] focus-visible:bg-navy-800",
  outline:
    "bg-transparent text-navy-700 border border-navy-700/25 hover:border-navy-700/60 hover:bg-navy-700/5",
  ghost: "bg-transparent text-navy-700 hover:bg-navy-700/5",
  onDark: "bg-white text-navy-800 hover:bg-paper-100 hover:shadow-[0_18px_45px_-18px_rgba(255,255,255,0.45)]",
  /* Verre dépoli clair — à poser sur un visuel sombre */
  glass:
    "glass-dark text-white hover:border-white/30 hover:bg-white/12",
  /* Dégradé de marque, pour l'action principale du hero */
  gradient:
    "text-white shadow-[0_20px_50px_-20px_rgba(159,26,74,0.85)] bg-[linear-gradient(110deg,var(--color-teal-600),var(--color-teal-500)_45%,var(--color-coral-500))] bg-[length:220%_auto] hover:bg-[position:100%_center]",
};

const SIZES = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-[0.95rem]",
  lg: "px-7 py-3.5 text-base",
  xl: "px-8 py-4 text-[1.05rem]",
};

const MotionLink = motion.create(Link);

/**
 * Bouton d'appel à l'action unifié. `to` → lien interne, `href` → lien externe,
 * sinon `<button>`. `withArrow` ajoute une flèche animée au survol.
 * `magnetic` active l'attraction du bouton vers le curseur (désactivée au tactile
 * et si prefers-reduced-motion).
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    to,
    href,
    withArrow = false,
    magnetic = false,
    className = "",
    ...props
  },
  ref
) {
  const magnet = useMagnetic(0.28, 90);
  const useMagnet = magnetic && magnet.active;

  const classes = `group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden
    rounded-md font-semibold transition-[background-color,color,box-shadow,border-color,background-position]
    duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-gold-500
    disabled:opacity-50 disabled:pointer-events-none shine
    ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {withArrow && (
        <span className="relative z-10 grid size-4 place-items-center overflow-hidden">
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-5"
          />
          <ArrowRight
            aria-hidden="true"
            className="absolute size-4 -translate-x-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0"
          />
        </span>
      )}
    </>
  );

  const motionProps = {
    whileTap: { scale: 0.96 },
    whileHover: { scale: 1.025 },
    transition: { type: "spring", stiffness: 380, damping: 24 },
    ...(useMagnet
      ? {
          onMouseMove: magnet.onMouseMove,
          onMouseLeave: magnet.onMouseLeave,
          style: magnet.style,
        }
      : {}),
  };

  const setRefs = (node) => {
    if (useMagnet) magnet.ref.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  if (to) {
    return (
      <MotionLink ref={setRefs} to={to} className={classes} {...motionProps} {...props}>
        {content}
      </MotionLink>
    );
  }
  if (href) {
    return (
      <motion.a ref={setRefs} href={href} className={classes} {...motionProps} {...props}>
        {content}
      </motion.a>
    );
  }
  return (
    <motion.button ref={setRefs} className={classes} {...motionProps} {...props}>
      {content}
    </motion.button>
  );
});

export default Button;
