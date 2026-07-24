import { useId, useState, type FormEvent } from "react";
import styles from "./CatalogPager.module.css";

/**
 * CatalogPager — page controls for the product grid.
 *
 * Rendering all 45 families at once meant a phone visitor scrolled 45 cards to
 * reach the section note beneath them. Twelve is the largest page that still
 * divides cleanly into 2, 3, and 4 columns, so no row is ever left ragged at any
 * breakpoint.
 *
 * The page numbers are elided around the current page rather than listed to 34,
 * and the jump field exists because a keyboard user should not have to tab
 * through page buttons to reach page 12. On a phone the numbered buttons are
 * hidden and the Previous and Next controls carry the whole job, since a row of
 * tap targets narrower than 44px is worse than no row.
 *
 * The current page is announced by `aria-current="page"` and carries a word in
 * its accessible name, so it never rests on the filled background alone.
 */

export interface CatalogPagerProps {
  page: number;
  pageCount: number;
  /** Total items across all pages, for the readout. */
  total: number;
  /** Plural noun for the readout, e.g. "products". */
  noun: string;
  onChange: (page: number) => void;
}

/** Page numbers to render, with `null` standing for an elision. */
function pageWindow(page: number, pageCount: number): (number | null)[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const out: (number | null)[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) out.push(null);
  for (let i = start; i <= end; i += 1) out.push(i);
  if (end < pageCount - 1) out.push(null);

  out.push(pageCount);
  return out;
}

export function CatalogPager({ page, pageCount, total, noun, onChange }: CatalogPagerProps) {
  const jumpId = useId();
  const [jump, setJump] = useState("");

  if (pageCount <= 1) return null;

  const go = (n: number) => onChange(Math.min(pageCount, Math.max(1, n)));

  const onJump = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(jump.trim());
    if (Number.isFinite(n) && n >= 1 && n <= pageCount) {
      go(n);
      setJump("");
    }
  };

  return (
    <nav className={styles.pager} aria-label="Product pages">
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.step}
          onClick={() => go(page - 1)}
          disabled={page === 1}
        >
          <span aria-hidden="true">&#8249;</span> Previous
        </button>

        <ol className={styles.numbers}>
          {pageWindow(page, pageCount).map((n, i) =>
            n === null ? (
              <li key={`gap-${i}`} className={styles.gap} aria-hidden="true">
                &hellip;
              </li>
            ) : (
              <li key={n}>
                <button
                  type="button"
                  className={styles.number}
                  aria-current={n === page ? "page" : undefined}
                  aria-label={n === page ? `Page ${n}, current page` : `Go to page ${n}`}
                  onClick={() => go(n)}
                >
                  {n}
                </button>
              </li>
            ),
          )}
        </ol>

        <button
          type="button"
          className={styles.step}
          onClick={() => go(page + 1)}
          disabled={page === pageCount}
        >
          Next <span aria-hidden="true">&#8250;</span>
        </button>
      </div>

      <div className={styles.readout}>
        <p className={styles.status} aria-live="polite">
          Page {page} of {pageCount} <span aria-hidden="true">·</span> {total} {noun}
        </p>

        <form className={styles.jump} onSubmit={onJump}>
          <label htmlFor={jumpId} className={styles.jumpLabel}>
            Jump to
          </label>
          <input
            id={jumpId}
            className={styles.jumpInput}
            type="number"
            inputMode="numeric"
            min={1}
            max={pageCount}
            value={jump}
            placeholder={String(page)}
            onChange={(e) => setJump(e.target.value)}
          />
          <span className={styles.jumpOf}>of {pageCount}</span>
          <button type="submit" className={styles.jumpGo}>
            Go
          </button>
        </form>
      </div>
    </nav>
  );
}
