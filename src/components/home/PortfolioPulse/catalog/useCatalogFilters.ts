import { useCallback, useEffect, useMemo, useState } from "react";
import { FAMILIES } from "@/data/families";
import { BRANDS, BRAND_BY_ID } from "@/data/brands";
import { CATEGORIES, CATEGORY_BY_ID } from "@/data/categories";
import {
  ALL_PRODUCT_TYPES,
  spiceLevel,
  spiceName,
  typesForFamily,
  type ProductType,
} from "@/data/spiciness";
import type { ProductFamily, BrandId, CategoryId } from "@/types/domain";
import {
  type CardDensity,
  type SortId,
  type FilterChip,
  type FacetCounts,
  type CatalogFilterModel,
} from "./types";

const DENSITY_KEY = "fireflow:catalog:density";
const HEAT_LEVELS = [1, 2, 3, 4, 5] as const;

/** popularityTier ordering for the "Most prominent" sort (A first). */
const TIER_ORDER: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

/** Read persisted density with a guard for invalid or missing values. */
function readDensity(): CardDensity {
  try {
    const raw = localStorage.getItem(DENSITY_KEY);
    if (raw === "list" || raw === "comfortable" || raw === "dense") return raw;
  } catch {
    /* private mode or storage unavailable — fall through to default */
  }
  return "comfortable";
}

/**
 * The single source of truth for the catalog's filter, sort, and view state.
 * Implements the CatalogFilterModel contract in ./types.
 *
 * Only `density` is persisted (localStorage). Facet selections, search, and
 * sort reset on reload so a shared link always opens on the full catalog.
 */
export function useCatalogFilters(): CatalogFilterModel {
  const [brands, setBrands] = useState<Set<BrandId>>(() => new Set());
  const [categories, setCategories] = useState<Set<CategoryId>>(() => new Set());
  const [heats, setHeats] = useState<Set<number>>(() => new Set());
  const [types, setTypes] = useState<Set<ProductType>>(() => new Set());
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortId>("popularity");
  const [density, setDensity] = useState<CardDensity>(readDensity);

  /* Persist density only; guarded for private mode. */
  useEffect(() => {
    try {
      localStorage.setItem(DENSITY_KEY, density);
    } catch {
      /* ignore write failures (private mode) */
    }
  }, [density]);

  /* ---- Togglers (stable identities) ---- */
  const toggleBrand = useCallback((id: BrandId) => {
    setBrands((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleCategory = useCallback((id: CategoryId) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleHeat = useCallback((level: number) => {
    setHeats((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  }, []);

  const toggleType = useCallback((t: ProductType) => {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setBrands(new Set());
    setCategories(new Set());
    setHeats(new Set());
    setTypes(new Set());
    setSearch("");
  }, []);

  /* ---- Per-dimension predicates (empty set = pass all) ---- */
  const query = search.trim().toLowerCase();

  const passBrand = useCallback(
    (f: ProductFamily) => brands.size === 0 || brands.has(f.brand),
    [brands],
  );
  const passCategory = useCallback(
    (f: ProductFamily) => categories.size === 0 || categories.has(f.category),
    [categories],
  );
  const passHeat = useCallback(
    (f: ProductFamily) => heats.size === 0 || heats.has(spiceLevel(f.id)),
    [heats],
  );
  const passType = useCallback(
    (f: ProductFamily) =>
      types.size === 0 || typesForFamily(f).some((t) => types.has(t)),
    [types],
  );
  const passSearch = useCallback(
    (f: ProductFamily) => {
      if (!query) return true;
      const hay = [f.name, f.blurb ?? "", ...f.aliases].join(" ").toLowerCase();
      return hay.includes(query);
    },
    [query],
  );

  /* ---- Filtered + sorted results ---- */
  const results = useMemo(() => {
    const filtered = FAMILIES.filter(
      (f) =>
        passBrand(f) &&
        passCategory(f) &&
        passHeat(f) &&
        passType(f) &&
        passSearch(f),
    );

    const byName = (a: ProductFamily, b: ProductFamily) =>
      a.name.localeCompare(b.name);

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "popularity": {
          const d =
            (TIER_ORDER[a.popularityTier] ?? 99) -
            (TIER_ORDER[b.popularityTier] ?? 99);
          return d !== 0 ? d : byName(a, b);
        }
        case "heat-desc": {
          const d = spiceLevel(b.id) - spiceLevel(a.id);
          return d !== 0 ? d : byName(a, b);
        }
        case "heat-asc": {
          const d = spiceLevel(a.id) - spiceLevel(b.id);
          return d !== 0 ? d : byName(a, b);
        }
        case "az":
        default:
          return byName(a, b);
      }
    });

    return sorted;
  }, [passBrand, passCategory, passHeat, passType, passSearch, sort]);

  const totalFormats = useMemo(
    () => results.reduce((n, f) => n + f.formats.length, 0),
    [results],
  );

  /* ---- Faceted counts: for each group, apply every OTHER active filter. ---- */
  const facetCounts = useMemo<FacetCounts>(() => {
    const brandCounts: Partial<Record<BrandId, number>> = {};
    const brandBase = FAMILIES.filter(
      (f) => passCategory(f) && passHeat(f) && passType(f) && passSearch(f),
    );
    for (const b of BRANDS) {
      brandCounts[b.id] = brandBase.filter((f) => f.brand === b.id).length;
    }

    const categoryCounts: Partial<Record<CategoryId, number>> = {};
    const categoryBase = FAMILIES.filter(
      (f) => passBrand(f) && passHeat(f) && passType(f) && passSearch(f),
    );
    for (const c of CATEGORIES) {
      categoryCounts[c.id] = categoryBase.filter(
        (f) => f.category === c.id,
      ).length;
    }

    const heatCounts: Partial<Record<number, number>> = {};
    const heatBase = FAMILIES.filter(
      (f) => passBrand(f) && passCategory(f) && passType(f) && passSearch(f),
    );
    for (const level of HEAT_LEVELS) {
      heatCounts[level] = heatBase.filter(
        (f) => spiceLevel(f.id) === level,
      ).length;
    }

    const typeCounts: Partial<Record<ProductType, number>> = {};
    const typeBase = FAMILIES.filter(
      (f) => passBrand(f) && passCategory(f) && passHeat(f) && passSearch(f),
    );
    for (const t of ALL_PRODUCT_TYPES) {
      typeCounts[t] = typeBase.filter((f) => typesForFamily(f).includes(t)).length;
    }

    return {
      brands: brandCounts,
      categories: categoryCounts,
      heats: heatCounts,
      types: typeCounts,
    };
  }, [passBrand, passCategory, passHeat, passType, passSearch]);

  /* ---- Active chips (one per selected facet value) ---- */
  const activeChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];
    for (const id of brands) {
      chips.push({
        id: `brand:${id}`,
        label: BRAND_BY_ID[id]?.name ?? id,
        group: "Brand",
        onRemove: () => toggleBrand(id),
      });
    }
    for (const id of categories) {
      chips.push({
        id: `category:${id}`,
        label: CATEGORY_BY_ID[id]?.label ?? id,
        group: "Category",
        onRemove: () => toggleCategory(id),
      });
    }
    for (const level of heats) {
      chips.push({
        id: `heat:${level}`,
        label: spiceName(level),
        group: "Heat",
        onRemove: () => toggleHeat(level),
      });
    }
    for (const t of types) {
      chips.push({
        id: `type:${t}`,
        label: t,
        group: "Type",
        onRemove: () => toggleType(t),
      });
    }
    return chips;
  }, [
    brands,
    categories,
    heats,
    types,
    toggleBrand,
    toggleCategory,
    toggleHeat,
    toggleType,
  ]);

  const activeFilterCount =
    brands.size + categories.size + heats.size + types.size;

  return {
    results,
    resultCount: results.length,
    totalFormats,

    brands,
    categories,
    heats,
    types,
    search,
    sort,
    density,

    toggleBrand,
    toggleCategory,
    toggleHeat,
    toggleType,
    setSearch,
    setSort,
    setDensity,
    clearAll,

    activeChips,
    activeFilterCount,
    facetCounts,
  };
}
