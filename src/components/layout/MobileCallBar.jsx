import { Link } from "react-router-dom";
import { Phone, MessageCircle, Search } from "lucide-react";
import { PHONE_HREF, WHATSAPP_HREF } from "../../data/site";

/**
 * Barre fixe basse sur mobile : téléphone et WhatsApp toujours à portée de pouce,
 * avec l'appel à l'action principal (cahier des charges §2.1).
 */
export default function MobileCallBar() {
  return (
    <nav
      aria-label="Contact rapide"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-900/10 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgba(16,42,42,0.25)] backdrop-blur-md xl:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-3">
        <li>
          <a href={PHONE_HREF} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium text-ink-900">
            <Phone className="size-5 text-teal-600" aria-hidden="true" />
            Appeler
          </a>
        </li>
        <li>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium text-ink-900"
          >
            <MessageCircle className="size-5 text-teal-600" aria-hidden="true" />
            WhatsApp
          </a>
        </li>
        <li className="p-1.5">
          <Link
            to="/prestataires"
            className="flex h-full min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg bg-teal-600 text-[0.7rem] font-semibold text-white"
          >
            <Search className="size-4.5" aria-hidden="true" />
            Demander
          </Link>
        </li>
      </ul>
    </nav>
  );
}
