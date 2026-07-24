import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useHome } from "@/state/homeStore";
import { sortForColumn, type BoardSort } from "@/state/homeStore";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import { FeaturedCase } from "@/components/ops/FeaturedCase/FeaturedCase";
import { PatternWatch } from "@/components/ops/PatternWatch/PatternWatch";
import { TEASER_CASE_ID } from "@/data/seedCases";
import { playSound } from "@/lib/sound/sound";
import {
  LIFECYCLE,
  LAST_STAGE,
  deriveCase,
  describeEvent,
  followUpsFor,
  formatAge,
  handlingLabel,
  initialsFor,
  isRoutedOut,
  orderBetween,
  resolutionNote,
  stageDetail,
  stageKeyAt,
  verifiedFacts,
  type DerivedCase,
  type RoutedCase,
  type StageKey,
} from "@/data/caseBoard";
import { TEAM, TEAM_BY_ID } from "@/data/team";
import {
  VENDOR_DISCLAIMER,
  accountPageFor,
  openCasesForAccount,
  vendorFor,
  type VendorProfile,
} from "@/data/vendors";
import type { PriorityId } from "@/components/home/SupportBar/intake";
import styles from "./OpsDashboard.module.css";

/**
 * OpsDashboard — a Customer Experience operations board.
 *
 * Cases (seeded, plus anything routed through the support intake) sit in columns
 * by lifecycle stage. Cards are uniform in height; the full case lives in a
 * modal. A card can be dragged to a position within a column (a drop indicator
 * shows where it will land), and because drag is not operable by keyboard or
 * assistive tech, every card also carries Move up / Move down buttons and a
 * "Move to" stage select that perform the identical reorder and stage change.
 * Every move is announced in a live region.
 *
 * All cases are synthetic. Account names are real grocery banners used
 * illustratively, with no relationship, data, or real inquiry implied.
 */

const HOUR_MS = 60 * 60 * 1000;

/**
 * Aging thresholds, measured against how long a case has sat in its CURRENT
 * stage (enteredStageAt), because that is the number that tells a manager what to
 * act on. Under 24h reads Fresh, 24 to 72h reads Aging, over 72h reads Stalled.
 * State is always a word plus a shape glyph, never color alone.
 */
const AGING_THRESHOLDS = {
  aging: 24 * HOUR_MS,
  stalled: 72 * HOUR_MS,
} as const;

type AgingState = "fresh" | "aging" | "stalled";

const AGING_META: Record<AgingState, { word: string; glyph: string; hint: string }> = {
  fresh: { word: "Fresh", glyph: "○", hint: "In this stage under 24 hours." },
  aging: { word: "Aging", glyph: "◆", hint: "In this stage 24 to 72 hours. Worth a look." },
  stalled: { word: "Stalled", glyph: "▲", hint: "In this stage over 72 hours. Act on this first." },
};

function agingState(msInStage: number): AgingState {
  if (msInStage >= AGING_THRESHOLDS.stalled) return "stalled";
  if (msInStage >= AGING_THRESHOLDS.aging) return "aging";
  return "fresh";
}

const PRIORITY_GLYPH: Record<PriorityId, string> = {
  standard: "○",
  elevated: "◆",
  high: "▲",
  critical: "⚠",
};
const PRIORITY_LABEL: Record<PriorityId, string> = {
  standard: "Standard",
  elevated: "Elevated",
  high: "High",
  critical: "Critical",
};
const PRIORITY_HINT: Record<PriorityId, string> = {
  standard: "Standard priority. Worked in turn behind anything more urgent.",
  elevated: "Elevated priority. Ahead of standard traffic.",
  high: "High priority. A dated commitment or a shelf is at risk.",
  critical: "Critical priority. A customer is exposed right now.",
};

/** One short sentence per stage, shown on the column header as a tooltip. */
const STAGE_HINT: Record<StageKey, string> = {
  reported: "A new case, logged but not yet picked up.",
  "in-progress":
    "Assigned and the account acknowledged. Either Customer Experience holds it, or it is routed to the team that owns the determination. Each card says which.",
  verified: "Facts confirmed against the record. Nothing promised to the account yet.",
  "resolution-proposed": "A fix is written down and the approvals it needs are named.",
  resolved:
    "The account was told in writing, the outcome is measured, and the corrective action is logged. Four follow-ups have to be true before a case may sit here.",
};

const SORT_LABEL: Record<BoardSort, string> = {
  manual: "Manual order",
  newest: "Newest first",
  oldest: "Oldest first",
  account: "Account A to Z",
};

/** The same four sorts, short enough to sit on a column header inside a chip. */
const SORT_SHORT: Record<BoardSort, string> = {
  manual: "Manual",
  newest: "Newest",
  oldest: "Oldest",
  account: "A to Z",
};

const SORT_ORDER: BoardSort[] = ["manual", "newest", "oldest", "account"];

type PriorityFilter = "all" | PriorityId;

/** Absolute stamp, e.g. "Jul 8, 2:14 PM". The relative age lives alongside it. */
function formatStamp(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Compact time-in-stage, e.g. "6h", "3d", "45m". */
function formatInStage(ms: number): string {
  const mins = Math.max(0, Math.round(ms / 60000));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

/** Sort a column's cards by the chosen key; manual honors the hand-placed order. */
function sortColumn(cards: RoutedCase[], sort: BoardSort): RoutedCase[] {
  const arr = [...cards];
  switch (sort) {
    case "newest":
      return arr.sort((a, b) => b.createdAt - a.createdAt);
    case "oldest":
      return arr.sort((a, b) => a.createdAt - b.createdAt);
    case "account":
      return arr.sort((a, b) => (a.account ?? "").localeCompare(b.account ?? ""));
    case "manual":
    default:
      return arr.sort((a, b) => a.order - b.order);
  }
}

/**
 * ColumnSortMenu — the sort control, living on the column header where the
 * column's own name and count already are.
 *
 * It used to be a full-width `<select>` on a third row of the column grid, which
 * meant five selects at five different heights (the grid only declared two rows,
 * so the select row absorbed the flexible space and every column stretched it
 * differently). A header chip cannot drift: it is inline with the count.
 *
 * The chip carries its own state in a glyph, not a color. Manual order shows ≡
 * and the column is draggable. Any other sort shows ⊘, the chip's border goes
 * dashed, and the column is read-only, because a card dropped into a sorted
 * column snaps straight back and the drag reads as broken.
 */
function ColumnSortMenu({
  stageKey,
  stageName,
  sort,
  onChange,
}: {
  stageKey: StageKey;
  stageName: string;
  sort: BoardSort;
  onChange: (next: BoardSort) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const manual = sort === "manual";
  const menuId = `sort-menu-${stageKey}`;

  /* A popover that outlives a click somewhere else is a bug, and one that traps
     a keyboard user is worse. Outside pointer-down closes it; Escape closes it
     and hands focus back to the chip that opened it. */
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: globalThis.MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      btnRef.current?.focus();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={styles.sortWrap} ref={wrapRef}>
      <button
        ref={btnRef}
        type="button"
        className={styles.sortBtn}
        data-locked={manual ? undefined : "on"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          manual
            ? `Sort the ${stageName} column. Currently manual order, so cards can be dragged and nudged.`
            : `Sort the ${stageName} column. Currently ${SORT_LABEL[sort].toLowerCase()}, so cards are read-only.`
        }
        title={
          manual
            ? `Sort the ${stageName} column. Manual order lets you drag or nudge cards by hand.`
            : `${stageName} is sorted by ${SORT_LABEL[sort].toLowerCase()}. Set it back to manual order to drag or nudge cards.`
        }
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true" className={styles.sortGlyph}>
          {manual ? "≡" : "⊘"}
        </span>
        <span className={styles.sortName}>{SORT_SHORT[sort]}</span>
        <span aria-hidden="true" className={styles.sortCaret}>
          ▾
        </span>
      </button>

      {open && (
        <div className={styles.sortMenu} id={menuId} role="menu" aria-label={`Sort ${stageName}`}>
          {SORT_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              role="menuitemradio"
              aria-checked={key === sort}
              className={styles.sortItem}
              data-on={key === sort ? "on" : undefined}
              onClick={() => {
                onChange(key);
                setOpen(false);
                btnRef.current?.focus();
              }}
            >
              <span className={styles.sortTick} aria-hidden="true">
                {key === sort ? "✓" : ""}
              </span>
              {SORT_LABEL[key]}
            </button>
          ))}
          <p className={styles.sortNote}>
            Manual order is the only sort you can drag or nudge inside. Any other sort makes this
            column read-only until you set it back.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */

export function OpsDashboard() {
  const { state, dispatch } = useHome();
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [vendorAccount, setVendorAccount] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const vendorTriggerRef = useRef<HTMLElement | null>(null);
  /** Whatever opened the case modal: a board card, or the featured-case panel. */
  const caseTriggerRef = useRef<HTMLElement | null>(null);

  /* Deep link from the homepage teaser: /ops?case=FF-2041 (&open=1 opens it).
     Read through react-router, never window.location.search. The home store's
     writeUrl() rebuilds the query from its own keys and replaceState's it, so
     `case` is stripped from the address bar on the first state sync. Because that
     is a replaceState, react-router never observes it, and useSearchParams still
     reports the string we navigated with. */
  const [searchParams] = useSearchParams();
  const [arrivedId, setArrivedId] = useState<string | null>(null);
  const deepLinkDone = useRef(false);

  const cases = state.routedCases;
  const now = Date.now();

  /* Sort is per column. Reported wants oldest first (that is the account nobody
     has answered); Resolved wants newest (what just closed). A board-wide sort
     forced one answer on every lane. Dragging is only possible in a column that
     is in manual order, because a sorted column would snap the card straight back
     and the drag would read as broken. */
  const sortOf = (key: StageKey): BoardSort => sortForColumn(state.columnSort, key);
  const isManual = (key: StageKey): boolean => sortOf(key) === "manual";

  const owners = useMemo(() => {
    const set = new Set<string>();
    for (const c of cases) {
      const d = deriveCase(c);
      if (d) set.add(d.category.owner);
    }
    return Array.from(set).sort();
  }, [cases]);

  const visible = useMemo(
    () =>
      cases.filter((c) => {
        if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;
        if (ownerFilter !== "all") {
          const d = deriveCase(c);
          if (!d || d.category.owner !== ownerFilter) return false;
        }
        return true;
      }),
    [cases, priorityFilter, ownerFilter],
  );

  const stats = useMemo(() => {
    const open = cases.filter((c) => c.stageIndex < LAST_STAGE).length;
    const closed = cases.length - open;
    const urgent = cases.filter(
      (c) => (c.priority === "high" || c.priority === "critical") && c.stageIndex < LAST_STAGE,
    ).length;
    const ages = cases.filter((c) => c.stageIndex < LAST_STAGE).map((c) => now - c.createdAt);
    const avg = ages.length ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
    const deductions = cases.filter((c) => c.deductionTypeId && c.stageIndex < LAST_STAGE).length;
    return { open, closed, urgent, avg, deductions };
  }, [cases, now]);

  const openCase = cases.find((c) => c.id === openId) ?? null;

  /* The case the panel above the board tells end to end. The deep link wins; a
     visitor who lands on /ops directly gets the teaser's case, so the tour is the
     same either way. An unknown id in the URL falls through to the teaser rather
     than hiding the panel. Read live from `cases`, so dragging the featured card
     to a new stage updates the panel with it. */
  const featuredCase =
    cases.find((c) => c.id === searchParams.get("case")) ??
    cases.find((c) => c.id === TEASER_CASE_ID) ??
    null;

  /* Land the visitor on the case the homepage teaser featured: select it, scroll
     it into view, and mark it "arrived" for a few seconds.

     Runs once. If the id names no case (an edited URL, or CLEAR_CASES emptied the
     board), everything short-circuits and the board renders normally. Nothing here
     dispatches a move: SELECT_CASE is a pure setter, so stage indices, the manual
     `order` key, and the audit trail are untouched.

     One rAF defers past ScrollAndFocusManager's scroll-to-top, which fires on the
     route change before this lazy chunk commits. `block: "center"` clears the
     sticky nav without offset math, and `inline: "center"` scrolls the
     horizontally overflowing board to the right column. */
  useEffect(() => {
    if (deepLinkDone.current) return;
    const id = searchParams.get("case");
    if (!id) return;
    deepLinkDone.current = true;

    const target = cases.find((c) => c.id === id);
    if (!target) return;

    dispatch({ type: "SELECT_CASE", caseId: id });
    if (searchParams.get("open") === "1") setOpenId(id);
    setArrivedId(id);
    setAnnouncement(`Case ${id}, ${target.account ?? "account"}, selected from the homepage.`);

    /* Read the motion preference directly rather than through useReducedMotion.
       That hook returns false on the first render and flips in its own effect,
       which would re-run this one; the cleanup would then cancel the frame below
       before it ever painted. No dependency, no race. */
    const still =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-caseid="${id}"]`)?.scrollIntoView({
        behavior: still ? "auto" : "smooth",
        block: "center",
        inline: "center",
      });
    });
  }, [searchParams, cases, dispatch]);

  /* The arrival highlight clears itself. Kept in its own effect so a re-render
     from any other source cannot cancel the timer mid-flight. */
  useEffect(() => {
    if (!arrivedId) return;
    const timer = window.setTimeout(() => setArrivedId(null), 4000);
    return () => window.clearTimeout(timer);
  }, [arrivedId]);

  const actorName = () => TEAM_BY_ID[state.activeStaffId]?.name ?? "Unassigned";

  /** Move a case to a stage, placing it at the top of the target column. */
  const moveToStage = (c: RoutedCase, stageIndex: number) => {
    if (stageIndex === c.stageIndex) return;
    const inTarget = cases.filter((x) => x.stageIndex === stageIndex && x.id !== c.id);
    const minOrder = inTarget.length ? Math.min(...inTarget.map((x) => x.order)) : null;
    dispatch({ type: "REORDER_CASE", caseId: c.id, stageIndex, order: orderBetween(null, minOrder) });
    playSound(stageIndex === LAST_STAGE ? "resolve" : "stageAdvance");
    setAnnouncement(`Case ${c.id} moved to ${LIFECYCLE[stageIndex]?.label ?? ""} by ${actorName()}.`);
  };

  /** Keyboard reorder within a column: nudge a card up or down one place. */
  const nudge = (c: RoutedCase, columnCards: RoutedCase[], dir: -1 | 1) => {
    const i = columnCards.findIndex((x) => x.id === c.id);
    if (i < 0) return;
    let order: number;
    if (dir < 0) {
      const prev = columnCards[i - 1];
      if (!prev) return;
      order = orderBetween(columnCards[i - 2]?.order ?? null, prev.order);
    } else {
      const next = columnCards[i + 1];
      if (!next) return;
      order = orderBetween(next.order, columnCards[i + 2]?.order ?? null);
    }
    dispatch({ type: "REORDER_CASE", caseId: c.id, stageIndex: c.stageIndex, order });
    setAnnouncement(
      `Case ${c.id} moved ${dir < 0 ? "up" : "down"} in ${LIFECYCLE[c.stageIndex]?.label ?? ""} by ${actorName()}.`,
    );
  };

  /**
   * Compute the insertion index from the pointer's position relative to each
   * card's vertical midpoint: the card is dropped before the first card whose
   * midpoint sits below the pointer, or at the end of the column.
   */
  const onColumnDragOver = (e: DragEvent<HTMLDivElement>, stageIndex: number) => {
    /* The TARGET column decides, not the source: dropping into a sorted column
       would compute an insertion index that the sort immediately overrides. */
    const targetKey = stageKeyAt(stageIndex);
    if (!isManual(targetKey) || !dragId) return;
    e.preventDefault();
    const wraps = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-cardwrap]"));
    const y = e.clientY;
    let idx = wraps.length;
    for (let i = 0; i < wraps.length; i += 1) {
      const el = wraps[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (y < r.top + r.height / 2) {
        idx = i;
        break;
      }
    }
    if (dropStage !== stageIndex || dropIndex !== idx) {
      setDropStage(stageIndex);
      setDropIndex(idx);
    }
  };

  const onColumnDragLeave = (e: DragEvent<HTMLDivElement>, stageIndex: number) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDropStage((s) => (s === stageIndex ? null : s));
    setDropIndex(null);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>, stageIndex: number, columnCards: RoutedCase[]) => {
    /* Defense in depth. The browser only fires drop when dragover called
       preventDefault, and onColumnDragOver already gates on the target column's
       sort, so this cannot fire into a sorted column today. It is one line, and a
       future refactor of the dragover gate would otherwise write an `order` the
       sort silently ignores, losing the move without a word. */
    if (!isManual(stageKeyAt(stageIndex))) return;
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    const insertAt = dropIndex ?? columnCards.length;
    setDragId(null);
    setDropStage(null);
    setDropIndex(null);
    if (!id) return;
    const dragged = cases.find((x) => x.id === id);
    if (!dragged) return;

    // Neighbors are drawn from the rendered column, excluding the dragged card,
    // so the new order sorts between the two cards the drop indicator sat between.
    const before = columnCards.slice(0, insertAt).filter((x) => x.id !== id);
    const others = columnCards.filter((x) => x.id !== id);
    const prev = before[before.length - 1] ?? null;
    const after = others[before.length] ?? null;
    const order = orderBetween(prev?.order ?? null, after?.order ?? null);

    const changedStage = dragged.stageIndex !== stageIndex;
    dispatch({ type: "REORDER_CASE", caseId: id, stageIndex, order });
    if (changedStage) playSound(stageIndex === LAST_STAGE ? "resolve" : "stageAdvance");
    setAnnouncement(
      changedStage
        ? `Case ${id} moved to ${LIFECYCLE[stageIndex]?.label ?? ""} by ${actorName()}.`
        : `Case ${id} reordered in ${LIFECYCLE[stageIndex]?.label ?? ""} by ${actorName()}.`,
    );
  };

  const openVendor = (account: string, trigger: HTMLElement) => {
    vendorTriggerRef.current = trigger;
    setVendorAccount(account);
  };

  const closeVendor = () => {
    setVendorAccount(null);
    const trigger = vendorTriggerRef.current;
    if (trigger) window.setTimeout(() => trigger.focus(), 0);
  };

  /* Open the case modal from anywhere, remembering what opened it.

     Two surfaces now open this dialog: a board card, and the featured-case panel
     above the board. Focus must return to whichever one was used. Returning to
     the card by selector would strand focus on document.body whenever the featured
     case is filtered out of the visible board, which is exactly the case a
     keyboard user hits when they arrive from the homepage with a filter set. */
  const openCaseFrom = (id: string, trigger: HTMLElement | null) => {
    caseTriggerRef.current = trigger;
    dispatch({ type: "SELECT_CASE", caseId: id });
    setOpenId(id);
  };

  const closeModal = () => {
    const id = openId;
    const trigger = caseTriggerRef.current;
    setOpenId(null);
    caseTriggerRef.current = null;
    window.setTimeout(() => {
      const fallback = id
        ? document.querySelector<HTMLElement>(`[data-card="${id}"]`)
        : null;
      (trigger ?? fallback)?.focus();
    }, 0);
  };

  const vendor = vendorAccount ? vendorFor(vendorAccount) : null;
  const featuredDerived = featuredCase ? deriveCase(featuredCase) : null;

  /** Jump to the end-to-end walkthrough that sits under the board. */
  const scrollToFeatured = () => {
    const still =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("ops-featured")?.scrollIntoView({
      behavior: still ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div className={styles.page}>
      {/* The board is the product, so the board opens the page. The hero states
          what it is, what it is measured on, and which single case to follow;
          the walkthrough of that case sits directly under the board, where a
          reader lands after the cards have raised the question. */}
      <header className={styles.hero}>
        <div className={styles.heroMain}>
          <div className={styles.brandRow}>
            <span className={styles.badgeSoft}>Five-stage lifecycle</span>
            <span className={styles.badgeSoft}>SAP SD aligned</span>
          </div>
          <p className={styles.eyebrow}>Customer Experience Operations</p>
          <h1 className={styles.title}>Account Case Board</h1>
          <p className={styles.lede}>
            Every service exception the Asian grocery channel raises, worked in one place across
            five stages, from the report that opens a case to the review that prevents the next one.
            Open a card to read the account&rsquo;s problem in their own words, open an account name
            for its operating profile, sort any column from the button on its header, and drag a
            card to place it by hand.
          </p>
          <p className={styles.fineprint}>
            Cases are written to be representative of real account traffic, not drawn from it.
          </p>
        </div>

        <section className={styles.stats} aria-label="Queue health">
          <div className={styles.stat}>
            <span className={styles.statLabel}>Open cases</span>
            <span className={styles.statValue}>{stats.open}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>High or critical</span>
            <span className={styles.statValue}>{stats.urgent}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Open deductions</span>
            <span className={styles.statValue}>{stats.deductions}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Average open age</span>
            <span className={styles.statValue}>{formatAge(stats.avg).replace(" ago", "")}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Closed</span>
            <span className={styles.statValue}>{stats.closed}</span>
          </div>
        </section>
      </header>

      {/* Fourteen cards tell a first-time reader nothing. This names the one case
          worth following before they scan, points at the card that carries the
          same mark on the board, and offers both ways in: the walkthrough under
          the board, or the full record right now. */}
      {featuredCase && featuredDerived && (
        <section className={styles.featStrip} aria-label="Featured case">
          <p className={styles.featTag}>
            <span aria-hidden="true">◎</span> Featured case
          </p>
          <div className={styles.featText}>
            <p className={styles.featRef}>
              {featuredCase.id} · {featuredDerived.account}
            </p>
            <p className={styles.featMeta}>
              {featuredDerived.category.label} · {PRIORITY_LABEL[featuredCase.priority]} priority ·{" "}
              {LIFECYCLE[featuredCase.stageIndex]?.label} · owned by {featuredDerived.category.owner}
            </p>
          </div>
          <div className={styles.featActions}>
            <button type="button" className={styles.featGhost} onClick={scrollToFeatured}>
              Follow this case end to end
            </button>
            <button
              type="button"
              className={styles.featPrimary}
              aria-haspopup="dialog"
              onClick={(e) => openCaseFrom(featuredCase.id, e.currentTarget)}
            >
              Open the full case record
            </button>
          </div>
        </section>
      )}

      <section className={styles.filters} aria-label="Filters">
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Priority</span>
          <select
            className={styles.select}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
          >
            <option value="all">All priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="elevated">Elevated</option>
            <option value="standard">Standard</option>
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Internal owner</span>
          <select
            className={styles.select}
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
          >
            <option value="all">All owners</option>
            {owners.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>

        {/* Whoever is working the board signs the audit trail. */}
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Acting as</span>
          <select
            className={styles.select}
            value={state.activeStaffId}
            onChange={(e) => dispatch({ type: "SET_ACTIVE_STAFF", staffId: e.target.value })}
          >
            {TEAM.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} · {m.level}
              </option>
            ))}
          </select>
        </label>
        <p className={styles.showing}>
          Showing {visible.length} of {cases.length} cases
        </p>
        <p className={styles.sortHint}>
          Each column sorts on its own, from the button on its header. A column in manual order can
          be dragged, or worked with Move up, Move down, and Move to on any card. Any other sort
          makes that column read-only until you set it back.
        </p>
      </section>

      <p className={styles.srOnly} role="status" aria-live="polite">
        {announcement}
      </p>

      <section className={styles.board} aria-label="Case board">
        {LIFECYCLE.map(({ key, label: stageName }, stageIndex) => {
          const columnSort = sortOf(key);
          const columnManual = isManual(key);
          const column = sortColumn(
            visible.filter((c) => c.stageIndex === stageIndex),
            columnSort,
          );
          const showLine = (i: number) =>
            columnManual && dragId && dropStage === stageIndex && dropIndex === i;

          return (
            <div key={key} className={styles.column} data-drop={dropStage === stageIndex ? "on" : undefined}>
              {/* Name, count, and the column's own sort, on one row. The header is
                  a fixed height in every column so five bodies start on the same
                  line no matter how long a stage name runs. */}
              <div className={styles.colHead}>
                <span className={styles.colName} title={STAGE_HINT[key]}>
                  {stageName}
                </span>
                <span className={styles.colCount}>{column.length}</span>
                <ColumnSortMenu
                  stageKey={key}
                  stageName={stageName}
                  sort={columnSort}
                  onChange={(sort) => dispatch({ type: "SET_COLUMN_SORT", stage: key, sort })}
                />
              </div>

              <div
                className={styles.colBody}
                onDragOver={(e) => onColumnDragOver(e, stageIndex)}
                onDragLeave={(e) => onColumnDragLeave(e, stageIndex)}
                onDrop={(e) => onDrop(e, stageIndex, column)}
              >
                {column.length === 0 && !showLine(0) && <p className={styles.colEmpty}>No cases</p>}

                {column.map((c, i) => {
                  const d = deriveCase(c);
                  if (!d) return null;
                  const inStage = now - c.enteredStageAt;
                  const aging = agingState(inStage);
                  const meta = AGING_META[aging];
                  const created = c.createdAt;

                  return (
                    <Fragment key={c.id}>
                      {showLine(i) && <div className={styles.dropLine} aria-hidden="true" />}
                      <article
                        className={styles.card}
                        data-cardwrap=""
                        data-caseid={c.id}
                        data-selected={state.selectedCaseId === c.id ? "on" : undefined}
                        data-arrived={arrivedId === c.id ? "on" : undefined}
                        data-featured={featuredCase?.id === c.id ? "on" : undefined}
                        data-dragging={dragId === c.id ? "on" : undefined}
                        draggable={columnManual}
                        onDragStart={(e) => {
                          if (!columnManual) return;
                          e.dataTransfer.setData("text/plain", c.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDragId(c.id);
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setDropStage(null);
                          setDropIndex(null);
                        }}
                      >
                        {/* The card the page told you to follow. A ribbon, not a hue:
                            it names itself in words, adds a border shape, and buys
                            its extra 22px of height honestly by growing the card. */}
                        {featuredCase?.id === c.id && (
                          <span className={styles.featRibbon}>
                            <span aria-hidden="true">◎</span> Featured case
                          </span>
                        )}

                        {/* Arrived from the homepage teaser. The signal is a word and
                            a glyph plus a luminance lift, never a hue: a colored ring
                            alone would say nothing to a colorblind reader. */}
                        {arrivedId === c.id && (
                          <span className={styles.arrived}>
                            <span aria-hidden="true">◎</span> From the homepage
                          </span>
                        )}

                        {/* Stretched hit layer: the whole card opens the case. It is
                            a sibling of the account and control buttons, never their
                            parent, so no button is nested inside another. */}
                        <button
                          type="button"
                          data-card={c.id}
                          className={styles.cardHit}
                          aria-haspopup="dialog"
                          aria-label={`Open case ${c.id}, ${d.account}`}
                          onClick={(e) => openCaseFrom(c.id, e.currentTarget)}
                        />

                        <div className={styles.cardBody}>
                          {key === "in-progress" && (
                            <span
                              className={styles.handling}
                              data-routed={isRoutedOut(d) ? "yes" : "no"}
                              title={
                                isRoutedOut(d)
                                  ? "Another function owns the determination. Customer Experience keeps the account."
                                  : "Small enough for Customer Experience to research and close without a handoff."
                              }
                            >
                              {/* Two glyphs, two shapes. No arrows in visible copy,
                                  and the words carry the meaning regardless. */}
                              <span aria-hidden="true">{isRoutedOut(d) ? "◇" : "◉"}</span>
                              {handlingLabel(d)}
                            </span>
                          )}
                          <div className={styles.cardTop}>
                            <span className={styles.cardRef}>{c.id}</span>
                            <span
                              className={styles.prio}
                              data-prio={c.priority}
                              title={PRIORITY_HINT[c.priority]}
                            >
                              <span aria-hidden="true">{PRIORITY_GLYPH[c.priority]}</span>
                              {PRIORITY_LABEL[c.priority]}
                            </span>
                          </div>

                          <span className={styles.accountRow}>
                            <button
                              type="button"
                              className={styles.accountBtn}
                              aria-haspopup="dialog"
                              title={`Quick look at ${d.account}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                openVendor(d.account, e.currentTarget);
                              }}
                            >
                              {d.account}
                            </button>
                            {/* Only accounts with a dossier get the link. A link to
                                a page that does not exist is worse than no link. */}
                            {accountPageFor(d.account) && (
                              <Link
                                to={accountPageFor(d.account) as string}
                                className={styles.accountDossier}
                                title={`Open the full operations dossier for ${d.account}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                Dossier
                              </Link>
                            )}
                          </span>

                          <span className={styles.cardCat}>{d.category.label}</span>
                          {c.inquiry && <span className={styles.cardQuote}>{c.inquiry}</span>}

                          <span
                            className={styles.cardWhen}
                            title={`Opened ${formatAge(now - created)}`}
                          >
                            {formatStamp(created)}
                            <span className={styles.dot} aria-hidden="true"> · </span>
                            In {stageName} for {formatInStage(inStage)}
                          </span>

                          <div className={styles.cardFoot}>
                            <span className={styles.aging} data-aging={aging} title={meta.hint}>
                              <span aria-hidden="true">{meta.glyph}</span>
                              {meta.word}
                            </span>
                            <span className={styles.cardOpen} aria-hidden="true">
                              Open case
                            </span>
                          </div>
                        </div>

                        {/* Drag is not keyboard operable, so every card also reorders
                            and moves stage from here. */}
                        <div className={styles.controls}>
                          <button
                            type="button"
                            className={styles.nudge}
                            disabled={!columnManual || i === 0}
                            title="Move up in this stage"
                            aria-label={`Move case ${c.id} up`}
                            onClick={(e) => {
                              e.stopPropagation();
                              nudge(c, column, -1);
                            }}
                          >
                            <span aria-hidden="true">▲</span> Up
                          </button>
                          <button
                            type="button"
                            className={styles.nudge}
                            disabled={!columnManual || i === column.length - 1}
                            title="Move down in this stage"
                            aria-label={`Move case ${c.id} down`}
                            onClick={(e) => {
                              e.stopPropagation();
                              nudge(c, column, 1);
                            }}
                          >
                            <span aria-hidden="true">▼</span> Down
                          </button>
                          <label className={styles.move}>
                            <span className={styles.srOnly}>Move case {c.id} to stage</span>
                            <select
                              className={styles.moveSelect}
                              value={c.stageIndex}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => moveToStage(c, Number(e.target.value))}
                            >
                              {LIFECYCLE.map((s, si) => (
                                <option key={s.key} value={si}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </article>
                    </Fragment>
                  );
                })}

                {showLine(column.length) && <div className={styles.dropLine} aria-hidden="true" />}
              </div>
            </div>
          );
        })}
      </section>

      <SectionNote sectionId="ops-board" />

      {/* Where the queue becomes a signal. Reads the same trigger the intake
          routing check evaluates, off the same live cases, so filing a third
          case in one category trips it here. */}
      <PatternWatch cases={cases} />

      {/* The featured case, told end to end, under the board that raised the
          question. Falls back to the teaser's case when no deep link is present,
          so a visitor who lands on /ops directly gets the same tour. */}
      {featuredCase && <FeaturedCase featured={featuredCase} onOpen={openCaseFrom} />}

      {openCase && <CaseModal routedCase={openCase} onClose={closeModal} onMove={moveToStage} />}

      {vendor && (
        <VendorModal
          vendor={vendor}
          openCount={openCasesForAccount(vendor.account, cases)}
          openCases={cases.filter(
            (c) => c.account === vendor.account && c.stageIndex < LAST_STAGE,
          )}
          onClose={closeVendor}
        />
      )}

      <footer className={styles.foot}>
        <p>
          FireFlow is an independent Customer Experience study by Nathan J. Song. It is not
          affiliated with or endorsed by Samyang.
        </p>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

/**
 * The audit trail. A stage change is not accountability until it carries a name
 * and a time, so every move is stamped with the initials of the person who made
 * it and both an absolute timestamp and its relative age.
 */
function ActivityLog({ routedCase }: { routedCase: RoutedCase }) {
  const events = routedCase.history ?? [];
  if (events.length === 0) return null;

  const now = Date.now();
  // Newest first: a reader wants the last thing that happened.
  const ordered = [...events].reverse();

  return (
    <section className={styles.activity} aria-label="Case activity">
      <h3 className={styles.activityHead}>Activity</h3>
      <ol className={styles.activityList}>
        {ordered.map((e, i) => {
          const member = TEAM_BY_ID[e.actorId];
          const name = member?.name ?? "Unassigned";
          const initials = member ? initialsFor(member.name) : "??";
          return (
            <li key={`${e.at}-${i}`} className={styles.activityItem}>
              <span className={styles.stamp} aria-hidden="true">
                {initials}
              </span>
              <span className={styles.activityText}>
                <span className={styles.activityAction}>{describeEvent(e)}</span>
                <span className={styles.activityMeta} title={formatAge(now - e.at)}>
                  {name} · {formatStamp(e.at)} · {formatAge(now - e.at)}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className={styles.activityNote}>
        Initials refer to the operating model on the leadership page.
      </p>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

/** The close-the-loop panel, shown once a case is resolved or in review. */
function CloseTheLoop({ d, stageKey }: { d: DerivedCase; stageKey: StageKey }) {
  const followUps = followUpsFor(d, stageKey);
  const [copied, setCopied] = useState(false);
  if (followUps.length === 0) return null;

  const note = resolutionNote(d);

  const copyNote = async () => {
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard unavailable (permissions / insecure context). Leave state alone.
      setCopied(false);
    }
  };

  return (
    <section className={styles.loop} aria-label="Follow-up actions">
      <h3 className={styles.loopHead}>Follow-up actions</h3>
      <ol className={styles.loopList}>
        {followUps.map((f) => (
          <li key={f.id} className={styles.loopItem}>
            <span className={styles.loopLabel}>{f.label}</span>
            <span className={styles.loopDetail}>{f.detail}</span>
          </li>
        ))}
      </ol>

      <div className={styles.noteBlock}>
        <div className={styles.noteBlockHead}>
          <span className={styles.noteBlockTitle}>Internal closing note</span>
          <button type="button" className={styles.copyBtn} onClick={copyNote}>
            {copied ? (
              <>
                <span aria-hidden="true">✓</span> Copied
              </>
            ) : (
              "Copy note"
            )}
          </button>
        </div>
        <p className={styles.noteBlockBody}>{note}</p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function CaseModal({
  routedCase,
  onClose,
  onMove,
}: {
  routedCase: RoutedCase;
  onClose: () => void;
  onMove: (c: RoutedCase, stageIndex: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const d = deriveCase(routedCase);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!d) return null;
  const stage = routedCase.stageIndex;
  const stageKey = stageKeyAt(stage);
  const now = Date.now();

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`case-${routedCase.id}`}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className={styles.modalHead}>
          <div>
            <p className={styles.modalEyebrow}>
              {d.accountType} · {LIFECYCLE[stage]?.label}
            </p>
            <h2 id={`case-${routedCase.id}`} className={styles.modalTitle}>
              {accountPageFor(d.account) ? (
                <Link
                  to={accountPageFor(d.account) as string}
                  className={styles.modalTitleLink}
                  title={`Open the ${d.account} account dossier`}
                >
                  {d.account}
                </Link>
              ) : (
                d.account
              )}
            </h2>
            <p className={styles.modalSub}>
              {routedCase.id} · {d.category.label} · opened {formatStamp(routedCase.createdAt)} (
              {formatAge(now - routedCase.createdAt)})
            </p>
            {accountPageFor(d.account) && (
              <Link
                to={accountPageFor(d.account) as string}
                className={styles.dossierCta}
                aria-label={`View the full ${d.account} account operations profile`}
              >
                <svg
                  className={styles.dossierCtaIcon}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle className={styles.ctaRipple1} cx="9" cy="9" r="4.5" />
                  <circle className={styles.ctaRipple2} cx="9" cy="9" r="7.5" />
                  <path d="M9 9 L20.2 13.1 L15.3 15.3 L13.1 20.2 Z" />
                </svg>
                View the full account operations profile
                <svg
                  className={styles.dossierCtaTag}
                  viewBox="0 0 66 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="1" y="1" width="64" height="22" rx="11" />
                  <text x="33" y="16" textAnchor="middle">
                    CLICK ME
                  </text>
                </svg>
              </Link>
            )}
          </div>
          <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Close case">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.colMain}>
            <div className={styles.prioRow}>
              <span className={styles.prio} data-prio={routedCase.priority}>
                <span aria-hidden="true">{PRIORITY_GLYPH[routedCase.priority]}</span>
                {PRIORITY_LABEL[routedCase.priority]}
              </span>
              <span className={styles.chan}>
                Arrived through {d.channelLabel}
                {d.ediRef ? `, ${d.ediRef}` : ""}
              </span>
            </div>

            {routedCase.inquiry && (
              <blockquote className={styles.quote}>
                <p>{routedCase.inquiry}</p>
                <cite>{d.account}</cite>
              </blockquote>
            )}

            <div className={styles.stageBox}>
              <h3>{LIFECYCLE[stage]?.label}</h3>
              <p>{stageDetail(routedCase, d, stageKey)}</p>
            </div>

            <CloseTheLoop d={d} stageKey={stageKey} />

            <ActivityLog routedCase={routedCase} />
          </div>

          <div className={styles.colSide}>
            <div className={styles.detailCard}>
              <h3>Case details</h3>
              <ul>
                {verifiedFacts(d).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>

            <div className={styles.detailCard}>
              <h3>Ownership</h3>
              <dl className={styles.kv}>
                <dt>Owner</dt>
                <dd>{d.category.owner}</dd>
                <dt>Supporting</dt>
                <dd>
                  {d.category.supporting.length ? d.category.supporting.join(", ") : "None required"}
                </dd>
                {d.sap && (
                  <>
                    <dt>SAP SD, aligned</dt>
                    <dd>
                      {d.sap.label}
                      {d.sap.ref ? `, ${d.sap.ref}` : ""}
                    </dd>
                  </>
                )}
              </dl>
            </div>

            <div className={styles.detailCard}>
              <h3>Service commitment</h3>
              <dl className={styles.kv}>
                <dt>Acknowledge</dt>
                <dd>{d.ack}</dd>
                <dt>Resolve</dt>
                <dd>{d.resolve}</dd>
                <dt>Metric at risk</dt>
                <dd>{d.category.metric}</dd>
              </dl>
            </div>

            {d.deductionType && (
              <div className={styles.detailCard}>
                <h3>Deduction</h3>
                <dl className={styles.kv}>
                  <dt>Type</dt>
                  <dd>{d.deductionType.label}</dd>
                  <dt>Window</dt>
                  <dd>{d.deductionType.window}</dd>
                  <dt>Backup</dt>
                  <dd>{d.deductionType.backup.join(", ")}</dd>
                </dl>
              </div>
            )}

            <div className={styles.detailCard}>
              <h3>Root cause and prevention</h3>
              <p>{d.deductionType ? d.deductionType.rootCause : d.category.rootCause}</p>
            </div>
          </div>
        </div>

        <div className={styles.modalFoot}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Move stage</span>
            <select
              className={styles.select}
              value={stage}
              onChange={(e) => onMove(routedCase, Number(e.target.value))}
            >
              {LIFECYCLE.map((s, i) => (
                <option key={s.key} value={i}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <p className={styles.synth}>
            Every move is signed and timestamped.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

/**
 * Vendor profile. Opened from an account name on a card, separate from the case
 * modal. Everything shown is synthetic; VENDOR_DISCLAIMER is rendered in full.
 */
function VendorModal({
  vendor,
  openCount,
  openCases,
  onClose,
}: {
  vendor: VendorProfile;
  openCount: number;
  openCases: RoutedCase[];
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modal} ${styles.vendorModal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`vendor-${vendor.account}`}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className={styles.modalHead}>
          <div>
            <p className={styles.modalEyebrow}>Account profile · {vendor.accountType}</p>
            <h2 id={`vendor-${vendor.account}`} className={styles.modalTitle}>
              {vendor.account}
            </h2>
            <p className={styles.modalSub}>Partner since {vendor.partnerSince}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close account profile"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className={styles.vendorBody}>
          <dl className={styles.kv}>
            <dt>Account type</dt>
            <dd>{vendor.accountType}</dd>
            <dt>Partner since</dt>
            <dd>{vendor.partnerSince}</dd>
            <dt>Region</dt>
            <dd>{vendor.region}</dd>
            <dt>Store count</dt>
            <dd>{vendor.storeCount}</dd>
            <dt>DC count</dt>
            <dd>{vendor.dcCount}</dd>
            <dt>Payment terms</dt>
            <dd>{vendor.paymentTerms}</dd>
            <dt>Order channel</dt>
            <dd>{vendor.orderChannel}</dd>
            <dt>Primary contact</dt>
            <dd>
              {vendor.primaryContact.name}, {vendor.primaryContact.role}
            </dd>
            <dt>How they order</dt>
            <dd>{vendor.notes}</dd>
          </dl>

          <div className={styles.vendorOpen}>
            <h3>Open cases on this board</h3>
            {openCount === 0 ? (
              <p className={styles.vendorOpenEmpty}>No open cases for this account.</p>
            ) : (
              <ul>
                {openCases.map((c) => {
                  const d = deriveCase(c);
                  return (
                    <li key={c.id}>
                      {c.id} · {d ? d.category.label : "Case"} ·{" "}
                      {LIFECYCLE[c.stageIndex]?.label ?? ""}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <p className={styles.vendorDisclaimer}>{VENDOR_DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}
