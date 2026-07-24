# FireFlow — All-B2B Refactor Plan

**Status:** proposal / read-only audit. No code changed by this document.
**Author context:** continuation brief for the "go all-B2B" pivot. Read alongside
`HANDOFF.md`, `CHANGELOG.md`, and `CLAUDE.md`.

## Goal

Remove the individual-consumer complaint path entirely. Make the whole experience
account service + ordering for **retailers and distributors** (B2B accounts). Then
add four new commerce flows:

1. Bulk / case ordering (SKUs, case pack, MOQ, price tiers, lead time)
2. Price / quote inquiry (RFQ)
3. Subscription / standing order (recurring PO)
4. Retailer account issue / escalation (the reworked, B2B-only version of today's
   inquiry system)

## Style + honesty rules the implementer must hold (from HANDOFF.md / CLAUDE.md)

- **No arrows in visible copy:** no `→`, `->`, `↗`. Use words ("routes to", "then").
- **No em dash as a sentence separator.** A lone `—` as a "no value" table cell is fine.
- **No underlined links.** Signal links by color + weight only.
- **Colorblind-safe state:** never signal status by color alone. Add a glyph, word, or
  shape (Nathan is colorblind). Every new severity/status/tier chip needs a text label
  or icon, not just a color.
- **CTAs name the action:** "Request a quote", "Add case to order", not "Submit" / "Go".
- **Honesty:** everything commercial is **synthetic and clearly labeled**. No real
  Samyang prices, MOQs, lead times, accounts, orders, or metrics. Price tiers, MOQs,
  lead times, and account names must carry a synthetic/editorial `SourceType` and a
  visible "synthetic" label, exactly as `ResolutionScenario.synthetic: true` and the
  `VENDOR_ACCOUNTS` list do today.
- **Do not invent official facts.** Case pack / net weight / allergens stay bound to the
  format-level variant and only where an official source already exists. Orderability
  (price, MOQ, lead time) is a **separate synthetic layer keyed by variant id**, never
  merged into the official variant facts.
- Keyboard operable, `prefers-reduced-motion` respected, visible focus, no `<Button>`
  nested in `<a>` (use `ButtonLink`). Run a grep sweep for banned glyphs after copy edits.

---

# PART A — Consumer removal map

## A.0 Recommended new `userMode` set

Today: `type UserMode = "explore" | "consumer" | "vendor";`

**Recommendation:** collapse to two account-facing lanes plus explore. The site is now
100% B2B, and "vendor" (a supplier-facing word) reads backwards for the audience, which
is Samyang's *customers* (retailers and distributors buying product). Rename accordingly.

```ts
export type UserMode = "explore" | "retailer" | "distributor";
```

Rationale for the role: a CX Manager serves the trade channel. "Retailer" (a store or
chain buying to resell) and "distributor" (buys in bulk, resells to retailers) are the
two real B2B account archetypes and let flows differ meaningfully (MOQ, case vs pallet,
standing orders). If the team prefers the least-churn option, a single non-explore mode
`"account"` also works and is noted below as the fallback.

**Fallback (minimal):** `type UserMode = "explore" | "account";` — one B2B lane. Fewer
copy variants, but loses the retailer-vs-distributor storytelling.

Either way, `"consumer"` is deleted from the union. Everywhere the union is narrowed
(store hydrate, URL parse) must be updated or `tsc -b` breaks.

## A.1 `InquiryChannel` — the type that quietly gates half the app

`src/types/domain.ts:263` — `export type InquiryChannel = "consumer" | "vendor";`

This is separate from `UserMode` and is the deeper dependency. It is used by
`InquiryIssue.channel`, `ResolutionScenario.channel`, `InquiryDialog`, `InquiryPaths`,
`CommandCenter`, `ResolutionSimulator`, and the derived arrays in `scenarios.ts`.

**Recommendation:** repurpose it into the B2B flow taxonomy rather than deleting it, so
the routing/severity machinery survives. Replace with:

```ts
export type InquiryChannel = "order" | "quote" | "standing-order" | "account-issue";
```

(These map 1:1 to the four new flows. Part B builds the data behind them.) Any code that
branches `channel === "consumer"` vs `"vendor"` must be rewritten against the new set.
This is the single biggest source of would-be type errors, so treat it as the spine of
the refactor.

## A.2 File-by-file inventory

Legend: **DELETE** = remove code/data; **RENAME** = keep behavior, change label/id to a
B2B word; **RETARGET** = repoint to a B2B flow (Part B).

### `src/types/domain.ts`
- L64 `UserMode` includes `"consumer"` — **RENAME** the union per A.0.
- L263 `InquiryChannel` — **RENAME/REPURPOSE** per A.1.
- L189 `ProductFamily.consumerQuestions?: string[]` — **DELETE** the field (or RENAME to a
  B2B concept, e.g. `buyerQuestions`). Removing it forces edits in families.ts,
  ProductDossier, and the anchor-completeness check in data/index.ts. See A.3.
- `vendorQuestions` (L190) — **KEEP**, it is already the B2B-facing field. Optionally
  RENAME to `accountQuestions` for clarity, but not required.
- `InquiryIssue` / `Severity` / `ResolutionScenario` shapes — **KEEP** structurally; they
  are reused by the account-issue flow (Part B, flow 4). Only the `channel` values change.

### `src/state/homeStore.tsx`
- L204 URL parse: `if (mode === "consumer" || mode === "vendor" || mode === "explore")`
  — **RENAME** to the new mode values (`retailer`/`distributor`/`explore`). If a stale
  `?mode=consumer` arrives from an old shared link, it should fall through to `explore`
  (it will, since it no longer matches) — acceptable.
- L160 `loadPersisted` default `parsed.userMode ?? "explore"` — safe, but if a returning
  visitor has `"consumer"` in localStorage it will hydrate an invalid mode. **ADD** a
  guard: coerce any non-`retailer`/`distributor` value to `"explore"`.
- L42 / L38 `INITIAL_STATE.userMode: "explore"` — no change (explore stays).
- No `"consumer"` string literal elsewhere in the reducer; `SET_MODE` is value-agnostic.

### `src/data/issues.ts` — **the core data rework**
- `CONSUMER_ISSUES` (L11–122) — **DELETE** entirely. This is the individual-consumer
  complaint taxonomy (missing sauce, crushed chips, allergic reaction, etc.). None of it
  survives the pivot.
- `VENDOR_ISSUES` (L124–245) — **KEEP and RETARGET.** This already is the B2B account
  taxonomy (PO issue, partial fill, deduction, EDI, pricing). It becomes the seed for
  the **account-issue / escalation flow** (Part B, flow 4). Change each item's
  `channel: "vendor"` to `channel: "account-issue"` (per A.1) and rename the export to
  `ACCOUNT_ISSUES`.
- L247 `ALL_ISSUES = [...CONSUMER_ISSUES, ...VENDOR_ISSUES]` — **EDIT** to reference only
  the surviving array(s). Every `routeTo: ["Consumer Care", ...]` string inside the
  deleted array goes with it; no "Consumer Care" strings remain in issues.ts afterward.
- File header comment (L3–9) mentions "Consumer and vendor issue taxonomies" — **RENAME**.

### `src/data/scenarios.ts` — Resolution Simulator data
- Four `channel: "consumer"` scenarios: `s-carbonara-missing-sauce` (L12),
  `s-chips-crushed` (L46), `s-sauce-leaking` (L75), `s-carbonara-allergen` (L104) —
  **DELETE** all four. They are consumer complaints and reference deleted issue ids
  (`c-*`) and consumer owners ("Consumer Care specialist").
- Three `channel: "vendor"` scenarios: `s-carbonara-partial-order` (L136),
  `s-retailer-deduction` (L167), `s-edi-failure` (L198) — **KEEP and RETARGET** to
  `channel: "account-issue"`. These already model the B2B lifecycle and reference `v-*`
  issue ids that survive.
- L231 `CONSUMER_SCENARIOS = SCENARIOS.filter(...channel === "consumer")` — **DELETE**
  (the array will be empty and is consumed by ResolutionSimulator; see below).
- L232 `VENDOR_SCENARIOS` — **KEEP/RENAME** to `ACCOUNT_SCENARIOS`.
- **Recommendation:** add new synthetic scenarios for the three commerce flows (a filled
  bulk order, a completed quote, a standing-order amendment) so the simulator still has
  breadth. Detailed in Part B.
- **Warning:** with only three scenarios left, `ResolutionSimulator.tsx:18`
  `CONSUMER_SCENARIOS[0]!` will be a dangling reference and a runtime crash. Must fix.

### `src/data/families.ts`
- Six anchors carry `consumerQuestions: [...]` at L100, L139, L203, L254, L319, L371 —
  **DELETE** those blocks (or migrate content into `vendorQuestions`/`buyerQuestions`).
  Tied to the domain field decision in A.2/domain.ts.
- `vendorQuestions` blocks (L106+ etc.) — **KEEP.**

### `src/data/index.ts`
- L62 `if (!f.consumerQuestions?.length) push("error", ...missing consumerQuestions...)`
  — **DELETE** this integrity assertion (the field is gone). Leave the `vendorQuestions`
  check (L63) or rename it. If you skip this, `tsc -b` errors on the removed field.

### `src/components/navigation/MegaNav/MegaNav.tsx`
- L60–76 the entire `consumer` group (`id: "consumer"`, `label: "Consumer Care"`,
  "Start a consumer case", `mode: "consumer"`) — **DELETE or REPLACE.**
- **Recommendation:** replace the single "Consumer Care" group with an **"Order & Buy"**
  group surfacing the new commerce flows, and keep/rename the "Vendor Support" group
  (L77–93) as **"Account Support"** for the account-issue flow. New group items point to
  the new section anchors from Part B (e.g. `#order`, `#quote`, `#standing-order`,
  `#account`). Each item's `mode` should be `retailer` (or `distributor`) not `consumer`.
- The nav is a hover/click mega-menu; adding a group is supported by the `GROUPS` array
  with no structural change. Keep group count reasonable (there are currently 5).

### `src/components/home/InquiryPaths/InquiryPaths.tsx` — the two-path component
- L6 imports `CONSUMER_ISSUES` — **EDIT** import (drop consumer, keep account issues).
- L29 `consumerIssueId` state — **DELETE.**
- L38 + L143 heading "Two Paths: Consumer &amp; Vendor" — **RENAME** (e.g. "Account
  Support: order issues and escalations"). It is no longer two paths in the
  consumer/vendor sense.
- L55 `emphasized = state.userMode === channel` — breaks once `UserMode` and
  `InquiryChannel` values diverge (they already differ). **REWORK** the emphasis logic so
  it compares against the retailer/distributor lane, or drop mode-emphasis here.
- L63 `channel === "consumer" ? "Consumer Care" : "Vendor & Retailer Support"` —
  **RENAME/REWORK** into the account-issue framing.
- L116/L161 `dispatch SET_MODE mode: channel` and `renderPath("consumer", ...)` — the
  consumer render call goes away; keep only the account-issue render.
- L149–158 `OperatorNote` copy ("belongs to Consumer Care, Quality, Logistics, or
  Finance") — **EDIT** copy to drop "Consumer Care" and speak to the trade account.
- **Bigger recommendation:** this component becomes the **account-issue/escalation** flow
  (Part B, flow 4). The three new commerce flows (order, quote, standing order) should be
  their own components/sections rather than crammed into InquiryPaths.

### `src/components/home/InquiryDialog/InquiryDialog.tsx`
- L16 doc comment "consumer and vendor paths render..." — **EDIT.**
- L62–66 `MODE_LABEL: Record<UserMode, string>` maps `consumer: "Consumer Care"` — this is
  a `Record<UserMode, string>`, so it **will not compile** once `UserMode` changes.
  **REWRITE** to the new modes.
- L195–197 `channel === "consumer" ? renderConsumer() : renderVendor()` — **REWORK** the
  branch against the new `InquiryChannel` set.
- L222–284 `renderConsumer()` — **DELETE** (consumer case card).
- L286+ `renderVendor()` — **KEEP/RENAME** as the account-issue case card; it already
  renders account, PO, invoice, SLA, cross-functional partners.
- The synthetic `VENDOR_ACCOUNTS` list (L68–74) and PO/invoice generation are reusable
  across the new order/quote/standing-order dialogs — factor into a shared synthetic
  helper if convenient.

### `src/components/home/ResolutionSimulator/ResolutionSimulator.tsx`
- L3 import `CONSUMER_SCENARIOS` — **EDIT** import.
- L18 `CONSUMER_SCENARIOS[0]!` fallback — **DANGLING/CRASH** once the array is empty.
  **REPOINT** to the account-scenario default.
- L39–41 "Consumer" picker label + group + `CONSUMER_SCENARIOS.map` — **DELETE** the
  consumer picker column (or replace with a picker across the four B2B flows).
- L75 `scenario.channel === "consumer" ? "Consumer" : "Vendor"` — **REWORK** to label by
  the new channel set.

### `src/components/home/CommandCenter/CommandCenter.tsx`
- L60–61 metric "Vendor vs consumer" / "Vendor cases (rest are consumer)" — **REWORK** the
  metric to a B2B split (e.g. orders vs escalations, or retailer vs distributor).
- L70 `CHANNEL_LABEL: Record<InquiryChannel, string> = { consumer, vendor }` — **will not
  compile** after the `InquiryChannel` change. **REWRITE** for the new channels.
- L71 `CHANNEL_ICON` same `Record<InquiryChannel,...>` — **REWRITE** (keep glyphs, they are
  the colorblind-safe signal).
- L80 `consumerCount = SCENARIOS.length - vendorCount` and L124 display — **REWORK** the
  counting against the new channel set.

### `src/components/home/SupportBar/SupportBar.tsx` (floating FAB)
- L8 doc comment "consumer/vendor toggle" — **EDIT.**
- L16–17 `useState<Exclude<UserMode,"explore">>(... "consumer")` — **will not compile**
  after `UserMode` change; **REWRITE** default (retailer).
- L91–108 the Consumer/Vendor toggle and "Consumer" button (L98) — **REWORK** to a
  retailer/distributor toggle, or repoint the FAB to "Start an order" / "Open a case".
- L110–112 "Start a {channel} case" — **RENAME** CTA to name the B2B action.

### `src/components/home/ProductDossier/ProductDossier.tsx`
- L156–171 questions block renders `consumerQuestions` (L158–162, "Common consumer
  questions") and mutes by `userMode === "consumer"` / `"vendor"` — **DELETE** the
  consumer-questions half; keep vendor/account questions. Update the mute logic to the
  new modes.
- L200–208 CTA "Ask as a consumer" with `SET_MODE mode: "consumer"` — **DELETE or
  RETARGET** to a B2B CTA ("Request a quote" or "Add to order"). The "Ask as a vendor"
  CTA (L209–216) stays/renames.

### `src/components/home/ProductSignalHero/ProductSignalHero.tsx`
- L46 copy "how consumer and vendor questions become structured..." — **EDIT** copy.
- L120–127 "Ask as a consumer" CTA + `SET_MODE mode: "consumer"` — **DELETE or RETARGET**.
  Keep/rename "Ask as a vendor" (L128–135).

### `src/components/home/SelectedProductRail/SelectedProductRail.tsx`
- L22 doc comment "(consumer care, vendor support, ...)" — **EDIT.**
- L105–111 desktop "Consumer care" action + `SET_MODE mode: "consumer"` — **DELETE or
  RETARGET** (e.g. "Request quote").
- L183–189 mobile-panel "Consumer care" action — same **DELETE/RETARGET.**
- L150 `state.userMode` is rendered as a raw chip — verify the new mode words read well.

### `src/components/home/SelectedProductRail/SelectedProductRail.module.css`
- L84 `.mode[data-mode="consumer"] { border-color: var(--info); }` — **DELETE** and add
  rules for the new `data-mode` values (`retailer`, `distributor`). Because state is also
  signaled by the mode word in the chip, the color rule is decorative, but keep parity.

### `src/components/home/ComparisonLab/ComparisonLab.tsx`
- L114 inline link "Consumer" that dispatches `SET_MODE mode: "consumer"` — **DELETE or
  RETARGET** to a B2B action. Check the adjacent vendor link renders correctly after.

### `src/components/home/BrandUniverse/BrandUniverse.tsx`
- L12 `consumer: string` field on the ANGLES type; L20/26/32/38 the `consumer:` copy per
  brand; L98 "consumers and vendors"; L114/131/150/164 `<dt>Consumer</dt>` rows —
  **REWORK.** Recommendation: replace the "Consumer" angle with a **buyer/shopper-demand**
  angle framed for the account ("what shoppers ask at shelf, which the retailer should
  merchandise for"), so the section still has two lenses without an individual-complaint
  path. Pure copy + one field rename; no type-system impact beyond this file.

### `src/components/home/HomepageFAQ/HomepageFAQ.tsx`
- L26–27 Q&A "Can consumers submit a real complaint?" / "the consumer path shows..." —
  **REWRITE** to a B2B FAQ ("Can I place a real order?" answer: no, synthetic
  demonstration; direct to Samyang America for genuine account/order needs). Keep the
  honest "no real submission / contact Samyang directly" spirit.

### `src/components/employer/EmployerEvidence/EmployerEvidence.tsx`
- L84 copy "For a consumer products company, customer experience is not only..." — this
  uses "consumer products" as an industry descriptor, not the removed complaint path.
  **KEEP** (accurate), or lightly reword; no functional change.

### `src/components/employer/EmployerIntro/EmployerIntro.tsx`
- L32 "more than eight years across consumer products, retail customer operations..." —
  résumé narrative, "consumer products" = industry. **KEEP.** (Also note the honesty rule
  bans "8 years of SAP" specifically; this line is about consumer-products/retail tenure,
  which is allowed, but re-read against the writing-style pack before shipping.)

## A.3 Dead-reference / compile-break checklist (do these together or `tsc -b` fails)

1. `ProductFamily.consumerQuestions` removed => breaks `families.ts` (6 anchors),
   `ProductDossier.tsx` (L156–161), `data/index.ts` (L62). Fix all three in one pass.
2. `UserMode` union changed => breaks the two `Record<UserMode, string>` maps
   (`InquiryDialog.tsx` L62, and any other `Record<UserMode,...>`), `SupportBar.tsx`
   `Exclude<UserMode,"explore">` default, `homeStore` URL/hydrate guards, and any literal
   `mode: "consumer"` dispatch (ProductDossier, ProductSignalHero, SelectedProductRail x2,
   ComparisonLab, MegaNav, InquiryPaths, SupportBar).
3. `InquiryChannel` values changed => breaks `Record<InquiryChannel,...>` in
   `CommandCenter.tsx` (L70–71), every `channel === "consumer"` branch (InquiryDialog,
   InquiryPaths, ResolutionSimulator L75), and the `.filter(channel === ...)` derivations
   in `scenarios.ts`.
4. `CONSUMER_ISSUES` / `CONSUMER_SCENARIOS` exports removed => breaks imports in
   `InquiryPaths.tsx` (L6), `ResolutionSimulator.tsx` (L3, L18, L41). The `L18`
   non-null-asserted `CONSUMER_SCENARIOS[0]!` is a **runtime crash** if left.
5. `ALL_ISSUES` / `ISSUE_BY_ID` (issues.ts L247–248) must be rebuilt from the surviving
   arrays; anything using `ISSUE_BY_ID` with a `c-*` key now returns undefined.
6. Any scenario referencing a deleted `c-*` issue id (`scenarios.ts` deleted blocks) goes
   away with those scenarios, so no orphan lookups remain — but verify no other file
   hardcodes a `c-*` id (grep `"c-"` issue ids).
7. Stale URLs / localStorage carrying `mode=consumer` must degrade to `explore` (guard in
   homeStore, A.2).
8. **Post-edit grep sweep** for leftover visible copy: `consumer`, `Consumer`, `→`, `->`,
   `↗`, and em-dash-as-separator. HANDOFF requires this after copy edits.

## A.4 Consumer-removal file count

**Files touched for consumer removal: 21.**

Types/state/data (6): `types/domain.ts`, `state/homeStore.tsx`, `data/issues.ts`,
`data/scenarios.ts`, `data/families.ts`, `data/index.ts`.

Components (14): `MegaNav.tsx`, `InquiryPaths.tsx`, `InquiryDialog.tsx`,
`ResolutionSimulator.tsx`, `CommandCenter.tsx`, `SupportBar.tsx`, `ProductDossier.tsx`,
`ProductSignalHero.tsx`, `SelectedProductRail.tsx`, `SelectedProductRail.module.css`,
`ComparisonLab.tsx`, `BrandUniverse.tsx`, `HomepageFAQ.tsx`, plus `HomePage.tsx` footer
labels ("Two Paths", "Care & Support" column — RENAME to match the new sections).

Optional / copy-only (leave or light-touch): `EmployerEvidence.tsx`, `EmployerIntro.tsx`
(industry-descriptor uses of "consumer products", not the complaint path).

---

# PART B — Data model for the four new B2B commerce flows

## B.0 Design principles

- **Reuse the product spine.** `ProductFamily` (45) and `ProductVariant` (76, id
  `${familyId}--${format}`) stay the source of truth for what exists. The new commerce
  layer does **not** duplicate product facts. It adds an **orderability record keyed by
  variant id** — every orderable SKU is a variant that has an entry in the new
  `orderability` data. Variants with no entry are simply not orderable in the demo.
- **Synthetic + labeled.** Every price, MOQ, lead time, tier, account, and order number is
  invented. Each new record carries a `SourceType` of `"synthetic"` and a visible label,
  mirroring `ResolutionScenario.synthetic: true` and the existing `VENDOR_ACCOUNTS`
  pattern. Add a shared `SYNTHETIC_COMMERCE_DISCLAIMER` string (like
  `INDEPENDENCE_DISCLAIMER` in `data/sources.ts`) rendered on every commerce section.
- **No official-fact contamination.** Case pack and net weight *may* derive from the
  variant's `netWeight`/`components` only where those are already official; pricing and
  MOQ are always synthetic and rendered with a synthetic chip.
- **Colorblind-safe status.** Any new status/tier enum (order status, quote status,
  lead-time band, tier) renders a word or glyph, never color alone.

## B.1 New types (add to `src/types/domain.ts`)

### Shared

```ts
/** Money in whole USD cents to avoid float drift. All values synthetic. */
export type PriceCents = number;

/** Coarse, colorblind-safe lead-time band; always paired with a word in UI. */
export type LeadTimeBand = "in-stock" | "short" | "standard" | "made-to-order";

/** Account archetype for B2B pricing + flow gating. */
export type AccountType = "retailer" | "distributor";

/** Every commerce record is invented for demonstration. */
export interface SyntheticFlag { synthetic: true; }
```

### Flow 1 — Bulk / case ordering

```ts
/** An orderable SKU. One per orderable variant; keyed by variantId. Synthetic. */
export interface OrderableSku extends SyntheticFlag {
  variantId: string;          // FK to ProductVariant.id (which carries familyId+format)
  sku: string;                // synthetic SKU code, e.g. "SY-BLDK-CARB-MULTI-CASE"
  unitLabel: string;          // e.g. "5-pack (Multi)"
  casePack: number;           // eaches per case (synthetic)
  caseGtin?: string;          // synthetic case barcode, optional
  moq: number;                // minimum order quantity in CASES (synthetic)
  caseIncrement: number;      // orderable step in cases (e.g. 1 or a full layer)
  palletCases?: number;       // cases per pallet, for distributor context
  leadTime: LeadTimeBand;
  storage: StorageType;       // reuse existing enum (ambient/frozen/etc.)
  priceTiers: PriceTier[];    // volume breaks, synthetic
  source: SourceRef;          // type: "synthetic"
}

/** Volume price break. Price is per case. Synthetic. */
export interface PriceTier {
  minCases: number;           // tier floor in cases
  unitPriceCents: PriceCents; // per-case list price at this tier (synthetic)
  accountType?: AccountType;  // optional: distributor tiers deeper than retailer
}

/** A line the visitor builds in the demo order cart (client-side only). */
export interface OrderLine {
  variantId: string;
  cases: number;
}
```

Product-to-SKU mapping: `OrderableSku.variantId` is the join. A helper
`skuForVariant(variantId)` and `orderableVariantsForFamily(familyId)` (mirroring the
existing `defaultVariantForFamily`/`imageForVariant` helpers) resolve the family/format
display from existing data, so the SKU record stays thin.

### Flow 2 — Price / quote inquiry (RFQ)

```ts
export type QuoteStatus = "draft" | "submitted" | "priced" | "expired";

/** A synthetic RFQ built from cart lines. No backend; generated in-browser. */
export interface QuoteRequest extends SyntheticFlag {
  id: string;                 // synthetic, e.g. "RFQ-40231"
  accountType: AccountType;
  lines: OrderLine[];
  requestedShipWindow?: string; // free text label, synthetic
  status: QuoteStatus;
  // Derived, synthetic quote math shown as an illustration only:
  subtotalCents: PriceCents;
  estLeadTime: LeadTimeBand;
  validUntil: string;         // synthetic ISO date
}
```

The quote total is computed client-side from `OrderableSku.priceTiers` and labeled
"illustrative synthetic pricing". No stored/real prices.

### Flow 3 — Subscription / standing order

```ts
export type OrderCadence = "weekly" | "biweekly" | "every-4-weeks" | "monthly";
export type StandingOrderStatus = "active" | "paused" | "pending-approval";

export interface StandingOrder extends SyntheticFlag {
  id: string;                 // synthetic, e.g. "SO-2207"
  accountType: AccountType;
  cadence: OrderCadence;
  nextShipDate: string;       // synthetic ISO date
  lines: OrderLine[];
  status: StandingOrderStatus;
  amendmentWindowDays: number;// how many days before ship you can edit (synthetic)
  autoHoldOnBackorder: boolean;
}
```

### Flow 4 — Retailer account issue / escalation

Reuse the existing `InquiryIssue` / `Severity` / `ResolutionScenario` shapes (they
already model this well). The only change is `InquiryChannel` becomes the four-flow set
(A.1), and the surviving `VENDOR_ISSUES` become `ACCOUNT_ISSUES` with
`channel: "account-issue"`. Optionally add an order/quote/standing-order linkage:

```ts
export interface InquiryIssue {
  // ...existing fields...
  channel: InquiryChannel;    // now "account-issue" for these
  relatesTo?: "order" | "quote" | "standing-order" | "delivery" | "invoice";
}
```

## B.2 New data files under `src/data/`

1. **`src/data/skus.ts`** — `export const ORDERABLE_SKUS: OrderableSku[]` plus
   `SKU_BY_VARIANT` and helper `orderableVariantsForFamily`. Seed with the ~15–25 highest
   priority variants (the anchors' Multi/Big Bowl/Cup formats, the 200g/350g sauces,
   frozen dumplings) so the catalog is representative, not all 76. Every record
   `synthetic: true`, `source.type: "synthetic"`.
2. **`src/data/pricing.ts`** — optional split: if price tiers grow, keep `PriceTier`
   tables here keyed by sku, and let `skus.ts` reference them. If kept inline in
   `OrderableSku.priceTiers`, this file is not needed. Recommend inline for the demo's
   size; add `pricing.ts` only if tiers get reused across SKUs.
3. **`src/data/quotes.ts`** — synthetic sample `QuoteRequest`s for the simulator/command
   center (e.g. 2–3 in different statuses), and the client-side quote-math helper
   `buildQuote(lines, accountType)`.
4. **`src/data/standingOrders.ts`** — synthetic sample `StandingOrder`s (active, paused,
   pending-approval) for the standing-order flow and command-center metrics.
5. **`src/data/issues.ts`** — *edit in place*, not new: rename `VENDOR_ISSUES` to
   `ACCOUNT_ISSUES`, delete `CONSUMER_ISSUES`, add any order/quote/standing-order-specific
   issue rows (e.g. "Amend a standing order", "Quote expired", "Case pack mismatch").
6. **`src/data/scenarios.ts`** — *edit in place*: delete consumer scenarios, retarget
   vendor scenarios to `account-issue`, and add 3 new synthetic scenarios (a fulfilled
   bulk order, a completed quote-to-order, a standing-order amendment) so the Resolution
   Simulator shows the commerce flows end to end.
7. **`src/data/index.ts`** — *edit*: `export *` the new files; extend
   `checkDataIntegrity()` with commerce checks (every `OrderableSku.variantId` resolves to
   a real variant; every `priceTiers` sorted ascending with a base tier; MOQ ≥ 1;
   `StandingOrder.lines` reference orderable SKUs) and add a `DATA_SUMMARY.skus` count.
   Remove the `consumerQuestions` assertion (A.2).

## B.3 New component directories under `src/components/home/`

Following the existing one-folder-per-chapter convention (`ComponentName/ComponentName.tsx`
+ `.module.css`):

1. **`OrderBuilder/`** — flow 1. Product/format picker (reads existing families/variants),
   case-quantity stepper honoring `moq`/`caseIncrement`, live price-tier readout, a
   client-side cart in `homeStore` (new `orderLines` state + `ADD_ORDER_LINE` /
   `SET_ORDER_LINE_QTY` / `CLEAR_ORDER` actions), and a synthetic "order summary" dialog
   (reuse `InquiryDialog`'s synthetic-case pattern). Section anchor `#order`.
2. **`QuoteRequest/`** — flow 2. Takes the current cart, shows illustrative synthetic
   totals via `buildQuote`, and produces a synthetic RFQ confirmation. Section `#quote`.
   Can share a dialog primitive with OrderBuilder.
3. **`StandingOrder/`** — flow 3. Cadence + next-ship + lines editor, status chip
   (word+glyph), amendment-window note. Section `#standing-order`.
4. **Account issue / escalation** — flow 4. **Rework the existing `InquiryPaths/` +
   `InquiryDialog/`** rather than a new folder; they already do routing, severity, SLA,
   cross-functional partners, and the SAP O2C linkage. Section stays `#resolve` (rename
   the heading/anchor to `#account` if desired for clarity, updating footer + nav).

Cart state note: the three commerce flows share one client-side cart, so add
`orderLines: OrderLine[]` to `HomeState` (persist to localStorage like `compareIds`; never
persist anything that looks like a real submission). Keep the "no backend, synthetic"
labeling from `InquiryDialog` on every confirmation.

## B.4 Store, nav, page wiring (summary)

- `homeStore.tsx`: add `orderLines` + `accountType` (or reuse the renamed `userMode`
  retailer/distributor) and the cart actions; URL-sync is optional (cart need not be
  shareable). Guard stale `consumer` mode.
- `MegaNav.tsx`: new "Order & Buy" group linking `#order`, `#quote`, `#standing-order`;
  "Account Support" group linking `#account`.
- `HomePage.tsx`: insert `<OrderBuilder/>`, `<QuoteRequestSection/>`, `<StandingOrder/>`
  into `<main>` (logical spot: after `ProductDossier`, before/around `InquiryPaths`), and
  update the footer `FOOTER_COLUMNS` labels ("Two Paths", "Care & Support") to the new
  sections.
- Command Center: add synthetic commerce metrics (open quotes, standing orders due,
  orders below MOQ) alongside the retargeted escalation metrics.

## B.5 Honesty checklist for the commerce layer

- Every SKU/price/MOQ/lead-time/quote/standing-order row is `synthetic: true` with a
  `"synthetic"` `SourceType` and a visible label.
- A `SYNTHETIC_COMMERCE_DISCLAIMER` renders on each commerce section and each confirmation
  dialog: "Demonstration only. No real Samyang catalog, pricing, MOQs, lead times, or
  orders. Nothing is transmitted."
- No real Samyang SKU codes, GTINs, prices, account names, or order numbers. Use the
  invented-name pattern already established by `VENDOR_ACCOUNTS`.
- Status/severity/tier signaled by word + glyph, not color alone.
- CTAs name the action: "Add case to order", "Request a quote", "Start a standing order",
  "Open an account case".
- Post-build grep sweep for `→ -> ↗`, em-dash separators, underlined links, and any
  residual "consumer" copy.
