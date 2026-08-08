import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Toutes les pages de la plateforme démarrent par un en-tête sombre (Hero ou
 * PageHero) : le thème par défaut est donc « dark ». Les routes listées ici font
 * exception et gardent une barre claire. Évalué dès le premier rendu, sans
 * clignotement au chargement.
 */
const LIGHT_HEADER_ROUTES = new Set([]);

export function routeNavTheme(pathname) {
  // Profils prestataires : en-tête blanc → barre claire + logo couleur (`logo.png`).
  if (pathname.startsWith("/prestataires/")) return "light";
  return LIGHT_HEADER_ROUTES.has(pathname) ? "light" : "dark";
}

/**
 * Indique au Navbar si le haut de la page est sombre : il passe alors en texte
 * clair tant que l'utilisateur n'a pas défilé, puis reprend son verre dépoli clair.
 */
const NavThemeContext = createContext({ theme: "light", setOverride: () => {} });

export function NavThemeProvider({ children }) {
  const { pathname } = useLocation();
  const [override, setOverride] = useState(null);
  const lastPath = useRef(pathname);

  // Une navigation annule toute déclaration de la page précédente. Le garde-fou
  // évite d'écraser la déclaration d'un enfant au premier montage : en React,
  // les effets des enfants s'exécutent avant ceux du parent.
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    setOverride(null);
  }, [pathname]);

  const theme = override ?? routeNavTheme(pathname);
  const value = useMemo(() => ({ theme, setOverride }), [theme]);

  return <NavThemeContext.Provider value={value}>{children}</NavThemeContext.Provider>;
}

export function useNavTheme() {
  return useContext(NavThemeContext).theme;
}

/** Permet à une section de forcer le thème du Navbar ; réinitialisé au démontage. */
export function useDeclareNavTheme(theme) {
  const { setOverride } = useContext(NavThemeContext);
  useEffect(() => {
    setOverride(theme);
    return () => setOverride(null);
  }, [setOverride, theme]);
}
