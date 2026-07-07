# 10 — Selected Product State Model

**Prepared:** 2026-07-07 · **Status:** Core doc, complete

One shared selection state runs through every chapter. This is the mechanism that makes the page product-first instead of a set of demos. It is the technical expression of the CX principle *never make the user repeat information*.

## The state shape

```ts
type UserMode = "explore" | "consumer" | "vendor";

type FireFlowHomeState = {
  selectedFamilyId: string | null;   // e.g. "buldak-carbonara"
  selectedVariantId: string | null;  // e.g. "buldak-carbonara-multi" (format-bound facts)
  selectedBrand: string | null;      // "buldak" | "samyang" | "tangle" | "mep"
  userMode: UserMode;                 // drives inquiry CTAs + relevant fields
  rankingMode: string;               // active ranking view id
  flavorMapMode: string;             // active flavor-explorer axis mode
  compareIds: string[];              // family ids in compare tray, max 4
  selectedScenarioId: string | null; // active resolution-simulator case
  selectedSignalId: string | null;   // active improvement signal
  savedProductIds: string[];         // "saved" families (non-sensitive)
  returningUser: boolean;            // set on repeat visit
};
```

## Ownership (who may write what)

To avoid feedback loops, each slice has one or few writer components; everyone else reads.

| Slice | Writers | Readers |
|---|---|---|
| selectedFamilyId / selectedVariantId | Hero, Portfolio Pulse, Rankings row, Flavor point, Dossier format selector | Rail, Dossier, Inquiry Paths, Comparison suggestions, Signals |
| selectedBrand | Hero, Portfolio Pulse, Brand Universe | Portfolio Pulse filter, Rankings filter |
| userMode | Hero role toggle, Rail, Two Paths | Inquiry CTAs, Dossier "relevant questions", Command preview emphasis |
| rankingMode | Rankings Lab | Rankings Lab |
| flavorMapMode | Flavor Explorer | Flavor Explorer |
| compareIds | Rankings, Flavor, Dossier, Comparison Lab | Comparison Lab, Rail (count) |
| selectedScenarioId | Resolution Simulator | Command preview |
| selectedSignalId | Product Signals | Product Signals, Dossier (affected badge) |
| savedProductIds | Rail, Dossier save button | Rail, (future) account |
| returningUser | app bootstrap | Hero (returning state) |

## Cross-section reactions (the point of the model)

- Select **Buldak Carbonara** in the hero → Rail shows it; Dossier loads its Multi facts; Inquiry Paths pre-fill product+format; Comparison suggests "vs Cream Carbonara"; context trail appends `Buldak Carbonara / Multi`.
- Switch to **Vendor** → inquiry CTAs change to vendor issues; Dossier surfaces vendor-relevant fields ("would require an approved sell sheet" for case pack/dimensions); Command preview emphasizes vendor cases.
- Add **Original** + **2X Spicy** to compare → compare tray + Rail count update; Comparison Lab opens with heat framing.
- Complete a **simulator case** → the synthetic Command preview reflects it (adds to queue, updates SLA exposure).
- Select a **signal** → affected products get an "affected" badge in Dossier/Portfolio.

## URL state

Shareable selection reflects into query params; the app hydrates from them on load.

```
?product=buldak-carbonara&format=multi&mode=vendor
?compare=buldak-original,buldak-2x-spicy
?rank=customer-guidance
```

Rules: URL is written with `replaceState` on selection changes (no history spam); unknown/invalid ids are ignored gracefully and fall back to the first-visit state; params are the source of truth on initial load, then in-memory state takes over.

## localStorage policy

Persist **only non-sensitive preferences**, namespaced `fireflow:home:`:

- `fireflow:home:selectedProduct` (family + variant)
- `fireflow:home:compareIds`
- `fireflow:home:userMode`
- `fireflow:home:savedProductIds`
- `fireflow:home:returning` (boolean + first-seen date)

Never persisted: any inquiry text, contact details, evidence descriptions, or case content. A visible **Reset** control clears both URL and storage and returns to first-visit state. Storage is wrapped in try/catch (Safari private mode, quota) and the page is fully functional with storage disabled.

## Returning-user behavior

On load, if `fireflow:home:returning` exists, `returningUser = true` and the hero shows its returning state ("Pick up where you left off — Buldak Carbonara") with a one-tap restore and an easy path to start fresh. Mirrors the reference homepage's returning-visitor memory, applied to product context rather than an astrology reading.

## Implementation

React context + `useReducer` (`state/homeStore.tsx`); typed action creators; memoized selectors in `state/selectors.ts`; `hooks/useUrlState.ts` and `hooks/useHomeState.ts` isolate URL/storage side effects so components stay pure. Progressive enhancement: server/JS-off renders the first-visit content and the full product data statically; interactivity layers on top.
