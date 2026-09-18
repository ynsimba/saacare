/**
 * Enveloppe de section. Les bascules 3D au scroll ont été retirées : trop
 * denses enchaînées sur l'accueil. Le composant conserve son API pour ne pas
 * casser les pages existantes.
 */
export default function Section3D({
  children,
  className = "",
  // Conservés pour compatibilité d'appel — volontairement ignorés.
  variant: _variant,
  intensity: _intensity,
  perspective: _perspective,
  clip: _clip,
}) {
  return <div className={className}>{children}</div>;
}
