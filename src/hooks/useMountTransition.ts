import { useEffect, useState } from "react";

/**
 * useMountTransition — keeps a node mounted long enough to animate out.
 *
 * `{open && <Panel/>}` cannot animate closed: React removes the node on the same
 * frame the flag flips, so there is nothing left to transition. This holds the
 * node for `exitMs` after close, and flips `entered` one frame after mount so the
 * opening transition has a from-state to leave.
 *
 * Collapsed panels are unmounted rather than hidden, so a screen reader never
 * walks twenty-six closed notes looking for the section's real content.
 */
export function useMountTransition(open: boolean, exitMs: number) {
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Two frames: one to commit the mount, one to leave the from-state.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }

    setEntered(false);
    if (exitMs <= 0) {
      setMounted(false);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), exitMs);
    return () => window.clearTimeout(timer);
  }, [open, exitMs]);

  return { mounted, entered };
}
