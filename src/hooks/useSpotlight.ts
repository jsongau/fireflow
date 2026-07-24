import { useEffect, useRef } from "react";

/**
 * useSpotlight — writes the pointer position into `--mx` / `--my` on an element
 * so CSS can paint a radial highlight under the cursor.
 *
 * The writes are rAF-throttled and go straight to the style attribute, never
 * through React state: `pointermove` fires faster than the display refreshes, and
 * a setState per event would re-render the card dozens of times a second for a
 * purely decorative effect.
 *
 * Only attaches on devices that actually hover. On touch, `pointermove` fires
 * only during a drag, which would leave the highlight stranded wherever the
 * finger last was, with no way to dismiss it. The CSS gates the paint behind the
 * same `(hover: hover)` query; this gates the listener.
 *
 * Purely decorative: nothing here carries state or meaning, so there is nothing
 * to expose to assistive technology and nothing lost when it does not run.
 */
export function useSpotlight<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return ref;
}
