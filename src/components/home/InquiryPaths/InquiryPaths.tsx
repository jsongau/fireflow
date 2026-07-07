import { useState } from "react";
import { useHome } from "@/state/homeStore";
import { FAMILY_BY_ID } from "@/data/families";
import { VARIANT_BY_ID } from "@/data/variants";
import { CATEGORY_BY_ID } from "@/data/categories";
import { CONSUMER_ISSUES, VENDOR_ISSUES } from "@/data/issues";
import { SCENARIOS } from "@/data/scenarios";
import { Button } from "@/components/primitives";
import type { InquiryIssue, InquiryChannel, Severity } from "@/types/domain";
import styles from "./InquiryPaths.module.css";

const VERIFY_STEPS = ["Identify", "Verify", "Gather evidence", "Route", "Resolve", "Update"];
const SEVERITY_LABEL: Record<Severity, string> = {
  standard: "Standard", elevated: "Elevated", priority: "Priority", specialist: "Specialist escalation",
};

export function InquiryPaths() {
  const { state, dispatch } = useHome();
  const family = state.selectedFamilyId ? FAMILY_BY_ID[state.selectedFamilyId] ?? null : null;
  const variant = state.selectedVariantId ? VARIANT_BY_ID[state.selectedVariantId] ?? null : null;
  const [consumerIssueId, setConsumerIssueId] = useState<string | null>(null);
  const [vendorIssueId, setVendorIssueId] = useState<string | null>(null);

  if (!family) {
    return (
      <section id="resolve" className={styles.section} aria-labelledby="resolve-h">
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Resolve</p>
          <h2 id="resolve-h" className={styles.h2}>Two Paths: Consumer &amp; Vendor</h2>
          <p className={styles.prompt}>Select a product first — an inquiry always starts from the exact product, so you never re-enter what the system already knows.</p>
        </div>
      </section>
    );
  }

  const relevant = (issues: InquiryIssue[]) =>
    issues.filter((i) => i.appliesToCategories.length === 0 || i.appliesToCategories.includes(family.category));

  const renderPath = (
    channel: InquiryChannel,
    issues: InquiryIssue[],
    activeId: string | null,
    setActive: (id: string) => void,
  ) => {
    const active = issues.find((i) => i.id === activeId) ?? null;
    const emphasized = state.userMode === channel;
    const matchingScenario = active ? SCENARIOS.find((s) => s.issueId === active.id) : undefined;
    return (
      <div
        id={channel === "vendor" ? "vendor" : undefined}
        className={emphasized ? `${styles.path} ${styles.pathOn}` : styles.path}
      >
        <div className={styles.pathHead}>
          <h3>{channel === "consumer" ? "Consumer Care" : "Vendor & Retailer Support"}</h3>
          {emphasized && <span className={styles.youAre}>You&rsquo;re here</span>}
        </div>
        <p className={styles.context}>
          About: <strong>{family.name}</strong>
          {variant ? <> · {variant.formatLabel}</> : null} · {CATEGORY_BY_ID[family.category]?.label}
        </p>

        <fieldset className={styles.issues}>
          <legend className={styles.legend}>What&rsquo;s the issue?</legend>
          {issues.map((i) => (
            <label key={i.id} className={i.id === activeId ? `${styles.issue} ${styles.issueOn}` : styles.issue}>
              <input
                type="radio"
                name={`issue-${channel}`}
                checked={i.id === activeId}
                onChange={() => setActive(i.id)}
              />
              {i.label}
            </label>
          ))}
        </fieldset>

        {active && (
          <div className={styles.detail}>
            <div className={styles.detailTop}>
              <span className={styles.severity} data-sev={active.defaultSeverity}>{SEVERITY_LABEL[active.defaultSeverity]}</span>
              <span className={styles.route}>Routes to: {active.routeTo.join(", ")}</span>
            </div>

            {active.requiresSpecialistEscalation && (
              <p className={styles.escalation}>
                This is routed to specialist escalation. FireFlow does not diagnose, minimize, or provide
                medical advice — it captures the facts and hands the case to the right team.
              </p>
            )}

            <ol className={styles.steps}>
              {VERIFY_STEPS.map((s) => <li key={s}>{s}</li>)}
            </ol>

            {active.evidenceRequested.length > 0 && (
              <div className={styles.evidence}>
                <span className={styles.evLabel}>Why we ask, and for what:</span>
                <ul>{active.evidenceRequested.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
            )}

            <a
              href="#simulate"
              onClick={() => {
                dispatch({ type: "SET_MODE", mode: channel });
                if (matchingScenario) dispatch({ type: "SELECT_SCENARIO", scenarioId: matchingScenario.id });
              }}
            >
              <Button variant="primary" size="sm">
                {matchingScenario ? "See this resolved" : "Start a case"}
              </Button>
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="resolve" className={styles.section} aria-labelledby="resolve-h">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Resolve</p>
        <h2 id="resolve-h" className={styles.h2}>Two Paths: Consumer &amp; Vendor</h2>
        <p className={styles.lede}>
          Every inquiry starts from the exact product and asks only what changes the routing or resolution.
          The system already knows the family, format, category, components, and public allergen information.
        </p>
        <div className={styles.grid}>
          {renderPath("consumer", relevant(CONSUMER_ISSUES), consumerIssueId, setConsumerIssueId)}
          {renderPath("vendor", relevant(VENDOR_ISSUES), vendorIssueId, setVendorIssueId)}
        </div>
      </div>
    </section>
  );
}
