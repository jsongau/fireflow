import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import {
  LIFECYCLE,
  deriveCase,
  followUpsFor,
  formatAge,
  handlingLabel,
  isRoutedOut,
  initialsFor,
  type DerivedCase,
  type RoutedCase,
  type StageKey,
} from "@/data/caseBoard";
import { TEAM_BY_ID } from "@/data/team";
import { useSpotlight } from "@/hooks/useSpotlight";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./FeaturedCase.module.css";

/**
 * FeaturedCase — the one case, told end to end, above the board.
 *
 * A visitor arriving from the homepage teaser has never seen a kanban board of
 * synthetic deductions. Fourteen cards tell them nothing. One case, walked from
 * the report that opened it to the review that prevents the next one, tells them
 * what the board is for. Then the board makes sense.
 *
 * Every value here is DERIVED, never retyped: the stage count comes from
 * LIFECYCLE, the owner and metric from deriveCase, the initials and timestamps
 * from the case's own audit trail, and the closing actions from followUpsFor.
 * The panel and the board cannot disagree, because there is one source.
 *
 * State is carried by a word and a glyph (Done ✓, Now ●, Next ○), never by color.
 */

export interface FeaturedCaseProps {
  featured: RoutedCase;
  /**
   * Opens the full case modal, the same dialog a board card opens. The trigger is
   * passed so focus returns here on close rather than to a board card that may be
   * filtered out of view.
   */
  onOpen: (id: string, trigger: HTMLElement | null) => void;
}

/** What was done at a stage the case has already passed. Past tense, names the function. */
const DONE_GLOSS: Record<StageKey, (d: DerivedCase) => string> = {
  reported: (d) =>
    `Customer Experience logged the exception ${d.account} raised through ${d.channelLabel.toLowerCase()} and opened the case against ${d.orderRef}.`,
  "in-progress": (d) =>
    isRoutedOut(d)
      ? `Customer Experience acknowledged the account, then handed the investigation to ${d.category.owner} while keeping the account and the next update.`
      : "Customer Experience acknowledged the account and kept the case. Small enough to research and close without a handoff.",
  verified: (d) =>
    `Customer Experience confirmed the account, the product, and the reference${d.ediRef ? ` against the ${d.ediRef}` : ""}, holding the gap as a checked fact rather than an assumption.`,
  "resolution-proposed": (d) =>
    `${d.category.owner} drafted the recovery and cleared approval before anything was promised to the account.`,
  resolved: () =>
    "A team lead signed off the close. The account was told in writing, and the corrective action was logged so the case does not return.",
};

/** What will happen at a stage the case has not reached. Names who acts and what the account feels. */
const NEXT_GLOSS: Record<StageKey, (d: DerivedCase) => string> = {
  reported: () => "The exception is logged and waits for someone to pick it up.",
  "in-progress": (d) =>
    isRoutedOut(d)
      ? `A rep will acknowledge the account and route the investigation to ${d.category.owner}, who owns the determination. Customer Experience keeps the account.`
      : "A rep will acknowledge the account and hold the case. Nothing here needs another function, so nothing waits in another queue.",
  verified: () => "The facts get separated from the assumptions before anyone commits to an answer.",
  "resolution-proposed": (d) =>
    `${d.category.owner} will write the recovery, and it clears approval before anyone commits, so the account is never told a recovery that later gets walked back. Then Customer Experience gives them the date, acknowledged ${d.ack.toLowerCase()} and answered ${d.resolve.toLowerCase()}.`,
  resolved: (d) =>
    `A team lead signs off the close, not the person who did the work. The account is confirmed in writing, the corrective action is logged, and the fix is measured against ${d.category.metric}.`,
};

const GLYPH: Record<"done" | "now" | "next", string> = { done: "✓", now: "●", next: "○" };
const WORD: Record<"done" | "now" | "next", string> = { done: "Done", now: "Now", next: "Next" };

export function FeaturedCase({ featured, onOpen }: FeaturedCaseProps) {
  const reduced = useReducedMotion();
  const panelRef = useSpotlight<HTMLDivElement>(!reduced);

  const derived = deriveCase(featured);
  const stage = featured.stageIndex;
  const current = LIFECYCLE[stage];
  /* A persisted stageIndex outside the lifecycle means the board and the store
     disagree. Render nothing rather than a panel that names a stage that is not
     on the board. */
  if (!derived || !current) return null;

  const now = Date.now();
  const history = featured.history ?? [];

  /* The audit trail, keyed by the stage each move landed on, so a stage row can
     show who moved it and when without re-deriving the order of events. */
  const stampFor = (index: number) => history.find((e) => e.to === index);

  return (
    <section
      className={styles.section}
      aria-labelledby="ops-featured-h"
      id="ops-featured"
    >
      <div ref={panelRef} className={styles.panel}>
        <div className={styles.head}>
          <div className={styles.headText}>
            {/* The board now sits above this panel, so a reader arrives here
                having already seen the ribboned card. "The case to follow" is
                true whether they came from the homepage teaser or from the
                featured strip at the top of this page. */}
            <p className={styles.eyebrow}>The case to follow</p>
            <h2 id="ops-featured-h" className={styles.title}>
              {featured.id} · {derived.category.caseType}, {derived.account}
            </h2>
            <p className={styles.standfirst}>
              A {derived.priorityLabel.toLowerCase()} priority {derived.category.metric.toLowerCase()}{" "}
              exception sitting at {current.label.toLowerCase()},{" "}
              {handlingLabel(derived).toLowerCase()}. Traced from the report that opened it, through
              the recovery {derived.category.owner} runs next, to the close that logs the cause so it
              does not happen again.
            </p>
          </div>

          <button
            type="button"
            className={styles.openFull}
            onClick={(e) => onOpen(featured.id, e.currentTarget)}
            aria-haspopup="dialog"
          >
            Open the full case record
          </button>
        </div>

        {/* ---- At a glance. Every figure is derived, so it cannot drift. ---- */}
        <dl className={styles.glance}>
          <div className={styles.glanceItem}>
            <dt>Stage</dt>
            <dd>
              {stage + 1} of {LIFECYCLE.length}
            </dd>
            <p className={styles.glanceNote}>
              The {LIFECYCLE.length} stages are how every case on this board is governed. Which one
              this case sits in belongs to this case.
            </p>
          </div>
          <div className={styles.glanceItem}>
            <dt>Time in {current.label}</dt>
            <dd>{formatAge(now - featured.enteredStageAt).replace(" ago", "")}</dd>
            <p className={styles.glanceNote}>
              Read from the last stamped move, so it climbs while the case waits. Total case age is{" "}
              {formatAge(now - featured.createdAt).replace(" ago", "")}.
            </p>
          </div>
          <div className={styles.glanceItem}>
            <dt>Handling</dt>
            <dd className={styles.handlingValue}>
              <span aria-hidden="true">{isRoutedOut(derived) ? "◇" : "◉"}</span>{" "}
              {handlingLabel(derived)}
            </dd>
            <p className={styles.glanceNote}>
              Routing is a property of a case being worked, not a stage it waits in. A case
              Customer Experience can close itself never looks like it is queued behind another
              team.
            </p>
          </div>
          <div className={styles.glanceItem}>
            <dt>Service commitment</dt>
            <dd>
              <span aria-hidden="true">▲</span> {derived.priorityLabel}
            </dd>
            <p className={styles.glanceNote}>
              Acknowledged {derived.ack.toLowerCase()}, resolved {derived.resolve.toLowerCase()}.
              The clock is ours to keep, not the account's to watch.
            </p>
          </div>
        </dl>

        {/* ---- The pipeline, past and future in one column ---------------- */}
        <ol className={styles.trail}>
          {LIFECYCLE.map((s, i) => {
            const state = i < stage ? "done" : i === stage ? "now" : "next";
            const stamp = stampFor(i);
            const actor = stamp ? TEAM_BY_ID[stamp.actorId] : undefined;
            const gloss = state === "next" ? NEXT_GLOSS[s.key](derived) : DONE_GLOSS[s.key](derived);
            const followUps = state === "next" ? followUpsFor(derived, s.key) : [];

            return (
              <li key={s.key} className={styles.step} data-state={state}>
                <span className={styles.marker} aria-hidden="true">
                  {GLYPH[state]}
                </span>

                <div className={styles.stepBody}>
                  <p className={styles.stepHead}>
                    <span className={styles.stepName}>{s.label}</span>
                    <span className={styles.stepState}>{WORD[state]}</span>
                    {actor && stamp && (
                      <span className={styles.stamp}>
                        <span className={styles.initials} aria-hidden="true">
                          {initialsFor(actor.name)}
                        </span>
                        {actor.name}, {formatAge(now - stamp.at)}
                      </span>
                    )}
                  </p>

                  <p className={styles.stepGloss}>
                    {state === "now" ? NEXT_GLOSS[s.key](derived) : gloss}
                  </p>

                  {followUps.length > 0 && (
                    <ul className={styles.followUps}>
                      {followUps.map((f) => (
                        <li key={f.id}>
                          <span className={styles.followLabel}>{f.label}.</span> {f.detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <p className={styles.why}>
          <span className={styles.whyLabel}>Why this case.</span> A short shipment is where an order
          that passed every entry check still fails the customer. The purchase order was accepted,
          priced, and confirmed correctly, and the shelf still came up short. An order entered
          correctly and an order operationally at risk are not the same order, and only one of them
          tells you the buyer is about to explain a hole in the set to their own manager.
        </p>
      </div>

      <SectionNote sectionId="ops-featured" />
    </section>
  );
}
