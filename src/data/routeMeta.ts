/**
 * Per-route document metadata. Dependency-free: consumed by RouteMeta.tsx to set
 * document.title, <meta name="description">, and <link rel="canonical"> on route
 * change, and by ScrollAndFocusManager.tsx to announce the new page title.
 *
 * Titles are honest and plain (no marketing puff, no arrows). Every route is a
 * synthetic Customer Experience portfolio artifact by Nathan J. Song. More routes
 * arrive in Wave 2; keep this map in sync as pages land.
 */

export interface RouteMetaEntry {
  title: string;
  description: string;
}

/** Used for any pathname not explicitly listed below. */
export const DEFAULT_ROUTE_META: RouteMetaEntry = {
  title: "FireFlow Product Intelligence",
  description:
    "An independent, interactive Customer Experience portfolio by Nathan J. Song.",
};

export const ROUTE_META: Record<string, RouteMetaEntry> = {
  "/": {
    title: "FireFlow Product Intelligence",
    description:
      "An independent, interactive Customer Experience portfolio by Nathan J. Song. Browse the U.S. product portfolio, compare formats, and preview the operations case board.",
  },
  "/ops": {
    title: "Ops Dashboard · FireFlow",
    description:
      "A Customer Experience case board. Drag cases across the lifecycle and filter by priority and owner.",
  },
};

/** Resolve the metadata for a pathname, falling back to the default entry. */
export function routeMetaFor(pathname: string): RouteMetaEntry {
  return ROUTE_META[pathname] ?? DEFAULT_ROUTE_META;
}
