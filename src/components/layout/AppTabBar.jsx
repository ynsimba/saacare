import { useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { haptic, springs, useIsReducedMotion } from "../../lib/motion";

export function isTabActive(pathname, { to, end, match }) {
  if (match) return match(pathname);
  if (!to) return false;
  if (end || to === "/") return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

/**
 * Barre d'onglets flottante façon application native (mobile et tablette).
 * - pastille active qui glisse d'un onglet à l'autre (ressort court) ;
 * - se rétracte au défilement vers le bas, réapparaît dès qu'on remonte ;
 * - toucher l'onglet actif ramène en haut de la page, comme sur iOS / Android ;
 * - un onglet `primary` devient un bouton d'action central surélevé.
 */
export default function AppTabBar({ items, label = "Navigation", className = "", hideOnScroll = true }) {
  const { pathname } = useLocation();
  const reduced = useIsReducedMotion();
  const pillId = useId();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    if (!hideOnScroll) return;
    const delta = y - lastY.current;
    if (Math.abs(delta) < 6) return;
    const nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 80;
    setHidden(delta > 0 && y > 140 && !nearBottom);
    lastY.current = y;
  });

  const onTap = (item, active) => (event) => {
    haptic();
    if (item.onClick) {
      event.preventDefault();
      item.onClick();
      return;
    }
    if (active) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }
  };

  return (
    <motion.nav
      aria-label={label}
      initial={reduced ? false : { y: "140%" }}
      animate={{ y: hidden && !reduced ? "140%" : "0%" }}
      transition={springs.gentle}
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] ${className}`}
    >
      <ul className="app-tabbar pointer-events-auto mx-auto flex max-w-md items-end gap-1 rounded-[1.75rem] p-1.5 sm:max-w-lg">
        {items.map((item) => {
          const active = item.active ?? isTabActive(pathname, item);
          const Icon = item.icon;
          const Tag = item.to && !item.onClick ? Link : "button";
          const tagProps = Tag === Link ? { to: item.to } : { type: "button" };

          if (item.primary) {
            return (
              <li key={item.key ?? item.to} className="flex flex-1 justify-center">
                <Tag
                  {...tagProps}
                  onClick={onTap(item, false)}
                  aria-label={item.label}
                  className="tap group -mt-6 flex flex-col items-center gap-1 text-[0.66rem] font-semibold text-teal-700"
                >
                  <span className="grid size-14 place-items-center rounded-[1.15rem] bg-teal-600 text-white shadow-[0_14px_30px_-12px_rgba(1,67,61,0.9)] ring-4 ring-paper-50 transition-colors duration-200 group-active:bg-teal-700">
                    <Icon className="size-6" strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <span aria-hidden="true">{item.short ?? item.label}</span>
                </Tag>
              </li>
            );
          }

          return (
            <li key={item.key ?? item.to} className="relative flex-1">
              <Tag
                {...tagProps}
                onClick={onTap(item, active)}
                aria-current={active && Tag === Link ? "page" : undefined}
                aria-expanded={item.expanded}
                aria-label={item.short && item.short !== item.label ? item.label : undefined}
                className={`tap relative flex h-14 w-full flex-col items-center justify-center gap-1 rounded-[1.3rem] text-[0.66rem] font-semibold transition-colors duration-200 ${
                  active ? "text-teal-700" : "text-ink-900/55"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={`tab-pill-${pillId}`}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-[1.3rem] bg-teal-600/10"
                    transition={springs.snappy}
                  />
                )}
                <motion.span
                  className="relative"
                  initial={false}
                  animate={reduced ? undefined : { y: active ? -1 : 0, scale: active ? 1.08 : 1 }}
                  transition={springs.snappy}
                >
                  <Icon className="size-[1.3rem]" strokeWidth={active ? 2.3 : 1.9} aria-hidden="true" />
                  {item.badge ? (
                    <span className="absolute -right-1.5 -top-1 size-2.5 rounded-full bg-gold-500 ring-2 ring-paper-50" aria-hidden="true" />
                  ) : null}
                </motion.span>
                <span className="relative max-w-full truncate px-1">{item.short ?? item.label}</span>
              </Tag>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
