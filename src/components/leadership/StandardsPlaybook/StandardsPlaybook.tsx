import { useState } from "react";
import {
  SLA_MATRIX,
  ESCALATION_LADDER,
  APPROVAL_AUTHORITY,
  DEDUCTION_SOP,
  COMMUNICATION_CADENCE,
} from "@/data/leadership";
import type { PriorityId } from "@/components/home/SupportBar/intake";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import styles from "./StandardsPlaybook.module.css";

/**
 * StandardsPlaybook — section id="standards" (Proposal B).
 *
 * One governed artifact that consolidates the service standards otherwise
 * scattered across the build: the SLA matrix by priority, the escalation ladder,
 * the approval-authority matrix, the deduction-dispute SOP, and the proactive-
 * communication cadence. The SLA and deduction values are imported from the
 * running intake taxonomy through @/data/leadership, so the playbook always
 * agrees with the live product. The design is synthetic and labeled.
 *
 * Interaction: selecting a priority row focuses the matrix on that tier, giving
 * a reader a single line to read against. State is carried by a glyph and word,
 * never color alone; every table remains fully readable without selecting.
 */
export function StandardsPlaybook() {
  const [selected, setSelected] = useState<PriorityId | null>(null);

  return (
    <section id="standards" className={styles.section} aria-labelledby="standards-h">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Standards and SOP</p>
            <h2 id="standards-h" className={styles.h2}>The service standards, governed in one place.</h2>
            <p className={styles.lede}>
              Establishing and governing service, order-management, and escalation standards is
              the artifact this role produces. Here it is: the SLA targets, who may commit what,
              how a deduction is disputed, and when the customer hears from us. The SLA and
              deduction values are the same ones the running case tools use.
            </p>
          </div>
          <div className={styles.headBadge}>
            <span className={styles.headNote}>Standards design for a portfolio artifact. Not a Samyang policy.</span>
          </div>
        </div>

        {/* --- SLA matrix ------------------------------------------------ */}
        <div className={styles.block}>
          <div className={styles.blockHead}>
            <h3 className={styles.h3}>Service-level matrix by priority</h3>
            <p className={styles.blockNote}>
              Acknowledge and resolve targets per priority. Select a row to focus it.
            </p>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={styles.caption}>Acknowledge and resolve targets by case priority.</caption>
              <thead>
                <tr>
                  <th scope="col">Priority</th>
                  <th scope="col">Acknowledge within</th>
                  <th scope="col">Resolve within</th>
                  <th scope="col">Typical cases</th>
                </tr>
              </thead>
              <tbody>
                {SLA_MATRIX.map((row) => {
                  const on = selected === row.id;
                  const dim = selected !== null && !on;
                  return (
                    <tr
                      key={row.id}
                      className={`${styles.slaRow} ${on ? styles.slaRowOn : ""} ${dim ? styles.slaRowDim : ""}`}
                      aria-selected={on}
                      tabIndex={0}
                      onClick={() => setSelected(on ? null : row.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelected(on ? null : row.id);
                        }
                      }}
                    >
                      <th scope="row" className={styles.priorityCell}>
                        <span className={styles.priorityGlyph} aria-hidden="true">{row.glyph}</span>
                        {row.label}
                        {on && <span className={styles.focusTag}> focused</span>}
                      </th>
                      <td>{row.ack}</td>
                      <td>{row.resolve}</td>
                      <td className={styles.exampleCell}>{row.example}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {selected !== null && (
            <button type="button" className={styles.clear} onClick={() => setSelected(null)}>
              Clear the focused priority
            </button>
          )}
        </div>

        {/* --- Escalation ladder + approval authority -------------------- */}
        <div className={styles.twoCol}>
          <div className={styles.block}>
            <div className={styles.blockHead}>
              <h3 className={styles.h3}>Escalation ladder</h3>
              <p className={styles.blockNote}>Who holds a case at each tier, and what moves it up.</p>
            </div>
            <ol className={styles.ladder}>
              {ESCALATION_LADDER.map((t) => (
                <li key={t.tier} className={styles.ladderItem}>
                  <span className={styles.tierBadge} aria-hidden="true">{t.tier}</span>
                  <div className={styles.ladderBody}>
                    <p className={styles.ladderOwner}>
                      <span className={styles.srOnly}>Tier {t.tier}. </span>{t.owner}
                    </p>
                    <p className={styles.ladderHolds}>{t.holds}</p>
                    <p className={styles.ladderEscalate}>
                      <span className={styles.escalateLabel}>Escalate when</span> {t.escalateWhen}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.block}>
            <div className={styles.blockHead}>
              <h3 className={styles.h3}>Approval authority</h3>
              <p className={styles.blockNote}>The ceiling on each commitment, by role.</p>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.caption}>Who may commit a credit, a substitution, a date, a deduction disposition, or an exception.</caption>
                <thead>
                  <tr>
                    <th scope="col">Action</th>
                    <th scope="col">Rep</th>
                    <th scope="col">Team Lead</th>
                    <th scope="col">CX Manager</th>
                    <th scope="col">Cross-functional</th>
                  </tr>
                </thead>
                <tbody>
                  {APPROVAL_AUTHORITY.map((r) => (
                    <tr key={r.action}>
                      <th scope="row" className={styles.actionCell}>{r.action}</th>
                      <td>{r.rep}</td>
                      <td>{r.lead}</td>
                      <td>{r.manager}</td>
                      <td>{r.crossFn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- Deduction-dispute SOP ------------------------------------- */}
        <div className={styles.block}>
          <div className={styles.blockHead}>
            <h3 className={styles.h3}>Deduction-dispute SOP</h3>
            <p className={styles.blockNote}>
              Type, validity read, dispute window, and the backup required to dispute. These
              values match the running case tools.
            </p>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={styles.caption}>How each deduction type is validated, disputed, and prevented.</caption>
              <thead>
                <tr>
                  <th scope="col">Deduction type</th>
                  <th scope="col">Validity</th>
                  <th scope="col">Validated by</th>
                  <th scope="col">Dispute window</th>
                  <th scope="col">Required backup</th>
                  <th scope="col">Root-cause fix</th>
                </tr>
              </thead>
              <tbody>
                {DEDUCTION_SOP.map((d) => (
                  <tr key={d.id}>
                    <th scope="row" className={styles.actionCell}>{d.label}</th>
                    <td>
                      <span className={styles.validity} data-validity={d.validity}>
                        <span aria-hidden="true">{d.validityGlyph}</span> {d.validityLabel}
                      </span>
                    </td>
                    <td>{d.validatedBy}</td>
                    <td>{d.window}</td>
                    <td>
                      <ul className={styles.backupList}>
                        {d.backup.map((b) => <li key={b}>{b}</li>)}
                      </ul>
                    </td>
                    <td className={styles.rootCell}>{d.rootCause}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Communication cadence ------------------------------------ */}
        <div className={styles.block}>
          <div className={styles.blockHead}>
            <h3 className={styles.h3}>Proactive-communication cadence</h3>
            <p className={styles.blockNote}>The standard for when an account hears from us, so no one has to chase us.</p>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={styles.caption}>The moment, the standard, and the owner for each customer touch.</caption>
              <thead>
                <tr>
                  <th scope="col">Moment</th>
                  <th scope="col">Standard</th>
                  <th scope="col">Owner</th>
                </tr>
              </thead>
              <tbody>
                {COMMUNICATION_CADENCE.map((c) => (
                  <tr key={c.moment}>
                    <th scope="row" className={styles.actionCell}>{c.moment}</th>
                    <td>{c.standard}</td>
                    <td>{c.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <SectionNote sectionId="standards" />
      </div>
    </section>
  );
}
