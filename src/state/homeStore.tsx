import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { UserMode, OrderLine } from "@/types/domain";
import { FAMILY_BY_ID } from "@/data/families";
import { defaultVariantForFamily } from "@/data/variants";
import {
  LAST_STAGE,
  LIFECYCLE,
  orderBetween,
  type RoutedCase,
  type StageKey,
} from "@/data/caseBoard";
import { SEED_CASES, attachSeedDetails } from "@/data/seedCases";

/** How one column is sorted. "manual" honors the order field set by dragging. */
export type BoardSort = "manual" | "newest" | "oldest" | "account";
const BOARD_SORTS: BoardSort[] = ["manual", "newest", "oldest", "account"];

/**
 * Sort is per column, not per board.
 *
 * A single board-wide sort forced one question on every lane at once. But the
 * questions differ: in Reported a manager wants the oldest first, because that is
 * the account nobody has answered; in Resolved they want the newest, to see what
 * just closed. A column not named here is in manual order.
 */
export type ColumnSort = Partial<Record<StageKey, BoardSort>>;

/** The sort for one column, defaulting to manual. */
export function sortForColumn(map: ColumnSort, key: StageKey): BoardSort {
  return map[key] ?? "manual";
}

const VALID_MODES: UserMode[] = ["explore", "retailer", "distributor"];
function coerceMode(value: unknown): UserMode {
  return VALID_MODES.includes(value as UserMode) ? (value as UserMode) : "explore";
}

/**
 * Shared home state (docs/homepage/10). One object threads the selected
 * product through every chapter. localStorage persists non-sensitive
 * preferences only; the URL reflects shareable selection. Inquiry text is
 * never stored here.
 */
export interface HomeState {
  selectedFamilyId: string | null;
  selectedVariantId: string | null;
  selectedBrand: string | null;
  userMode: UserMode;
  rankingMode: string;
  flavorMapMode: string;
  compareIds: string[];
  selectedScenarioId: string | null;
  selectedSignalId: string | null;
  savedProductIds: string[];
  /** Client-side demo cart shared by the order, quote, and standing-order flows.
   * Synthetic only; never a real submission. */
  orderLines: OrderLine[];
  returningUser: boolean;
  /** Cases routed from the support intake, worked in the Resolution Simulator.
   * Synthetic. Only identifiers persist; typed free text never leaves memory. */
  routedCases: RoutedCase[];
  selectedCaseId: string | null;
  /** How cards are ordered within each board column. Persisted. */
  columnSort: ColumnSort;
  /** Which synthetic team member is working the board. Stamps the audit trail. */
  activeStaffId: string;
}

/** Keep the board readable rather than unbounded. */
const MAX_ROUTED_CASES = 8;

/** Keep an audit trail useful without letting it grow forever. */
const MAX_HISTORY = 12;

/**
 * Move a case and stamp the move with who did it. A stage change without an
 * actor and a timestamp is not an audit trail, it is just a number changing.
 */
function moveCase(c: RoutedCase, stageIndex: number, actorId: string): RoutedCase {
  if (stageIndex === c.stageIndex) return c;
  const now = Date.now();
  const event = { at: now, actorId, from: c.stageIndex, to: stageIndex };
  const history = [...(c.history ?? []), event].slice(-MAX_HISTORY);
  // Stamp when the case entered its new stage; this is what "how long it has sat
  // here" is measured from, and that number is what tells a manager what is next.
  return { ...c, stageIndex, enteredStageAt: now, history };
}

export const INITIAL_STATE: HomeState = {
  selectedFamilyId: null,
  selectedVariantId: null,
  selectedBrand: null,
  userMode: "explore",
  rankingMode: "portfolio-priority",
  flavorMapMode: "approachability",
  compareIds: [],
  selectedScenarioId: null,
  selectedSignalId: null,
  savedProductIds: [],
  orderLines: [],
  returningUser: false,
  // A fresh visitor lands on a worked queue rather than an empty board.
  routedCases: SEED_CASES,
  selectedCaseId: SEED_CASES[0]?.id ?? null,
  // Every column starts in manual order, so a manager's hand-placed board shows.
  columnSort: {},
  // The board opens as the team lead. Switchable, and every move is stamped.
  activeStaffId: "lead-grace",
};

const MAX_COMPARE = 2;

export type HomeAction =
  | { type: "SELECT_FAMILY"; familyId: string }
  | { type: "SELECT_VARIANT"; variantId: string }
  | { type: "SET_BRAND"; brand: string | null }
  | { type: "SET_MODE"; mode: UserMode }
  | { type: "SET_RANKING_MODE"; mode: string }
  | { type: "SET_FLAVOR_MODE"; mode: string }
  | { type: "ADD_COMPARE"; familyId: string }
  | { type: "REMOVE_COMPARE"; familyId: string }
  | { type: "CLEAR_COMPARE" }
  | { type: "SELECT_SCENARIO"; scenarioId: string | null }
  | { type: "SELECT_SIGNAL"; signalId: string | null }
  | { type: "TOGGLE_SAVE"; familyId: string }
  | { type: "SET_ORDER_LINE"; variantId: string; cases: number }
  | { type: "REMOVE_ORDER_LINE"; variantId: string }
  | { type: "CLEAR_ORDER" }
  | { type: "ROUTE_CASE"; routedCase: RoutedCase }
  | { type: "SELECT_CASE"; caseId: string | null }
  | { type: "SET_CASE_STAGE"; caseId: string; stageIndex: number }
  | { type: "ADVANCE_CASE"; caseId: string }
  | { type: "REORDER_CASE"; caseId: string; stageIndex: number; order: number }
  | { type: "SET_COLUMN_SORT"; stage: StageKey; sort: BoardSort }
  | { type: "SET_ACTIVE_STAFF"; staffId: string }
  | { type: "CLEAR_CASES" }
  | { type: "HYDRATE"; patch: Partial<HomeState> }
  | { type: "RESET" };

export function homeReducer(state: HomeState, action: HomeAction): HomeState {
  switch (action.type) {
    case "SELECT_FAMILY": {
      const family = FAMILY_BY_ID[action.familyId];
      if (!family) return state;
      const variant = defaultVariantForFamily(action.familyId);
      return {
        ...state,
        selectedFamilyId: family.id,
        selectedVariantId: variant?.id ?? null,
        selectedBrand: family.brand,
      };
    }
    case "SELECT_VARIANT":
      return { ...state, selectedVariantId: action.variantId };
    case "SET_BRAND":
      return { ...state, selectedBrand: action.brand };
    case "SET_MODE":
      return { ...state, userMode: action.mode };
    case "SET_RANKING_MODE":
      return { ...state, rankingMode: action.mode };
    case "SET_FLAVOR_MODE":
      return { ...state, flavorMapMode: action.mode };
    case "ADD_COMPARE": {
      if (state.compareIds.includes(action.familyId)) return state;
      if (state.compareIds.length >= MAX_COMPARE) return state;
      return { ...state, compareIds: [...state.compareIds, action.familyId] };
    }
    case "REMOVE_COMPARE":
      return { ...state, compareIds: state.compareIds.filter((id) => id !== action.familyId) };
    case "CLEAR_COMPARE":
      return { ...state, compareIds: [] };
    case "SELECT_SCENARIO":
      return { ...state, selectedScenarioId: action.scenarioId };
    case "SELECT_SIGNAL":
      return { ...state, selectedSignalId: action.signalId };
    case "TOGGLE_SAVE": {
      const has = state.savedProductIds.includes(action.familyId);
      return {
        ...state,
        savedProductIds: has
          ? state.savedProductIds.filter((id) => id !== action.familyId)
          : [...state.savedProductIds, action.familyId],
      };
    }
    case "SET_ORDER_LINE": {
      // Setting cases to 0 or less removes the line.
      const rest = state.orderLines.filter((l) => l.variantId !== action.variantId);
      if (action.cases <= 0) return { ...state, orderLines: rest };
      return { ...state, orderLines: [...rest, { variantId: action.variantId, cases: action.cases }] };
    }
    case "REMOVE_ORDER_LINE":
      return { ...state, orderLines: state.orderLines.filter((l) => l.variantId !== action.variantId) };
    case "CLEAR_ORDER":
      return { ...state, orderLines: [] };
    case "ROUTE_CASE": {
      // Newest first; re-routing the same reference replaces it.
      const rest = state.routedCases.filter((c) => c.id !== action.routedCase.id);
      // Place the new card at the top of its column: take an order below the
      // current minimum in that stage, so manual sort shows it first.
      const inStage = rest.filter((c) => c.stageIndex === action.routedCase.stageIndex);
      const minOrder = inStage.length ? Math.min(...inStage.map((c) => c.order)) : null;
      const now = Date.now();
      const incoming: RoutedCase = {
        ...action.routedCase,
        enteredStageAt: action.routedCase.enteredStageAt || now,
        order: orderBetween(null, minOrder),
      };
      return {
        ...state,
        routedCases: [incoming, ...rest].slice(0, MAX_ROUTED_CASES),
        selectedCaseId: incoming.id,
      };
    }
    case "SELECT_CASE":
      return { ...state, selectedCaseId: action.caseId };
    case "SET_CASE_STAGE":
      return {
        ...state,
        routedCases: state.routedCases.map((c) =>
          c.id === action.caseId
            ? moveCase(c, Math.min(LAST_STAGE, Math.max(0, action.stageIndex)), state.activeStaffId)
            : c,
        ),
      };
    case "ADVANCE_CASE":
      return {
        ...state,
        routedCases: state.routedCases.map((c) =>
          c.id === action.caseId
            ? moveCase(c, Math.min(LAST_STAGE, c.stageIndex + 1), state.activeStaffId)
            : c,
        ),
      };
    case "REORDER_CASE": {
      // Drop a card at a position within a column. moveCase stamps the stage
      // change (and enteredStageAt) when the column changes; the order is set
      // regardless, so a same-column reorder still takes effect.
      const stageIndex = Math.min(LAST_STAGE, Math.max(0, action.stageIndex));
      return {
        ...state,
        routedCases: state.routedCases.map((c) =>
          c.id === action.caseId
            ? { ...moveCase(c, stageIndex, state.activeStaffId), order: action.order }
            : c,
        ),
      };
    }
    case "SET_COLUMN_SORT":
      return {
        ...state,
        columnSort: { ...state.columnSort, [action.stage]: action.sort },
      };
    case "SET_ACTIVE_STAFF":
      return { ...state, activeStaffId: action.staffId };
    case "CLEAR_CASES":
      return { ...state, routedCases: [], selectedCaseId: null };
    case "HYDRATE":
      return { ...state, ...action.patch };
    case "RESET":
      // Reset the selected product and workflow, but remember that this is not a
      // first visit.
      return {
        ...INITIAL_STATE,
        returningUser: state.returningUser,
      };
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Persistence (non-sensitive preferences only)                        */
/* ------------------------------------------------------------------ */

// Bumped to v2 when a stage ("in-progress") was inserted into the lifecycle.
// Persisted cases store stageIndex as a number; an insert shifts what each index
// means, so stale v1 state would mislabel every case. A new key discards it
// cleanly and reseeds the board rather than showing wrong stages.
/* v3: the lifecycle dropped from eight stages to five on 2026-07-09. A persisted
   stageIndex written against the old order would be silently reinterpreted (an
   old "Resolved" at 6 is out of range; an old "Routed" at 3 would become
   "Resolution proposed"). Bumping the key discards those rather than mislabeling
   them, which is the same reason v2 existed. */
const STORAGE_KEY = "fireflow:home:v3";

const ROLES = ["retailer", "distributor", "broker", "vendor", "internal", "consumer"];
const PRIORITIES = ["standard", "elevated", "high", "critical"];
const CHANNELS = ["edi", "portal", "manual"];

/**
 * Persist only a routed case's identifiers. Anything a visitor typed (account,
 * product, references) stays in memory for the session and is deliberately not
 * written to storage; on reload the case re-derives those from synthetic prefill.
 */
function stripCase(c: RoutedCase) {
  return {
    id: c.id,
    createdAt: c.createdAt,
    role: c.role,
    categoryId: c.categoryId,
    priority: c.priority,
    channel: c.channel,
    deductionTypeId: c.deductionTypeId,
    stageIndex: c.stageIndex,
    // Board position and stage clock. Numbers only, no typed text.
    order: c.order,
    enteredStageAt: c.enteredStageAt,
    // The audit trail is ids and timestamps only. It carries no typed text.
    history: c.history ?? [],
  };
}

/**
 * Validate a persisted per-column sort map.
 *
 * Both halves are checked against the CURRENT lifecycle: a stage key that no
 * longer exists (an old "routed" or "improvement-review") is dropped rather than
 * carried into a map other code will iterate, and an unknown sort value falls
 * back to manual. Storage is untrusted input even when we are the ones who wrote it.
 */
function parseColumnSort(value: unknown): ColumnSort {
  if (!value || typeof value !== "object") return {};
  const known = new Set<string>(LIFECYCLE.map((s) => s.key));
  const out: ColumnSort = {};
  for (const [key, sort] of Object.entries(value as Record<string, unknown>)) {
    if (!known.has(key)) continue;
    if (!BOARD_SORTS.includes(sort as BoardSort)) continue;
    out[key as StageKey] = sort as BoardSort;
  }
  return out;
}

function parseHistory(value: unknown): RoutedCase["history"] {
  if (!Array.isArray(value)) return [];
  const out: NonNullable<RoutedCase["history"]> = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const e = raw as Record<string, unknown>;
    if (typeof e.actorId !== "string" || typeof e.to !== "number") continue;
    /* Clamp exactly as parseCases clamps stageIndex. An unclamped `to` from a
       hand-edited payload indexes LIFECYCLE_LABELS out of range and describeEvent
       renders "Moved  to ". Storage is untrusted input even when we wrote it. */
    const clamp = (n: number) => Math.min(LAST_STAGE, Math.max(0, Math.floor(n)));
    out.push({
      at: typeof e.at === "number" ? e.at : Date.now(),
      actorId: e.actorId,
      from: typeof e.from === "number" ? clamp(e.from) : null,
      to: clamp(e.to),
    });
  }
  return out.slice(-MAX_HISTORY);
}

function parseCases(value: unknown): RoutedCase[] {
  if (!Array.isArray(value)) return [];
  const out: RoutedCase[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const c = raw as Record<string, unknown>;
    if (typeof c.id !== "string" || typeof c.categoryId !== "string") continue;
    if (!ROLES.includes(String(c.role))) continue;
    if (!PRIORITIES.includes(String(c.priority))) continue;
    if (!CHANNELS.includes(String(c.channel))) continue;
    const createdAt = typeof c.createdAt === "number" ? c.createdAt : Date.now();
    // Seeded cases get their (non-persisted) account and inquiry text back from code.
    out.push(
      attachSeedDetails({
        id: c.id,
        createdAt,
        role: c.role as RoutedCase["role"],
        categoryId: c.categoryId,
        priority: c.priority as RoutedCase["priority"],
        channel: c.channel as RoutedCase["channel"],
        deductionTypeId: typeof c.deductionTypeId === "string" ? c.deductionTypeId : null,
        stageIndex:
          typeof c.stageIndex === "number"
            ? Math.min(LAST_STAGE, Math.max(0, Math.floor(c.stageIndex)))
            : 0,
        // Default a missing board position by index so old data still sorts sanely,
        // and default the stage clock to createdAt (a case that has not moved).
        order: typeof c.order === "number" ? c.order : (out.length + 1) * 100,
        enteredStageAt: typeof c.enteredStageAt === "number" ? c.enteredStageAt : createdAt,
        history: parseHistory(c.history),
      }),
    );
  }
  return out.slice(0, MAX_ROUTED_CASES);
}

function loadPersisted(): Partial<HomeState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<HomeState>;

    /* Distinguish "never had a board" (seed it) from "cleared the board"
       (respect that). Only the second writes a routedCases key. */
    const board: Partial<HomeState> = {};
    if (Object.prototype.hasOwnProperty.call(parsed, "routedCases")) {
      const routedCases = parseCases(parsed.routedCases);
      board.routedCases = routedCases;
      board.selectedCaseId =
        typeof parsed.selectedCaseId === "string" &&
        routedCases.some((c) => c.id === parsed.selectedCaseId)
          ? parsed.selectedCaseId
          : routedCases[0]?.id ?? null;
    }

    return {
      ...board,
      columnSort: parseColumnSort(parsed.columnSort),
      activeStaffId:
        typeof parsed.activeStaffId === "string" ? parsed.activeStaffId : "lead-grace",
      selectedFamilyId: parsed.selectedFamilyId ?? null,
      selectedVariantId: parsed.selectedVariantId ?? null,
      selectedBrand: parsed.selectedBrand ?? null,
      // Coerce any stale value (e.g. a returning visitor with "consumer") to explore.
      userMode: coerceMode(parsed.userMode),
      compareIds: Array.isArray(parsed.compareIds) ? parsed.compareIds : [],
      savedProductIds: Array.isArray(parsed.savedProductIds) ? parsed.savedProductIds : [],
      returningUser: true,
      // Any stored `operatorNotesEnabled` or `introDismissed` is intentionally
      // ignored: notes are always on, and the entrance cover no longer exists.
    };
  } catch {
    return {};
  }
}

function persist(state: HomeState) {
  try {
    const toSave = {
      selectedFamilyId: state.selectedFamilyId,
      selectedVariantId: state.selectedVariantId,
      selectedBrand: state.selectedBrand,
      userMode: state.userMode,
      compareIds: state.compareIds,
      savedProductIds: state.savedProductIds,
      routedCases: state.routedCases.map(stripCase),
      selectedCaseId: state.selectedCaseId,
      columnSort: state.columnSort,
      activeStaffId: state.activeStaffId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    /* storage unavailable (private mode / quota) — app still works */
  }
}

/** Read initial selection from URL query params (shareable state). */
function readUrl(): Partial<HomeState> {
  try {
    const p = new URLSearchParams(window.location.search);
    const patch: Partial<HomeState> = {};
    const product = p.get("product");
    if (product && FAMILY_BY_ID[product]) {
      patch.selectedFamilyId = product;
      const format = p.get("format");
      const variantId = format ? `${product}--${format}` : defaultVariantForFamily(product)?.id;
      patch.selectedVariantId = variantId ?? null;
      patch.selectedBrand = FAMILY_BY_ID[product]?.brand ?? null;
    }
    const mode = p.get("mode");
    // Only accept current B2B modes; a stale ?mode=consumer/vendor link falls
    // through to explore.
    if (mode === "retailer" || mode === "distributor" || mode === "explore") patch.userMode = mode;
    const compare = p.get("compare");
    if (compare) patch.compareIds = compare.split(",").filter((id) => FAMILY_BY_ID[id]).slice(0, MAX_COMPARE);
    return patch;
  } catch {
    return {};
  }
}

function writeUrl(state: HomeState) {
  try {
    const p = new URLSearchParams();
    if (state.selectedFamilyId) {
      p.set("product", state.selectedFamilyId);
      const fmt = state.selectedVariantId?.split("--")[1];
      if (fmt) p.set("format", fmt);
    }
    if (state.userMode !== "explore") p.set("mode", state.userMode);
    if (state.compareIds.length) p.set("compare", state.compareIds.join(","));
    const qs = p.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  } catch {
    /* no-op */
  }
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface HomeContextValue {
  state: HomeState;
  dispatch: Dispatch<HomeAction>;
}

const HomeContext = createContext<HomeContextValue | null>(null);

/**
 * The product every first visit opens on. Buldak 2X Spicy is the extreme-heat
 * anchor and the portfolio's best-known name, so the page always lands with a
 * worked example on screen instead of an empty hero. A shared URL or a
 * returning visitor's stored selection still wins over this default.
 */
const DEFAULT_FAMILY_ID = "buldak-2x-spicy";

function initState(): HomeState {
  // URL wins over storage on first load; storage supplies returning-user memory.
  const persisted = loadPersisted();
  const url = readUrl();
  const state = { ...INITIAL_STATE, ...persisted, ...url };
  if (!state.selectedFamilyId && FAMILY_BY_ID[DEFAULT_FAMILY_ID]) {
    state.selectedFamilyId = DEFAULT_FAMILY_ID;
    state.selectedVariantId = defaultVariantForFamily(DEFAULT_FAMILY_ID)?.id ?? null;
    state.selectedBrand = FAMILY_BY_ID[DEFAULT_FAMILY_ID]?.brand ?? null;
  }
  return state;
}

export function HomeStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(homeReducer, undefined, initState);

  useEffect(() => {
    persist(state);
    writeUrl(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

export function useHome(): HomeContextValue {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error("useHome must be used within HomeStateProvider");
  return ctx;
}

/* Selector helpers */
export function useSelectedFamily() {
  const { state } = useHome();
  return state.selectedFamilyId ? FAMILY_BY_ID[state.selectedFamilyId] ?? null : null;
}
