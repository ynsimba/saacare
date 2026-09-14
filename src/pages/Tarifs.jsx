import { Navigate } from "react-router-dom";

/** Les tarifs ne sont plus publiés : redirection vers le contact pour un devis. */
export default function Tarifs() {
  return <Navigate to="/contact" replace />;
}
