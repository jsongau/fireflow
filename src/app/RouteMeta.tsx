import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { routeMetaFor } from "@/data/routeMeta";

/**
 * Dependency-free per-route head management. Renders nothing. On pathname change
 * it sets document.title and updates (or creates) <meta name="description"> and
 * <link rel="canonical">. Client-set head is reliable for Google's renderer but
 * not for social scrapers; a prerender step (see docs/restructure/01) is the
 * follow-on for share previews.
 */
function upsertMeta(name: string): HTMLMetaElement {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  return el;
}

function upsertLink(rel: string): HTMLLinkElement {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  return el;
}

export function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = routeMetaFor(pathname);
    document.title = meta.title;
    upsertMeta("description").setAttribute("content", meta.description);

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    upsertLink("canonical").setAttribute("href", `${origin}${pathname}`);
  }, [pathname]);

  return null;
}
