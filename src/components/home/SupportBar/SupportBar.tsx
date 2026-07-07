import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useHome } from "@/state/homeStore";
import type { UserMode } from "@/types/domain";
import styles from "./SupportBar.module.css";

/**
 * Compact floating support widget (docs/homepage IA). A labeled FAB pinned
 * bottom-right that expands into a small panel with a consumer/vendor toggle
 * and a "Start a case" action. Closed by default; while open it traps focus and
 * Escape returns focus to the FAB. Motion respects the reduced-motion tokens.
 * Mounted once, outside the main flow.
 */
export function SupportBar() {
  const { state, dispatch } = useHome();
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<Exclude<UserMode, "explore">>(
    state.userMode === "vendor" ? "vendor" : "consumer",
  );

  const fabRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  /* Move focus into the panel on open; return it to the FAB on close. */
  useEffect(() => {
    if (open) {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    }
  }, [open]);

  const close = () => {
    setOpen(false);
    fabRef.current?.focus();
  };

  /* Escape closes; Tab cycles within the panel (focus trap). */
  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab") return;
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables || focusables.length === 0) return;
    const list = Array.from(focusables);
    const first = list[0];
    const last = list[list.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const startCase = () => {
    dispatch({ type: "SET_MODE", mode: channel });
    setOpen(false);
    // FAB is not refocused here — the user is being sent to the case section.
  };

  return (
    <div className={styles.root}>
      {open && (
        <div
          ref={panelRef}
          className={styles.panel}
          role="dialog"
          aria-modal="false"
          aria-label="Start a support case"
          onKeyDown={onPanelKeyDown}
        >
          <div className={styles.panelHead}>
            <p className={styles.panelTitle}>Need help with a product?</p>
            <button type="button" className={styles.closeBtn} onClick={close} aria-label="Close support panel">
              Close
            </button>
          </div>

          <p className={styles.panelBody}>
            Tell us who you are and we&rsquo;ll open the right path — with the evidence each case needs.
          </p>

          <div className={styles.toggle} role="group" aria-label="I am a">
            <button
              type="button"
              className={channel === "consumer" ? `${styles.toggleBtn} ${styles.toggleOn}` : styles.toggleBtn}
              aria-pressed={channel === "consumer"}
              onClick={() => setChannel("consumer")}
            >
              Consumer
            </button>
            <button
              type="button"
              className={channel === "vendor" ? `${styles.toggleBtn} ${styles.toggleOn}` : styles.toggleBtn}
              aria-pressed={channel === "vendor"}
              onClick={() => setChannel("vendor")}
            >
              Vendor
            </button>
          </div>

          <a href="#resolve" className={styles.startBtn} onClick={startCase}>
            Start a {channel} case
          </a>
        </div>
      )}

      <button
        ref={fabRef}
        type="button"
        className={styles.fab}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.fabDot} aria-hidden="true" />
        {open ? "Support" : "Get support"}
      </button>
    </div>
  );
}
