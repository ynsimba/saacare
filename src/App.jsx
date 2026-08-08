import { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import SkipLink from "./components/layout/SkipLink";
import ScrollToTop from "./components/layout/ScrollToTop";
import PageTransition from "./components/layout/PageTransition";
import Cursor from "./components/layout/Cursor";
import BackToTop from "./components/layout/BackToTop";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const Home = lazy(() => import("./pages/Home.jsx"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage.jsx"));
const DomainDetail = lazy(() => import("./pages/DomainDetail.jsx"));
const FindProvider = lazy(() => import("./pages/FindProvider.jsx"));
const ProviderProfile = lazy(() => import("./pages/ProviderProfile.jsx"));
const BecomeProvider = lazy(() => import("./pages/BecomeProvider.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const FAQPage = lazy(() => import("./pages/FAQPage.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Connexion = lazy(() => import("./pages/Connexion.jsx"));
const LegalPage = lazy(() => import("./pages/legal/LegalPage.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const ClientDashboard = lazy(() => import("./pages/espace/ClientDashboard.jsx"));
const ProviderDashboard = lazy(() => import("./pages/espace/ProviderDashboard.jsx"));
const ProviderApplication = lazy(() => import("./pages/espace/ProviderApplication.jsx"));
const Profile = lazy(() => import("./pages/espace/Profile.jsx"));

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
        <main id="main-content" className="flex-1 pt-20">
          <Suspense fallback={<RouteFallback />}>
            <AnimatePresence mode="wait" initial={false}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PublicPage><Home /></PublicPage>} />
                <Route path="/comment-ca-marche" element={<PublicPage><HowItWorksPage /></PublicPage>} />
                <Route path="/domaines/:slug" element={<PublicPage><DomainDetail /></PublicPage>} />
                <Route path="/trouver-un-prestataire" element={<PublicPage><FindProvider /></PublicPage>} />
                <Route path="/prestataires/:id" element={<PublicPage><ProviderProfile /></PublicPage>} />
                <Route path="/devenir-prestataire" element={<PublicPage><BecomeProvider /></PublicPage>} />
                <Route path="/a-propos" element={<PublicPage><About /></PublicPage>} />
                <Route path="/faq" element={<PublicPage><FAQPage /></PublicPage>} />
                <Route path="/contact" element={<PublicPage><Contact /></PublicPage>} />
                <Route path="/connexion" element={<PublicPage><Connexion /></PublicPage>} />
                {["mentions-legales", "cgu", "cgv", "confidentialite"].map((slug) => (
                  <Route
                    key={slug}
                    path={`/${slug}`}
                    element={
                      <PublicPage>
                        <LegalPage slug={slug} />
                      </PublicPage>
                    }
                  />
                ))}
                <Route path="*" element={<PublicPage><NotFound /></PublicPage>} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
      )}

      {!isEspace && <Footer />}
    </div>
  );
}
