import { TRACK_RECORD, CANNOT_CLAIM } from "@/data/leadership";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import styles from "./TrackRecord.module.css";

/**
 * TrackRecord — section id="results" (Proposal E).
 *
 * Promotes Nathan's real, defensible prior-role results out of the collapsed
 * <details> they were buried in and into a first-class section. Each result
 * names what changed, the number, the mechanism he used, and an explicit
 * "prior role, not Samyang" attribution. The honesty line naming what he cannot
 * claim is part of the argument, not a footnote. No SyntheticBadge here: these
 * are real.
 */
export function TrackRecord() {
  return (
    <section id="results" className={styles.section} aria-labelledby="results-h">
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>Track record</p>
          <h2 id="results-h" className={styles.h2}>Numbers I have actually moved.</h2>
          <p className={styles.lede}>
            The job asks for a demonstrated track record. These are real results from prior
            roles, with the mechanism that produced each one. They are not from Samyang, and
            I say so on every card. That is the point: the results you can trust are the ones
            I am careful about attributing.
          </p>
        </div>

        <ul className={styles.grid}>
          {TRACK_RECORD.map((r) => (
            <li key={r.id} className={styles.card}>
              <div className={styles.numberRow}>
                <span className={styles.number}>{r.number}</span>
                <span className={styles.numberLabel}>{r.numberLabel}</span>
              </div>
              <p className={styles.change}>{r.change}</p>
              <div className={styles.mechBlock}>
                <p className={styles.mechLabel}>How</p>
                <p className={styles.mech}>{r.mechanism}</p>
              </div>
              <p className={styles.attribution}>
                <span className={styles.attrGlyph} aria-hidden="true">◆</span>
                {r.attribution}
              </p>
            </li>
          ))}
        </ul>

        <p className={styles.cannot}>
          <span className={styles.cannotGlyph} aria-hidden="true">✳</span>
          {CANNOT_CLAIM}
        </p>

        <SectionNote sectionId="results" />
      </div>
    </section>
  );
}
