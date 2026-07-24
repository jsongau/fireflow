import { SECTION_NOTES } from "@/data/sectionNotes";
import styles from "./SectionNote.module.css";

/**
 * SectionNote — an invisible anchor marking where a section's note belongs.
 *
 * It renders nothing a reader sees. The persistent NathanFloater reads these
 * anchors to know which sections carry commentary, which one the reader is
 * currently on, and where to scroll when the guided tour advances.
 *
 * It stays a component, mounted at each section foot, so every page that already
 * writes <SectionNote sectionId="x" /> keeps working untouched. A section id with
 * no matching note renders nothing, exactly as before.
 */
export interface SectionNoteProps {
  /** Anchor id of the section; keys into SECTION_NOTES. */
  sectionId: string;
}

export function SectionNote({ sectionId }: SectionNoteProps) {
  if (!SECTION_NOTES[sectionId]) return null;
  return <div className={styles.anchor} data-note-anchor={sectionId} aria-hidden="true" />;
}
