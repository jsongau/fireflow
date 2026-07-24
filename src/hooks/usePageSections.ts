import { useEffect, useState } from "react";
import type { NavSection } from "@/data/nav";

/**
 * One shared scroll-spy for the whole page.
 *
 * Both the SubNav and the MiniNav need to know which section is currently under
 * the reader. Running an IntersectionObserver in each would double the work and
 * risk the two disagreeing, so this hook owns the single observer and both
 * consumers read its result.
 *
 * The observer's top inset is the live height of the sticky header stack
 * (`--sticky-h`), so a section only counts as active once it clears the sticky
 * nav, rail, and SubNav. The `-55%` bottom inset flips the active section near
 * the upper third of the viewport rather than dead center.
 */

/** Used when `--sticky-h` cannot be read or measured (SSR, jsdom, parse miss). */
const FALLBACK_STICKY_PX = 120;

/**
 * Resolve `--sticky-h` to a pixel number at runtime.
 *
 * `--sticky-h` is a `calc()` of several custom properties, and browsers do not
 * reliably resolve calc() in the computed value of a custom property. We first
 * try to read a plain `NNpx` value; if that fails we let layout evaluate the
 * expression on a throwaway element; if that also fails we fall back to a sane
 * constant so the observer still works.
 */
function readStickyPx(): number {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return FALLBACK_STICKY_PX;
  }

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--sticky-h")
    .trim();
  const direct = /^([\d.]+)px$/.exec(raw);
  if (direct?.[1]) {
    const n = Number.parseFloat(direct[1]);
    if (Number.isFinite(n) && n > 0) return n;
  }

  // The value is an unresolved calc(); measure it via a hidden probe element.
  try {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:absolute;visibility:hidden;pointer-events:none;width:0;height:var(--sticky-h);";
    document.body.appendChild(probe);
    const h = probe.getBoundingClientRect().height;
    probe.remove();
    if (Number.isFinite(h) && h > 0) return h;
  } catch {
    /* no layout engine (e.g. jsdom) — fall through to the constant */
  }

  return FALLBACK_STICKY_PX;
}

export interface PageSectionsState {
  /** id of the section currently under the reader, or null before first hit. */
  activeId: string | null;
  /** index of `activeId` within `sections`, or -1 when nothing is active. */
  activeIndex: number;
}

export function usePageSections(sections: NavSection[]): PageSectionsState {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (sections.length === 0) {
      setActiveId(null);
      return;
    }

    const stickyPx = readStickyPx();
    const rootMargin = `-${Math.round(stickyPx) + 1}px 0px -55% 0px`;

    // Track which section ids are currently crossing the trigger band, then pick
    // the topmost one in document order so the active item is deterministic.
    const inBand = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) inBand.add(id);
          else inBand.delete(id);
        }
        const next = sections.find((s) => inBand.has(s.id));
        if (next) setActiveId(next.id);
      },
      { rootMargin, threshold: 0 },
    );

    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  const activeIndex = activeId ? sections.findIndex((s) => s.id === activeId) : -1;

  return { activeId, activeIndex };
}
