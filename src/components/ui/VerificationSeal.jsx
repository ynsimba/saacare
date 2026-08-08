import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useIsReducedMotion } from "../../lib/motion";

/**
 * Élément signature de la marque : un sceau de vérification animé.
 * Rappelle le motif central de SaaCare — des professionnels contrôlés et certifiés —
 * sous la forme d'un tampon officiel, avec anneau tournant et coche tracée au chargement.
 */
export default function VerificationSeal({ size = 220, label = "SAACARE · PRESTATAIRE VÉRIFIÉ ·" }) {
  const reduced = useIsReducedMotion();
  const r = size / 2;
  const textPathId = "seal-text-path";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      {/* Anneau de pulsation */}
      {!reduced && (
        <span className="absolute inset-0 rounded-full bg-teal-500/25 animate-pulse-ring" />
      )}

      <motion.svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="relative"
        animate={reduced ? {} : { rotate: 360 }}
        transition={reduced ? {} : { duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <path id={textPathId} d={`M ${r},${r} m -${r - 10},0 a ${r - 10},${r - 10} 0 1,1 ${(r - 10) * 2},0 a ${r - 10},${r - 10} 0 1,1 -${(r - 10) * 2},0`} />
        </defs>
        <circle cx={r} cy={r} r={r - 3} fill="none" stroke="#c93268" strokeWidth="1.5" strokeDasharray="3 5" />
        <text fill="#8c1743" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" letterSpacing="2.5">
          <textPath href={`#${textPathId}`} startOffset="0%">
            {label.repeat(2)}
          </textPath>
        </text>
      </motion.svg>

      {/* Disque central fixe (ne tourne pas avec l'anneau) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex items-center justify-center rounded-full bg-teal-600 shadow-lifted"
          style={{ width: size * 0.62, height: size * 0.62 }}
        >
          <motion.svg
            viewBox="0 0 44 44"
            width={size * 0.3}
            height={size * 0.3}
            fill="none"
          >
            <motion.path
              d="M11 23 L19 31 L33 13"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
            />
          </motion.svg>
        </div>
      </div>
    </div>
  );
}
