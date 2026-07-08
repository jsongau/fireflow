import { useState } from "react";
import { toggleSound, isSoundOn, playSound } from "@/lib/sound/sound";
import styles from "./SoundToggle.module.css";

/**
 * Quiet nav-pill control for optional sound. State is shown by glyph + word
 * (never colour alone), it is keyboard operable as a native button, and the
 * pressed state is announced with aria-pressed. Turning sound on plays a
 * subtle "confirm" — this click is also the user gesture that unlocks audio.
 * The control is fully functional even when audio is unavailable.
 */
export function SoundToggle({ className }: { className?: string }) {
  const [on, setOn] = useState<boolean>(() => isSoundOn());

  function handleClick() {
    const next = toggleSound();
    setOn(next);
    if (next) {
      playSound("confirm");
    }
  }

  return (
    <button
      type="button"
      className={[styles.toggle, className].filter(Boolean).join(" ")}
      aria-pressed={on}
      onClick={handleClick}
    >
      <span className={styles.dot} data-on={on ? "true" : undefined} aria-hidden="true">
        {on ? "●" : "○"}
      </span>
      Sound: {on ? "On" : "Off"}
    </button>
  );
}
