import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { useAwaken } from "@/hooks/useAwaken";
import { useMountTransition } from "@/hooks/useMountTransition";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./OperatorNote.module.css";

interface OperatorNoteProps {
  /** Short title naming the operational truth. */
  title: string;
  /** The note body, in Nathan's first person. */
  children: ReactNode;
  /** Optional one-line connection to the target role. */
  role?: string;
}

/**
 * Operator Note — Nathan's fourth-wall narration inside FireFlow. Always present:
 * the notes are part of the portfolio's argument, not an optional preference.
 * Styled to read as builder commentary, not product UI, a system status, or a
 * real Samyang annotation.
 *
 * Collapsed to the tag and title by default so a note never dominates the page;
 * the body and role-fit line expand on demand. State is never signaled by color
 * alone: the toggle carries a word ("Read note" / "Hide note") and a glyph
 * ("+" / "-"). Escape from inside the expanded body collapses it and returns
 * focus to the toggle.
 *
 * Motion. The card drifts up into place the first time it scrolls into view, and
 * the body grows from zero height rather than appearing. The body is unmounted
 * while collapsed, so assistive technology never walks a closed note, but the
 * wrapper keeps the id that `aria-controls` points at. With prefers-reduced-motion
 * set, every duration is 0ms and the note simply is where it is.
 */
export function OperatorNote({ title, children, role }: OperatorNoteProps) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const reduced = useReducedMotion();

  const { ref: noteRef, awake } = useAwaken<HTMLElement>(!reduced);
  const { mounted, entered } = useMountTransition(open, reduced ? 0 : 420);

  const collapse = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  const onBodyKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        collapse();
      }
    },
    [collapse],
  );

  return (
    <aside
      ref={noteRef}
      className={styles.note}
      data-awake={awake ? "true" : "false"}
      aria-label="Operator note from Nathan"
    >
      <p className={styles.tag}>
        <span className={styles.avatar} aria-hidden="true">NS</span>
        Nathan&rsquo;s Notes
      </p>
      <h4 className={styles.title}>{title}</h4>

      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.toggleGlyph} aria-hidden="true">
          {open ? "−" : "+"}
        </span>
        {open ? "Hide note" : "Read note"}
      </button>

      <div
        id={bodyId}
        className={styles.reveal}
        data-open={entered ? "true" : "false"}
        onKeyDown={onBodyKeyDown}
      >
        <div className={styles.revealInner}>
          {mounted && (
            <div className={styles.collapse} data-animate={entered ? "true" : "false"}>
              <div className={styles.body}>{children}</div>
              {role && (
                <p className={styles.role}>
                  <span className={styles.roleLabel}>Role fit</span> {role}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
