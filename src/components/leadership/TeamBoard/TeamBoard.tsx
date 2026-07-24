import {
  TEAM,
  PRIORITY_LABEL,
  loadState,
  LOAD_META,
  LOAD_SCALE_MAX,
  WORKLOAD_THRESHOLDS,
  APPROVAL_LEVELS,
  APPROVAL_MATRIX,
  QA_RUBRIC,
  QA_SAMPLE_PER_REP,
} from "@/data/team";
import { THRESHOLD_BASIS } from "@/data/escalation";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import styles from "./TeamBoard.module.css";

/*
 * TeamBoard — a synthetic Customer Experience team operating model.
 *
 * Job competency this demonstrates: people leadership. The roster, workload
 * balancing, escalation-authority matrix, QA rubric, and 1:1 cadence together
 * answer "3+ years managing supervisors, managers, or team leads" and "lead,
 * coach, and develop the team" WITHOUT claiming Nathan has managed these people.
 * Everything is invented and labeled synthetic. State is shown by word + glyph,
 * never color alone.
 */

export function TeamBoard() {
  return (
    <section id="team" className={styles.section} aria-labelledby="team-h">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Lead</p>
            <h2 id="team-h" className={styles.h2}>
              CX team operating model
            </h2>
            <p className={styles.lede}>
              This is how I would run the Customer Experience function: who owns what,
              how load stays balanced, who may commit what without me, and what I check
              on a sampled case. It is an operating model, not a claim of having
              managed this exact team.
            </p>
          </div>
          <div className={styles.headBadge}>
            <span className={styles.headNote}>
              How I would balance load and set approval limits.
            </span>
          </div>
        </div>

        {/* Roster ---------------------------------------------------------- */}
        <div className={styles.block}>
          <div className={styles.blockHead}>
            <h3 className={styles.blockTitle}>Roster and coaching</h3>
            <p className={styles.blockNote}>
              One team lead and five reps. Each carries a specialty that maps to the case
              types the intake actually routes, plus a coaching focus, a development goal,
              and a 1:1 cadence.
            </p>
          </div>
          <ul className={styles.roster}>
            {TEAM.map((m) => {
              const state = loadState(m.openCases);
              const meta = LOAD_META[state];
              return (
                <li key={m.id} className={styles.member} data-load={state}>
                  <div className={styles.memberTop}>
                    <div>
                      <p className={styles.memberName}>{m.name}</p>
                      <p className={styles.memberLevel}>{m.level}</p>
                    </div>
                    <span className={styles.loadPill} data-load={state}>
                      <span aria-hidden="true">{meta.glyph}</span> {meta.word}
                    </span>
                  </div>

                  <p className={styles.specialty}>{m.specialty}</p>
                  <p className={styles.covers}>{m.covers}</p>

                  <dl className={styles.facts}>
                    <div className={styles.factRow}>
                      <dt className={styles.factKey}>Open cases</dt>
                      <dd className={styles.factVal}>{m.openCases}</dd>
                    </div>
                    <div className={styles.factRow}>
                      <dt className={styles.factKey}>Top priority</dt>
                      <dd className={styles.factVal}>{PRIORITY_LABEL[m.topPriority]}</dd>
                    </div>
                    <div className={styles.factRow}>
                      <dt className={styles.factKey}>1:1 cadence</dt>
                      <dd className={styles.factVal}>{m.oneOnOne}</dd>
                    </div>
                  </dl>

                  <p className={styles.coach}>
                    <span className={styles.coachKey}>Coaching focus</span>
                    {m.coachingFocus}
                  </p>
                  <p className={styles.coach}>
                    <span className={styles.coachKey}>Development goal</span>
                    {m.developmentGoal}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Workload balance ----------------------------------------------- */}
        <div className={styles.block}>
          <div className={styles.blockHead}>
            <h3 className={styles.blockTitle}>Workload balance</h3>
            <p className={styles.blockNote}>
              Load across the team at a glance, so an overloaded rep is visible before it
              becomes a missed update. State is derived from open-case thresholds: under{" "}
              {WORKLOAD_THRESHOLDS.atCapacity} has headroom, {WORKLOAD_THRESHOLDS.atCapacity}{" "}
              to {WORKLOAD_THRESHOLDS.overloaded - 1} is at capacity,{" "}
              {WORKLOAD_THRESHOLDS.overloaded} or more is overloaded.
            </p>
          </div>
          <ul className={styles.loadChart}>
            {TEAM.map((m) => {
              const state = loadState(m.openCases);
              const meta = LOAD_META[state];
              const pct = Math.min(100, Math.round((m.openCases / LOAD_SCALE_MAX) * 100));
              return (
                <li key={m.id} className={styles.loadRow}>
                  <span className={styles.loadName}>{m.name}</span>
                  <span className={styles.loadTrack} aria-hidden="true">
                    <span
                      className={styles.loadFill}
                      data-load={state}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className={styles.loadCount}>{m.openCases}</span>
                  <span className={styles.loadState} data-load={state}>
                    <span aria-hidden="true">{meta.glyph}</span> {meta.word}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className={styles.rebalance}>
            My move here: Priya is over the line while Jordan and Marcus have room. I pull
            her routine deduction research to Marcus for the week and keep her on the
            aging-window disputes only, then rebuild it once the backlog clears.
          </p>
        </div>

        {/* Escalation authority ------------------------------------------- */}
        <div className={styles.block}>
          <div className={styles.blockHead}>
            <h3 className={styles.blockTitle}>Escalation and approval authority</h3>
            <p className={styles.blockNote}>
              Who may commit what without a manager. Clear limits keep the queue moving
              and keep the risky calls with the right level.
            </p>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.matrix}>
              <thead>
                <tr>
                  <th scope="col" className={styles.matrixActionHead}>
                    Action
                  </th>
                  {APPROVAL_LEVELS.map((lvl) => (
                    <th key={lvl} scope="col">
                      {lvl}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {APPROVAL_MATRIX.map((row) => (
                  <tr key={row.id}>
                    <th scope="row" className={styles.matrixAction}>
                      <span className={styles.matrixActionLabel}>{row.action}</span>
                      {row.note && <span className={styles.matrixNote}>{row.note}</span>}
                    </th>
                    {APPROVAL_LEVELS.map((lvl) => {
                      const val = row.limits[lvl];
                      const denied = val === "Not authorized";
                      return (
                        <td key={lvl} data-denied={denied ? "true" : undefined}>
                          <span aria-hidden="true" className={styles.matrixGlyph}>
                            {denied ? "✕" : "✓"}
                          </span>{" "}
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* The same ceilings the intake routing check climbs. Published here,
              evaluated there, one set of numbers, so the standard and the system
              cannot quietly disagree. */}
          <p className={styles.matrixBasis}>
            <strong>About these thresholds.</strong> {THRESHOLD_BASIS} The reship and credit
            ceilings above are the same values account support intake evaluates when it decides
            whether a case leaves first contact, so the standard on this page and the check running
            in the product cannot drift apart.
          </p>
        </div>

        {/* QA rubric ------------------------------------------------------- */}
        <div className={styles.block}>
          <div className={styles.blockHead}>
            <h3 className={styles.blockTitle}>Case-quality rubric</h3>
            <p className={styles.blockNote}>
              I sample {QA_SAMPLE_PER_REP} closed cases per rep each week and check the
              same five things. It keeps the standard concrete and the coaching specific.
            </p>
          </div>
          <ol className={styles.rubric}>
            {QA_RUBRIC.map((q, i) => (
              <li key={q.id} className={styles.rubricItem}>
                <span className={styles.rubricNum} aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <p className={styles.rubricCheck}>{q.check}</p>
                  <p className={styles.rubricWhy}>{q.why}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <SectionNote sectionId="team" />
      </div>
    </section>
  );
}
