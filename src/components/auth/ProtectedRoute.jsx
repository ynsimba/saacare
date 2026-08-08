import { Navigate, useLocation } from "react-router-dom";
import { homeForRole, useAuth } from "../../lib/auth";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
        <span className="sr-only">Vérification de la session…</span>
        <div className="size-9 animate-spin rounded-full border-2 border-teal-600/25 border-t-teal-600" aria-hidden="true" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return children;
}
