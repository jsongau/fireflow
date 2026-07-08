import { useHome } from "@/state/homeStore";
import styles from "./OperatorNotesToggle.module.css";

/**
 * Quiet global control for Operator Notes. State is shown by glyph + word
 * (not colour alone), it is keyboard operable, and the pressed state is
 * announced with aria-pressed. Turning notes off leaves product selections
 * untouched.
 */
export function OperatorNotesToggle({ className }: { className?: string }) {
  const { state, dispatch } = useHome();
  const on = state.operatorNotesEnabled;
  return (
    <button
      type="button"
      className={[styles.toggle, className].filter(Boolean).join(" ")}
      aria-pressed={on}
      onClick={() => dispatch({ type: "TOGGLE_OPERATOR_NOTES" })}
    >
      <span className={styles.dot} data-on={on ? "true" : undefined} aria-hidden="true">
        {on ? "●" : "○"}
      </span>
      Operator Notes: {on ? "On" : "Off"}
    </button>
  );
}
