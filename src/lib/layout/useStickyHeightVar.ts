import { useEffect, type RefObject } from "react";

/**
 * Publish a live element height to a CSS custom property on :root.
 *
 * The sticky nav and the selected-product rail stack on top of each other, so
 * the rail's `top` and the page's `scroll-padding` both depend on the nav's
 * real height. That height is not a constant: the nav labels wrap to two lines
 * at narrower widths, and the rail itself wraps when a product is selected.
 * Hardcoding `--nav-h: 64px` made the rail stick too high, so the higher-z nav
 * painted over its top edge on scroll.
 *
 * Measuring at runtime keeps `--nav-h`, `--rail-h`, and the derived
 * `--sticky-h` correct at every breakpoint and zoom level. The token defaults
 * in tokens.css stay as the pre-hydration fallback.
 *
 * @param ref     the element to measure (border-box height)
 * @param cssVar  the custom property to write, e.g. "--nav-h"
 * @param extraPx pixels to add, e.g. a 1px border not included in the box
 * @param enabled false when the caller renders nothing on this route. The bar
 *        unmounts but the hook's deps never change, so without this the last
 *        measured height stays on :root and every sticky offset on the next
 *        route inherits a phantom bar. Passing `false` clears the property.
 */
export function useStickyHeightVar<T extends HTMLElement>(
  ref: RefObject<T | null>,
  cssVar: string,
  extraPx = 0,
  enabled = true,
): void {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!enabled) {
      document.documentElement.style.removeProperty(cssVar);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const root = document.documentElement;

    const apply = () => {
      const h = el.getBoundingClientRect().height;
      if (h <= 0) return; // hidden (e.g. display:none at this breakpoint)
      root.style.setProperty(cssVar, `${Math.ceil(h) + extraPx}px`);
    };

    apply();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(apply);
      ro.observe(el);
    }
    // Fallback for browsers without ResizeObserver, and for font-load reflow.
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      // Hand control back to the tokens.css default rather than leaving a
      // stale inline value behind.
      root.style.removeProperty(cssVar);
    };
  }, [ref, cssVar, extraPx, enabled]);
}
