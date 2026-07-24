import { useEffect, useRef, useState } from "react";

/**
 * useAwaken — fires once, the first time an element scrolls into view.
 *
 * Twenty-six section notes share ONE IntersectionObserver. Creating an observer
 * per note would put twenty-six callbacks on the scroll path for an effect that
 * runs exactly once per element, so the observer is module-scoped and each target
 * unobserves itself the moment it awakens.
 *
 * `enabled: false` (reduced motion) short-circuits to awake, so nothing is ever
 * left invisible waiting on an observer that will not run.
 */

let observer: IntersectionObserver | null = null;
const wake = new Map<Element, () => void>();

function shared(): IntersectionObserver {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        wake.get(entry.target)?.();
        observer?.unobserve(entry.target);
        wake.delete(entry.target);
      }
    },
    // Wait until the note is meaningfully on screen, not clipping the bottom edge.
    { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
  );
  return observer;
}

export function useAwaken<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T | null>(null);
  const [awake, setAwake] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setAwake(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    // No observer (older browser, SSR-ish environments): show it, do not hide it.
    if (typeof IntersectionObserver === "undefined") {
      setAwake(true);
      return;
    }

    const obs = shared();
    wake.set(el, () => setAwake(true));
    obs.observe(el);

    return () => {
      obs.unobserve(el);
      wake.delete(el);
    };
  }, [enabled]);

  return { ref, awake };
}
