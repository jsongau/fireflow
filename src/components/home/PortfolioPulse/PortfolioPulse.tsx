import { useEffect, useRef, useState } from "react";
import { useHome } from "@/state/homeStore";
import { FAMILIES } from "@/data/families";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useCatalogFilters } from "./catalog/useCatalogFilters";
import { CatalogToolbar } from "./catalog/CatalogToolbar";
import { CatalogFilterPanel } from "./catalog/CatalogFilterPanel";
import { CatalogPager } from "./catalog/CatalogPager";
import { ProductGrid } from "./catalog/ProductGrid";
import { ProductQuickView } from "./catalog/ProductQuickView";
import styles from "./PortfolioPulse.module.css";

const TOTAL_FORMATS = FAMILIES.reduce((n, f) => n + f.formats.length, 0);

/** Twelve divides cleanly into 2, 3, and 4 columns, so no page ends ragged. */
const PAGE_SIZE = 12;

export function PortfolioPulse() {
  const { state } = useHome();
  const model = useCatalogFilters();
  const reduced = useReducedMotion();

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelReturn, setPanelReturn] = useState<HTMLElement | null>(null);
  const [quickId, setQuickId] = useState<string | null>(null);
  const [quickReturn, setQuickReturn] = useState<HTMLElement | null>(null);

  const [page, setPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement | null>(null);

  const pageCount = Math.max(1, Math.ceil(model.resultCount / PAGE_SIZE));
  /* Clamp rather than trust: a filter that shrinks the result set can strand the
     visitor on page 4 of 2, which would render an empty grid and read as a bug. */
  const safePage = Math.min(page, pageCount);
  const pageItems = model.results.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* Any change to the result set returns the visitor to page one. Searching for
     "carbonara" while on page 3 should not show an empty grid. */
  const resultSignature = `${model.search}|${model.sort}|${model.resultCount}|${model.activeFilterCount}`;
  useEffect(() => {
    setPage(1);
  }, [resultSignature]);

  /* Changing page keeps the grid's top edge in view. Without this, tapping Next
     at the bottom of the page leaves the visitor at the bottom of the next one. */
  const changePage = (next: number) => {
    setPage(next);
    gridTopRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  const openPanel = () => {
    setPanelReturn(document.activeElement as HTMLElement | null);
    setPanelOpen(true);
  };
  const openQuick = (familyId: string) => {
    setQuickReturn(document.activeElement as HTMLElement | null);
    setQuickId(familyId);
  };

  return (
    <section id="portfolio" className={styles.section} aria-labelledby="portfolio-h">
      <div className={styles.inner}>
        <header className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Explore</p>
            <h2 id="portfolio-h" className={styles.h2}>Portfolio Pulse</h2>
            <p className={styles.lede}>
              Samyang America lists formats as separate products. FireFlow normalizes them into{" "}
              <strong>{FAMILIES.length} families</strong> across <strong>{TOTAL_FORMATS} formats</strong>, so
              you browse flavors, not repetition. Filter, switch the view, and open any product for its
              actions.
            </p>
          </div>
        </header>

        <CatalogToolbar model={model} onOpenPanel={openPanel} />

        {/* Scroll anchor for page changes. `scroll-margin-top` on it clears the
            sticky nav and the sticky toolbar above it. */}
        <div ref={gridTopRef} className={styles.gridTop} aria-hidden="true" />

        {model.resultCount === 0 ? (
          <p className={styles.empty}>
            No products match these filters.{" "}
            <button type="button" className={styles.clearInline} onClick={model.clearAll}>
              Clear all filters
            </button>
          </p>
        ) : (
          <>
            <ProductGrid
              items={pageItems}
              density={model.density}
              selectedId={state.selectedFamilyId}
              comparedIds={state.compareIds}
              savedIds={state.savedProductIds}
              onOpen={openQuick}
            />

            <CatalogPager
              page={safePage}
              pageCount={pageCount}
              total={model.resultCount}
              noun="products"
              onChange={changePage}
            />
          </>
        )}

        <SectionNote sectionId="portfolio" />
      </div>

      <CatalogFilterPanel
        model={model}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        returnFocusTo={panelReturn}
      />

      {quickId && (
        <ProductQuickView
          familyId={quickId}
          onClose={() => setQuickId(null)}
          returnFocusTo={quickReturn}
        />
      )}
    </section>
  );
}
