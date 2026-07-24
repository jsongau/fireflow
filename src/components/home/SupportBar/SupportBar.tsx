import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Link } from "react-router-dom";
import { useHome } from "@/state/homeStore";
import { NoteTeaser } from "@/components/employer/NoteTeaser/NoteTeaser";
// The shared OperatorNote card is still used by the page chapters; the drawer
// now uses the teaser + out-of-drawer panel instead.
import {
  OperatorNotePanel,
  type NoteLine,
  type OperatorNoteContent,
} from "@/components/employer/OperatorNotePanel/OperatorNotePanel";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { GlossaryTerm } from "@/components/primitives/GlossaryTerm";
import { CaseEmail, resolutionPhrase } from "./CaseEmail";
import { EscalationTrace } from "./EscalationTrace";
import { evaluateEscalation } from "@/data/escalation";
import { LAST_STAGE } from "@/data/caseBoard";
import { KPI_GLOSSARY, SAP_GLOSSARY, EDI_GLOSSARY } from "@/data/glossary";
import { playSound } from "@/lib/sound/sound";
import {
  ROLES,
  ROLE_LABEL,
  ACCOUNT_TYPE,
  FIELD_SETS,
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  PRIORITY_TARGET,
  PRODUCT_FIELDS,
  REFERENCE_FIELDS,
  categoriesForRole,
  isAccountRole,
  CHANNEL_LABEL,
  CHANNEL_ORDER,
  SAP_OBJECT,
  EDI_REF,
  O2C_LINK,
  DEDUCTION_CATEGORIES,
  DEDUCTION_TYPES,
  VALIDITY_LABEL,
  VALIDITY_GLYPH,
  type ChannelId,
  type CategoryDef,
  type FieldDef,
  type PriorityId,
  type RoleId,
} from "./intake";
import styles from "./SupportBar.module.css";

/**
 * Account Support Intake — a compact floating SOP flow.
 *
 * A labeled FAB pinned bottom-right expands into a multi-step drawer that turns
 * a support request into a governed case: who you are, what you need, the right
 * details, an internal-style routing summary, and a confirmation with a mock
 * case reference. It demonstrates structured intake, categorization, priority,
 * cross-functional routing, and the service metric each case affects.
 *
 * There is no backend. Nothing is transmitted. Every value is generated in the
 * browser and labeled synthetic. Accessibility: role="dialog", aria-modal, focus
 * trap, Escape to close, focus restored to the FAB, body scroll locked while
 * open, motion gated by prefers-reduced-motion, and priority shown with a glyph
 * and word so it never relies on color alone.
 */

type Step = 0 | 1 | 2 | 3 | 4;

const STEP_LABELS = ["Role", "Category", "Details", "Routing", "Done"] as const;

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

const PRIORITY_GLYPH: Record<PriorityId, string> = {
  standard: "○", // circle
  elevated: "◆", // diamond
  high: "▲", // triangle
  critical: "⚠", // warning
};

/** Stable 32-bit hash so the same case always yields the same reference. */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function SupportBar() {
  const { state, dispatch } = useHome();
  const titleId = useId();
  const notePanelId = useId();

  /* Enough room to show the note beside the drawer instead of inside it. */
  const wideEnoughForPanel = useMediaQuery("(min-width: 1100px)");

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [role, setRole] = useState<RoleId | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [priority, setPriority] = useState<PriorityId>("standard");
  const [channel, setChannel] = useState<ChannelId>("edi");
  const [deductionTypeId, setDeductionTypeId] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(true);

  const fabRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const teaserRef = useRef<HTMLButtonElement | null>(null);

  const category: CategoryDef | null = useMemo(() => {
    if (!role || !categoryId) return null;
    return categoriesForRole(role).find((c) => c.id === categoryId) ?? null;
  }, [role, categoryId]);

  const fields: FieldDef[] = category ? FIELD_SETS[category.fieldSet] : [];

  /* Wave B derived context: SAP object, EDI document, deduction sub-flow. */
  const sapObject = category ? SAP_OBJECT[category.id] : undefined;
  const ediRef = category ? EDI_REF[category.id] : undefined;
  const showO2c = category ? O2C_LINK.has(category.id) : false;
  const isDeduction = category ? DEDUCTION_CATEGORIES.has(category.id) : false;
  const showChannel = role ? isAccountRole(role) : false;
  const deductionType = deductionTypeId
    ? DEDUCTION_TYPES.find((d) => d.id === deductionTypeId) ?? null
    : null;

  /* The escalation standard, evaluated against this case and the live board.

     `casesAffected` uses whatever the form actually captured: a short-ship form
     gives ordered minus received, an order form gives the case quantity outright.
     When neither is present the reship rule is not evaluated rather than guessed
     at, because a rule that fires on an assumed number is worse than one that
     stays quiet.

     `priorInCategory` counts OPEN cases already on the ops board in the same
     category, so filing a third one can trip the pattern rule in front of you.
     That is the point of categorized intake, and it is why the rule reads live
     state rather than a hardcoded count. */
  const escalation = useMemo(() => {
    if (!category) return null;

    /* `Number("")` is 0, not NaN. Reading a blank "received" field as zero
       received would turn an unfilled form into a total loss of the shipment and
       demand a manager's authority for it. Both fields must actually be filled
       before the subtraction means anything. Nothing is required on this form, so
       an empty field is the normal case, not an edge case. */
    const orderedRaw = values.orderedQty?.trim();
    const receivedRaw = values.receivedQty?.trim();
    const flatRaw = values.qty?.trim();

    let casesAffected: number | null = null;
    if (orderedRaw && receivedRaw) {
      const ordered = Number(orderedRaw);
      const received = Number(receivedRaw);
      if (Number.isFinite(ordered) && Number.isFinite(received) && ordered > received) {
        casesAffected = ordered - received;
      }
    } else if (flatRaw) {
      const flat = Number(flatRaw);
      if (Number.isFinite(flat) && flat > 0) casesAffected = flat;
    }

    const priorInCategory = state.routedCases.filter(
      (c) => c.categoryId === category.id && c.stageIndex < LAST_STAGE,
    ).length;

    return evaluateEscalation({
      category,
      priority,
      casesAffected,
      deductionLabel: deductionType?.label ?? null,
      deductionWindow: deductionType?.window ?? null,
      priorInCategory,
    });
    /* Scoped to the three fields the rules actually read, so typing an email
       address does not re-run the escalation check on every keystroke. */
  }, [
    category,
    priority,
    values.orderedQty,
    values.receivedQty,
    values.qty,
    deductionType,
    state.routedCases,
  ]);

  /**
   * The single source of truth for Nathan's Notes. The teaser shows the hook;
   * the panel shows every line. Content deepens as the case gains context (the
   * SAP object, the service target, the deduction root cause).
   */
  const noteContent: OperatorNoteContent | null = useMemo(() => {
    if (!category || step === 0) return null;
    const target = PRIORITY_TARGET[priority];

    /* On the confirmation step the artifact worth explaining is the email. */
    if (step === 4) {
      return {
        title: "Why the email reads this way",
        caseLabel: category.label,
        hook: "The acknowledgment is where the account learns whether this case is being managed or merely filed.",
        lines: [
          {
            label: "Name the owner.",
            text: `The account is told that ${category.owner} holds the determination. A person, not a queue, so the review is visible to them instead of a black box.`,
          },
          {
            label: "Commit to a date.",
            text: `The email gives a date for the next update, ${resolutionPhrase(
              target.resolve,
            )}, and commits to telling them before that date is missed rather than after.`,
          },
          {
            label: "Do not make them chase.",
            text: "No line asks the account to follow up if they hear nothing. If the review goes quiet, catching that is my job, not theirs. Chasing a vendor is unpaid work for a customer who has already lost something.",
          },
          {
            label: "Say the hard part early.",
            text: "If the answer is going to be no, or late, they hear it the day I know. A buyer can move a promotion or brief their own manager around a delay they were told about. Nobody can plan around silence.",
          },
          {
            label: "Leave the door open.",
            text: "The invitation to contact me is there for anything else they need. It is not how this case gets an answer.",
          },
        ],
        roleFit: "Manager, Customer Experience",
      };
    }

    const lines: NoteLine[] = [
      {
        text: `I pre-filled this with a sample ${category.caseType.toLowerCase()} so you can walk the flow without typing. Every field is editable.`,
      },
      { label: "Likely scenario.", text: category.scenario },
      {
        label: "Fix it upstream.",
        text: deductionType ? deductionType.rootCause : category.rootCause,
      },
      { label: "Handle the customer.", text: category.handling },
      {
        label: "Service target.",
        text: `Acknowledge within ${target.ack}. Resolve by ${target.resolve.toLowerCase()}.`,
      },
    ];

    if (sapObject) {
      lines.push({
        label: "In SAP SD (aligned).",
        text: (
          <>
            {sapObject.label}
            {sapObject.ref ? (
              <>
                {", "}
                <SapTerm refName={sapObject.ref} />
              </>
            ) : null}
          </>
        ),
      });
    }

    if (deductionType) {
      lines.push({
        label: "Before the window closes.",
        text: `${deductionType.window} Backup needed: ${deductionType.backup.join(", ")}.`,
      });
    }

    /* Route ownership of the determination. Retain ownership of the case. */
    if (category.owner !== "Customer Experience") {
      lines.push({
        label: "Handoff.",
        text: `${category.owner} owns the investigation and the determination. I submit the findings and the evidence file, not instructions on how to work it. Their call is their call.`,
      });
    }

    lines.push({
      label: "Close the loop.",
      text: "The case stays mine until it is closed. I confirm to the account that it is submitted, name the date they will hear back, and chase the update myself. The customer never has to follow up to find out what happened.",
    });

    lines.push({
      label: "What this costs them.",
      text: "Behind this case is a person who has to explain the gap to someone above them. They are not waiting on a resolution. They are waiting on something they can say with confidence today.",
    });

    return {
      title: "How I'd handle this case",
      caseLabel: category.label,
      hook: category.scenario,
      lines,
      roleFit: "Manager, Customer Experience",
    };
  }, [category, step, priority, deductionType, sapObject]);

  const caseRef = useMemo(() => {
    if (!role || !category) return "FF-0000";
    const seed = hashSeed(`${role}:${category.id}:${values.email ?? ""}:${values.description ?? ""}`);
    return `FF-${1000 + (seed % 9000)}`;
  }, [role, category, values.email, values.description]);

  /* Focus into the drawer on open; restore to the FAB on close. Lock scroll. */
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panelRef.current)?.focus();
    playSound("modalOpen");
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const resetFlow = () => {
    setStep(0);
    setRole(null);
    setCategoryId(null);
    setValues({});
    setPriority("standard");
    setChannel("edi");
    setDeductionTypeId(null);
    setNoteOpen(true);
  };

  /* Collapse the note back to the teaser and return focus to it. */
  const closeNote = () => {
    setNoteOpen(false);
    teaserRef.current?.focus();
  };

  const openDrawer = () => {
    resetFlow();
    setOpen(true);
  };

  const closeDrawer = () => {
    setOpen(false);
    fabRef.current?.focus();
  };

  /* Close without stealing focus back to the FAB, so an in-page anchor can land. */
  const closeForJump = () => setOpen(false);

  const getFocusable = () =>
    Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      // Escape collapses the out-of-drawer note first, then closes the drawer.
      if (noteContent && noteOpen && wideEnoughForPanel) {
        closeNote();
        return;
      }
      closeDrawer();
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
    if (e.target === e.currentTarget) closeDrawer();
  };

  const pickRole = (r: RoleId) => {
    setRole(r);
    setCategoryId(null);
    setValues({});
    playSound("select");
    setStep(1);
  };

  const pickCategory = (c: CategoryDef) => {
    setCategoryId(c.id);
    setPriority(c.priority);
    setDeductionTypeId(DEDUCTION_CATEGORIES.has(c.id) ? DEDUCTION_TYPES[0]?.id ?? null : null);
    // The Details step has the longest form, so the note starts collapsed there.
    setNoteOpen(false);
    // Pre-fill with the category's synthetic sample so the flow can be tested
    // without typing. Every field stays editable. Nothing is required.
    setValues({ ...c.prefill });
    playSound("select");
    setStep(2);
  };

  const setValue = (name: string, v: string) => {
    setValues((prev) => ({ ...prev, [name]: v }));
  };

  const goToSummary = () => {
    playSound("stageAdvance");
    setNoteOpen(true);
    setStep(3);
  };

  const submitCase = () => {
    playSound("modalComplete");
    // The case does not evaporate. It lands on the live board in the Resolution
    // Simulator, carrying the owner, SAP object, priority, and service target.
    if (role && category) {
      dispatch({
        type: "ROUTE_CASE",
        routedCase: {
          id: caseRef,
          createdAt: Date.now(),
          role,
          categoryId: category.id,
          priority,
          channel,
          deductionTypeId: deductionTypeId ?? null,
          stageIndex: 0,
          // The reducer re-stamps both on route (order places the card at the top
          // of its column, enteredStageAt is the stage clock). Seed sane values.
          enteredStageAt: Date.now(),
          order: 0,
          account: values.account,
          product: affectedProduct,
          orderRef,
        },
      });
    }
    setStep(4);
  };

  /* ---- Derived summary values ------------------------------------------ */
  const affectedProduct =
    PRODUCT_FIELDS.map((k) => values[k]).find((v) => v && v.trim()) ?? "Not specified";
  const orderRef =
    REFERENCE_FIELDS.map((k) => (values[k] ? `${values[k]}` : "")).filter(Boolean).join(", ") ||
    "Not provided";
  const missingQty =
    values.orderedQty && values.receivedQty
      ? String(Math.max(0, Number(values.orderedQty) - Number(values.receivedQty)))
      : null;

  const stepIndex = step;

  return (
    <div className={styles.root}>
      {open && (
        <div
          ref={panelRef}
          className={styles.overlay}
          onMouseDown={onOverlayMouseDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={onKeyDown}
        >
          <div className={styles.drawer}>
            {/* Header */}
            <div className={styles.head}>
              <div>
                <p className={styles.eyebrow}>Account Support Intake</p>
                <h2 id={titleId} className={styles.title}>
                  {step === 4 ? "Support case routed" : "Open an Account Support Case"}
                </h2>
                {step < 4 && (
                  <p className={styles.subtitle}>
                    Choose the issue type and we&rsquo;ll route the case with the right details,
                    priority, and next step.
                  </p>
                )}
              </div>
              <button
                type="button"
                className={styles.close}
                onClick={closeDrawer}
                aria-label="Close support case"
              >
                &times;
              </button>
            </div>

            {/* Step progress */}
            {step < 4 && (
              <ol className={styles.progress} aria-label="Intake progress">
                {STEP_LABELS.slice(0, 4).map((label, i) => {
                  const done = i < stepIndex;
                  const current = i === stepIndex;
                  return (
                    <li
                      key={label}
                      className={styles.progressItem}
                      data-state={done ? "done" : current ? "current" : "todo"}
                      aria-current={current ? "step" : undefined}
                    >
                      <span className={styles.progressDot} aria-hidden="true">
                        {done ? "✓" : i + 1}
                      </span>
                      <span className={styles.progressLabel}>{label}</span>
                    </li>
                  );
                })}
              </ol>
            )}

            {/* Body */}
            <div className={styles.body}>
              {/* STEP 1 — Role */}
              {step === 0 && (
                <section className={styles.section} aria-label="Who are you">
                  <p className={styles.prompt}>Who are you?</p>
                  <p className={styles.hint}>This helps route the case to the right support path.</p>
                  <div className={styles.cardGrid}>
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className={styles.card}
                        aria-pressed={role === r.id}
                        onClick={() => pickRole(r.id)}
                      >
                        <span className={styles.cardTitle}>{r.label}</span>
                        <span className={styles.cardBlurb}>{r.blurb}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* STEP 2 — Category */}
              {step === 1 && role && (
                <section className={styles.section} aria-label="What do you need help with">
                  <p className={styles.prompt}>What do you need help with?</p>
                  <p className={styles.hint}>
                    Paths shown for a <strong>{ROLE_LABEL[role]}</strong>. Each maps to an owner and a
                    service metric.
                  </p>
                  <div className={styles.pillGrid}>
                    {categoriesForRole(role).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={styles.pill}
                        aria-pressed={categoryId === c.id}
                        onClick={() => pickCategory(c)}
                      >
                        <span className={styles.pillText}>
                          <span className={styles.pillSop}>{c.sop}</span>
                          <span className={styles.pillLabel}>{c.label}</span>
                        </span>
                        <span className={styles.pillMeta} data-prio={c.priority}>
                          <span className={styles.pillPrio}>
                            <span aria-hidden="true">{PRIORITY_GLYPH[c.priority]}</span>
                            {PRIORITY_LABEL[c.priority]}
                          </span>
                          <span className={styles.pillSla}>
                            Resolve {PRIORITY_TARGET[c.priority].resolve.toLowerCase()}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* STEP 3 — Details */}
              {step === 2 && category && (
                <section className={styles.section} aria-label="Case details">
                  <p className={styles.prompt}>{category.label}</p>
                  <p className={styles.hint}>
                    Case type: <strong>{category.caseType}</strong>. Pre-filled with a sample so you can
                    test the flow. Edit anything. Nothing is required.
                  </p>
                  <div className={styles.form}>
                    {fields.map((f) => (
                      <label
                        key={f.name}
                        className={
                          f.type === "textarea" ? `${styles.field} ${styles.fieldWide}` : styles.field
                        }
                      >
                        <span className={styles.fieldLabel}>
                          {f.label}
                          {f.optional && <span className={styles.optional}> (optional)</span>}
                        </span>
                        {f.type === "textarea" ? (
                          <textarea
                            className={styles.textarea}
                            rows={3}
                            placeholder={f.placeholder}
                            value={values[f.name] ?? ""}
                            onChange={(e) => setValue(f.name, e.target.value)}
                          />
                        ) : f.type === "file" ? (
                          <span className={styles.fileStub}>
                            Attachments are not enabled here.
                          </span>
                        ) : (
                          <input
                            className={styles.input}
                            type={f.type}
                            placeholder={f.placeholder}
                            value={values[f.name] ?? ""}
                            onChange={(e) => setValue(f.name, e.target.value)}
                          />
                        )}
                      </label>
                    ))}

                    {missingQty !== null && (
                      <div className={`${styles.field} ${styles.fieldWide}`}>
                        <span className={styles.fieldLabel}>Missing quantity (calculated)</span>
                        <span className={styles.computed}>{missingQty} cases</span>
                      </div>
                    )}
                  </div>

                  {/* Urgency override for order and generic sets */}
                  {(category.fieldSet === "order" || category.fieldSet === "generic") && (
                    <div className={styles.urgency}>
                      <span className={styles.fieldLabel}>Urgency level</span>
                      <div className={styles.prioRow} role="group" aria-label="Urgency level">
                        {PRIORITY_ORDER.map((p) => (
                          <button
                            key={p}
                            type="button"
                            className={styles.prioBtn}
                            data-prio={p}
                            aria-pressed={priority === p}
                            onClick={() => setPriority(p)}
                          >
                            <span aria-hidden="true">{PRIORITY_GLYPH[p]}</span>
                            {PRIORITY_LABEL[p]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order channel (account roles): how this case actually arrived. */}
                  {showChannel && (
                    <div className={styles.urgency}>
                      <span className={styles.fieldLabel}>Order channel</span>
                      <div className={styles.optRow} role="group" aria-label="Order channel">
                        {CHANNEL_ORDER.map((c) => {
                          const on = channel === c;
                          return (
                            <button
                              key={c}
                              type="button"
                              className={styles.optBtn}
                              aria-pressed={on}
                              onClick={() => setChannel(c)}
                            >
                              {on && <span aria-hidden="true">✓</span>}
                              {CHANNEL_LABEL[c]}
                            </button>
                          );
                        })}
                      </div>
                      {channel === "edi" && ediRef && (
                        <p className={styles.docLine}>
                          Document in play: <EdiTerm doc={ediRef} />
                        </p>
                      )}
                    </div>
                  )}

                  {/* Deduction sub-flow: type drives validity, window, and backup. */}
                  {isDeduction && (
                    <div className={styles.urgency}>
                      <span className={styles.fieldLabel}>Deduction type</span>
                      <div className={styles.optRow} role="group" aria-label="Deduction type">
                        {DEDUCTION_TYPES.map((d) => {
                          const on = deductionTypeId === d.id;
                          return (
                            <button
                              key={d.id}
                              type="button"
                              className={styles.optBtn}
                              aria-pressed={on}
                              onClick={() => setDeductionTypeId(d.id)}
                            >
                              {on && <span aria-hidden="true">✓</span>}
                              {d.label}
                            </button>
                          );
                        })}
                      </div>

                      {deductionType && (
                        <div className={styles.dedPanel}>
                          <p className={styles.dedLine}>
                            <span className={styles.valChip} data-v={deductionType.validity}>
                              <span aria-hidden="true">{VALIDITY_GLYPH[deductionType.validity]}</span>
                              {VALIDITY_LABEL[deductionType.validity]}
                            </span>
                          </p>
                          <p className={styles.dedLine}>
                            <strong>Validated by</strong> {deductionType.validatedBy}
                          </p>
                          <p className={styles.dedLine}>
                            <strong>Dispute window</strong> {deductionType.window} Tracked against{" "}
                            <MetricValue metric="Deduction Aging" />.
                          </p>
                          <div>
                            <span className={styles.fieldLabel}>Backup required to dispute</span>
                            <ul className={styles.checklist}>
                              {deductionType.backup.map((b) => (
                                <li key={b}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* STEP 4 — Routing summary */}
              {step === 3 && role && category && (
                <section className={styles.section} aria-label="Routing summary">
                  <p className={styles.prompt}>Review the case routing</p>
                  <p className={styles.hint}>
                    This is the internal-style summary a representative would receive. Confirm to route
                    it.
                  </p>
                  <div className={styles.summary}>
                    <SummaryRow label="Governing procedure" value={category.sop} />
                    <SummaryRow label="Case type" value={category.caseType} />
                    <SummaryRow label="Account type" value={ACCOUNT_TYPE[role]} />
                    <SummaryRow
                      label="Priority"
                      value={
                        <span className={styles.prioChip} data-prio={priority}>
                          <span aria-hidden="true">{PRIORITY_GLYPH[priority]}</span>
                          {PRIORITY_LABEL[priority]}
                        </span>
                      }
                    />
                    <SummaryRow label="Acknowledge target" value={PRIORITY_TARGET[priority].ack} />
                    <SummaryRow label="Resolution target" value={PRIORITY_TARGET[priority].resolve} />
                    <SummaryRow label="Affected product" value={affectedProduct} />
                    <SummaryRow label="Order / invoice reference" value={orderRef} />
                    {showChannel && (
                      <SummaryRow
                        label="Order channel"
                        value={
                          channel === "edi" && ediRef ? (
                            <span>
                              EDI, <EdiTerm doc={ediRef} />
                            </span>
                          ) : (
                            CHANNEL_LABEL[channel]
                          )
                        }
                      />
                    )}
                    {sapObject && (
                      <SummaryRow
                        label="SAP SD object (aligned)"
                        value={
                          <span>
                            {sapObject.label}
                            {sapObject.ref ? (
                              <>
                                {", "}
                                <SapTerm refName={sapObject.ref} />
                              </>
                            ) : null}
                          </span>
                        }
                      />
                    )}
                    <SummaryRow label="Internal owner" value={category.owner} />
                    <SummaryRow
                      label="Supporting teams"
                      value={
                        category.supporting.length ? category.supporting.join(", ") : "None required"
                      }
                    />
                    {deductionType && (
                      <>
                        <SummaryRow label="Deduction type" value={deductionType.label} />
                        <SummaryRow
                          label="Typical validity"
                          value={
                            <span className={styles.valChip} data-v={deductionType.validity}>
                              <span aria-hidden="true">{VALIDITY_GLYPH[deductionType.validity]}</span>
                              {VALIDITY_LABEL[deductionType.validity]}
                            </span>
                          }
                        />
                        <SummaryRow label="Dispute window" value={deductionType.window} />
                        <SummaryRow label="Backup required" value={deductionType.backup.join(", ")} />
                      </>
                    )}
                    <SummaryRow label="Service metric affected" value={<MetricValue metric={category.metric} />} />
                    <SummaryRow label="Next action" value={category.nextAction} />
                  </div>

                  {/* The standard, executing. Shown after the summary because the
                      summary says where the case went and this says why. */}
                  {escalation && <EscalationTrace verdict={escalation} />}

                  <p className={styles.synthNote}>
                    Routing and service-level design. SAP SD references are an aligned
                    workflow study, not a live system.
                  </p>
                  {showO2c && (
                    <Link to="/intelligence#o2c" className={styles.o2cLink} onClick={closeForJump}>
                      Open the order-to-cash chapter
                    </Link>
                  )}
                </section>
              )}

              {/* STEP 5 — Confirmation */}
              {step === 4 && role && category && (
                <section className={styles.section} aria-label="Confirmation">
                  <div className={styles.confirmMark} aria-hidden="true">
                    &#10003;
                  </div>
                  <p className={styles.confirmTitle}>Thank you. Your support case has been routed.</p>
                  <p className={styles.confirmBody}>
                    A representative will contact you shortly with the next step.
                  </p>
                  <div className={styles.summary}>
                    <SummaryRow
                      label="Case reference"
                      value={
                        <span>
                          <strong>{caseRef}</strong>
                        </span>
                      }
                    />
                    <SummaryRow label="Selected path" value={`${ROLE_LABEL[role]}, ${category.label}`} />
                    <SummaryRow
                      label="Priority"
                      value={
                        <span className={styles.prioChip} data-prio={priority}>
                          <span aria-hidden="true">{PRIORITY_GLYPH[priority]}</span>
                          {PRIORITY_LABEL[priority]}
                        </span>
                      }
                    />
                    <SummaryRow
                      label="Service target"
                      value={`Acknowledge within ${PRIORITY_TARGET[priority].ack}. Resolve by ${PRIORITY_TARGET[
                        priority
                      ].resolve.toLowerCase()}.`}
                    />
                    <SummaryRow label="Expected next action" value={category.nextAction} />
                    <SummaryRow label="Internal owner" value={category.owner} />
                  </div>

                  <Link to="/support#simulate" className={styles.o2cLink} onClick={closeForJump}>
                    Work this case in the Resolution Simulator
                  </Link>

                  <CaseEmail
                    caseRef={caseRef}
                    accountName={values.account ?? ""}
                    contactName={values.contact ?? ""}
                    categoryLabel={category.label}
                    owner={category.owner}
                    nextAction={category.nextAction}
                    priorityLabel={PRIORITY_LABEL[priority]}
                    resolveTarget={PRIORITY_TARGET[priority].resolve}
                    concern={values.description ?? values.notes ?? ""}
                    reviewScope={
                      deductionType
                        ? "the backup, order details, and remittance documentation"
                        : "the order detail and supporting documentation"
                    }
                  />
                </section>
              )}

            </div>

            {/* Fourth wall: a compact teaser here, the full reading outside the drawer. */}
            {noteContent && (
              <div className={styles.noteDock}>
                <NoteTeaser
                  ref={teaserRef}
                  hook={noteContent.hook}
                  open={noteOpen}
                  onToggle={() => (noteOpen ? closeNote() : setNoteOpen(true))}
                  panelId={notePanelId}
                />
                {/* No room for a left panel on narrow screens: expand in place. */}
                {noteOpen && !wideEnoughForPanel && (
                  <OperatorNotePanel
                    content={noteContent}
                    id={notePanelId}
                    onClose={closeNote}
                    inline
                  />
                )}
              </div>
            )}

            {/* Footer actions */}
            <div className={styles.actions}>
              {step === 0 && (
                <button type="button" className={styles.ghostBtn} onClick={closeDrawer}>
                  Close
                </button>
              )}
              {step === 1 && (
                <button type="button" className={styles.ghostBtn} onClick={() => setStep(0)}>
                  Back
                </button>
              )}
              {step === 2 && (
                <>
                  <button type="button" className={styles.ghostBtn} onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button type="button" className={styles.primaryBtn} onClick={goToSummary}>
                    Next
                  </button>
                </>
              )}
              {step === 3 && (
                <>
                  <button type="button" className={styles.ghostBtn} onClick={() => setStep(2)}>
                    Back
                  </button>
                  <button type="button" className={styles.primaryBtn} onClick={submitCase}>
                    Route this case
                  </button>
                </>
              )}
              {step === 4 && (
                <>
                  <button type="button" className={styles.ghostBtn} onClick={resetFlow}>
                    Start another case
                  </button>
                  <button type="button" className={styles.primaryBtn} onClick={closeDrawer}>
                    Done
                  </button>
                </>
              )}
            </div>
          </div>

          {/* The full note lives OUTSIDE the support box, anchored left, so the
              commentary is visibly separate from the product. */}
          {noteContent && noteOpen && wideEnoughForPanel && (
            <OperatorNotePanel content={noteContent} id={notePanelId} onClose={closeNote} />
          )}
        </div>
      )}

      <button
        ref={fabRef}
        type="button"
        className={styles.fab}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => (open ? closeDrawer() : openDrawer())}
      >
        Open a support case
      </button>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles.sumRow}>
      <span className={styles.sumLabel}>{label}</span>
      <span className={styles.sumValue}>{value}</span>
    </div>
  );
}

/** Render a service metric as a hoverable glossary term when a definition exists. */
function MetricValue({ metric }: { metric: string }) {
  const entry = KPI_GLOSSARY[metric];
  if (!entry) return <>{metric}</>;
  return <GlossaryTerm term={metric} definition={entry.short} />;
}

/** Render an SAP SD reference (transaction or object) as a hoverable term. */
function SapTerm({ refName }: { refName: string }) {
  const entry = SAP_GLOSSARY[refName];
  if (!entry) return <>{refName}</>;
  return <GlossaryTerm term={refName} definition={entry.short} />;
}

/** Render an EDI document reference as a hoverable term. */
function EdiTerm({ doc }: { doc: string }) {
  const entry = EDI_GLOSSARY[doc];
  if (!entry) return <>{doc}</>;
  return <GlossaryTerm term={doc} definition={entry.short} />;
}
