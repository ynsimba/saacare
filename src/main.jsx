import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { MotionConfig } from "motion/react";

// Polices de la charte, auto-hébergées, sous-ensemble latin uniquement :
// Montserrat pour les titres, Poppins pour le texte, l'interface et les données.
import "@fontsource/urbanist/latin-600.css";
import "@fontsource/urbanist/latin-700.css";
import "@fontsource/urbanist/latin-800.css";
import "@fontsource/montserrat/latin-600.css";
import "@fontsource/montserrat/latin-700.css";
import "@fontsource/montserrat/latin-800.css";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";

import App from "./App.jsx";
import { AuthProvider } from "./lib/auth.jsx";
import { NavThemeProvider } from "./lib/navTheme.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <NavThemeProvider>
            {/* Respecte « réduire les animations » du système pour toute animation motion. */}
            <MotionConfig reducedMotion="user">
              <App />
            </MotionConfig>
          </NavThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
