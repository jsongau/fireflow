import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { sectionsForRoute } from "@/data/nav";
import { usePageSections } from "@/hooks/usePageSections";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./MiniNav.module.css";

/**
 * A vertical "where am I" progress rail for long routes. It mirrors the left
 * CompareRail on the right gutter so the two fixed trays never collide, and it
 * is hidden below 900px so mobile keeps only the SupportBar FAB floating.
 *
 * It renders nothing for short routes (fewer than three sections), so it appears
 * only on /intelligence, /about, /leadership, and /products.
 *
 * Resting state is a narrow spine (--spine-w) that fits inside the gutter the
 * page shell reserves, so it can never cover content the way the old 220px
 * always-open panel did over the Order summary. It widens into the labeled panel
 * on hover, on keyboard focus, or when pinned. The width change is pure CSS; the
 * only state React holds is the pin, because that is the only part worth
 * persisting.
 *
 * Progress reuses the SupportBar step-rail data-state pattern and never signals
 * by color alone. Each state carries a distinct shape or glyph:
 *   - upcoming: a hollow ring and a muted label.
 *   - current:  a diamond glyph inside the ring, a bold label, aria-current.
 *   - done:     a check glyph in a filled marker. The check is the cue.
 * A text readout ("Section 3 of 5") makes progress legible without decoding any
 * marker, and a thin connector fills up to the current step.
 */

const STORAGE_KEY = "fireflow:mininav";

/**
 * Read the persisted pin preference. Private mode must not throw.
 *
 * The key previously stored "collapsed" | "open" for a rail that was open by
 * default. A visitor who had explicitly opened it wanted it visible, so "open"
 * migrates to pinned; everything else falls back to the new spine default.
 */
function readPinned(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "pinned" || v === "open";
  } catch {
    return false;
  }
}

/** Persist the pin preference, swallowing storage errors. */
function writePinned(pinned: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, pinned ? "pinned" : "auto");
  } catch {
    /* storage unavailable (private mode, blocked) — preference is session-only */
  }
}

export function MiniNav() {
  const { pathname } = useLocation();
  const sections = sectionsForRoute(pathname);
  const { activeIndex } = usePageSections(sections);
  const reduced = useReducedMotion();
  const [pinned, setPinned] = useState(readPinned);

  // The rail renders on this route only when it has three or more sections.
  const railShown = sections.length >= 3;

  /* A pinned rail is layout, not a transient overlay: publish the pin to the
     root element so tokens.css can widen --gutter-reserve and the content
     column (the catalog toolbar's Filters button included) moves clear of the
     open panel. Hover expansion stays an overlay and reserves nothing. */
  useEffect(() => {
    const root = document.documentElement;
    if (railShown && pinned) root.setAttribute("data-mininav-pinned", "true");
    else root.removeAttribute("data-mininav-pinned");
    return () => root.removeAttribute("data-mininav-pinned");
  }, [railShown, pinned]);

  // Only long routes earn the rail; short ones would be noise.
  if (!railShown) return null;

  // Before the first scroll hit the first section reads as current, so the rail
  // always shows exactly one current step and the readout always resolves.
  const current = activeIndex < 0 ? 0 : activeIndex;
  const total = sections.length;

  function togglePin() {
    setPinned((v) => {
      const next = !v;
      writePinned(next);
      return next;
    });
  }

  function goTo(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    try {
      history.replaceState(null, "", `#${id}`);
    } catch {
      /* replaceState can throw in sandboxed frames; scrolling still works */
    }
    const el = document.getElementById(id);
    // scroll-margin-top on each section handles the sticky offset, so no math.
    el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  return (
    <nav
      className={pinned ? `${styles.rail} ${styles.railPinned}` : styles.rail}
      aria-label="Section progress"
    >
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={pinned}
        aria-label={pinned ? "Unpin the contents rail" : "Keep the contents rail open"}
        onClick={togglePin}
      >
        {/* The collapsed spine's only readable cue. The full readout below carries
            the same fact for assistive technology, so this is decorative. */}
        <span className={styles.toggleCount} aria-hidden="true">
          {current + 1}/{total}
        </span>
        <span className={styles.toggleLabel} aria-hidden="true">
          {pinned ? "Unpin contents" : "Contents"}
        </span>
      </button>

      <div className={styles.body}>
        <p className={styles.srOnly}>
          Section {current + 1} of {total}
        </p>

        <ol className={styles.list}>
          {sections.map((s, i) => {
            const state = i < current ? "done" : i === current ? "current" : "upcoming";
            const glyph = state === "done" ? "✓" : state === "current" ? "◆" : "";
            return (
              <li key={s.id} className={styles.item} data-state={state}>
                <a
                  className={styles.link}
                  href={`#${s.id}`}
                  aria-current={state === "current" ? "true" : undefined}
                  onClick={(e) => goTo(e, s.id)}
                >
                  <span className={styles.markerCol} aria-hidden="true">
                    <span className={styles.marker}>{glyph}</span>
                  </span>
                  <span className={styles.label}>{s.label}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
