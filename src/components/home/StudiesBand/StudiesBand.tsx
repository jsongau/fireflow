import { Link } from "react-router-dom";
import { routeFor, hrefForSection, type NavSection } from "@/data/nav";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import styles from "./StudiesBand.module.css";

/**
 * StudiesBand — the landing page's index of the five working studies on
 * /intelligence.
 *
 * Why it exists: the deepest evidence on this site (the order-to-cash queue,
 * the customer master, the integration map, the dimensional model, the
 * command center) lives one page down behind a single navigation label, and a
 * reviewer scrolling the landing page rarely opens a menu. This band names the
 * five studies on the landing page itself and links each straight to its
 * screen.
 *
 * The cards do not carry their own copy. Each one reads label, kicker, sub,
 * and CTA from the same route/section table (`src/data/nav.ts`) that the
 * MegaNav dropdown and the footer read, so what a card promises and what the
 * menu promises can never drift apart.
 */

/** The five studies, in the order the /intelligence page presents them. */
const STUDY_IDS = ["o2c", "customer-master", "integration", "data-model", "command"] as const;

export function StudiesBand() {
  const route = routeFor("/intelligence");
  if (!route) return null;

  const studies = STUDY_IDS.map((id) => route.sections.find((s) => s.id === id)).filter(
    (s): s is NavSection => s != null,
  );
  if (studies.length === 0) return null;

  return (
    <section id="studies" className={styles.section} aria-labelledby="studies-h">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Under the order screens</p>
            <h2 id="studies-h" className={styles.h2}>
              Five studies, one page down.
            </h2>
            <p className={styles.lede}>
              The catalog, the order builder, and the case board above all run on process work
              that lives one page down: an order queue scored in the open, the customer record
              behind a clean order, one purchase order traced across five systems, the star
              schema under the reporting, and the queue a manager triages first. Each card opens
              the working screen.
            </p>
          </div>
          <p className={styles.aside}>
            <span aria-hidden="true">◆</span> Aligned to SAP SD and X12 practice. These are
            studies, not implementations.
          </p>
        </div>

        <ul className={styles.grid}>
          {studies.map((s) => (
            <li key={s.id}>
              <Link className={styles.card} to={hrefForSection(route, s)}>
                {s.kicker && <span className={styles.kicker}>{s.kicker}</span>}
                <span className={styles.name}>{s.label}</span>
                {s.sub && <span className={styles.sub}>{s.sub}</span>}
                {s.cta && <span className={styles.action}>{s.cta}</span>}
              </Link>
            </li>
          ))}
        </ul>

        <SectionNote sectionId="studies" />
      </div>
    </section>
  );
}
