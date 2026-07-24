import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { routeMetaFor } from "@/data/routeMeta";

/**
 * Restores the scroll, hash, and focus behavior that BrowserRouter suppresses.
 * Renders only a visually-hidden aria-live region that announces the new page
 * title on pathname change; all real work happens in an effect.
 *
 * - location.hash present: scroll the target into view. CSS scroll-margin-top
 *   already accounts for the sticky header, so we compute no offsets. If the
 *   target is not in the DOM yet (a lazy chunk may not have committed), retry
 *   once inside requestAnimationFrame.
 * - No hash: scroll to top on PUSH; leave POP (back/forward) to the browser's
 *   native scroll restoration.
 * - On pathname change, move focus to #main so keyboard and screen-reader users
 *   are not stranded at the old focus. A same-page hash change does NOT steal
 *   focus, so a user mid-interaction keeps their place.
 */

const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  border: 0,
};

function focusMain() {
  const main = document.getElementById("main");
  if (!main) return;
  if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
  main.focus({ preventScroll: true });
}

export function ScrollAndFocusManager() {
  const { pathname, hash, key } = useLocation();
  const navType = useNavigationType();
  const prefersReducedMotion = useReducedMotion();
  const [announcement, setAnnouncement] = useState("");
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";
    const pathnameChanged = prevPathname.current !== pathname;
    let raf = 0;

    if (hash) {
      const id = hash.slice(1);
      const scrollToTarget = (retry: boolean) => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior });
        } else if (retry) {
          raf = requestAnimationFrame(() => scrollToTarget(false));
        }
      };
      scrollToTarget(true);
    } else if (navType !== "POP") {
      // PUSH or REPLACE: land at the top. POP restores natively.
      window.scrollTo({ top: 0, left: 0 });
    }

    // Focus and announce only when the pathname actually changed, so an in-page
    // hash jump never yanks focus away from a mid-interaction user.
    if (pathnameChanged) {
      focusMain();
      setAnnouncement(routeMetaFor(pathname).title);
    }

    prevPathname.current = pathname;

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
    // key is included so repeated navigations to the same location re-run.
  }, [pathname, hash, key, navType, prefersReducedMotion]);

  return (
    <div aria-live="polite" aria-atomic="true" style={srOnly}>
      {announcement}
    </div>
  );
}
