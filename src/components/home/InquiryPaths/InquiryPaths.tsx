import { useState, type MouseEvent } from "react";
import { useHome } from "@/state/homeStore";
import { FAMILY_BY_ID } from "@/data/families";
import { VARIANT_BY_ID } from "@/data/variants";
import { CATEGORY_BY_ID } from "@/data/categories";
import { ACCOUNT_ISSUES } from "@/data/issues";
import { SCENARIOS } from "@/data/scenarios";
import { ButtonLink, Button } from "@/components/primitives";
import { InquiryDialog } from "@/components/home/InquiryDialog/InquiryDialog";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import type { InquiryIssue, Severity } from "@/types/domain";
import styles from "./InquiryPaths.module.css";

interface DialogState {
  issue: InquiryIssue;
  trigger: HTMLElement | null;
}

const VERIFY_STEPS = ["Identify", "Verify", "Gather evidence", "Route", "Resolve", "Update"];
const SEVERITY_LABEL: Record<Severity, string> = {
  standard: "Standard", elevated: "Elevated", priority: "Priority", specialist: "Specialist escalation",
};

export function InquiryPaths() {
  const { state, dispatch } = useHome();
  const family = state.selectedFamilyId ? FAMILY_BY_ID[state.selectedFamilyId] ?? null : null;
  const variant = state.selectedVariantId ? VARIANT_BY_ID[state.selectedVariantId] ?? null : null;
  const [issueId, setIssueId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  if (!family) {
    return (
      <section id="resolve" className={styles.section} aria-labelledby="resolve-h">
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Account support</p>
          <h2 id="resolve-h" className={styles.h2}>Open an account case</h2>
          <p className={styles.prompt}>Select a product first. A case always starts from the exact product, so you never re-enter what the system already knows.</p>
        </div>
      </section>
    );
  }

  const issues = ACCOUNT_ISSUES.filter(
    (i) => i.appliesToCategories.length === 0 || i.appliesToCategories.includes(family.category),
  );
  const active = issues.find((i) => i.id === issueId) ?? null;
  const matchingScenario = active ? SCENARIOS.find((s) => s.issueId === active.id) : undefined;

  return (
    <section id="resolve" className={styles.section} aria-labelledby="resolve-h">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Account support</p>
        <h2 id="resolve-h" className={styles.h2}>Open an account case</h2>
        <p className={styles.lede}>
          Every case for a retailer or distributor starts from the exact product and asks only what changes the
          routing or resolution. The system already knows the family, format, category, components, and public
          allergen information.
        </p>

        <div className={styles.path}>
          <div className={styles.pathHead}>
            <h3>Retailer and distributor cases</h3>
          </div>
          <p className={styles.context}>
            About: <strong>{family.name}</strong>
            {variant ? <> · {variant.formatLabel}</> : null} · {CATEGORY_BY_ID[family.category]?.label}
          </p>

          <fieldset className={styles.issues}>
            <legend className={styles.legend}>What&rsquo;s the issue?</legend>
            {issues.map((i) => (
              <label key={i.id} className={i.id === issueId ? `${styles.issue} ${styles.issueOn}` : styles.issue}>
                <input
                  type="radio"
                  name="issue-account"
                  checked={i.id === issueId}
                  onChange={() => setIssueId(i.id)}
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
                  medical advice. It captures the facts and hands the case to the right team.
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

              <ButtonLink
                href="#simulate"
                variant="primary"
                size="sm"
                onClick={() => {
                  if (matchingScenario) dispatch({ type: "SELECT_SCENARIO", scenarioId: matchingScenario.id });
                }}
              >
                {matchingScenario ? "See this resolved" : "Start a case"}
              </ButtonLink>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(e: MouseEvent<HTMLButtonElement>) =>
                  setDialog({ issue: active, trigger: e.currentTarget })
                }
              >
                Submit case
              </Button>
            </div>
          )}
        </div>

        <SectionNote sectionId="resolve" />
      </div>

      {dialog && (
        <InquiryDialog
          channel="account-issue"
          issue={dialog.issue}
          familyId={family.id}
          variantId={state.selectedVariantId}
          mode={state.userMode}
          returnFocusTo={dialog.trigger}
          onClose={() => setDialog(null)}
        />
      )}
    </section>
  );
}
