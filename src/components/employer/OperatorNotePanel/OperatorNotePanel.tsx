import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import styles from "./OperatorNotePanel.module.css";

/**
 * OperatorNotePanel — the expanded "Nathan's Notes" reading.
 *
 * A fourth-wall surface. On wide screens it renders OUTSIDE the support drawer,
 * anchored to the left edge, so the commentary is visibly separate from the
 * product. On narrow screens the caller renders it `inline` inside the drawer's
 * note dock instead, since there is no room beside the drawer.
 *
 * It is rendered inside the support dialog's DOM subtree, so screen readers
 * reach it while `aria-modal` is set on the wrapper. Escape and the close button
 * both collapse it back to the teaser, and focus returns to the teaser.
 */

export interface NoteLine {
  /** Optional bolded lead-in, e.g. "Fix it upstream." */
  label?: string;
  /** The line body. ReactNode so callers can embed glossary terms. */
  text: ReactNode;
}

export interface OperatorNoteContent {
  title: string;
  /** The case this note is about, shown as a kicker. (Legacy; `label` is the
      current field. Kept because the support drawer still supplies it.) */
  caseLabel?: string;
  /** Short name for what the note points at ("The case board"). Rendered as
      the live "now" tag in the open panel and spoken by the guide's Prev/Next
      button labels. */
  label?: string;
  /** One-line hook used by the collapsed teaser. */
  hook: string;
  lines: NoteLine[];
  /** Optional role-fit footer line. */
  roleFit?: string;
}

/**
 * Prev/Next wiring for the guided sequence. SectionNote builds this from
 * NOTE_GUIDE; a note outside the sequence passes no guide and renders as a
 * standalone note, exactly as before.
 */
export interface NoteGuide {
  /** 1-based position in the sequence. */
  step: number;
  total: number;
  /** Label of the previous stop, or null at the first stop (button disabled). */
  prevLabel: string | null;
  /** Label of the next stop, or null at the last stop (button disabled). */
  nextLabel: string | null;
  onPrev: () => void;
  onNext: () => void;
}

export interface OperatorNotePanelProps {
  content: OperatorNoteContent;
  /** Must match the teaser's aria-controls. */
  id: string;
  onClose: () => void;
  /** Render statically inside the drawer instead of as the left-side panel. */
  inline?: boolean;
  className?: string;
  /**
   * Run the staggered entrance. The caller flips this one frame after mount so
   * each line has a from-state to leave. Ignored under reduced motion, where the
   * stagger tokens are 0ms and every line lands together.
   */
  animate?: boolean;
  /** Prev/Next through the guided sequence. Absent on standalone notes. */
  guide?: NoteGuide;
  /**
   * Pull focus into the panel even in inline mode. Set by SectionNote when the
   * note was opened by a guide jump, so a keyboard user lands inside the note
   * they asked for instead of on the button that just unmounted.
   */
  autoFocus?: boolean;
}

export function OperatorNotePanel({
  content,
  id,
  onClose,
  inline = false,
  className,
  animate = true,
  guide,
  autoFocus = false,
}: OperatorNotePanelProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);

  /* When it opens as the standalone left panel, move focus to it so keyboard
     users land on the commentary they just asked for. Inline mode stays put,
     except on a guide arrival (autoFocus): then the panel root takes focus,
     with preventScroll because the arrival scroll is already in flight. */
  useEffect(() => {
    if (!inline) {
      closeRef.current?.focus();
    } else if (autoFocus) {
      rootRef.current?.focus({ preventScroll: true });
    }
  }, [inline, autoFocus]);

  const cls = [styles.panel, inline ? styles.inline : styles.floating, className]
    .filter(Boolean)
    .join(" ");

  return (
    <aside
      ref={rootRef}
      id={id}
      className={cls}
      data-animate={animate ? "true" : "false"}
      tabIndex={-1}
      aria-label="Nathan's Notes, builder commentary"
    >
      <div className={styles.head}>
        <p className={styles.tag}>
          <span className={styles.avatar} aria-hidden="true">
            NS
          </span>
          Nathan&rsquo;s Notes
        </p>
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close note"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      {(content.label ?? content.caseLabel) && (
        <p className={styles.nowTag}>
          {/* The dot is decoration; the words carry the state. */}
          <span className={styles.nowDot} aria-hidden="true" />
          {content.label ?? content.caseLabel}
        </p>
      )}
      <h3 className={styles.title} style={{ "--i": 0 } as CSSProperties}>
        {content.title}
      </h3>

      <div className={styles.body}>
        {content.lines.map((line, i) => (
          <p key={i} className={styles.line} style={{ "--i": i + 1 } as CSSProperties}>
            {line.label && <strong className={styles.lineLabel}>{line.label}</strong>}{" "}
            {line.text}
          </p>
        ))}
      </div>

      {content.roleFit && (
        <p
          className={styles.role}
          style={{ "--i": content.lines.length + 1 } as CSSProperties}
        >
          <span className={styles.roleLabel}>Role fit</span> {content.roleFit}
        </p>
      )}

      <p className={styles.synth} style={{ "--i": content.lines.length + 2 } as CSSProperties}>
        Commentary from the builder.
      </p>

      {guide && (
        <nav
          className={styles.guideNav}
          style={{ "--i": content.lines.length + 3 } as CSSProperties}
          aria-label="Guided notes"
        >
          {/* Ends clamp rather than wrap: the tour has a start (the hero) and
              an end (the close), and wrapping would teleport a reader from the
              close back to the top without warning. Disabled buttons stay
              rendered so the row never reflows. */}
          <button
            type="button"
            className={styles.guideBtn}
            onClick={guide.onPrev}
            disabled={guide.prevLabel === null}
            aria-label={
              guide.prevLabel ? `Previous note: ${guide.prevLabel}` : "Previous note, none before this"
            }
          >
            <span className={styles.guideGlyph} aria-hidden="true">
              &lsaquo;
            </span>
            Prev
          </button>
          <span className={styles.guideStep}>
            {guide.step} of {guide.total}
          </span>
          <button
            type="button"
            className={styles.guideBtn}
            onClick={guide.onNext}
            disabled={guide.nextLabel === null}
            aria-label={guide.nextLabel ? `Next note: ${guide.nextLabel}` : "Next note, none after this"}
          >
            Next
            <span className={styles.guideGlyph} aria-hidden="true">
              &rsaquo;
            </span>
          </button>
        </nav>
      )}
    </aside>
  );
}
