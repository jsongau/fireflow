import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { UserMode } from "@/types/domain";
import { FAMILY_BY_ID } from "@/data/families";
import { defaultVariantForFamily } from "@/data/variants";

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
  returningUser: boolean;
  /** Employer layer: show Nathan's "Operator Notes" narration. */
  operatorNotesEnabled: boolean;
  /** Whether the visitor has chosen an entrance, so we don't re-show the cover. */
  introDismissed: boolean;
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
  returningUser: false,
  operatorNotesEnabled: false,
  introDismissed: false,
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
  | { type: "SET_OPERATOR_NOTES"; enabled: boolean }
  | { type: "TOGGLE_OPERATOR_NOTES" }
  | { type: "DISMISS_INTRO" }
  | { type: "OPEN_INTRO" }
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
    case "SET_OPERATOR_NOTES":
      return { ...state, operatorNotesEnabled: action.enabled, introDismissed: true };
    case "TOGGLE_OPERATOR_NOTES":
      return { ...state, operatorNotesEnabled: !state.operatorNotesEnabled };
    case "DISMISS_INTRO":
      return { ...state, introDismissed: true };
    case "OPEN_INTRO":
      return { ...state, introDismissed: false };
    case "HYDRATE":
      return { ...state, ...action.patch };
    case "RESET":
      // Reset the selected product and workflow, but keep the visitor's
      // narration preference and the fact that they've seen the intro.
      return {
        ...INITIAL_STATE,
        returningUser: state.returningUser,
        operatorNotesEnabled: state.operatorNotesEnabled,
        introDismissed: state.introDismissed,
      };
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Persistence (non-sensitive preferences only)                        */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "fireflow:home";

function loadPersisted(): Partial<HomeState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<HomeState>;
    return {
      selectedFamilyId: parsed.selectedFamilyId ?? null,
      selectedVariantId: parsed.selectedVariantId ?? null,
      selectedBrand: parsed.selectedBrand ?? null,
      userMode: parsed.userMode ?? "explore",
      compareIds: Array.isArray(parsed.compareIds) ? parsed.compareIds : [],
      savedProductIds: Array.isArray(parsed.savedProductIds) ? parsed.savedProductIds : [],
      returningUser: true,
      operatorNotesEnabled: parsed.operatorNotesEnabled === true,
      introDismissed: parsed.introDismissed === true,
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
      operatorNotesEnabled: state.operatorNotesEnabled,
      introDismissed: state.introDismissed,
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
    if (mode === "consumer" || mode === "vendor" || mode === "explore") patch.userMode = mode;
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

function initState(): HomeState {
  // URL wins over storage on first load; storage supplies returning-user memory.
  const persisted = loadPersisted();
  const url = readUrl();
  return { ...INITIAL_STATE, ...persisted, ...url };
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
