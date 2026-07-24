import { useState } from "react";
import styles from "./CaseEmail.module.css";

/**
 * CaseEmail — the acknowledgment Customer Experience sends the moment a case is
 * routed.
 *
 * It exists to show the service posture, not just the workflow: the concern is
 * documented as reported, the owning team is named, the account is told no
 * further action is needed, a date is committed, and Customer Experience monitors
 * the case through resolution. The account is never asked to chase an answer.
 *
 * This is a draft rendered in the browser. Nothing is sent anywhere.
 */

export interface CaseEmailProps {
  caseRef: string;
  accountName: string;
  contactName: string;
  categoryLabel: string;
  /** Team that owns the investigation and the determination. */
  owner: string;
  nextAction: string;
  priorityLabel: string;
  /** Resolution target, e.g. "Same business day". */
  resolveTarget: string;
  /** What the requester described, if they gave us anything. */
  concern: string;
  /** What the owning team will validate, e.g. "the backup, order details, and remittance documentation". */
  reviewScope: string;
}

const CX = "Customer Experience";

function firstName(full: string): string {
  const first = full.trim().split(/\s+/)[0];
  return first && first.length > 0 ? first : "there";
}

/** "Same business day" reads as "by the same business day"; others take "within". */
export function resolutionPhrase(resolveTarget: string): string {
  const t = resolveTarget.trim();
  if (/^same/i.test(t)) return `by the ${t.toLowerCase()}`;
  return `within ${t.toLowerCase()}`;
}

/** Lowercase the first character so a sentence can follow "Finance will ...". */
function lowerFirst(s: string): string {
  return s.length > 0 ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

function buildEmail(p: CaseEmailProps): { subject: string; paragraphs: string[] } {
  const account = p.accountName.trim() || "your team";
  const subject = `Case ${p.caseRef}: ${p.categoryLabel} for ${account}`;
  const target = resolutionPhrase(p.resolveTarget);
  const ownerIsCx = p.owner === CX;

  const documented = p.concern.trim()
    ? `We have documented your concern exactly as reported: ${p.concern.trim()}`
    : `We have documented your concern exactly as reported.`;

  const reviewing = ownerIsCx
    ? `I am reviewing this personally and will validate ${p.reviewScope}. The case is moving forward and no additional action is needed from you at this time.`
    : `Our ${p.owner} team is reviewing it now and will validate ${p.reviewScope}. I have already shared the supporting information with the appropriate team, so the case is moving forward and no additional action is needed from you at this time.`;

  const nextParty = ownerIsCx ? "I" : `${p.owner}`;

  const paragraphs: string[] = [
    `Hi ${firstName(p.contactName)},`,
    `Thank you for bringing this to our attention.`,
    `Your case has been opened as Case ${p.caseRef} and marked ${p.priorityLabel.toLowerCase()} priority. ${documented}`,
    reviewing,
    `Here is what happens next:`,
    `${nextParty} will ${lowerFirst(p.nextAction)} I will monitor the case through resolution and follow up with you ${target} with an update. If the review requires additional time, I will let you know before that deadline so you are not left waiting.`,
    `Thank you for your partnership and for giving us the opportunity to review this properly.`,
    `Best,`,
    `Nathan J. Song`,
    CX,
  ];

  return { subject, paragraphs };
}

export function CaseEmail(props: CaseEmailProps) {
  const [copied, setCopied] = useState(false);
  const { subject, paragraphs } = buildEmail(props);

  const copy = async () => {
    const plain = `Subject: ${subject}\n\n${paragraphs.join("\n\n")}`;
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard unavailable (permissions, insecure context). Stay silent:
      // the draft is fully readable on screen either way.
    }
  };

  return (
    <section className={styles.wrap} aria-label="Customer acknowledgment email draft">
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Customer acknowledgment</p>
          <p className={styles.title}>The email that goes out now</p>
        </div>
        <button type="button" className={styles.copy} onClick={copy}>
          {copied ? (
            <>
              <span aria-hidden="true">&#10003;</span> Copied
            </>
          ) : (
            "Copy email"
          )}
        </button>
      </div>

      <div className={styles.envelope}>
        <p className={styles.meta}>
          <span className={styles.metaLabel}>To</span>
          {props.accountName.trim() || "The account"}
        </p>
        <p className={styles.meta}>
          <span className={styles.metaLabel}>Subject</span>
          {subject}
        </p>

        <div className={styles.body}>
          {paragraphs.map((line, i) => (
            <p key={i} className={styles.line}>
              {line}
            </p>
          ))}
        </div>
      </div>

      <p className={styles.synth}>
        Draft only. Nothing is sent.
      </p>
    </section>
  );
}
