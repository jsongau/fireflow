import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * NotesProvider — holds the single open Nathan's Note for the whole site, so
 * opening one section's note collapses any other. SectionNote consumes this.
 *
 * App mounts the provider once, high in the tree. If a SectionNote ever renders
 * without a provider it degrades to inert (the teaser simply never expands)
 * rather than crashing the page.
 */

interface NotesContextValue {
  /** Section id of the note currently expanded, or null when all are collapsed. */
  openNoteId: string | null;
  setOpenNoteId: (id: string | null) => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const value = useMemo<NotesContextValue>(() => ({ openNoteId, setOpenNoteId }), [openNoteId]);
  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

const INERT: NotesContextValue = { openNoteId: null, setOpenNoteId: () => {} };

export function useNotes(): NotesContextValue {
  return useContext(NotesContext) ?? INERT;
}

/* ---- Guide handoff -------------------------------------------------------
 *
 * Prev/Next in an open note can target a note on another route. The jump
 * writes the target id here before navigating; the SectionNote that owns that
 * id consumes the flag once it is mounted, opens itself, scrolls into view,
 * and clears it. sessionStorage rather than provider state because the pages
 * are lazy: a route change swaps the whole page subtree through Suspense, and
 * the flag has to survive that remount (same pattern as
 * "fireflow:o2c:open-order" in ediLifecycle). Wrapped in try/catch so a
 * blocked storage (private mode) degrades to "the jump navigates but does not
 * auto-open" instead of throwing. */
const PENDING_NOTE_KEY = "fireflow:notes:pending";

/** Remember which note a guide jump is heading to. */
export function setPendingNote(id: string): void {
  try {
    sessionStorage.setItem(PENDING_NOTE_KEY, id);
  } catch {
    /* storage unavailable */
  }
}

/** Read the pending target without consuming it. */
export function peekPendingNote(): string | null {
  try {
    return sessionStorage.getItem(PENDING_NOTE_KEY);
  } catch {
    return null;
  }
}

/** The target note arrived (or the user moved on): drop the flag. */
export function clearPendingNote(): void {
  try {
    sessionStorage.removeItem(PENDING_NOTE_KEY);
  } catch {
    /* storage unavailable */
  }
}
