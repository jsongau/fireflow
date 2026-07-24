import { useState } from "react";
import { Link } from "react-router-dom";
import { useHome } from "@/state/homeStore";
import { FAMILY_BY_ID } from "@/data/families";
import { BRAND_BY_ID } from "@/data/brands";
import { imageForVariant } from "@/data/images";
import { playSound } from "@/lib/sound/sound";
import styles from "./CompareRail.module.css";

/**
 * The left-gutter tray that holds the comparison set. It appears only when at
 * least one product is added to compare. The comparison model is head-to-head,
 * so it holds at most two products (enforced in the store).
 *
 * It rests as a --spine-w spine, narrow enough to sit inside the gutter the page
 * shell reserves, and widens into the full tray on hover, on keyboard focus, or
 * when pinned. Before this it was a 280px panel that covered the left edge of
 * the content column the moment a visitor added their first product.
 *
 * The collapsed spine still shows the thumbnails it is holding, so the tray
 * answers "what is in here" without being opened. The body is never unmounted:
 * the width change is pure CSS, every control stays in the accessibility tree,
 * and :focus-within guarantees no control can take focus while it is clipped.
 */
export function CompareRail() {
  const { state, dispatch } = useHome();
  const [pinned, setPinned] = useState(false);

  const ids = state.compareIds;
  if (ids.length === 0) return null;

  const families = ids
    .map((id) => FAMILY_BY_ID[id])
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  return (
    <aside
      className={pinned ? `${styles.rail} ${styles.railPinned}` : styles.rail}
      aria-label="Comparison tray"
    >
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={pinned}
        aria-label={pinned ? "Unpin the comparison tray" : "Keep the comparison tray open"}
        onClick={() => setPinned((v) => !v)}
      >
        {/* The count is the spine's one readable cue. The tray heading below
            carries the same fact for assistive technology. */}
        <span className={styles.toggleCount} aria-hidden="true">{ids.length}</span>
        <span className={styles.toggleLabel} aria-hidden="true">
          {pinned ? "Unpin tray" : "Compare"}
        </span>
      </button>

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
          <Link
            to="/#compare"
            className={styles.compareBtn}
            onClick={() => playSound("select")}
          >
            Compare these
          </Link>
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => dispatch({ type: "CLEAR_COMPARE" })}
          >
            Clear
          </button>
        </div>
      </div>
    </aside>
  );
}
