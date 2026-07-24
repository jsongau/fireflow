# PROJECT_STATE — FireFlow Product Intelligence

**Last updated:** 2026-07-10

## Where we are — TWO TRACKS

**Track A — Single-file build (COMPLETE + verified). This is the finished, viewable deliverable.**
Files: `preview.html` + `preview-data.js` + `public/products/` (keep together; open preview.html in a browser). A complete FireFlow site on the dark **Buldak Night** theme with real product photos and all chapters: mega nav (split-panel), hero, Portfolio Pulse (immersive listing), Rankings Lab, Heat Dial (WebAudio), Comparison Lab (versus/battle), Product Dossier, Two Paths, Resolution Simulator, CX Command Center, Product Signals, Brand Universe, Methodology, FAQ, selected-product side rail, and a floating support bar. Verified: JS syntax clean, all anchors resolve, headless smoke test 0 failures, no beige remaining.

**Track B — React + Vite + TS app (now ported to Buldak Night; needs `npm run build` to finalize).**
`src/` (59 TS/TSX files) contains the verified data foundation (types + all 45 families / 76 variants / rankings engine / scenarios / issues / sources / images.ts), shared state store, dark-themed primitives (tokens.css = Buldak Night, real photos wired into ProductStage), and dark implementations of every section: MegaNav (split panel), Hero, SelectedProductRail (rich context), PortfolioPulse, RankingsLab, ComparisonLab, ProductDossier, InquiryPaths, ResolutionSimulator, CommandCenter, ProductSignals, BrandUniverse, Methodology, HomepageFAQ, SupportBar, + assembled HomePage. Built by parallel agents against a shared dark-token contract.
Static verification passed (this environment blocks npm, so no tsc/vite run was possible): all `@/` imports resolve, every named import has a matching export, 0 unused imports, all 91 CSS tokens resolve, and the one real build-breaker found — `UserMode` missing from `domain.ts` — was fixed. `npm install && npm run build` on a machine with npm is the final gate; expect at most minor type nits only tsc can surface.

**Design decisions locked (2026-07-07):** theme = Buldak Night; product listing = immersive glow (C); comparison = versus/battle (B); mega nav = split panel (B); side rail = rich context (B); support bar = compact status (C).

**2026-07-08 update:** the Order-to-Cash Process Intelligence chapter (`SapProcessIntelligence`, `#o2c`) moved from one fixed synthetic scenario to a filterable/sortable 7-order Order Queue, per site-owner feedback that the single-scenario version read as a teaching walkthrough rather than a working tool. The flow-stage and exception-detail panels are reused, not rebuilt; adds one `OperatorNote`. Site-wide the count is now 8 (6 on the homepage, 2 in the Ops Dashboard), above the old documented cap of 6. That cap is superseded by the guided-tour rule: one note per section, collapsed to a teaser by default. See `CLAUDE.md`, `docs/restructure/05-OPERATOR-NOTES-RIDE-GUIDE.md`, CHANGELOG, and D-009.

**2026-07-10 update:** the Order Queue gained a featured **Retailer Order Lifecycle** order (99 Ranch Market, PO 4500382711): a reducer-driven X12 workflow study (`src/data/ediLifecycle.ts` + `OrderLifecycle.tsx`) covering 850/997/855/856/810/820, split-pane raw-vs-translated document viewer with two-way highlighting and Explain mode, structural-vs-business validation, gated advance actions with visible reasons, a short-shipment deduction reconciled checkpoint by checkpoint, handoff to the case board as FF-2231, and a corrective-action close. Entry link from ComparisonLab ("Trace in retailer order"). Labeled a workflow study, synthetic, simplified X12; see CHANGELOG and KNOWN_LIMITATIONS 7a.

## Confirmed decisions (2026-07-07)
- **Stack:** React + Vite + TypeScript, custom CSS + design tokens.
- **Docs:** master plan + core docs first; remaining docs per section during build.
- **MVP:** Tier A Launch Anchors (Buldak Carbonara, Original, 2X Spicy, Habanero Lime, Original Hot Sauce, Carbonara Hot Sauce) with full data; all 45 families browseable with lighter, labeled data.

## Source material (audited)
- `samyang job.pdf` — Manager, CX role. Read in full.
- `samyang_product_catalog_ux_all_markdown.zip` — 21 spec files. Read (families, tiers, rankings, flagship profiles, inquiry maps, open questions).
- `SAMYANG AMERICA_files.zip` — 54 product PNGs (reference), 11 JS + 8 CSS from saved site (do NOT reuse), Mac metadata (ignore).
- `indexv5.html` — reference homepage (hero reveal, chapter nav, identity rail, per-section modules). Structure audited.
- `animal-template-v2.zip` — Sun Bear template + docs (seven-stage progression, JSON+renderer architecture, single-home rule, honest scoring). Audited.

## Confirmed data structure
45 normalized families / 76 format-variants across Buldak (29), Samyang (9), Tangle (4), MEP (3). Allergens & prep are format-specific.

## Documents complete
`docs/homepage/`: 00, 04, 06, 08, 09, 10, 12, and MASTER-FIREFLOW-HOMEPAGE-BUILD-PLAN.md.
Governance: PROJECT_STATE, DECISIONS, CHANGELOG, DATA_SOURCES, KNOWN_LIMITATIONS, README.

## Documents stubbed (filled during build)
01, 02, 03, 05, 07, 11, 13, 14, 15, 16, 17, 18, 19, 20.

## Next action
Track A is done. To productionize Track B: on a machine with npm, `npm install`, then port the Buldak Night tokens + the 5 chosen component designs + the 4 new sections from Track A / the docs into the React CSS modules and components, running `npm run build` + `npm run verify:data` to keep it green. Then wire Supabase if a real backend is wanted (schema sketched in KNOWN_LIMITATIONS).

## Open items needing Nathan/Samyang input
Official image rights; whether a real backend (Supabase) is added later; approved vendor fields; approved allergen/safety language. See KNOWN_LIMITATIONS.
