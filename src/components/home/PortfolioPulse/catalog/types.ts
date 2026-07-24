/**
 * Shared contract for the redesigned catalog (PortfolioPulse).
 *
 * These types are the interface between three pieces that are built
 * independently and composed in PortfolioPulse:
 *   - the filter model + toolbar + slide-in panel (useCatalogFilters, CatalogToolbar, CatalogFilterPanel)
 *   - the card + grid views (ProductCard, ProductGrid)
 *   - the product quick-view modal (ProductQuickView)
 *
 * Everything stays honest and colorblind-safe: heat, saved, and compared state
 * must always be signaled with a glyph or word, never color alone.
 */
import type { ProductFamily, BrandId, CategoryId } from "@/types/domain";
import type { ProductType } from "@/data/spiciness";

/** Card layout density for the catalog view switcher. Persisted to localStorage. */
export type CardDensity = "list" | "comfortable" | "dense";

export const DENSITY_OPTIONS: { value: CardDensity; label: string; glyph: string }[] = [
  { value: "list", label: "List", glyph: "☰" }, // ☰
  { value: "comfortable", label: "Grid", glyph: "▦" }, // ▦
  { value: "dense", label: "Dense", glyph: "☷" }, // ⚏-like block
];

/** Sort options for the catalog. */
export type SortId = "popularity" | "heat-desc" | "heat-asc" | "az";

export const SORT_OPTIONS: { value: SortId; label: string }[] = [
  { value: "popularity", label: "Most prominent" },
  { value: "heat-desc", label: "Hottest first" },
  { value: "heat-asc", label: "Mildest first" },
  { value: "az", label: "A to Z" },
];

/** One active-filter chip shown in the slim bar. */
export interface FilterChip {
  /** Unique id, e.g. "brand:buldak" or "heat:5". */
  id: string;
  /** Short display label, e.g. "Buldak" or "Extreme Spicy". */
  label: string;
  /** Facet group name for context, e.g. "Brand". */
  group: string;
  /** Remove just this filter value. */
  onRemove: () => void;
}

/** Per-facet-value result counts, computed against the OTHER active filters. */
export interface FacetCounts {
  brands: Partial<Record<BrandId, number>>;
  categories: Partial<Record<CategoryId, number>>;
  heats: Partial<Record<number, number>>;
  types: Partial<Record<ProductType, number>>;
}

/**
 * The complete catalog filter/sort/view model returned by useCatalogFilters().
 * PortfolioPulse consumes `results` for the grid and passes the whole model to
 * CatalogToolbar and CatalogFilterPanel.
 */
export interface CatalogFilterModel {
  /** Filtered + sorted families to render. */
  results: ProductFamily[];
  resultCount: number;
  /** Sum of formats across the filtered families (for the "N formats" readout). */
  totalFormats: number;

  /* Facet selections (multi-select sets). */
  brands: Set<BrandId>;
  categories: Set<CategoryId>;
  heats: Set<number>;
  types: Set<ProductType>;
  search: string;
  sort: SortId;
  density: CardDensity;

  /* Setters / togglers. */
  toggleBrand: (id: BrandId) => void;
  toggleCategory: (id: CategoryId) => void;
  toggleHeat: (level: number) => void;
  toggleType: (t: ProductType) => void;
  setSearch: (q: string) => void;
  setSort: (s: SortId) => void;
  setDensity: (d: CardDensity) => void;
  clearAll: () => void;

  /* Derived helpers for the UI. */
  activeChips: FilterChip[];
  activeFilterCount: number;
  facetCounts: FacetCounts;
}

/** Props the parent passes into a rendered ProductCard. */
export interface ProductCardProps {
  family: ProductFamily;
  density: CardDensity;
  selected?: boolean;
  compared?: boolean;
  saved?: boolean;
  /** Open the quick-view modal for this family. */
  onOpen: (familyId: string) => void;
}

/** Props for the grid/list container. */
export interface ProductGridProps {
  items: ProductFamily[];
  density: CardDensity;
  selectedId?: string | null;
  comparedIds?: string[];
  savedIds?: string[];
  onOpen: (familyId: string) => void;
}
