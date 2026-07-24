import { useCallback, useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/primitives/ButtonLink";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import { LIFECYCLE, deriveCase } from "@/data/caseBoard";
import { OWNER_BY_CATEGORY, SEED_BY_ID, TEASER_CASE_ID } from "@/data/seedCases";
import { TEAM } from "@/data/team";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSpotlight } from "@/hooks/useSpotlight";
import { playSound } from "@/lib/sound/sound";
import styles from "./OpsTeaser.module.css";

/**
 * OpsTeaser — the bridge between building an order and watching one go wrong.
 *
 * Sits directly after OrderBuilder. It takes one synthetic case off the ops board
 * (FF-2041, a short shipment), shows what the account said, and walks it through
 * the same lifecycle the board runs. The CTA deep-links to `/ops?case=FF-2041`,
 * where the board selects and highlights that exact card.
 *
 * The "Trace this case" switch runs a light down the pipeline, stage by stage,
 * stopping where the case actually sits today. It is a real `role="switch"` with
 * `aria-checked`, and it is decoration: every stage already carries its state in a
 * word ("Done", "Now", "Next") and a glyph, so nothing is learned only from the
 * light. Under prefers-reduced-motion the trace lands instantly with no walk and
 * no sound, since the sound engine mutes itself under the same preference.
 */

/** What each stage means to the account, for a short-shipment case. */
const ACCOUNT_VIEW: Record<string, string> = {
  reported: "Logged, nobody has picked it up",
  "in-progress": "A rep has it, and you know",
  verified: "Ordered checked against received",
  "resolution-proposed": "Recovery drafted, then you hear the date",
  resolved: "Made whole, and the cause is fixed",
};

type TickState = "done" | "now" | "next";

/** State carries a word and a glyph. Never the light alone, never a hue alone. */
const TICK_GLYPH: Record<TickState, string> = { done: "✓", now: "●", next: "○" };
const TICK_WORD: Record<TickState, string> = { done: "Done", now: "Now", next: "Next" };

const TRACE_STEP_MS = 260;

export function OpsTeaser() {
  const reduced = useReducedMotion();
  const cardRef = useSpotlight<HTMLDivElement>(!reduced);

  const featured = SEED_BY_ID[TEASER_CASE_ID];
  const derived = featured ? deriveCase(featured) : null;

  /* How far the trace light has walked. -1 is unlit. */
  const [traced, setTraced] = useState(-1);
  const [tracing, setTracing] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  if (!featured || !derived) return null;

  const currentStage = featured.stageIndex;
  const ownerId = OWNER_BY_CATEGORY[featured.categoryId];
  const rep = TEAM.find((m) => m.id === ownerId);

  const stateFor = (i: number): TickState =>
    i < currentStage ? "done" : i === currentStage ? "now" : "next";

  const toggleTrace = () => {
    clearTimers();
    if (tracing) {
      setTracing(false);
      setTraced(-1);
      playSound("toggle");
      return;
    }
    setTracing(true);
    playSound("toggle");

    if (reduced) {
      // No walk. The light lands on the current stage and stays there.
      setTraced(currentStage);
      return;
    }

    for (let i = 0; i <= currentStage; i += 1) {
      const t = window.setTimeout(() => {
        setTraced(i);
        // The stage the case actually reached gets a different voice.
        playSound(i === currentStage ? "stageAdvance" : "tick", { detuneCents: i * 45 });
      }, i * TRACE_STEP_MS);
      timers.current.push(t);
    }
  };

  return (
    <section id="ops-teaser" className={styles.section} aria-labelledby="ops-teaser-h">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>After the order is placed</p>
            <h2 id="ops-teaser-h" className={styles.h2}>
              A submitted order can still arrive short.
            </h2>
            <p className={styles.lede}>
              A purchase order has to be confirmed, picked, staged, loaded, and driven before
              it becomes a full pallet on a dock. Cases go missing at any of those steps, and
              too often the account finds out when the truck arrives light. Here is one short
              shipment on the case board, and the lifecycle that works it before the ad runs.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          {/* ---- The featured case ------------------------------------- */}
          <div ref={cardRef} className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.caseId}>{featured.id}</span>
              <span className={styles.priority}>
                <span aria-hidden="true">▲</span> {derived.priorityLabel} priority
              </span>
            </div>

            <p className={styles.account}>{featured.account}</p>
            <p className={styles.product}>
              {featured.product} · {featured.orderRef}
            </p>

            <blockquote className={styles.quote}>
              <p>{featured.inquiry}</p>
            </blockquote>

            <dl className={styles.facts}>
              <div>
                <dt>Case type</dt>
                <dd>{derived.category.caseType}</dd>
              </div>
              <div>
                <dt>Metric at risk</dt>
                <dd>{derived.category.metric}</dd>
              </div>
              <div>
                <dt>Owns the recovery</dt>
                <dd>{derived.category.owner}</dd>
              </div>
              <div>
                <dt>Owns the account</dt>
                <dd>{rep ? `${rep.name}, Customer Experience` : "Customer Experience"}</dd>
              </div>
            </dl>

            <p className={styles.commitment}>
              {derived.priorityLabel} priority means acknowledged {derived.ack.toLowerCase()} and
              resolved {derived.resolve.toLowerCase()}. The account hears the recovery from one
              named person, on a date we set, before the ad runs on Friday.
            </p>
          </div>

          {/* ---- The pipeline ------------------------------------------ */}
          <div className={styles.pipeline}>
            <div className={styles.pipeHead}>
              <h3 className={styles.pipeTitle}>Where it is right now</h3>
              <button
                type="button"
                role="switch"
                aria-checked={tracing}
                className={styles.trace}
                onClick={toggleTrace}
              >
                <span className={styles.traceTrack} aria-hidden="true">
                  <span className={styles.traceThumb} />
                </span>
                {tracing ? "Tracing" : "Trace this case"}
              </button>
            </div>

            <ol className={styles.stages}>
              {LIFECYCLE.map((stage, i) => {
                const state = stateFor(i);
                const lit = tracing && i <= traced;
                return (
                  <li
                    key={stage.key}
                    className={styles.stage}
                    data-state={state}
                    data-lit={lit ? "on" : "off"}
                  >
                    <span className={styles.tick} aria-hidden="true">
                      {TICK_GLYPH[state]}
                    </span>
                    <span className={styles.stageText}>
                      <span className={styles.stageLabel}>
                        {stage.label}
                        <span className={styles.stageState}> · {TICK_WORD[state]}</span>
                      </span>
                      <span className={styles.stageMeans}>{ACCOUNT_VIEW[stage.key]}</span>
                    </span>
                  </li>
                );
              })}
            </ol>

            <p className={styles.pipeFoot}>
              {LIFECYCLE.length} stages and one accountable owner are how every case on this board
              is governed. The stage this one sits in, and the shortage behind it, belong to this
              case alone.
            </p>

            <ButtonLink to={`/ops?case=${TEASER_CASE_ID}`} className={styles.cta}>
              Open {TEASER_CASE_ID} on the case board
            </ButtonLink>
          </div>
        </div>

        <SectionNote sectionId="ops-teaser" />
      </div>
    </section>
  );
}
