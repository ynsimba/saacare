import Seo from "../../lib/Seo";
import Profile from "../espace/Profile.jsx";

export default function PrestataireProfile() {
  return (
    <>
      <Seo title="Profil prestataire" path="/prestataire/profil" noindex />
      <Profile />
    </>
  );
}
