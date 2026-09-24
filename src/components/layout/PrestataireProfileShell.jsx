import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Camera, ChevronDown, LayoutDashboard, Pencil, Bell, Briefcase } from "lucide-react";
import { PRESTATAIRE_NAV, SpaceNav } from "./SpaceNav";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";

const STATUS_LABEL = {
  pending: "En validation",
  approved: "Approuvé",
  rejected: "Refusé",
  suspended: "Suspendu",
};

function mediaKey(userId, kind) {
  return `saacare_prestataire_${kind}_${userId || "guest"}`;
}

function readMedia(userId, kind) {
  try {
    return localStorage.getItem(mediaKey(userId, kind)) || "";
  } catch {
    return "";
  }
}

function writeMedia(userId, kind, value) {
  try {
    if (value) localStorage.setItem(mediaKey(userId, kind), value);
    else localStorage.removeItem(mediaKey(userId, kind));
  } catch {
    /* ignore quota */
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Lecture impossible."));
    reader.readAsDataURL(file);
  });
}

/**
 * Header profil prestataire (couverture + identité + onglets).
 * Même composition que l’espace client.
 */
export default function PrestataireProfileShell() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [coverUrl, setCoverUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [dash, setDash] = useState(null);

  useEffect(() => {
    if (!user) return;
    setCoverUrl(readMedia(user.id, "cover"));
    setAvatarUrl(readMedia(user.id, "avatar"));
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    api
      .prestataireDashboard()
      .then((data) => {
        if (!cancelled) setDash(data);
      })
      .catch(() => {
        if (!cancelled) setDash(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const initials = (user?.fullName || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const status = dash?.providerStatus || user?.providerStatus || "pending";
  const missionsStat = dash?.stats?.find((s) => /mission/i.test(s.label));
  const metier = user?.providerProfile?.metier || dash?.user?.providerProfile?.metier;

  const onPickCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user?.id) return;
    const dataUrl = await fileToDataUrl(file);
    setCoverUrl(dataUrl);
    writeMedia(user.id, "cover", dataUrl);
  };

  const onPickAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user?.id) return;
    const dataUrl = await fileToDataUrl(file);
    setAvatarUrl(dataUrl);
    writeMedia(user.id, "avatar", dataUrl);
  };

  const goEdit = () => {
    navigate("/prestataire/profil#profile-edit");
    if (location.pathname.startsWith("/prestataire/profil")) {
      requestAnimationFrame(() => {
        document.getElementById("profile-edit")?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.dispatchEvent(new Event("saacare:profile-edit"));
      });
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-ink-900/8 bg-white shadow-soft">
      <div className="relative">
        <div
          className="relative h-44 overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-navy-800 sm:h-56 lg:h-64"
          style={
            coverUrl
              ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {!coverUrl && (
            <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
              <div className="absolute -left-10 top-8 size-56 rounded-full bg-teal-400/30 blur-3xl" />
              <div className="absolute right-0 top-0 size-72 rounded-full bg-gold-500/20 blur-3xl" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900/35 to-transparent" aria-hidden="true" />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-3 right-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-ink-900 shadow-soft transition-colors hover:bg-paper-100 sm:bottom-4 sm:right-4"
          >
            <Camera className="size-4 text-teal-700" aria-hidden="true" />
            <span className="hidden sm:inline">Ajouter une photo de couverture</span>
            <span className="sm:hidden">Couverture</span>
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" className="sr-only" onChange={onPickCover} />
        </div>

        <div className="relative px-4 pb-5 pt-0 sm:px-6 sm:pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
              <div className="relative -mt-14 shrink-0 self-start sm:-mt-16">
                <div className="size-28 overflow-hidden rounded-full border-4 border-white bg-teal-600 shadow-lifted sm:size-32">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center font-display text-3xl font-bold text-white" aria-hidden="true">
                      {initials}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-1 right-1 grid size-9 place-items-center rounded-full border-2 border-white bg-paper-200 text-ink-900 shadow-soft transition-colors hover:bg-teal-50 hover:text-teal-700"
                  aria-label="Modifier la photo de profil"
                >
                  <Camera className="size-4" aria-hidden="true" />
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="sr-only" onChange={onPickAvatar} />
              </div>

              <div className="min-w-0 pb-1">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                  {user?.fullName || "Prestataire SaaCare"}
                </h1>
                <p className="mt-1 text-sm text-ink-900/55">
                  {[
                    STATUS_LABEL[status] || null,
                    metier || null,
                    missionsStat != null ? `${missionsStat.value} mission${Number(missionsStat.value) > 1 ? "s" : ""}` : null,
                    user?.commune || null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Espace prestataire SaaCare"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:pb-1">
              <Link
                to="/prestataire/dashboard"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-teal-700"
              >
                <LayoutDashboard className="size-4" aria-hidden="true" />
                Tableau de bord
              </Link>
              <button
                type="button"
                onClick={goEdit}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-paper-200 px-4 py-2 text-sm font-semibold text-ink-900 transition-colors hover:bg-teal-50 hover:text-teal-800"
              >
                <Pencil className="size-4" aria-hidden="true" />
                Modifier
              </button>
              <Link
                to="/prestataire/missions"
                className={`inline-flex size-10 items-center justify-center rounded-lg transition-colors ${
                  location.pathname.startsWith("/prestataire/missions")
                    ? "bg-teal-50 text-teal-700"
                    : "bg-paper-200 text-ink-900 hover:bg-teal-50 hover:text-teal-800"
                }`}
                aria-label="Missions"
              >
                <Briefcase className="size-4" aria-hidden="true" />
              </Link>
              <Link
                to="/prestataire/notifications"
                className={`relative inline-flex size-10 items-center justify-center rounded-lg transition-colors ${
                  location.pathname.startsWith("/prestataire/notifications")
                    ? "bg-teal-50 text-teal-700"
                    : "bg-paper-200 text-ink-900 hover:bg-teal-50 hover:text-teal-800"
                }`}
                aria-label="Notifications"
              >
                <Bell className="size-4" aria-hidden="true" />
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="inline-flex size-10 items-center justify-center rounded-lg bg-paper-200 text-ink-900 transition-colors hover:bg-teal-50 hover:text-teal-800"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="Plus d’options"
                >
                  <ChevronDown className={`size-4 transition-transform ${menuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-ink-900/8 bg-white py-1 shadow-lifted"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full px-3 py-2.5 text-left text-sm text-ink-900 hover:bg-teal-50"
                      onClick={() => {
                        setMenuOpen(false);
                        goEdit();
                      }}
                    >
                      Informations
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full px-3 py-2.5 text-left text-sm text-ink-900 hover:bg-teal-50"
                      onClick={() => {
                        setMenuOpen(false);
                        setCoverUrl("");
                        setAvatarUrl("");
                        writeMedia(user?.id, "cover", "");
                        writeMedia(user?.id, "avatar", "");
                      }}
                    >
                      Retirer les photos
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / tablette : la barre d'onglets basse prend le relais. */}
        <div className="hidden border-t border-ink-900/8 lg:block">
          <SpaceNav links={PRESTATAIRE_NAV} variant="tabs" />
        </div>
      </div>
    </section>
  );
}
