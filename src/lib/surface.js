import { createContext, useContext } from "react";

/**
 * Surface sur laquelle un composant est posé. Les en-têtes de page sont désormais
 * clairs : les boutons pensés pour un fond sombre (`onDark`, `glass`) y prennent
 * automatiquement leur équivalent clair, sans toucher à chaque page.
 */
export const SurfaceContext = createContext("default");
export const useSurface = () => useContext(SurfaceContext);
