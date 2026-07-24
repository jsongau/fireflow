/**
 * The "Follow the order" tour: a small docked bar that walks a visitor through
 * the order story in six stops, across three routes. See lib/tour/orderTour.ts
 * for the stop definitions and mechanics.
 *
 * Accessibility: the bar is a labeled region, not a modal; the page stays fully
 * usable. Step changes are announced through aria-live. Escape (with focus in
 * the bar) exits. Scrolling honors prefers-reduced-motion. State is words and
 * glyphs, never color alone.
 */
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { playSound } from "@/lib/sound/sound";
import { useHome } from "@/state/homeStore";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import { buildDeductionCase, LIFECYCLE_ORDER_ID, O2C_OPEN_ORDER_KEY } from "@/data/ediLifecycle";
import {
  TOUR_STOPS,
  TOUR_START_EVENT,
  readTourStep,
  writeTourStep,
  requestO2cMilestone,
  type TourStop,
} from "@/lib/tour/orderTour";
import styles from "./OrderTour.module.css";

function scrollToTarget(target: string) {
  if (!target) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  /* Lazy routes may not have committed yet; poll briefly for the element. */
  let tries = 0;
  const attempt = () => {
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      return;
    }
    if (tries++ < 30) setTimeout(attempt, 100);
  };
  attempt();
}

export function OrderTour() {
  const navigate = useNavigate();
  const { dispatch } = useHome();
  const [step, setStep] = useState<number | null>(() => readTourStep());

  const arrive = useCallback(
    (stop: TourStop) => {
      switch (stop.arrive?.kind) {
        case "compare-setup":
          dispatch({ type: "CLEAR_COMPARE" });
          dispatch({ type: "ADD_COMPARE", familyId: "buldak-2x-spicy" });
          dispatch({ type: "ADD_COMPARE", familyId: "buldak-carbonara" });
          break;
        case "route-case":
          dispatch({ type: "ROUTE_CASE", routedCase: buildDeductionCase() });
          break;
        case "milestone": {
          const milestone = stop.arrive.milestone;
          /* The #o2c section may still be mounting on a fresh navigation. The
             sessionStorage key covers the mount path; the event covers the
             already-mounted path. Both are consumed idempotently. */
          try {
            sessionStorage.setItem(O2C_OPEN_ORDER_KEY, LIFECYCLE_ORDER_ID);
          } catch { /* storage unavailable */ }
          let tries = 0;
          const fire = () => {
            if (document.getElementById("o2c")) requestO2cMilestone(milestone);
            else if (tries++ < 30) setTimeout(fire, 100);
          };
          fire();
          break;
        }
      }
      scrollToTarget(stop.target);
    },
    [dispatch],
  );

  const goTo = useCallback(
    (next: number) => {
      const stop = TOUR_STOPS[next];
      if (!stop) return;
      setStep(next);
      writeTourStep(next);
      const [path, query] = stop.path.split("?");
      const here = window.location.pathname === path;
      if (!here || query) navigate(stop.path);
      /* Arrival work runs after navigation is requested; its own polling
         waits out any lazy route mount. */
      arrive(stop);
      playSound("select");
    },
    [arrive, navigate],
  );

  const exit = useCallback(() => {
    setStep(null);
    writeTourStep(null);
    playSound("select");
  }, []);

  /* Resume support: arriving on a page mid-tour re-scrolls to the active stop
     without re-running arrival setup (state was already advanced). */
  useEffect(() => {
    if (step !== null) {
      const stop = TOUR_STOPS[step];
      if (stop) scrollToTarget(stop.target);
    }
    // Mount-only resume.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* The entry button starts the tour while this bar is already mounted, so it
     announces the start through an event rather than a re-mount. */
  useEffect(() => {
    const onStart = () => setStep(readTourStep());
    window.addEventListener(TOUR_START_EVENT, onStart);
    return () => window.removeEventListener(TOUR_START_EVENT, onStart);
  }, []);

  if (step === null) return null;
  const stop = TOUR_STOPS[step];
  if (!stop) return null;
  const last = step === TOUR_STOPS.length - 1;

  return (
    <div
      className={styles.bar}
      role="region"
      aria-label="Follow the order tour"
      onKeyDown={(e) => { if (e.key === "Escape") exit(); }}
    >
      <div className={styles.text} aria-live="polite">
        <p className={styles.kicker}>
          Follow the order · Stop {step + 1} of {TOUR_STOPS.length}
        </p>
        <p className={styles.title}>{stop.title}</p>
        <p className={styles.body}>{stop.body}</p>
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.btn}
          onClick={() => goTo(step - 1)}
          disabled={step === 0}
        >
          Back
        </button>
        {last ? (
          <>
            <Link className={styles.primaryLink} to="/about#fit" onClick={exit}>
              See how this maps to the role
            </Link>
            <button type="button" className={styles.btn} onClick={exit}>
              Finish
            </button>
          </>
        ) : (
          <button type="button" className={styles.primary} onClick={() => goTo(step + 1)}>
            Next
          </button>
        )}
        <button type="button" className={styles.exit} onClick={exit}>
          Exit tour
        </button>
      </div>
    </div>
  );
}

/**
 * The entry point, rendered on the home page below the hero. One sentence,
 * one action; product voice, no fourth wall.
 */
export function OrderTourEntry() {
  const navigate = useNavigate();
  const { dispatch } = useHome();

  const start = () => {
    writeTourStep(0);
    const stop = TOUR_STOPS[0]!;
    dispatch({ type: "CLEAR_COMPARE" });
    dispatch({ type: "ADD_COMPARE", familyId: "buldak-2x-spicy" });
    dispatch({ type: "ADD_COMPARE", familyId: "buldak-carbonara" });
    navigate(stop.path);
    window.dispatchEvent(new Event(TOUR_START_EVENT));
    scrollToTarget(stop.target);
    playSound("select");
  };

  return (
    <section className={styles.entry} aria-label="Guided path through the order story">
      <div className={styles.entryInner}>
        <div>
          <p className={styles.entryKicker}>Three minutes, one order</p>
          <p className={styles.entryTitle}>
            Follow one retailer order from product comparison to a resolved deduction.
          </p>
          <p className={styles.entryBody}>
            Six stops: the product master data, the order queue, the X12 document trail, a
            short-shipment deduction, its resolution, and the case board it lands on.
          </p>
        </div>
        <button type="button" className={styles.entryBtn} onClick={start}>
          Follow the order
        </button>
        <div className={styles.entryNote}>
          <SectionNote sectionId="order-tour" />
        </div>
      </div>
    </section>
  );
}
