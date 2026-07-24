import { useEffect, useState } from "react";

/**
 * True when the given media query matches. Used to decide whether there is room
 * to show the out-of-drawer operator note panel beside the support drawer.
 * Safe when matchMedia is unavailable (returns false).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
