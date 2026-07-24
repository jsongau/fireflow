import { ButtonLink } from "@/components/primitives";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import { EMPLOYER, hasResume, hasContact } from "@/config/employer";
import styles from "./EmployerClose.module.css";

/**
 * Final employer close before the footer. "View Nathan's experience" always
 * works (it links to the on-page evidence section). The résumé and contact
 * actions only render when configured in `@/config/employer`, so no dead
 * button ever ships.
 */
export function EmployerClose() {
  return (
    <section id="why" className={styles.section} aria-labelledby="why-h">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Why I built FireFlow</p>
        <h2 id="why-h" className={styles.h2}>A résumé lists responsibilities. This shows the thinking.</h2>
        <p className={styles.body}>
          I built FireFlow to show more than a résumé can show. My background is in customer and retail
          operations, where accurate information, clear ownership, and calm communication determine
          whether a process works. FireFlow demonstrates how I think through product knowledge, customer
          questions, vendor support, Order-to-Cash friction, escalation, and continuous improvement.
        </p>
        <p className={styles.body}>
          The goal is not to pretend this is Samyang&rsquo;s system. The goal is to show how I would
          approach learning, supporting, and improving the real one.
        </p>

        <div className={styles.actions}>
          <ButtonLink href="#fit" variant="primary" size="md">View Nathan&rsquo;s experience</ButtonLink>
          {hasResume() && (
            <ButtonLink href={EMPLOYER.resumeUrl} variant="secondary" size="md">Open Nathan&rsquo;s résumé</ButtonLink>
          )}
          {hasContact() && (
            <ButtonLink href={`mailto:${EMPLOYER.contactEmail}`} variant="secondary" size="md">Discuss the role</ButtonLink>
          )}
        </div>

        <SectionNote sectionId="why" />
      </div>
    </section>
  );
}
