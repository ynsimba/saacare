import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function espaceKey(pathname) {
  if (pathname.startsWith("/client")) return "client";
  if (pathname.startsWith("/prestataire")) return "prestataire";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}

/**
 * Remonte en haut sur les changements de page « réels ».
 * Dans un même espace (client / prestataire / admin), les onglets
 * ne doivent pas faire sauter tout le layout.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPath = useRef(pathname);

  useEffect(() => {
    const from = prevPath.current;
    prevPath.current = pathname;

    const fromEspace = espaceKey(from);
    const toEspace = espaceKey(pathname);
    if (fromEspace && fromEspace === toEspace) return;

    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [pathname]);

  return null;
}
