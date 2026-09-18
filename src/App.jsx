import { Suspense, lazy } from "react";
import { Routes, Route, useLocation, useParams, Navigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import SkipLink from "./components/layout/SkipLink";
import ScrollToTop from "./components/layout/ScrollToTop";
import PageTransition from "./components/layout/PageTransition";
import BackToTop from "./components/layout/BackToTop";
import MobileCallBar from "./components/layout/MobileCallBar";
import SupportCTA from "./components/layout/SupportCTA";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const Home = lazy(() => import("./pages/Home.jsx"));
const Solutions = lazy(() => import("./pages/Solutions.jsx"));
const SolutionDetail = lazy(() => import("./pages/SolutionDetail.jsx"));
const FindProvider = lazy(() => import("./pages/FindProvider.jsx"));
const ProviderProfile = lazy(() => import("./pages/ProviderProfile.jsx"));
const BecomeProvider = lazy(() => import("./pages/BecomeProvider.jsx"));
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
const RegisterChooser = lazy(() => import("./pages/RegisterChooser.jsx"));
const RegisterClient = lazy(() => import("./pages/RegisterClient.jsx"));
const RegisterProvider = lazy(() => import("./pages/RegisterProvider.jsx"));
const LegalPage = lazy(() => import("./pages/legal/LegalPage.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const ClientDashboard = lazy(() => import("./pages/client/Dashboard.jsx"));
const ClientProfile = lazy(() => import("./pages/client/Profile.jsx"));
const ClientServices = lazy(() => import("./pages/client/Services.jsx"));
const ClientOrders = lazy(() => import("./pages/client/Orders.jsx"));
const ClientProviders = lazy(() => import("./pages/client/Providers.jsx"));
const ClientPayments = lazy(() => import("./pages/client/Payments.jsx"));
const ClientMessages = lazy(() => import("./pages/client/Messages.jsx"));
const ClientNotifications = lazy(() => import("./pages/client/Notifications.jsx"));
const ClientOrderTracking = lazy(() => import("./pages/client/OrderTracking.jsx"));
const ClientReservations = lazy(() => import("./pages/client/Reservations.jsx"));
const ClientFavorites = lazy(() => import("./pages/client/Favorites.jsx"));
const PrestataireDashboard = lazy(() => import("./pages/prestataire/Dashboard.jsx"));
const PrestataireProfile = lazy(() => import("./pages/prestataire/Profile.jsx"));
const PrestataireMissions = lazy(() => import("./pages/prestataire/Missions.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard.jsx"));
const AdminProviders = lazy(() => import("./pages/admin/Providers.jsx"));
const AdminProviderDetail = lazy(() => import("./pages/admin/ProviderDetail.jsx"));
const AdminValidation = lazy(() => import("./pages/admin/Validation.jsx"));
const AdminMissions = lazy(() => import("./pages/admin/Missions.jsx"));
const AdminMissionDetail = lazy(() => import("./pages/admin/MissionDetail.jsx"));
const AdminClients = lazy(() => import("./pages/admin/Clients.jsx"));
const AdminClientDetail = lazy(() => import("./pages/admin/ClientDetail.jsx"));
const AdminOrders = lazy(() => import("./pages/admin/Orders.jsx"));
const AdminOrderDetail = lazy(() => import("./pages/admin/OrderDetail.jsx"));
const AdminPayments = lazy(() => import("./pages/admin/Payments.jsx"));
const AdminTariffs = lazy(() => import("./pages/admin/Tariffs.jsx"));
const AdminSettings = lazy(() => import("./pages/admin/Settings.jsx"));
const AdminReports = lazy(() => import("./pages/admin/Reports.jsx"));
const AdminUsers = lazy(() => import("./pages/admin/Users.jsx"));
const AdminLoginJournal = lazy(() => import("./pages/admin/LoginJournal.jsx"));
const AdminAccounting = lazy(() => import("./pages/admin/Accounting.jsx"));
const AdminStatistics = lazy(() => import("./pages/admin/Statistics.jsx"));
const AdminData = lazy(() => import("./pages/admin/Data.jsx"));

const PUBLIC_ROUTES = [
  ["/", Home],
  ["/solutions", Solutions],
  ["/solutions/:slug", SolutionDetail],
  ["/prestataires", FindProvider],
  ["/prestataires/:reference", ProviderProfile],
  ["/devenir-prestataire", BecomeProvider],
  ["/inscription", RegisterChooser],
  ["/inscription/client", RegisterClient],
  ["/inscription/prestataire", RegisterProvider],
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
  ["/login", Connexion],
];

const LEGAL_SLUGS = ["mentions-legales", "cgu", "confidentialite"];
const LEGACY_DOMAIN_SLUGS = { "home-service": "home", walet: "wale" };

function LegacySearchRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/prestataires${search.replace("domaine=", "service=").replace("service=home-service", "service=home").replace("service=walet", "service=wale")}`} replace />;
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

/**
 * Espaces connectés uniquement : on compare segment par segment, sinon
 * « /prestataires » (la recherche publique) serait avalé par « /prestataire ».
 */
const APP_SPACE_ROOTS = ["client", "prestataire", "admin", "espace", "espace-client", "espace-prestataire"];

function isAppSpace(pathname) {
  const [root] = pathname.replace(/^\//, "").split("/");
  return APP_SPACE_ROOTS.includes(root);
}

export default function App() {
  const location = useLocation();
  const inSpace = isAppSpace(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-paper-100">
      <SkipLink />
      {!inSpace && <Navbar />}
      {!inSpace && <BackToTop />}
      {!inSpace && <SupportCTA />}
      <ScrollToTop />

      {inSpace ? (
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
                  path="/client/dashboard"
                  element={
                    <ProtectedRoute roles={["client"]}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/profil"
                  element={
                    <ProtectedRoute roles={["client"]}>
                      <ClientProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/reservations"
                  element={
                    <ProtectedRoute roles={["client"]}>
                      <ClientReservations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/favoris"
                  element={
                    <ProtectedRoute roles={["client"]}>
                      <ClientFavorites />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/services"
                  element={
                    <ProtectedRoute roles={["client"]}>
                      <ClientServices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/commandes"
                  element={
                    <ProtectedRoute roles={["client"]}>
                      <ClientOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/commandes/:id/suivi"
                  element={
                    <ProtectedRoute roles={["client"]}>
                      <ClientOrderTracking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/prestataires"
                  element={
                    <ProtectedRoute roles={["client"]}>
                      <ClientProviders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/paiements"
                  element={
                    <ProtectedRoute roles={["client"]}>
                      <ClientPayments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/messages"
                  element={
                    <ProtectedRoute roles={["client"]}>
                      <ClientMessages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/notifications"
                  element={
                    <ProtectedRoute roles={["client"]}>
                      <ClientNotifications />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/prestataire/dashboard"
                  element={
                    <ProtectedRoute roles={["prestataire"]}>
                      <PrestataireDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/prestataire/profil"
                  element={
                    <ProtectedRoute roles={["prestataire"]}>
                      <PrestataireProfile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/prestataire/missions"
                  element={
                    <ProtectedRoute roles={["prestataire"]}>
                      <PrestataireMissions />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/prestataires/validation"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminValidation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/prestataires/:id"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminProviderDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/prestataires"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminProviders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/missions/:id"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminMissionDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/missions"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminMissions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/clients/:id"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminClientDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/clients"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminClients />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/commandes/:id"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminOrderDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/commandes"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/paiements"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminPayments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tarifs"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminTariffs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/parametres"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/rapports"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/utilisateurs"
                  element={
                    <ProtectedRoute roles={["admin"]} superAdmin>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/journal-connexions"
                  element={
                    <ProtectedRoute roles={["admin"]} superAdmin>
                      <AdminLoginJournal />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/comptabilite"
                  element={
                    <ProtectedRoute roles={["admin"]} superAdmin>
                      <AdminAccounting />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/statistiques"
                  element={
                    <ProtectedRoute roles={["admin"]} superAdmin>
                      <AdminStatistics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/donnees"
                  element={
                    <ProtectedRoute roles={["admin"]} superAdmin>
                      <AdminData />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="/client" element={<Navigate to="/client/dashboard" replace />} />
              <Route path="/prestataire" element={<Navigate to="/prestataire/dashboard" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/espace-client" element={<Navigate to="/client/dashboard" replace />} />
              <Route path="/espace-prestataire" element={<Navigate to="/prestataire/dashboard" replace />} />
              <Route path="/espace/profil" element={<Navigate to="/client/profil" replace />} />
              <Route path="/espace" element={<Navigate to="/client/dashboard" replace />} />
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

                <Route path="/connexion" element={<Navigate to="/login" replace />} />
                <Route path="/devenir-prestataire/postuler" element={<Navigate to="/inscription/prestataire" replace />} />
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

      {!inSpace && <Footer />}
      {!inSpace && <MobileCallBar />}
    </div>
  );
}
