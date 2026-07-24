import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  OperatorNotePanel,
  type NoteGuide,
} from "@/components/employer/OperatorNotePanel/OperatorNotePanel";
import { NOTE_GUIDE, NOTE_GUIDE_ROUTES, SECTION_NOTES } from "@/data/sectionNotes";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./NathanFloater.module.css";

/**
 * NathanFloater — the persistent "Nathan's Notes" companion.
 *
 * One floating avatar, always on screen, that follows the reader down the page
 * and swaps its commentary to whatever section is in front of them. It is the
 * fourth wall that used to open as a teaser at every section foot, moved into a
 * single fixed surface so the builder's voice is always one click away instead
 * of something you scroll past.
 *
 * How it tracks. Every section that carries a note mounts an invisible anchor
 * (SectionNote) with `data-note-anchor="<sectionId>"`. This component observes
 * the section each anchor sits in and keeps `activeId` set to the one crossing
 * the middle of the viewport. Scroll down and the note changes on its own; the
 * avatar gives a small pulse each time so the change is felt, not just shown.
 *
 * The tour. Twelve of the notes form an ordered route (NOTE_GUIDE). Prev/Next in
 * the open bubble walk that route: a same-page stop scrolls to its section, a
 * stop on another page navigates there and, because this component never
 * unmounts, scrolls to the target as soon as its anchor appears. Free-scrolling
 * still shows every section's note; the tour cursor just follows along.
 *
 * Motion and access. The avatar is a real button (aria-expanded). The bubble is
 * labelled commentary; Escape closes it and returns focus to the avatar. Every
 * transition and the pulse are dropped under prefers-reduced-motion.
 */

/** IntersectionObserver keeps the section crossing this centre band active. */
const CENTER_BAND = "-45% 0px -45% 0px";

export function NathanFloater() {
  const reduced = useReducedMotion();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);
  /** Section ids present on this route, in document order. Drives has-notes. */
  const [present, setPresent] = useState<string[]>([]);

  const avatarRef = useRef<HTMLButtonElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  /** A cross-page Prev/Next stores its target here until the anchor mounts. */
  const pendingScroll = useRef<string | null>(null);
  /** Last active id, so we only pulse on a real change. */
  const lastActive = useRef<string | null>(null);

  /* ---- Track which section owns the viewport -------------------------------
     Rebuilt on every route change. A MutationObserver catches the lazy page
     mounting its sections a beat after navigation, and re-scans so the anchor
     set is never stale. The IntersectionObserver watches the SECTION each
     anchor sits in (not the foot-anchor itself), so a note goes live while its
     section fills the screen rather than only as it scrolls off. */
  useEffect(() => {
    const intersecting = new Set<string>();
    let order: string[] = [];

    const recomputeActive = () => {
      const next = order.find((id) => intersecting.has(id));
      if (next) setActiveId(next);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.noteFor;
          if (!id) continue;
          if (e.isIntersecting) intersecting.add(id);
          else intersecting.delete(id);
        }
        recomputeActive();
      },
      { rootMargin: CENTER_BAND, threshold: 0 },
    );

    const observed = new Map<Element, string>();

    const rescan = () => {
      const anchors = Array.from(
        document.querySelectorAll<HTMLElement>("[data-note-anchor]"),
      );
      order = anchors.map((a) => a.dataset.noteAnchor as string);
      setPresent(order);

      const wanted = new Map<Element, string>();
      for (const a of anchors) {
        const id = a.dataset.noteAnchor as string;
        const target = (a.closest("section") as Element | null) ?? a;
        (target as HTMLElement).dataset.noteFor = id;
        wanted.set(target, id);
      }
      // Observe new targets, drop ones that left the DOM.
      for (const [el] of observed) {
        if (!wanted.has(el)) {
          io.unobserve(el);
          observed.delete(el);
        }
      }
      for (const [el, id] of wanted) {
        if (!observed.has(el)) {
          io.observe(el);
          observed.set(el, id);
        }
      }

      // Seed an active note so the bubble is never empty on this route.
      setActiveId((cur) => (cur && order.includes(cur) ? cur : (order[0] ?? null)));

      // A cross-page tour jump lands here once its section exists.
      const want = pendingScroll.current;
      if (want && order.includes(want)) {
        pendingScroll.current = null;
        scrollToSection(want, reduced);
        setActiveId(want);
      }
    };

    rescan();
    const mo = new MutationObserver(() => rescan());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname, reduced]);

  /* A real change of active section gives the avatar one pulse. */
  useEffect(() => {
    if (!activeId || activeId === lastActive.current) return;
    lastActive.current = activeId;
    if (reduced) return;
    setPulse(true);
    const t = window.setTimeout(() => setPulse(false), 900);
    return () => window.clearTimeout(t);
  }, [activeId, reduced]);

  /* Escape closes the bubble and hands focus back to the avatar. */
  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => avatarRef.current?.focus(), 0);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    }
  };

  /* Walk the guided route. Same-page stops scroll; other-page stops navigate
     and leave a breadcrumb the rescan picks up when the section mounts. */
  const goTo = useCallback(
    (targetId: string) => {
      const route = NOTE_GUIDE_ROUTES[targetId];
      if (!route) return;
      if (route === pathname) {
        scrollToSection(targetId, reduced);
        setActiveId(targetId);
      } else {
        pendingScroll.current = targetId;
        navigate(`${route}#${targetId}`);
      }
    },
    [pathname, navigate, reduced],
  );

  const content = activeId ? SECTION_NOTES[activeId] : undefined;

  /* Prev/Next is the twelve-stop tour. The cursor is the active note's own
     place in the route when it has one; otherwise the last stop at or before it
     in route order, so Next always moves the reader forward, never backward. */
  const guide = buildGuide(activeId, present, goTo);

  // Nothing to say on a route with no notes: keep the avatar off the screen
  // rather than opening to an empty bubble.
  if (present.length === 0 || !content) return null;

  return (
    <div
      className={styles.root}
      data-open={open ? "true" : "false"}
      onKeyDown={onKeyDown}
    >
      {open && (
        <div className={styles.bubble} ref={bubbleRef} role="dialog" aria-label="Nathan's Notes">
          <OperatorNotePanel
            content={content}
            id="nathan-floater-note"
            onClose={close}
            inline
            className={styles.panel}
            animate
            guide={guide}
          />
        </div>
      )}

      <button
        ref={avatarRef}
        type="button"
        className={styles.avatar}
        data-pulse={pulse ? "true" : "false"}
        aria-expanded={open}
        aria-controls="nathan-floater-note"
        onClick={() => setOpen((v) => !v)}
        title={open ? "Close Nathan's Notes" : `Nathan's Notes: ${content.label ?? "open"}`}
      >
        <span className={styles.avatarMark} aria-hidden="true">
          NS
        </span>
        <span className={styles.srOnly}>
          {open ? "Close Nathan's Notes" : `Open Nathan's Notes. Now on: ${content.label ?? content.title}`}
        </span>
      </button>

      {/* A quiet, always-visible cue: the label of the note under the reader
          right now, updating as they scroll. Hidden when the bubble is open. */}
      {!open && (
        <button
          type="button"
          className={styles.cue}
          onClick={() => setOpen(true)}
          tabIndex={-1}
          aria-hidden="true"
        >
          <span className={styles.cueKicker}>Nathan&rsquo;s Notes</span>
          <span className={styles.cueLabel}>{content.label ?? content.title}</span>
        </button>
      )}
    </div>
  );
}

/** Smooth-scroll a section to the centre of the viewport (instant if reduced). */
function scrollToSection(id: string, reduced: boolean) {
  const anchor = document.querySelector<HTMLElement>(`[data-note-anchor="${id}"]`);
  const target = anchor?.closest("section") ?? document.getElementById(id) ?? anchor;
  target?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
}

/** Build the Prev/Next tour object for the note currently shown, or undefined. */
function buildGuide(
  activeId: string | null,
  present: string[],
  goTo: (id: string) => void,
): NoteGuide | undefined {
  if (!activeId) return undefined;

  // The cursor: the active note's own guide index, or the last guide stop that
  // sits at or before it, so a reader on an off-route section can still advance.
  let cursor = NOTE_GUIDE.indexOf(activeId);
  if (cursor === -1) {
    const posInPage = present.indexOf(activeId);
    // Highest guide index whose section appears at or before the active one on
    // this page; falls back to 0 so Next always has somewhere to go.
    cursor = 0;
    for (let i = 0; i < NOTE_GUIDE.length; i += 1) {
      const gid = NOTE_GUIDE[i];
      if (gid === undefined) continue;
      const p = present.indexOf(gid);
      if (p !== -1 && p <= posInPage) cursor = i;
    }
  }

  const prevId = cursor > 0 ? (NOTE_GUIDE[cursor - 1] ?? null) : null;
  const nextId = cursor < NOTE_GUIDE.length - 1 ? (NOTE_GUIDE[cursor + 1] ?? null) : null;
  return {
    step: cursor + 1,
    total: NOTE_GUIDE.length,
    prevLabel: prevId ? (SECTION_NOTES[prevId]?.label ?? null) : null,
    nextLabel: nextId ? (SECTION_NOTES[nextId]?.label ?? null) : null,
    onPrev: () => {
      if (prevId) goTo(prevId);
    },
    onNext: () => {
      if (nextId) goTo(nextId);
    },
  };
}
