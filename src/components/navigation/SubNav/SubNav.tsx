import { useRef, type MouseEvent } from "react";
import { useLocation } from "react-router-dom";
import { sectionsForRoute } from "@/data/nav";
import { usePageSections } from "@/hooks/usePageSections";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useStickyHeightVar } from "@/lib/layout/useStickyHeightVar";
import styles from "./SubNav.module.css";

/**
 * Per-page sticky "on this page" bar. Derives its sections from the current
 * route, tracks the active section with the shared scroll-spy, and sticks
 * beneath the MegaNav and SelectedProductRail. Renders nothing on routes with
 * fewer than two sections (a one-item bar has nothing to navigate between).
 */
export function SubNav() {
  const { pathname } = useLocation();
  const sections = sectionsForRoute(pathname);
  const { activeId } = usePageSections(sections);
  const prefersReducedMotion = useReducedMotion();
  const navRef = useRef<HTMLElement | null>(null);

  // Publish our real height so the sticky stack and scroll-padding account for
  // this bar. +1 covers the bottom border, which the border-box height omits.
  /* When this bar renders nothing (a route with fewer than two sections), it must
     clear --subnav-h. Otherwise the height measured on the last route survives on
     :root, and --sticky-h carries a bar that is no longer on screen. */
  const renders = sections.length >= 2;
  useStickyHeightVar(navRef, "--subnav-h", 1, renders);

  if (!renders) return null;

  const onLinkClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    // Update the hash without a history entry or a jump; CSS scroll-margin-top
    // on each section handles the sticky-header offset.
    window.history.replaceState(null, "", `#${id}`);
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <nav className={styles.subnav} aria-label="On this page" ref={navRef}>
      <ul className={styles.list} role="list">
        {sections.map((s) => {
          const isActive = s.id === activeId;
          return (
            <li key={s.id} className={styles.item}>
              <a
                href={`#${s.id}`}
                className={isActive ? `${styles.link} ${styles.linkActive}` : styles.link}
                aria-current={isActive ? "true" : undefined}
                onClick={(e) => onLinkClick(e, s.id)}
              >
                {/* Non-color active cue: a diamond that only the active item
                    shows. Paired with weight and the bottom indicator bar so
                    state never rides on color alone. */}
                <span className={styles.glyph} aria-hidden="true">
                  &#9670;
                </span>
                <span className={styles.label}>{s.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
