# 06 — Homepage Information Architecture

**Prepared:** 2026-07-07 · **Status:** Core doc, complete

## 1. Page hierarchy (one H1)

- **H1 (hero):** the page's single H1. Working direction: *"Know the product. Understand the friction. Resolve the experience."* (copy alternatives tracked in `13-CONTENT-AND-BRAND-VOICE.md`).
- Each chapter is a `<section>` with an `aria-labelledby` pointing to its **H2**.
- Sub-groups inside a chapter use **H3**. No skipped levels. No second H1 anywhere (the reference `indexv5.html` shipped two H1s — an explicit anti-pattern we avoid; see `01-INDEXV5-STRUCTURAL-AUDIT.md`).

## 2. Chapter order and why

The brief lists 18 chapters. Order is refined to follow a **discover → understand → resolve → operate → trust** arc so a casual visitor gets value early and an engaged one goes deeper — the progressive-depth lesson from the reference homepage.

1. Hero — Product Signal Engine *(hook + seeds state)*
2. Context trail + sticky chapter nav *(orientation)*
3. Selected Product Rail *(continuity)*
4. Portfolio Pulse *(the "what exists" overview)*
5. Rankings Lab *(transparent measurement)*
6. Flavor & Format Explorer *(guided discovery)*
7. Comparison Lab *(decision support)*
8. Product Dossier *(deep single-product truth)*
9. Two Paths — Consumer & Vendor *(from product to inquiry)*
10. Resolution Simulator *(inquiry to governed case)*
11. CX Command Center preview *(cases to operating picture)*
12. Product Signals & Continuous Improvement *(cases to improvement)*
13. Brand Universe *(portfolio texture)*
14. Methodology & Trust *(how we know / what we don't)*
15. Portfolio Case Study preview *(restrained self-framing)*
16. FAQ
17. Mega navigation *(built last)*
18. Footer *(built last)*

Rationale for key moves: Rankings (5) precedes Flavor Explorer (6) so the visitor learns *rankings are multi-axis and sourced* before meeting the most "fun" visualization — this inoculates against reading the scatter plot as objective truth. Dossier (8) sits immediately before the inquiry paths (9) so the exact product and its facts are fresh when an inquiry launches. Methodology (14) comes after the operational chapters, as an earned payoff, not fine print.

## 3. Sub-navigation (sticky chapter rail)

A horizontal (desktop) / condensed (mobile) chapter string that scroll-spies the active section, mirroring the reference's chapter navigation but with product-intelligence labels:

`Portfolio · Rankings · Flavor · Compare · Product · Resolve · Vendor · Command · Signals · Brands · Methodology`

Behavior: updates active chapter on scroll; click/enter scrolls to anchor and moves focus to the section heading; full keyboard support (roving tabindex); shows the **selected product chip** and a compact **role indicator** (Explore / Consumer / Vendor). It must not visually collide with the eventual main nav or the selected-product rail (design-restraint rule: no competing sticky elements — the chapter rail and rail share one sticky zone; see `12-VISUAL-SYSTEM.md`).

## 4. Context trail (breadcrumb)

`FireFlow / Product Intelligence / U.S. Portfolio`

Semantic decision: this is the canonical root homepage, so the trail is **contextual signposting, not a hierarchical breadcrumb**, and we do **not** emit `BreadcrumbList` schema that would imply a parent of "Home." When a product is selected, the trail appends the family and format as non-link context: `… / Buldak Carbonara / Multi`. Rationale recorded in `DECISIONS.md`.

## 5. Section relationships & anchors

Each chapter has a stable `id` used for anchors, scroll-spy, and deep links: `#hero, #portfolio, #rankings, #flavor, #compare, #product, #resolve, #vendor, #command, #signals, #brands, #methodology, #casestudy, #faq`. Cross-links: Rankings rows and Flavor points open the Dossier (`#product`) with that product selected; Dossier's inquiry buttons jump to `#resolve` / `#vendor` with mode set; Signals link back to affected products.

## 6. Pathways into deeper pages (future routes)

The homepage is a rich single page, but it is structured so these become real routes later without IA churn (URL strategy in `10-SELECTED-PRODUCT-STATE-MODEL.md`): `/products`, `/products/:family`, `/compare`, `/rankings`, `/brands/:brand`, `/resolve`, `/vendor`, `/command`, `/methodology`, `/case-study`. Until they exist, links that would leave the page are either in-page anchors or clearly marked "planned" — **no empty placeholder links** (QA gate).

## 7. URL & query-parameter behavior (summary)

Selected product, format, and mode reflect into the URL as query params so a state is shareable and a returning visitor can be restored. Details and the local-storage policy live in `10-SELECTED-PRODUCT-STATE-MODEL.md`. Principle: URL for shareable selection state; localStorage for non-sensitive preference memory; never persist inquiry content.

## 8. Nav-budget discipline

The top-level information architecture is a fixed instrument. New content is routed into an existing section or a sub-menu of the eventual mega nav — the top level is not widened to surface things. The five mega-nav groups (Explore, Consumer Care, Vendor Support, CX Intelligence, About) are the budget; anything new finds a home inside one of them.
