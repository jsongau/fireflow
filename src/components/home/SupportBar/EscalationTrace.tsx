import { THRESHOLD_BASIS, type EscalationVerdict } from "@/data/escalation";
import styles from "./EscalationTrace.module.css";

/**
 * EscalationTrace — the escalation standard, shown executing.
 *
 * A routing summary tells you where a case went. This tells you WHY, one rule at
 * a time, with the case's own data next to each rule and the consequence spelled
 * out where it fired. It is the SOP a rep would follow on a bad Friday, running.
 *
 * Every rule is evaluated and shown, including the ones that did not fire. A
 * trace that only lists what triggered is a conclusion; a trace that lists what
 * was checked is an argument, and a rep can audit it.
 *
 * Outcome is carried by a word and a glyph ("Met ▲", "Not met ○"), never by a
 * color. The prototype this pattern came from used red for fired and green for
 * clear, which a colorblind reader cannot separate at all.
 */
export function EscalationTrace({ verdict }: { verdict: EscalationVerdict }) {
  const { results, escalated, requiredLevel, bringIn, headline, detail } = verdict;
  const firedCount = results.filter((r) => r.met).length;

  return (
    <section className={styles.wrap} aria-label="Escalation check">
      <div className={styles.head}>
        <h4 className={styles.title}>Escalation check</h4>
        <p className={styles.sub}>
          {firedCount} of {results.length} rules fired. Each is checked against this case, in order.
        </p>
      </div>

      <ol className={styles.rules}>
        {results.map((r) => (
          <li key={r.id} className={styles.rule} data-met={r.met ? "yes" : "no"}>
            <p className={styles.outcome}>
              <span className={styles.glyph} aria-hidden="true">
                {r.met ? "▲" : "○"}
              </span>
              <span className={styles.outcomeWord}>{r.met ? "Met" : "Not met"}</span>
              {r.met && r.requires && (
                <span className={styles.requires}>Needs {r.requires}</span>
              )}
            </p>

            <div className={styles.ruleBody}>
              <p className={styles.ruleText}>{r.rule}</p>
              <p className={styles.finding}>{r.finding}</p>
              {r.met && r.consequence && <p className={styles.consequence}>{r.consequence}</p>}
            </div>
          </li>
        ))}
      </ol>

      <div className={styles.verdict} data-escalated={escalated ? "yes" : "no"}>
        <p className={styles.verdictHead}>
          <span aria-hidden="true">{escalated ? "▲" : "●"}</span>
          {headline}
        </p>
        <p className={styles.verdictDetail}>{detail}</p>

        <dl className={styles.verdictFacts}>
          <div>
            <dt>Authority required</dt>
            <dd>{requiredLevel}</dd>
          </div>
          <div>
            <dt>Beyond first contact</dt>
            <dd>{bringIn.length ? bringIn.join(", ") : "Nobody. It closes here."}</dd>
          </div>
        </dl>
      </div>

      <p className={styles.basis}>
        <span className={styles.basisLabel}>About these thresholds.</span> {THRESHOLD_BASIS}
      </p>
    </section>
  );
}
