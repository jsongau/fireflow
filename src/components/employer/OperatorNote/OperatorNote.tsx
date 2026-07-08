import type { ReactNode } from "react";
import { useHome } from "@/state/homeStore";
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
 * Operator Note — Nathan's fourth-wall narration inside FireFlow. It renders
 * only when the visitor turned on Operator Notes (via "Explore with Nathan" or
 * the toggle). It is styled to read as builder commentary, not product UI, a
 * system status, or a real Samyang annotation.
 */
export function OperatorNote({ title, children, role }: OperatorNoteProps) {
  const { state } = useHome();
  if (!state.operatorNotesEnabled) return null;
  return (
    <aside className={styles.note} aria-label="Operator note from Nathan">
      <p className={styles.tag}>
        <span className={styles.avatar} aria-hidden="true">NS</span>
        Nathan&rsquo;s read
      </p>
      <h4 className={styles.title}>{title}</h4>
      <div className={styles.body}>{children}</div>
      {role && (
        <p className={styles.role}>
          <span className={styles.roleLabel}>Role fit</span> {role}
        </p>
      )}
    </aside>
  );
}
