import { useHome } from "@/state/homeStore";
import { EMPLOYER } from "@/config/employer";
import styles from "./EmployerIntro.module.css";

/**
 * Entrance cover for FireFlow. It reads as the cover card of an interactive
 * case study, not a landing page pasted in front of the product. It appears
 * only until the visitor chooses an entrance, and can be reopened later. It is
 * inline (not a blocking full-screen takeover).
 *
 *   Enter FireFlow      -> continue with Operator Notes off
 *   Explore with Nathan -> continue with Operator Notes on
 */
export function EmployerIntro() {
  const { state, dispatch } = useHome();
  if (state.introDismissed) return null;

  return (
    <section className={styles.cover} aria-labelledby="intro-h">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Independent application concept by {EMPLOYER.name}</p>
        <h1 id="intro-h" className={styles.h1}>
          A customer experience operating model, built to show how I think.
        </h1>
        <p className={styles.lead}>
          FireFlow is an independent customer experience operating model I built for the {EMPLOYER.role}
          opportunity at {EMPLOYER.company}. It shows how I think through product knowledge, order flow,
          customer communication, escalation, billing friction, issue resolution, and continuous
          improvement.
        </p>
        <p className={styles.body}>
          I bring more than eight years across consumer products, retail customer operations, billing,
          customer communication, process training, and complex issue resolution. Explore it as a working
          product, or turn on Operator Notes to see the decisions behind each workflow.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => dispatch({ type: "SET_OPERATOR_NOTES", enabled: false })}
          >
            Enter FireFlow
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => dispatch({ type: "SET_OPERATOR_NOTES", enabled: true })}
          >
            Explore with Nathan
          </button>
        </div>
        <p className={styles.hint}>
          Explore with Nathan turns on Operator Notes, short first-person notes on the decision behind
          each workflow. You can turn them on or off any time.
        </p>

        <p className={styles.independence}>
          FireFlow is not affiliated with {EMPLOYER.company} and does not represent access to its internal
          systems. Product information comes from public sources. Customers, orders, cases, metrics, and
          outcomes are synthetic and labeled.
        </p>
      </div>
    </section>
  );
}
