import { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { HomeStateProvider } from "@/state/homeStore";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RouteMeta } from "@/app/RouteMeta";
import { ScrollAndFocusManager } from "@/app/ScrollAndFocusManager";
import { SiteFooter } from "@/app/SiteFooter";
import { MegaNav } from "@/components/navigation/MegaNav/MegaNav";
import { SubNav } from "@/components/navigation/SubNav/SubNav";
import { Breadcrumb } from "@/components/navigation/Breadcrumb/Breadcrumb";
import { MiniNav } from "@/components/navigation/MiniNav/MiniNav";
import { SelectedProductRail } from "@/components/home/SelectedProductRail/SelectedProductRail";
import { SupportBar } from "@/components/home/SupportBar/SupportBar";
import { CompareRail } from "@/components/home/CompareRail/CompareRail";
import { OrderTour } from "@/components/tour/OrderTour";
import { NotesProvider } from "@/components/employer/SectionNote/NotesProvider";
import { NathanFloater } from "@/components/employer/NathanFloater/NathanFloater";
import { installGlobalClickSound } from "@/lib/sound/sound";

// Non-landing routes are code-split. HomePage stays eager because it is the
// landing surface. Named exports are adapted to lazy's default-export contract.
const ProductsPage = lazy(() =>
  import("@/pages/ProductsPage").then((m) => ({ default: m.ProductsPage })),
);
const OrderPage = lazy(() =>
  import("@/pages/OrderPage").then((m) => ({ default: m.OrderPage })),
);
const SupportPage = lazy(() =>
  import("@/pages/SupportPage").then((m) => ({ default: m.SupportPage })),
);
const IntelligencePage = lazy(() =>
  import("@/pages/IntelligencePage").then((m) => ({ default: m.IntelligencePage })),
);
const LeadershipPage = lazy(() =>
  import("@/pages/LeadershipPage").then((m) => ({ default: m.LeadershipPage })),
);
const AboutPage = lazy(() =>
  import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const OpsPage = lazy(() =>
  import("@/pages/OpsPage").then((m) => ({ default: m.OpsPage })),
);
const AccountPage = lazy(() =>
  import("@/pages/AccountPage").then((m) => ({ default: m.AccountPage })),
);

/**
 * A minimal, non-flashing route fallback. No spinner, no animation, so it
 * respects prefers-reduced-motion by construction. aria-busy tells assistive
 * tech the region is loading.
 */
function RouteFallback() {
  return (
    <div
      aria-busy="true"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "40vh",
        color: "var(--text-2)",
      }}
    >
      Loading
    </div>
  );
}

export function App() {
  // Every interactive click makes a warm, gamified sound. Bespoke component
  // sounds still take priority; this only fills the gaps. Sound is on by
  // default but only actually plays after the first user gesture unlocks audio.
  useEffect(() => installGlobalClickSound(), []);

  /* /intelligence gives up both gutter trays (CompareRail left, MiniNav right)
     by owner decision (2026-07-09): the Integration Map section uses a
     full-bleed sticky reading pane that needs the gutters, and the page's
     SubNav already provides section navigation. All other routes keep both. */
  const { pathname } = useLocation();
  const showGutterRails = pathname !== "/intelligence";

  return (
    <HomeStateProvider>
      {/* BrowserRouter intercepts navigation, so hash scrolling, scroll
          restoration, and focus movement are ours to restore. RouteMeta gives
          each route its own title, description, and canonical URL. */}
      <RouteMeta />
      <ScrollAndFocusManager />

      {/* Only one Nathan's Note may be open at a time, site-wide. Collapsed
          teasers keep the fourth wall from becoming wallpaper. */}
      <NotesProvider>
        {/* The persistent shell. Everything here mounts once and survives
            navigation. SupportBar in particular holds the entire intake flow in
            local state, so it must never be remounted by a route change. */}
        <a className="skip-link" href="#main">Skip to content</a>

        <MegaNav />
        <SelectedProductRail />

        {/* Breadcrumb first: it states where you are, then SubNav offers where to
            go within the page. SubNav sticks beneath the nav and rail and publishes
            its own height into --subnav-h, so every section's scroll-margin-top
            stays correct and anchors never land under the headers. */}
        <Breadcrumb />
        <SubNav />

        {/* Right-gutter progress rail, mirroring CompareRail on the left. It
            renders only on routes with three or more sections. */}
        {showGutterRails && <MiniNav />}

        <main id="main" tabIndex={-1}>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/intelligence" element={<IntelligencePage />} />
              <Route path="/leadership" element={<LeadershipPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/ops" element={<OpsPage />} />
              {/* One account has a dossier. The route is explicit rather than a
                  :slug param, so an unknown slug 404s instead of rendering an
                  empty page that looks like a broken feature. */}
              <Route path="/accounts/99-ranch-market" element={<AccountPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>

        <SiteFooter />

        {showGutterRails && <CompareRail />}
        <SupportBar />

        {/* "Follow the order": the guided six-stop path. Renders nothing until
            a visitor starts it; survives route changes via sessionStorage. */}
        <OrderTour />

        {/* Nathan's Notes, the persistent floating companion. Mounts once here so
            it survives navigation and tracks the reader's scrolling on every
            route. Reads the invisible SectionNote anchors on each page. */}
        <NathanFloater />
      </NotesProvider>
    </HomeStateProvider>
  );
}
