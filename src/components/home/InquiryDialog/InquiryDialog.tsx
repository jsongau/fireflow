import { useEffect, useId, useRef, type KeyboardEvent, type MouseEvent } from "react";
import { ButtonLink, Button } from "@/components/primitives";
import { FAMILY_BY_ID } from "@/data/families";
import { VARIANT_BY_ID } from "@/data/variants";
import { BRAND_BY_ID } from "@/data/brands";
import type { InquiryChannel, InquiryIssue, Severity, UserMode } from "@/types/domain";
import { playSound } from "@/lib/sound/sound";
import styles from "./InquiryDialog.module.css";

/**
 * InquiryDialog: a local, synthetic submission confirmation.
 *
 * There is no backend. Opening this dialog does NOT send anything anywhere. It
 * demonstrates how a completed inquiry would be recorded and routed through the
 * FireFlow operating model, using only information already in state (the chosen
 * product, format, channel, and issue). It renders a plausible B2B account case
 * for a retailer or distributor. Everything shown is generated in the browser
 * and clearly labelled synthetic.
 *
 * Accessibility: role="dialog", aria-modal, focus trap, Escape to close, focus
 * restored to the trigger on close, body scroll locked while open, motion gated
 * by prefers-reduced-motion.
 */
export interface InquiryDialogProps {
  /** Which path opened the dialog. */
  channel: InquiryChannel;
  /** The issue the visitor selected. */
  issue: InquiryIssue;
  /** Selected product family id (from the store). */
  familyId: string;
  /** Selected variant id, or null when no format is chosen. */
  variantId: string | null;
  /** Current visitor view, used only for a small provenance line. */
  mode: UserMode;
  /** Element focus returns to on close (the trigger button). */
  returnFocusTo: HTMLElement | null;
  /** Close the dialog. */
  onClose: () => void;
}

const ACCOUNT_PRIORITY: Record<Severity, string> = {
  standard: "Standard",
  elevated: "Elevated",
  priority: "High",
  specialist: "Critical",
};

const SLA_TARGET: Record<Severity, string> = {
  standard: "Two business days",
  elevated: "One business day",
  priority: "Same business day",
  specialist: "Within four hours",
};

const MODE_LABEL: Record<UserMode, string> = {
  explore: "Explore",
  retailer: "Retailer account",
  distributor: "Distributor account",
};

const SYNTHETIC_ACCOUNTS = [
  "Great Lakes Grocery Group",
  "Pacific Retail Collective",
  "Summit Foods Distribution",
  "Harbor Market Partners",
  "Cascade Wholesale Co.",
];

const O2C_TEAMS = ["Order Management", "Finance", "Supply Chain", "Logistics"];

/** Stable, non-random 32-bit hash so the same selection always shows the same case. */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

export function InquiryDialog({
  channel,
  issue,
  familyId,
  variantId,
  mode,
  returnFocusTo,
  onClose,
}: InquiryDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  /* Focus into the dialog on open, lock body scroll, and restore both on close. */
  useEffect(() => {
    const restoreTo = returnFocusTo;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialogRef.current)?.focus();
    playSound("modalOpen");
    return () => {
      document.body.style.overflow = prevOverflow;
      restoreTo?.focus?.();
    };
    // Run once for the lifetime of the open dialog; unmount restores focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFocusable = () =>
    Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const list = getFocusable();
    if (list.length === 0) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onOverlayMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const family = FAMILY_BY_ID[familyId] ?? null;
  if (!family) return null;
  const variant = variantId ? VARIANT_BY_ID[variantId] ?? null : null;
  const brand = BRAND_BY_ID[family.brand] ?? null;
  const productLabel = variant ? `${family.name}, ${variant.formatLabel}` : family.name;

  const seed = hashSeed(`${channel}:${familyId}:${variantId ?? "any"}:${issue.id}`);
  const caseRef = `FF-${1000 + (seed % 9000)}`;
  const routing = issue.routeTo.join(", ");
  const hasEvidence = issue.evidenceRequested.length > 0;

  return (
    <div className={styles.overlay} onMouseDown={onOverlayMouseDown}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Case routed</p>
            <h2 id={titleId} className={styles.title}>
              Case created
            </h2>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.lede}>
            This case has been routed through the FireFlow operating model.
          </p>
          <p className={styles.synthNote}>
            Everything below is generated in your browser to show how a completed inquiry would be
            recorded. It is not a real submission.
          </p>
          <p className={styles.lede}>
            In a real CX workflow, this is where the system would preserve the product, evidence, owner,
            severity, and next update. The goal is not only to answer the customer. It is to keep the
            organization aligned while the answer is being worked.
          </p>

          {renderAccountCase()}

          <p className={styles.meta}>
            Generated locally from the {MODE_LABEL[mode]} view.
            {brand ? ` Brand: ${brand.name}.` : null}
          </p>
        </div>

        <div className={styles.actions}>
          <ButtonLink href="#simulate" variant="primary" size="sm" onClick={onClose}>
            Run the resolution simulator
          </ButtonLink>
          <ButtonLink to="/intelligence#command" variant="secondary" size="sm" onClick={onClose}>
            Open the command center
          </ButtonLink>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Start another scenario
          </Button>
        </div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */

  function renderAccountCase() {
    const isO2c = issue.routeTo.some((t) => O2C_TEAMS.includes(t));
    const account = SYNTHETIC_ACCOUNTS[seed % SYNTHETIC_ACCOUNTS.length] ?? "Regional Retail Partner";
    const po = `PO-${480000 + (seed % 20000)}`;
    const invoice = `INV-${90000 + ((seed >>> 3) % 9000)}`;
    const workflow = isO2c ? "Order-to-Cash exception handling" : "Account request intake and routing";
    return (
      <div className={styles.block}>
        <dl className={styles.info}>
          <dt className={styles.term}>Case reference</dt>
          <dd className={styles.desc}>
            <strong>{caseRef}</strong>
          </dd>

          <dt className={styles.term}>Account</dt>
          <dd className={styles.desc}>{account}</dd>

          <dt className={styles.term}>Product</dt>
          <dd className={styles.desc}>
            <strong>{productLabel}</strong>
          </dd>

          <dt className={styles.term}>Order context</dt>
          <dd className={styles.desc}>
            {po}, invoice {invoice}
          </dd>

          <dt className={styles.term}>Issue type</dt>
          <dd className={styles.desc}>{issue.label}</dd>

          <dt className={styles.term}>Priority</dt>
          <dd className={styles.desc}>
            <span className={styles.chip} data-sev={issue.defaultSeverity}>
              {ACCOUNT_PRIORITY[issue.defaultSeverity]}
            </span>
          </dd>

          <dt className={styles.term}>Assigned workflow</dt>
          <dd className={styles.desc}>{workflow}</dd>

          <dt className={styles.term}>Cross-functional partners</dt>
          <dd className={styles.desc}>{routing}</dd>

          <dt className={styles.term}>SLA target</dt>
          <dd className={styles.desc}>{SLA_TARGET[issue.defaultSeverity]}</dd>

          <dt className={styles.term}>Next action</dt>
          <dd className={styles.desc}>
            Customer Experience opens the exception, confirms the order context, and coordinates the
            assigned partners.
          </dd>
        </dl>

        <div>
          <p className={styles.evLabel}>Required documentation</p>
          {hasEvidence ? (
            <ul className={styles.evList}>
              {issue.evidenceRequested.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : (
            <p className={styles.desc}>No supporting documents are required for this request type.</p>
          )}
        </div>

        {issue.requiresSpecialistEscalation && (
          <p className={styles.notice}>
            Quality and Regulatory are engaged because this concerns product or packaging integrity.
            FireFlow captures the facts and routes the case. It does not make a safety determination
            on its own.
          </p>
        )}

        {isO2c && (
          <ButtonLink className={styles.docLink} to="/intelligence#o2c" variant="secondary" size="sm" onClick={onClose}>
            Open the SAP SD order-to-cash chapter
          </ButtonLink>
        )}
      </div>
    );
  }
}
