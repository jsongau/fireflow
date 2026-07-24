import { ProductCard } from "./ProductCard";
import type { ProductGridProps } from "./types";
import styles from "./ProductGrid.module.css";

/**
 * Density-aware container for the catalog. Renders a <ul> of ProductCards with
 * exact per-breakpoint column counts. When there are no items it renders null
 * so the parent can own the empty state.
 */
export function ProductGrid({
  items,
  density,
  selectedId,
  comparedIds,
  savedIds,
  onOpen,
}: ProductGridProps) {
  if (items.length === 0) return null;

  const densityClass =
    density === "list" ? styles.list : density === "dense" ? styles.dense : styles.comfortable;

  return (
    <ul className={`${styles.grid} ${densityClass}`}>
      {items.map((family) => (
        <li key={family.id} className={styles.item}>
          <ProductCard
            family={family}
            density={density}
            selected={family.id === selectedId}
            compared={comparedIds?.includes(family.id)}
            saved={savedIds?.includes(family.id)}
            onOpen={onOpen}
          />
        </li>
      ))}
    </ul>
  );
}
