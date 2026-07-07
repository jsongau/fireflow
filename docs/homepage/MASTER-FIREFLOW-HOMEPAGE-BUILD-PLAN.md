# MASTER — FireFlow Product Intelligence Homepage Build Plan

**Owner:** Nathan J. Song
**Purpose:** Independent portfolio piece supporting an application for **Manager, Customer Experience — Samyang America** (Brea, CA; $100–122k; owns service & order-management strategy, order-to-cash, escalation standards, service levels / fill rates / CSAT, deductions & disputes, SAP SD + EDI, cross-functional leadership).
**Prepared:** 2026-07-07
**Status:** Documentation phase — core docs complete, build not yet started.

This document synthesizes the source audit and the core planning docs into one ordered production plan. It is the single source of truth for the homepage build. Where a decision is recorded, see `DECISIONS.md` for the full rationale; where a fact comes from a source, see `DATA_SOURCES.md`.

---

## 1. Confirmed decisions (from Nathan, 2026-07-07)

| Decision | Choice | Consequence |
|---|---|---|
| Technical stack | **React + Vite + TypeScript**, custom CSS with design tokens | Build step required; component + type discipline; app is served, not opened as a file. |
| Documentation depth | **Master plan + core docs first**, remaining docs filled per section during build | Docs 00, 04, 06, 08, 09, 10, 12 written now; 01–03, 05, 07, 11, 13–20 completed as their section is built. |
| MVP product scope | **Tier A Launch Anchors (6 products)** with full data; all 45 families browseable with lighter data | Deep, credible flagship experiences; honest labeling of editorial/synthetic fields for non-anchor families. |

MVP anchor set: **Buldak Carbonara, Buldak Original, Buldak 2X Spicy, Buldak Habanero Lime, Buldak Original Hot Sauce, Buldak Carbonara Hot Sauce.**

---

## 2. Final homepage objective

A first-time visitor (recruiter or hiring manager) should, within ~90 seconds, understand that FireFlow is a product-intelligence + customer-experience operating concept, not a store or a help desk. An engaged visitor should be able to select a real Samyang product, understand how it is experienced, compare it, open a consumer or vendor inquiry pre-populated with that product's facts, watch a synthetic case move through a governed resolution lifecycle, and see how repeated cases become portfolio improvement. Every chapter must prove at least one responsibility from the target job.

The page is **product-first**: the selected product is the spine that runs through every chapter via one shared state object.

---

## 3. Final chapter order

Refined from the brief's 18 chapters. Rationale in `06-HOMEPAGE-INFORMATION-ARCHITECTURE.md`. Chapters marked **MVP** ship in the first build; others are scaffolded and filled in later waves.

| # | Chapter | Anchor interaction | Job competency proven | Wave |
|---|---|---|---|---|
| 1 | **Hero — Product Signal Engine** | Brand/format/experience selector that seeds page state | Product knowledge; customer-first framing | MVP |
| 2 | **Context trail + sticky chapter nav** | Scroll-spy chapter rail, selected-product chip | Navigability; operational clarity | MVP |
| 3 | **Selected Product Rail** | Persistent identity rail (desktop) / bottom bar (mobile) | Continuity; "never make the user repeat info" | MVP |
| 4 | **Portfolio Pulse** | Brand → category filter; family vs. format toggle | Portfolio organization; taxonomy | MVP |
| 5 | **Rankings Lab** | Tabbed multi-axis rankings with methodology + confidence | Data integrity; transparent measurement | MVP |
| 6 | **Flavor & Format Explorer** | Approachable↔Adventurous / Simple↔Layered scatter w/ table fallback | Customer guidance; discovery | Wave 2 |
| 7 | **Comparison Lab** | Side-by-side with difference highlighting | Product knowledge; guidance | MVP |
| 8 | **Product Dossier** | Format-bound facts (allergens/prep per variant) | Product mastery; data honesty | MVP |
| 9 | **Two Paths — Consumer & Vendor** | Product-aware inquiry launchers | Retailer/distributor + consumer support | MVP |
| 10 | **Resolution Simulator** | Stateful case timeline (consumer + vendor scenarios) | Escalation, complex issue resolution, deductions | MVP |
| 11 | **CX Command Center preview** | Drill-down synthetic case queue | Order management; SLA; leadership | Wave 2 |
| 12 | **Product Signals & Continuous Improvement** | Signal → root cause → action → measure | Continuous improvement; trend analysis | Wave 2 |
| 13 | **Brand Universe** | Four differentiated brand panels | Portfolio breadth | Wave 3 |
| 14 | **Methodology & Trust** | Source/confidence disclosure | Data integrity; governance | MVP |
| 15 | **Portfolio Case Study preview** | Restrained; links to deeper page | Self-framing (kept minimal) | Wave 3 |
| 16 | **FAQ** | `<details>` accessible disclosures | Clarity; honesty | MVP |
| 17 | **Mega navigation** | Built last, from final IA | IA discipline | Wave 3 |
| 18 | **Footer** | Built last, from final sitemap | Completeness; disclosure | Wave 3 |

**MVP definition of the first shippable homepage:** Chapters 1–5, 7–10, 14, 16 working with the 6 anchors, plus a temporary compact header and a real (non-mega) footer with the disclaimer. Mega nav, Command Center, Signals, Brand Universe, Flavor Explorer, and the full footer arrive in later waves.

---

## 4. Section dependencies

```
Data foundation (families, variants, brands, rankings, scenarios, sources)
   └─> Design tokens + primitives (buttons, cards, forms, status, focus, motion)
         └─> Page shell (skip link, temp header, main, context trail, chapter anchors)
               └─> Hero (writes selectedFamily/variant/mode) ─┐
                     ├─> Selected Product Rail (reads state)   │ shared
                     ├─> Chapter Nav (reads chapter + state)   │ state
                     ├─> Portfolio Pulse (writes brand/category)│
                     ├─> Rankings Lab (writes compare, selection)
                     ├─> Comparison Lab (reads compareIds)
                     ├─> Dossier (reads selectedVariant → format-bound facts)
                     ├─> Inquiry Paths (reads product + mode)
                     └─> Resolution Simulator (writes case → Command preview)
                           └─> Command Center preview (reads simulator output)
                                 └─> Product Signals (reads case patterns)
Methodology + FAQ (mostly static, source-aware)
Mega nav + Footer (require final routes/sitemap → built last)
```

---

## 5. State architecture

One shared state object, `FireFlowHomeState`, defined in `10-SELECTED-PRODUCT-STATE-MODEL.md`. Implemented as a React context + reducer (`state/homeStore.tsx`), with a thin URL-sync layer (`?product=buldak-carbonara&format=multi&mode=vendor`) and a localStorage layer for **non-sensitive preferences only** (selected product, compare tray, user mode, returning-user flag). Inquiry text is never persisted.

Rule: a section may *read* any state; a section may only *write* the slices it owns (documented per module in `09-INTERACTION-MODULE-MAP.md`) to avoid feedback loops.

---

## 6. CSS architecture

Custom CSS, token-driven, no UI kit. Layered:

1. `styles/tokens.css` — color, type scale, spacing, radii, shadow, motion, z-index, severity tokens (see `12-VISUAL-SYSTEM.md`).
2. `styles/base.css` — reset, semantic element defaults, focus-visible, reduced-motion, skip-link.
3. `styles/primitives.css` — button, card, chip, tab, field, badge, table.
4. Component-scoped CSS modules (`Component.module.css`) per home component.
5. `styles/utilities.css` — a small, deliberate utility set (spacing/flow), not a Tailwind-scale system.

No more than two dense card grids per viewport; alternate immersive and calm sections; one dominant interaction per chapter (design-restraint rules from the brief, enforced in QA).

---

## 7. JavaScript / TypeScript architecture

```
src/
├── app/                      # App shell, routing seam (single route for now)
├── components/
│   ├── home/                 # one folder per chapter component
│   ├── navigation/           # ChapterNav, (later) MegaNav
│   ├── primitives/           # Button, Card, Chip, Tabs, Field, Badge, StatusDot, DataTable
│   └── footer/
├── data/                     # typed JSON-as-TS modules
│   ├── brands/  product-families/  variants/  rankings/  scenarios/  sources/
├── hooks/                    # useHomeState, useScrollSpy, useReducedMotion, useUrlState
├── state/                    # homeStore (context+reducer), selectors
├── styles/                   # tokens, base, primitives, utilities
├── types/                    # domain types (Product, Variant, Ranking, Scenario, Source)
├── utilities/                # formatters, source-label helpers, alias search
└── pages/                    # HomePage composition
```

Strict separation of concerns in data: **product facts** (official), **editorial scoring** (FireFlow model), **synthetic cases/metrics**, and **display copy** live in distinct files/fields, each carrying a `source` and `confidence`. No product data hard-coded into JSX.

---

## 8. Build sequence (phases)

- **Phase 0 — Research & documentation.** Core docs (this set). Remaining docs per section. *(In progress.)*
- **Phase 1 — Data foundation.** Types + JSON for 45 families, 76 variants, 4 brands, aliases, categories, formats, sources, Tier-A full data, sample rankings, representative scenarios.
- **Phase 2 — Design foundation.** Tokens, typography, spacing, grids, primitives, status, focus, motion, loading/skeleton/empty/error states.
- **Phase 3 — Page shell.** Skip link, temp compact header, main structure, context trail, chapter anchors. No mega nav, no final footer.
- **Phase 4 — Product Signal Hero.** First-visit / selected / returning states; role toggle; four direct actions. Complete + test before moving on.
- **Phase 5 — Chapter nav + Selected Product Rail.** Desktop + mobile.
- **Phase 6 — Portfolio Pulse.**
- **Phase 7 — Rankings Lab.**
- **Phase 8 — Flavor & Format Explorer** *(Wave 2)*.
- **Phase 9 — Comparison Lab.**
- **Phase 10 — Product Dossier.**
- **Phase 11 — Consumer & Vendor Paths.**
- **Phase 12 — Resolution Simulator.**
- **Phase 13 — Command Center preview** *(Wave 2)*.
- **Phase 14 — Product Signals** *(Wave 2)*.
- **Phase 15 — Brand Universe** *(Wave 3)*.
- **Phase 16 — Methodology, case-study preview, FAQ.**
- **Phase 17 — Mega navigation** *(after all routes exist)*.
- **Phase 18 — Footer** *(after final sitemap)*.
- **Phase 19 — Full QA & optimization** — mobile, a11y, performance, data, copy, SEO, analytics, regression.

Working method per section: read spec → confirm data → build semantic markup → static layout → progressive interaction → loading/empty/success/error states → keyboard → reduced motion → mobile → overflow/missing-image/missing-data tests → analytics events → update docs + `PROJECT_STATE.md` + `CHANGELOG.md` + `DECISIONS.md` → run section QA → next. No half-finished modules left open while starting new ones.

---

## 9. Testing sequence

Functional → data-integrity → visual → accessibility (one H1, keyboard-only, focus, reduced motion, non-color status) → responsive (320/375/390/430/768/1024/1280/1600) → performance (image/asset budget) → content → product-source labeling → analytics → regression. High-stakes verification (allergen binding, source labeling, "no fabricated official data") is checked with a dedicated review pass, per `19-HOMEPAGE-QA-PLAN.md`.

---

## 10. Definition of done

The homepage is done when: it is product-first; the selected product carries through every chapter; consumer and vendor have distinct coherent paths; rankings are transparent and multi-axis; comparison is meaningful; product facts are source- and format-aware; the resolution simulator runs; the Command preview responds to interaction; every chapter proves a job competency; one H1; keyboard-only usable; reduced-motion supported; mobile is not a squished desktop; no horizontal overflow at 320px; all major states have empty/error handling; product images optimized; primary content survives JS failure; mega nav + footer built from final IA; every source and limitation disclosed; no private or fabricated Samyang data presented as real; and the page feels as deliberate and layered as the reference homepage while being unmistakably FireFlow.

---

## 11. Unresolved risks & open questions

1. **Official image rights.** 54 product PNGs exist from the saved public site; using them in a public portfolio is a rights question. Mitigation: treat as reference; plan for own photography or clearly-labeled placeholder staging; keep image mapping abstract so sources can be swapped. (See `KNOWN_LIMITATIONS.md`.)
2. **Popularity legitimacy.** Retail review counts are single-listing snapshots. Risk: reading them as sales. Mitigation: multi-axis rankings + explicit evidence/confidence/date labels; never "official bestseller."
3. **Allergen/prep correctness.** Facts are format-specific and safety-relevant. Risk: applying a family's allergens to all variants. Mitigation: allergens/prep live only at variant level; QA gate blocks family-level fallback; standing "verify the current physical package" reminder.
4. **SAP over-claiming.** Job wants extensive SAP SD. Risk: implying Nathan has it. Mitigation: label the system integration-ready / system-agnostic; demonstrate process fluency, not tool tenure.
5. **Scope creep.** 18 chapters × deep interaction is large. Mitigation: MVP wave discipline; no chapter left half-built.
6. **Vendor data invention.** Case packs, dimensions, pricing, pallet configs unknown. Mitigation: display as "unavailable / requires approved sell sheet"; never fabricate.

---

## 12. Honest scoring criteria (applied at each wave)

Score 0–5 per axis, no unsupported 5s: product-first coherence, state continuity, interaction meaningfulness (vs. decoration), accessibility, mobile quality, source honesty, job-competency coverage, performance, visual restraint, copy quality. Recorded in `19-HOMEPAGE-QA-PLAN.md` after each wave with before/after notes, mirroring the Sun Bear `FINAL-REVIEW-REPORT` discipline.
