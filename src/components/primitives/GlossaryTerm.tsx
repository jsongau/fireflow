import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import styles from "./GlossaryTerm.module.css";

/**
 * GlossaryTerm — an accessible hover/tap definition for a term inline in copy.
 *
 * Opens on hover, keyboard focus, and click/tap (click pins it open). Escape or
 * blur closes; when pinned, Escape is handled here and its propagation is stopped
 * so it does not also close a surrounding dialog. The affordance is a dotted
 * underline plus a small circled marker, never color alone, so it is
 * colorblind-safe. No motion is required, so it is fine under reduced-motion.
 *
 * WHY THE TOOLTIP IS PORTALED. It used to be `position: absolute` inside the
 * term's own `position: relative` wrapper. That makes it a prisoner of its
 * ancestors twice over: any ancestor with `overflow: hidden` clips it (the ops
 * cards, the note panel body, the support drawer), and any ancestor that creates
 * a stacking context caps its `z-index`, so a tooltip with `z-index: 5` rendered
 * behind a dialog at `--z-dialog: 60` no matter what number we wrote on it.
 *
 * The fix is to render it into `document.body` and position it with `fixed`
 * coordinates measured from the trigger. It flips above or below depending on
 * room, clamps to the viewport so it never runs off an edge, and re-measures on
 * scroll and resize while open. `aria-describedby` still resolves, because ARIA
 * references work by id across the whole document, not by DOM proximity.
 *
 * The tip is `pointer-events: none`: it must never swallow a click meant for the
 * content it is covering.
 */
export interface GlossaryTermProps {
  /** The visible term text. */
  term: string;
  /** The definition shown in the tooltip. */
  definition: string;
  /** Optional tooltip heading; defaults to the term. */
  heading?: string;
}

interface Coords {
  top: number;
  left: number;
  placement: "top" | "bottom";
}

/** Gap between the term and its tooltip, and the minimum margin from any edge. */
const GAP = 8;

export function GlossaryTerm({ term, definition, heading }: GlossaryTermProps) {
  const id = useId();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || focused || pinned;

  const termRef = useRef<HTMLButtonElement | null>(null);
  const tipRef = useRef<HTMLSpanElement | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);

  const place = useCallback(() => {
    const trigger = termRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip) return;

    const t = trigger.getBoundingClientRect();
    const box = tip.getBoundingClientRect();

    // Above by default. Below only when there is not room above.
    let placement: Coords["placement"] = "top";
    let top = t.top - box.height - GAP;
    if (top < GAP) {
      placement = "bottom";
      top = t.bottom + GAP;
    }
    // If it would now run off the bottom too, pin it to the roomier side.
    if (placement === "bottom" && top + box.height > window.innerHeight - GAP) {
      const roomAbove = t.top;
      const roomBelow = window.innerHeight - t.bottom;
      if (roomAbove > roomBelow) {
        placement = "top";
        top = Math.max(GAP, t.top - box.height - GAP);
      } else {
        top = Math.max(GAP, window.innerHeight - box.height - GAP);
      }
    }

    // Centered on the term, then clamped inside the viewport.
    const centered = t.left + t.width / 2 - box.width / 2;
    const left = Math.max(GAP, Math.min(centered, window.innerWidth - box.width - GAP));

    setCoords({ top, left, placement });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    place();

    // `true` captures scrolls on any ancestor, not just the window, so a tooltip
    // opened inside the support drawer follows its term when the drawer scrolls.
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      setPinned(false);
      e.currentTarget.blur();
    }
  };

  const tip =
    open && typeof document !== "undefined"
      ? createPortal(
          <span
            ref={tipRef}
            role="tooltip"
            id={id}
            className={styles.tip}
            data-placement={coords?.placement ?? "top"}
            style={{
              top: coords ? `${coords.top}px` : 0,
              left: coords ? `${coords.left}px` : 0,
              // Rendered once to be measured, then revealed in the same frame.
              visibility: coords ? "visible" : "hidden",
            }}
          >
            <span className={styles.tipHead}>{heading ?? term}</span>
            <span className={styles.tipBody}>{definition}</span>
          </span>,
          document.body,
        )
      : null;

  return (
    <span className={styles.wrap}>
      <button
        ref={termRef}
        type="button"
        className={styles.term}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={() => setPinned((v) => !v)}
        onKeyDown={onKeyDown}
      >
        <span className={styles.label}>{term}</span>
        <span className={styles.marker} aria-hidden="true">
          i
        </span>
      </button>
      {tip}
    </span>
  );
}
