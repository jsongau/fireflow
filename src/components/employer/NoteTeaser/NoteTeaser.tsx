import { forwardRef } from "react";
import styles from "./NoteTeaser.module.css";

/**
 * NoteTeaser — the compact, collapsible "Nathan's Notes" bar pinned inside the
 * support drawer. It shows a one-line, case-aware hook. Activating it opens the
 * full reading (on wide screens, in a panel outside the drawer on the left).
 *
 * Expanded state is signaled with a word and a glyph, never color alone.
 */
export interface NoteTeaserProps {
  /** One-line hook drawn from the current case. */
  hook: string;
  open: boolean;
  onToggle: () => void;
  /** Id of the panel this controls. */
  panelId: string;
  /**
   * Has this note scrolled into view yet? Drives the pill-to-bar entrance.
   * Defaults to true so any caller that does not observe still renders it whole,
   * rather than leaving an invisible button on the page.
   */
  awake?: boolean;
}

export const NoteTeaser = forwardRef<HTMLButtonElement, NoteTeaserProps>(function NoteTeaser(
  { hook, open, onToggle, panelId, awake = true },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={styles.teaser}
      data-awake={awake ? "true" : "false"}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onToggle}
    >
      <span className={styles.avatar} aria-hidden="true">
        NS
      </span>
      <span className={styles.text}>
        <span className={styles.tag}>Nathan&rsquo;s Notes</span>
        <span className={styles.hook}>{hook}</span>
      </span>
      <span className={styles.action}>
        {open ? "Hide" : "Read"}
        <span className={styles.glyph} aria-hidden="true">
          {open ? "–" : "+"}
        </span>
      </span>
    </button>
  );
});
