import { Link, useLocation } from "react-router-dom";
import { routeFor, sectionsForRoute } from "@/data/nav";
import { usePageSections } from "@/hooks/usePageSections";
import styles from "./Breadcrumb.module.css";

/**
 * Dynamic location trail. Replaces the old hardcoded
 * "FireFlow / Product Intelligence / U.S. Portfolio" string that lived inline in
 * App.tsx. It reads the active route and, via the shared scroll-spy, the section
 * currently under the reader, so the last crumb tracks where you actually are.
 *
 * Shape: FireFlow / {Route label} / {Active section label}. On "/" before any
 * section is active it shows "FireFlow / Home"; on an unknown route it shows just
 * "FireFlow". The last crumb is plain text with aria-current="page"; earlier
 * crumbs are links.
 *
 * The separator is a hand-tuned monochrome SVG chili (Option A from the nav
 * spec), drawn in currentColor at reduced opacity and marked aria-hidden, so it
 * reads as a brand detail to sighted users while a screen reader announces only
 * "FireFlow, Intelligence, Order-to-Cash". Because it is monochrome and
 * opacity-based it encodes nothing by color, which keeps the trail colorblind
 * safe. There is deliberately no heat meter and no per-section color coder here.
 */

/** A single pepper glyph used purely as the crumb separator. Never announced. */
function PepperSeparator() {
  return (
    <svg
      className={styles.pepper}
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {/* Stem: a short curved stalk leaning off the shoulder of the body. */}
      <path
        d="M13 4c1.7-.4 3 .5 3.1 2.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Body: a solid curved chili tapering to a point at lower left. */}
      <path d="M12.6 6c4.4 1 6 6 3.5 10.5C14 20 10.4 21.6 7.8 21c0 0 4-1.9 5.6-6.4C14.6 11 13.8 8 12.6 6Z" />
    </svg>
  );
}

/** Five fixed obangsaek squares. Purely decorative brand mark, never a state. */
const OBANGSAEK = [
  "var(--op-accent)",
  "var(--accent)",
  "var(--gold)",
  "var(--text-0)",
  "var(--surface-0)",
] as const;

interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumb() {
  const { pathname } = useLocation();
  const route = routeFor(pathname);
  const sections = sectionsForRoute(pathname);
  const { activeId } = usePageSections(sections);

  const items: Crumb[] = [{ label: "FireFlow", to: "/" }];
  if (route) {
    items.push({ label: route.label, to: route.path });
    const active = route.sections.find((s) => s.id === activeId);
    if (active) {
      items.push({ label: active.label, to: `${route.path}#${active.id}` });
    }
  }

  return (
    <nav className={styles.trail} aria-label="Breadcrumb">
      {/* Decorative obangsaek tick. All five colors, always shown, encodes
          nothing, hidden from assistive tech. Not a per-section color coder. */}
      <span className={styles.tick} aria-hidden="true">
        {OBANGSAEK.map((c, i) => (
          <span key={i} className={styles.tickSq} style={{ background: c }} />
        ))}
      </span>

      <ol className={styles.list}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className={styles.item}>
              {i > 0 && <PepperSeparator />}
              {isLast || !item.to ? (
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link className={styles.link} to={item.to}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
