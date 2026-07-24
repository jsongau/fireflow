import { NINETY_DAY_PLAN } from "@/data/leadership";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import styles from "./FirstNinetyDays.module.css";

/**
 * FirstNinetyDays — section id="plan" (Proposal D).
 *
 * A 30/60/90: assess, stand up standards, then launch continuous improvement.
 * Each phase carries concrete, checkable actions tied to artifacts that exist on
 * this site (the SLA matrix, the deduction SOP, the case lifecycle, the command
 * center, the team board). It is a plan, not a record of work performed, and it
 * says so. The checkboxes read as "planned," never as "done."
 */
export function FirstNinetyDays() {
  return (
    <section id="plan" className={styles.section} aria-labelledby="plan-h">
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>First 90 days</p>
          <h2 id="plan-h" className={styles.h2}>How I would start.</h2>
          <p className={styles.lede}>
            A 30/60/90 for this role, tied to the artifacts already on this site. This is a
            plan, not a claim: nothing here has happened yet. Each item is something I would do
            and could be held to, in order.
          </p>
        </div>

        <ol className={styles.phases}>
          {NINETY_DAY_PLAN.map((phase, i) => (
            <li key={phase.id} className={styles.phase}>
              <div className={styles.phaseHead}>
                <span className={styles.phaseNum} aria-hidden="true">{i + 1}</span>
                <div>
                  <p className={styles.window}>{phase.window}</p>
                  <h3 className={styles.theme}>{phase.theme}</h3>
                </div>
              </div>
              <p className={styles.aim}>{phase.aim}</p>
              <ul className={styles.actions}>
                {phase.actions.map((a) => (
                  <li key={a.text} className={styles.action}>
                    <span className={styles.check} aria-hidden="true">☐</span>
                    <span className={styles.actionBody}>
                      <span className={styles.actionText}>{a.text}</span>
                      <span className={styles.tiedTo}>Ties to: {a.tiedTo}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <p className={styles.footNote}>
          The open boxes mark planned actions, not completed ones. This is an interview
          artifact for the role, not a report of work at Samyang.
        </p>

        <SectionNote sectionId="plan" />
      </div>
    </section>
  );
}
