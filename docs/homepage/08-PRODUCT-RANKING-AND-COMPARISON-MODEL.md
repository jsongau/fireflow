# 08 — Product Ranking & Comparison Model

**Prepared:** 2026-07-07 · **Status:** Core doc, complete
**Basis:** catalog docs `04_POPULARITY_AND_PRIORITY_TIERS.md`, `10_RANKING_SYSTEM.md`, `13_PRODUCT_COMPARISON_UX.md`.

## Governing principle

No single "best product" score. Rankings are multiple, transparent, and honest about their inputs. Retail review counts are **engagement on one listing**, never total U.S. sales, unique customers, market share, or satisfaction. Every ranking view exposes: what is measured, how it is calculated, which inputs are official vs. external vs. synthetic, a confidence level, and a last-reviewed date.

## The ranking views

Each has a plain-language purpose line shown in the UI, an inputs list, a 0–100 normalized display scale, weighting, confidence, missing-data behavior, and the public-facing label.

### 1. Portfolio Priority Index
- **Purpose (UI):** "Which products we'd build and staff support for first."
- **Inputs & weight:** official prominence 25 · retail visibility 25 · format breadth 15 · category importance 15 · support/inquiry value 10 · evidence confidence 10.
- **Confidence:** medium-high for Tier-A anchors (multiple public signals), lower for Tier C/D.
- **Missing data:** absent input contributes 0 and is shown struck-through with a tooltip; the confidence badge drops a level. Never imputed silently.
- **Public label:** "Portfolio Priority — FireFlow editorial index. Not an official Samyang ranking."
- **Risk:** reads as a bestseller list. Mitigation: label + methodology drawer + confidence badge.

### 2. First-Time Buyer Fit
- **Purpose:** "How approachable this is for someone new to Buldak-level heat."
- **Inputs:** heat accessibility · familiar flavor · preparation simplicity · format convenience · guidance confidence.
- **Nature:** editorial experience score, explicitly *not* an official rating.
- **Missing data:** if heat positioning is unknown, product is excluded from this view rather than guessed.

### 3. Vendor Opportunity
- **Purpose:** "Where a retailer/distributor conversation is most worth having."
- **Inputs:** retail visibility · category growth potential · format options · education needs · marketing-support potential · inquiry demand.

### 4. Customer Guidance Opportunity
- **Purpose:** "Where clearer information or support would most improve the experience."
- **Inputs:** preparation questions · heat expectation · allergen questions · format confusion · package-component complexity · availability demand.
- **Critical framing (UI, always visible):** "A high score means better guidance could help. It does **not** mean the product is defective." (Enforced copy — see `13`.)

### 5. Support Complexity
- **Purpose:** "How much operational care a product needs to support well."
- **Inputs:** number of formats · number of components · frozen vs. ambient handling · allergen complexity · preparation steps · likely order/logistics questions.

### 6. Format Versatility *(derived)*
- **Purpose:** "How many ways a family shows up on shelf (Multi / Big Bowl / Cup / Bag / bottle / stick / frozen)."
- **Input:** count + diversity of formats from the variant model. High-confidence (structural fact), low subjectivity.

### 7. Retail Visibility *(external signal, isolated)*
- **Purpose:** "Public retail engagement snapshot."
- **Input:** captured review/rating counts and merchandising markers (e.g., Walmart "Overall Pick"), each with retailer + snapshot date.
- **Label:** "Public retail signal — single-listing engagement, date-stamped. Not sales." Kept visually distinct from editorial scores so it is never confused with them.

### 8. Evidence Confidence *(meta)*
- **Purpose:** "How well-sourced this product's data is."
- **Input:** proportion of official vs. editorial vs. synthetic fields; recency. Drives the confidence badges shown on all other views.

## Score display rules

- Normalized 0–100 for cross-product comparison; the raw component breakdown is available in an expandable "How this is calculated" panel (animated, but content is present without animation and without hover — no hover-only info).
- Each score chip carries a source-type marker: **Official · Retail signal · Editorial · Synthetic**.
- Confidence shown as a labeled badge (High / Medium / Low) with text, not color alone.
- Last-reviewed date on every ranking view.

## Comparison model

- Start from useful **preset comparisons** (from catalog `13`): Carbonara vs Cream Carbonara; Cheese vs Quattro Cheese; Original vs 2X Spicy; Original vs Habanero Lime; Buldak noodles vs Samyang soup ramen; Original vs Carbonara hot sauce; the three potato-chip flavors; Tangle vs Buldak.
- **Dimensions:** brand · category · formats · flavor · heat positioning · creaminess · preparation · soup/stir-fry · storage · public allergens · expected package components · first-time fit · support complexity · inquiry themes · evidence confidence.
- **Allergens & prep are variant-bound.** Comparison compares the *selected format* of each family (default Multi where available), and the row is labeled with the format. Changing a product's format in the compare tray updates its allergen/prep/component cells.
- **Behaviors:** add/remove products (tray, max 4); "hide matching rows" to surface only differences; highlight differences; shareable via URL (`?compare=buldak-original,buldak-2x-spicy`); mobile stacks to a per-product accordion with a difference toggle; the table is a real semantic `<table>` with scope headers; each product column has direct "Ask as consumer / Ask as vendor" actions that carry the product + format into the inquiry.

## Accessibility

Rankings use accessible tabs/segmented control (arrow-key navigation, `aria-selected`). Score bars have text values, not color-only. Sorting is announced via a polite live region. The scatter-style Flavor view (doc `09`) always ships a table fallback; ranking tables are keyboard-sortable with `aria-sort`.

## What we will not do

No fabricated sales, revenue, velocity, unit counts, satisfaction scores, or "official Samyang ranking." No SCU/Scoville-style scientific heat numbers attached to Samyang products unless a product-specific official source supports them (none currently do — heat is expressed as *positioning*, e.g., "extreme-heat anchor," not a number).
