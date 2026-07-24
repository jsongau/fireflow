import { useMemo } from "react";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import {
  ALL_CATEGORIES,
  PRIORITY_LABEL,
  PRIORITY_TARGET,
  type CategoryDef,
} from "@/components/home/SupportBar/intake";
import { SOP_FAMILIES, familyOf } from "@/data/escalation";
import styles from "./SopRegister.module.css";

/**
 * SopRegister — the written procedures, listed.
 *
 * Rendered from `ALL_CATEGORIES`, which is the same taxonomy account support
 * intake routes against. A register typed out separately from the categories it
 * governs will eventually list a procedure nobody runs and omit one everybody
 * does, and nobody will notice until a rep follows the document and the system
 * does something else. There is one list.
 *
 * The point of the register is not that it exists. It is that every code here is
 * cited on a live case: pick a category in the support drawer and its SOP code
 * rides the case into the routing summary and the confirmation. A rep can name
 * the procedure they followed, and a reader can come here and check it.
 */
export function SopRegister() {
  const families = useMemo(() => {
    const groups = new Map<string, CategoryDef[]>();
    for (const c of ALL_CATEGORIES) {
      const key = familyOf(c.sop);
      const list = groups.get(key);
      if (list) list.push(c);
      else groups.set(key, [c]);
    }
    return Array.from(groups.entries());
  }, []);

  return (
    <section id="sop-register" className={styles.section} aria-labelledby="sop-register-h">
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Standards</p>
          <h2 id="sop-register-h" className={styles.title}>
            The procedure register
          </h2>
          <p className={styles.lede}>
            {ALL_CATEGORIES.length} procedures across {families.length} families. Each names the
            team that owns resolution, the metric it protects, and the service target it commits to.
            Every code here is cited on the live case when you open one through account support, so
            the register and the running system describe the same operation.
          </p>
        </div>
      </div>

      {families.map(([key, cats]) => (
        <div key={key} className={styles.family}>
          <h3 className={styles.familyName}>
            <span className={styles.familyKey}>{key}</span>
            {SOP_FAMILIES[key] ?? key}
          </h3>

          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Procedure</th>
                  <th scope="col">Owns resolution</th>
                  <th scope="col">Metric protected</th>
                  <th scope="col">Default priority</th>
                  <th scope="col">Resolve target</th>
                </tr>
              </thead>
              <tbody>
                {cats.map((c) => (
                  <tr key={c.id}>
                    <th scope="row" className={styles.code}>
                      {c.sop}
                    </th>
                    <td>{c.label}</td>
                    <td>{c.owner}</td>
                    <td>{c.metric}</td>
                    <td>{PRIORITY_LABEL[c.priority]}</td>
                    <td className={styles.target}>{PRIORITY_TARGET[c.priority].resolve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <p className={styles.foot}>
        A procedure a rep cannot follow at four o&rsquo;clock on a Friday is not a procedure. Each
        of these fits on one screen, names one owner, and commits to one clock, because the register
        exists to be used under pressure rather than cited in an audit.
      </p>

      <SectionNote sectionId="sop-register" />
    </section>
  );
}
