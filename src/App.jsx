import { Suspense, lazy } from "react";
import { Routes, Route, useLocation, useParams, Navigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import SkipLink from "./components/layout/SkipLink";
import ScrollToTop from "./components/layout/ScrollToTop";
import PageTransition from "./components/layout/PageTransition";
import Cursor from "./components/layout/Cursor";
import BackToTop from "./components/layout/BackToTop";
import MobileCallBar from "./components/layout/MobileCallBar";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const Home = lazy(() => import("./pages/Home.jsx"));
const Solutions = lazy(() => import("./pages/Solutions.jsx"));
const SolutionDetail = lazy(() => import("./pages/SolutionDetail.jsx"));
const FindProvider = lazy(() => import("./pages/FindProvider.jsx"));
const ProviderProfile = lazy(() => import("./pages/ProviderProfile.jsx"));
const BecomeProvider = lazy(() => import("./pages/BecomeProvider.jsx"));
const ApplicationForm = lazy(() => import("./pages/ApplicationForm.jsx"));
const SaaTrust = lazy(() => import("./pages/SaaTrust.jsx"));
const Verifier = lazy(() => import("./pages/Verifier.jsx"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage.jsx"));
const Entreprises = lazy(() => import("./pages/Entreprises.jsx"));
const QuoteRequest = lazy(() => import("./pages/QuoteRequest.jsx"));
const Diaspora = lazy(() => import("./pages/Diaspora.jsx"));
const Tarifs = lazy(() => import("./pages/Tarifs.jsx"));
const Garanties = lazy(() => import("./pages/Garanties.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const HelpCenter = lazy(() => import("./pages/HelpCenter.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Connexion = lazy(() => import("./pages/Connexion.jsx"));
const LegalPage = lazy(() => import("./pages/legal/LegalPage.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const ClientDashboard = lazy(() => import("./pages/espace/ClientDashboard.jsx"));
const ProviderDashboard = lazy(() => import("./pages/espace/ProviderDashboard.jsx"));
const ProviderApplication = lazy(() => import("./pages/espace/ProviderApplication.jsx"));
const Profile = lazy(() => import("./pages/espace/Profile.jsx"));

/** Pages publiques et adresses définitives du cahier des charges §2. */
const PUBLIC_ROUTES = [
  ["/", Home],
  ["/solutions", Solutions],
  ["/solutions/:slug", SolutionDetail],
  ["/prestataires", FindProvider],
  ["/prestataires/:reference", ProviderProfile],
  ["/devenir-prestataire", BecomeProvider],
  ["/devenir-prestataire/postuler", ApplicationForm],
  ["/saatrust", SaaTrust],
  ["/verifier", Verifier],
  ["/comment-ca-marche", HowItWorksPage],
  ["/entreprises", Entreprises],
  ["/entreprises/devis", QuoteRequest],
  ["/diaspora", Diaspora],
  ["/tarifs", Tarifs],
  ["/garanties", Garanties],
  ["/a-propos", About],
  ["/aide", HelpCenter],
  ["/contact", Contact],
  ["/connexion", Connexion],
];

const LEGAL_SLUGS = ["mentions-legales", "cgu", "confidentialite"];

/** Anciennes adresses : redirection permanente côté client vers les adresses définitives. */
const LEGACY_DOMAIN_SLUGS = { "home-service": "home" };

function LegacySearchRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/prestataires${search.replace("domaine=", "service=").replace("service=home-service", "service=home")}`} replace />;
}

function LegacyDomainRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/solutions/${LEGACY_DOMAIN_SLUGS[slug] ?? slug}`} replace />;
}

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Chargement de la page…</span>
      <div className="size-9 animate-spin rounded-full border-2 border-teal-600/25 border-t-teal-600" aria-hidden="true" />
    </div>
  );
}

function PublicPage({ children }) {
  return <PageTransition>{children}</PageTransition>;
}

export default function App() {
  const location = useLocation();
  const isEspace = location.pathname.startsWith("/espace");

  return (
    <div className="flex min-h-screen flex-col bg-paper-100">
      <SkipLink />
      <Cursor />
      {!isEspace && <Navbar />}
      {!isEspace && <BackToTop />}
      <ScrollToTop />

      {isEspace ? (
        <div id="main-content" className="flex-1">
          <Suspense fallback={<RouteFallback />}>
            <Routes location={location}>
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="/espace-client"
                  element={
                    <ProtectedRoute roles={["CLIENT", "ADMIN"]}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/espace-prestataire"
                  element={
                    <ProtectedRoute roles={["PROVIDER", "ADMIN"]}>
                      <ProviderDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/espace-prestataire/candidature"
                  element={
                    <ProtectedRoute roles={["PROVIDER", "ADMIN"]}>
                      <ProviderApplication />
                    </ProtectedRoute>
                  }
                />
                <Route path="/espace/profil" element={<Profile />} />
              </Route>
              <Route path="/espace" element={<Navigate to="/espace-client" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      ) : (
        <main id="main-content" className="flex-1 pb-16 pt-20 xl:pb-0">
          <Suspense fallback={<RouteFallback />}>
            <AnimatePresence mode="wait" initial={false}>
              <Routes location={location} key={location.pathname}>
                {PUBLIC_ROUTES.map(([path, Page]) => (
                  <Route key={path} path={path} element={<PublicPage><Page /></PublicPage>} />
                ))}
                {LEGAL_SLUGS.map((slug) => (
                  <Route key={slug} path={`/${slug}`} element={<PublicPage><LegalPage slug={slug} /></PublicPage>} />
                ))}

                <Route path="/trouver-un-prestataire" element={<LegacySearchRedirect />} />
                <Route path="/domaines/:slug" element={<LegacyDomainRedirect />} />
                <Route path="/faq" element={<Navigate to="/aide" replace />} />
                <Route path="/cgv" element={<Navigate to="/cgu" replace />} />

                <Route path="*" element={<PublicPage><NotFound /></PublicPage>} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
      )}

      {!isEspace && <Footer />}
      {!isEspace && <MobileCallBar />}
    </div>
  );
}
