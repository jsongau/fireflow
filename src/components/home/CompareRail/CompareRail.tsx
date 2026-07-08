import { useState } from "react";
import { useHome } from "@/state/homeStore";
import { FAMILY_BY_ID } from "@/data/families";
import { BRAND_BY_ID } from "@/data/brands";
import { imageForVariant } from "@/data/images";
import { playSound } from "@/lib/sound/sound";
import styles from "./CompareRail.module.css";

/**
 * A sticky, manually collapsible left rail that holds the comparison set.
 * It appears only when at least one product is added to compare, opens on the
 * left, and can be collapsed to a thin edge tab by hand. The comparison model
 * is head-to-head, so it holds at most two products (enforced in the store).
 */
export function CompareRail() {
  const { state, dispatch } = useHome();
  const [collapsed, setCollapsed] = useState(false);

  const ids = state.compareIds;
  if (ids.length === 0) return null;

  const families = ids
    .map((id) => FAMILY_BY_ID[id])
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  return (
    <aside
      className={collapsed ? `${styles.rail} ${styles.railCollapsed}` : styles.rail}
      aria-label="Comparison tray"
    >
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((v) => !v)}
      >
        <span className={styles.toggleGlyph} aria-hidden="true">{collapsed ? "›" : "‹"}</span>
        <span className={styles.toggleLabel}>Compare · {ids.length}</span>
      </button>

      {!collapsed && (
        <div className={styles.body}>
          <p className={styles.title}>Comparison tray</p>
          <ul className={styles.list}>
            {families.map((f) => {
              const brand = BRAND_BY_ID[f.brand] ?? null;
              const photo = imageForVariant("", f.id);
              return (
                <li key={f.id} className={styles.item}>
                  <span className={styles.thumb} aria-hidden="true">
                    {photo ? (
                      <img className={styles.thumbImg} src={photo} alt="" loading="lazy" />
                    ) : (
                      <span className={styles.thumbFallback}>{brand?.name.charAt(0)}</span>
                    )}
                  </span>
                  <span className={styles.itemText}>
                    <span className={styles.itemName}>{f.name}</span>
                    <span className={styles.itemBrand}>{brand?.name}</span>
                  </span>
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={`Remove ${f.name} from compare`}
                    onClick={() => dispatch({ type: "REMOVE_COMPARE", familyId: f.id })}
                  >
                    <span aria-hidden="true">{"×"}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className={styles.hint}>
            {ids.length < 2
              ? "Add one more product to compare head to head."
              : "Two products, ready to compare."}
          </p>

          <div className={styles.actions}>
            <a
              href="#compare"
              className={styles.compareBtn}
              onClick={() => playSound("select")}
            >
              Compare these
            </a>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => dispatch({ type: "CLEAR_COMPARE" })}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
