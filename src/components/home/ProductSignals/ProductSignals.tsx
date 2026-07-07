import { useHome } from "@/state/homeStore";
import { FAMILY_BY_ID } from "@/data/families";
import { SyntheticBadge, ConfidenceBadge } from "@/components/primitives";
import type { Confidence } from "@/types/domain";
import styles from "./ProductSignals.module.css";

/*
 * Product Signals & Continuous Improvement.
 * Job competency this demonstrates: turning repeated individual cases into a
 * closed improvement loop — inquiry -> pattern -> root cause -> action -> measure —
 * with an owner and a metric on every signal. Signals are grounded in REAL public
 * products; the evidence, impact and metrics are SYNTHETIC demonstration data.
 */

interface Signal {
  id: string;
  title: string;
  inquiry: string;
  pattern: string;
  rootCause: string;
  action: string;
  measure: string;
  owner: string;
  impact: string;
  evidence: string[];
  affectedFamilyIds: string[];
  confidence: Confidence;
}

const SIGNALS: Signal[] = [
  {
    id: "sig-carbonara-heat",
    title: "Carbonara heat expectation gap",
    inquiry: "“Is Carbonara mild?” / “why is this spicier than I expected?”",
    pattern: "Creamy, cheese-forward look sets a mild expectation; the actual moderate heat surprises first-time buyers.",
    rootCause: "Heat positioning is not obvious at the point of purchase for the creamy variants.",
    action: "Add a plain-language heat-level cue and an FAQ line to creamy-variant product pages.",
    measure: "Heat-expectation contacts per 1,000 units on creamy variants, tracked month over month.",
    owner: "CX Insights + Brand/PDP",
    impact: "Concentrated on the portfolio's highest-visibility flavor family — small copy change, broad reach.",
    evidence: [
      "Repeated “expected mild” comments clustered on creamy variants",
      "Questions arrive pre-purchase and post-purchase, suggesting a labelling gap",
    ],
    affectedFamilyIds: ["buldak-carbonara", "buldak-cream-carbonara"],
    confidence: "medium",
  },
  {
    id: "sig-chip-shipping",
    title: "Chip shipping damage by carrier",
    inquiry: "“My chips arrived crushed.”",
    pattern: "Crushed-bag claims concentrate on direct-to-home parcels, not on shelf-purchased bags.",
    rootCause: "Transit handling on a fragile snack format — a shipping problem, not a product defect.",
    action: "Review protective packaging with Logistics and aggregate claims by carrier and route.",
    measure: "Crushed-chip claims per 1,000 shipments, segmented by carrier.",
    owner: "CX + Logistics",
    impact: "Damage claims are avoidable cost and a poor first impression for the snack line.",
    evidence: [
      "Photo evidence shows in-transit crushing, seals intact",
      "Claims skew toward specific carriers/routes in the synthetic sample",
    ],
    affectedFamilyIds: ["buldak-potato-chips-original", "buldak-potato-chips-habanero-lime", "buldak-potato-chips-quattro-cheese"],
    confidence: "medium",
  },
  {
    id: "sig-sauce-leak-lot",
    title: "Hot-sauce leakage clustered by lot",
    inquiry: "“The bottle arrived leaking with a loose cap.”",
    pattern: "Leak and loose-cap reports appear to cluster against particular lot codes rather than spreading evenly.",
    rootCause: "Possible cap-torque or seal-integrity variation on specific fill lots.",
    action: "Flag recurring lot codes to Quality for a seal-integrity review before it becomes systemic.",
    measure: "Leak claims per lot code; escalate any lot crossing the review threshold.",
    owner: "CX + Quality",
    impact: "Early lot-level detection contains a seal issue before it spreads across the sauce line.",
    evidence: [
      "Lot codes captured on every leak report",
      "A small number of lots account for a disproportionate share of claims",
    ],
    affectedFamilyIds: ["buldak-original-hot-sauce", "buldak-carbonara-hot-sauce", "buldak-2x-spicy-hot-sauce"],
    confidence: "low",
  },
  {
    id: "sig-creamy-allergen",
    title: "Creamy-variant milk-allergen questions",
    inquiry: "“Does this contain milk?”",
    pattern: "Milk-allergen questions cluster on creamy and cheese variants, where shoppers reasonably expect dairy.",
    rootCause: "On-page allergen information is not prominent enough on the creamy line; this is an information need, not a defect.",
    action: "Improve allergen visibility on creamy-variant pages using pre-approved allergen language only.",
    measure: "Allergen-question contacts on creamy variants, and self-serve views of the allergen statement.",
    owner: "CX + Quality/Regulatory",
    impact: "Clear allergen answers are a safety and trust priority; better labelling deflects avoidable contacts.",
    evidence: [
      "Milk questions concentrate on carbonara / cheese / mac variants",
      "Answers rely on approved statements — no ad-hoc medical guidance",
    ],
    affectedFamilyIds: ["buldak-carbonara", "buldak-cream-carbonara", "buldak-quattro-cheese", "buldak-mac-and-cheese-carbo"],
    confidence: "high",
  },
  {
    id: "sig-deduction-reason",
    title: "Deductions by reason code",
    inquiry: "Retailer chargebacks citing shortages on received shipments.",
    pattern: "Deductions recur under a handful of reason codes rather than being one-off events.",
    rootCause: "Determine per code whether the driver is pick/pack, transit, or receiving.",
    action: "Reconcile each deduction to documents, then drive corrective action with the responsible function per reason code.",
    measure: "Deduction count and value by reason code; recovery vs. write-off rate.",
    owner: "CX Manager + Finance + Supply Chain",
    impact: "Reason-code patterns convert repeated write-offs into targeted, recoverable fixes.",
    evidence: [
      "Reason codes and claim numbers captured on every deduction",
      "A few codes dominate the synthetic deduction sample",
    ],
    affectedFamilyIds: ["buldak-original", "buldak-carbonara"],
    confidence: "medium",
  },
  {
    id: "sig-sellsheet-requests",
    title: "Repeated vendor sell-sheet requests",
    inquiry: "“Are sell sheets / marketing assets available for this line?”",
    pattern: "The same vendor asset requests repeat across accounts, one email thread at a time.",
    rootCause: "Sell sheets and marketing assets are not discoverable through a self-serve channel.",
    action: "Assemble a self-serve vendor asset kit and route requests to it instead of handling each manually.",
    measure: "Sell-sheet request volume vs. self-serve asset downloads over time.",
    owner: "CX + Sales/Marketing",
    impact: "Self-serve assets reclaim CX time and speed vendors to shelf.",
    evidence: [
      "Recurring asset requests appear in vendor question sets across the anchor lines",
      "Requests are near-identical, a strong self-serve candidate",
    ],
    affectedFamilyIds: ["buldak-original-hot-sauce", "buldak-carbonara-hot-sauce", "buldak-original", "buldak-carbonara"],
    confidence: "high",
  },
];

const CHAIN: { key: keyof Pick<Signal, "inquiry" | "pattern" | "rootCause" | "action" | "measure">; label: string }[] = [
  { key: "inquiry", label: "Inquiry" },
  { key: "pattern", label: "Pattern" },
  { key: "rootCause", label: "Root cause" },
  { key: "action", label: "Action" },
  { key: "measure", label: "Measure" },
];

export function ProductSignals() {
  const { state, dispatch } = useHome();
  const selectedId = state.selectedSignalId;

  return (
    <section id="signals" className={styles.section} aria-labelledby="signals-h">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Improve</p>
            <h2 id="signals-h" className={styles.h2}>Product Signals &amp; Continuous Improvement</h2>
            <p className={styles.lede}>
              Individual cases are noise until they cluster. Each signal follows one loop —
              inquiry &rarr; pattern &rarr; root cause &rarr; action &rarr; measure — grounded in real products.
              Select a signal to see the evidence, the fix, and how it&rsquo;s measured.
            </p>
          </div>
          <div className={styles.headBadge}>
            <SyntheticBadge />
            <span className={styles.headNote}>Products are real; evidence, impact and metrics are invented for demonstration.</span>
          </div>
        </div>

        <ul className={styles.grid}>
          {SIGNALS.map((sig) => {
            const open = sig.id === selectedId;
            return (
              <li key={sig.id} className={open ? `${styles.card} ${styles.cardOn}` : styles.card}>
                <button
                  className={styles.cardBtn}
                  aria-expanded={open}
                  onClick={() =>
                    dispatch({ type: "SELECT_SIGNAL", signalId: open ? null : sig.id })
                  }
                >
                  <span className={styles.cardTitle}>{sig.title}</span>
                  <ol className={styles.chain}>
                    {CHAIN.map((step) => (
                      <li key={step.key} className={styles.chainStep}>
                        <span className={styles.chainLabel}>{step.label}</span>
                        <span className={styles.chainText}>{sig[step.key]}</span>
                      </li>
                    ))}
                  </ol>
                  <span className={styles.expandHint} aria-hidden="true">{open ? "Hide detail −" : "Show detail +"}</span>
                </button>

                {open && (
                  <div className={styles.detail}>
                    <div className={styles.detailGrid}>
                      <div className={styles.block}>
                        <h4>Evidence</h4>
                        <ul>{sig.evidence.map((e, i) => <li key={i}>{e}</li>)}</ul>
                      </div>
                      <div className={styles.block}>
                        <h4>Impact</h4>
                        <p>{sig.impact}</p>
                      </div>
                      <div className={styles.block}>
                        <h4>Proposed action</h4>
                        <p>{sig.action}</p>
                      </div>
                      <div className={styles.block}>
                        <h4>Measurement</h4>
                        <p>{sig.measure}</p>
                      </div>
                    </div>

                    <div className={styles.block}>
                      <h4>Affected products</h4>
                      <div className={styles.chips}>
                        {sig.affectedFamilyIds.map((fid) => {
                          const family = FAMILY_BY_ID[fid];
                          return (
                            <button
                              key={fid}
                              className={styles.chip}
                              onClick={() => dispatch({ type: "SELECT_FAMILY", familyId: fid })}
                            >
                              {family?.name ?? fid}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className={styles.footer}>
                      <span className={styles.owner}>Owner: <strong>{sig.owner}</strong></span>
                      <span className={styles.badges}>
                        <ConfidenceBadge level={sig.confidence} />
                        <SyntheticBadge />
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
