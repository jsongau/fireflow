# CHANGELOG — FireFlow Product Intelligence

## 2026-07-07
- Completed full source audit: job PDF, product catalog (21 md), assets ZIP (54 PNG / 11 JS / 8 CSS), indexv5.html, Sun Bear template.
- Confirmed 45-family / 76-variant structure across Buldak, Samyang, Tangle, MEP.
- Confirmed build decisions: React+Vite+TS; core-docs-first; Tier-A (6-anchor) MVP.
- Wrote core homepage docs: MASTER build plan, 00 Executive Summary, 04 Job Map, 06 Information Architecture, 08 Ranking & Comparison Model, 09 Interaction Module Map, 10 Selected Product State Model, 12 Visual System.
- Created governance files: PROJECT_STATE, DECISIONS (D-001–D-008), DATA_SOURCES, KNOWN_LIMITATIONS, README.
- Stubbed remaining docs: 01, 02, 03, 05, 07, 11, 13, 14, 15, 16, 17, 18, 19, 20.

### Phase 1 — data foundation
- Scaffolded React + Vite + TypeScript project (strict tsconfig, path alias `@/`, tokens + base CSS).
- Built typed domain model (`src/types/domain.ts`): families, variants, brands, categories, formats, rankings, inquiries, scenarios, sources.
- Authored data: 45 families (`families.ts`), 76 generated variants (`variants.ts`, official facts bound only to sourced formats), 4 brands, 11 categories, 13 formats, 8 ranking views + compute engine (`rankings.ts`), consumer/vendor issue taxonomy (`issues.ts`), 7 synthetic resolution scenarios (`scenarios.ts`), source registry + disclaimers (`sources.ts`).
- Added integrity checks (`data/index.ts`) + verification script (`scripts/verify-data.ts`).
- Verified via Node type-stripping: 45 families / 76 variants / 6 anchors, brand split Buldak 29 / Samyang 9 / Tangle 4 / MEP 3, all cross-references valid, 0 integrity errors, all 8 ranking views compute; honesty rules hold (First-Time Fit + Retail Visibility score anchors only, no guessed values).
- Note: npm registry is blocked in the build sandbox; `npm install` + `npm run build`/`dev`/`verify:data` must be run on Nathan's machine.

### Phases 2–4 — design foundation, shell, hero, rail
- Shared state store (`state/homeStore.tsx`): context + reducer, URL sync (`?product/format/mode/compare`), localStorage for non-sensitive prefs only, returning-user memory, reset.
- Primitives: `Button`, `Segmented` (accessible radiogroup, arrow-key nav), `SourceBadge`/`ConfidenceBadge`/`SyntheticBadge` (never color-alone), `ProductStage` (brand-accented package placeholder by format archetype — honest stand-in until image rights resolved). Plus `useReducedMotion` hook.
- Product Signal Hero (`components/home/ProductSignalHero`): first-visit / product-selected / returning states; brand + role (Explore/Consumer/Vendor) selectors; product picker seeds shared state; four actions (Explore, Compare, Ask as consumer, Ask as vendor); dark surface; responsive; reduced-motion.
- Selected Product Rail (`components/home/SelectedProductRail`): sticky context bar carrying product/format/mode/compare-count through the page; consumer/vendor quick actions; reset.
- Page shell (`pages/HomePage`): skip link, compact header, context trail, main, scaffolded chapter anchors (portfolio/rankings/compare/product/resolve/vendor), footer with independence disclaimer + research date. App root wraps the state provider.
- Verified statically: all `@/` imports resolve, all 7 CSS modules present, strict-TS issues hand-fixed (Dispatch import, CSS custom-property cast). Full `tsc`/`vite` build to be run on Nathan's machine.

### Phases 6–10 — Explore layer
- Portfolio Pulse: brand + category filters, family↔format view toggle (teaches 45→76 normalization), selectable cards wired to shared state, live counts, empty state.
- Rankings Lab: accessible tabs over all 8 ranking views; per-view source + confidence + caveat + last-reviewed; ranked rows with score bars, confidence badges, missing-input markers, Open + Compare actions; "how it's calculated" weights panel; honest "not scored rather than guessed" note.
- Comparison Lab: preset comparisons, up to 4 products, semantic table, hide-matching + difference highlighting, per-column consumer/vendor actions, allergens/prep shown for each product's default format (variant-bound), empty state.
- Product Dossier: format selector rebinds facts; allergens/prep/components/storage/retail-signal per exact variant with source + confidence; "verify the package" wherever format data is absent; related products, consumer/vendor questions (mode-aware), save, inquiry actions, source + last-verified.
- Wired all four into HomePage in IA order (portfolio → rankings → compare → product); resolve/vendor remain scaffolded anchors. 40 source files; imports + CSS modules verified.

### Phases 11–12 — Resolve layer
- Two Paths (InquiryPaths): consumer + vendor columns, pre-populated with the selected product/format (never re-enter); issues filtered to the product's category; on select, shows severity, routing, the Identify→Verify→Evidence→Route→Resolve→Update steps, per-issue evidence "why we ask", and a calm specialist-escalation notice for allergen/injury/tampering issues (no medical advice); mode-aware emphasis; "See this resolved / Start a case" hands off to the simulator. Anchors #resolve and #vendor.
- Resolution Simulator: consumer + vendor scenario pickers; interactive case lifecycle timeline (Reported → Verified → Routed → Resolution proposed → Customer updated → Resolved → Improvement review) with clickable + Prev/Advance stepping; full case attributes (verified facts, evidence, owner, collaborators, update commitment, resolution options, approvals, root cause, corrective action); everything labeled synthetic. Anchor #simulate.
- Wired into HomePage after the dossier; remaining scaffolded anchors now #command / #signals / #methodology. 44 source files; imports, CSS modules, and in-page anchor targets verified.

### Redesign wave — real images + richer interactions (agents)
- Scraped current interactive-CSS-card techniques (freefrontend) for inspiration; catalogued: pointer 3D tilt + glare, cursor spotlight, mask-composite glow borders, hot/cold swap, fanned/bento reveals, Popover-API mega nav, SVG stroke progress.
- Extracted 54 real Samyang product PNGs to public/products/ (normalized names). Agent built src/data/images.ts (IMAGE_BY_VARIANT 49, IMAGE_BY_FAMILY 28, imageForVariant helper) + public/products/manifest.json; 0 missing files.
- 6 parallel agents wrote 10 enhancement specs to docs/enhancements/: mega-nav, footer, product-card, bento-portfolio, sound-heat-card, motion-and-sound-system, hero, dossier, rankings, simulator — each with a runnable recipe, a11y + reduced-motion + sound-consent contracts, and React + vanilla integration notes.
- Rebuilt preview.html as v2: real product photos throughout (hero, bento portfolio cards, rankings thumbnails, compare, dossier, related chips, nav feature); pointer 3D tilt + mask-composite glow product cards; cursor-spotlight hero; accessible mega nav with per-group panels + featured product + mobile drawer; scroll-reveal (IntersectionObserver, reduced-motion aware); animated ranking bars + SVG heat gauge; rich footer with source legend + disclaimer; and "The Heat Dial" — a WebAudio sound-toggle card (muted by default, gesture-gated, localStorage pref) mapping heat expectation to a calm, honest ladder.
- Verified: both script blocks syntax-clean; headless smoke test 13/13 render branches pass (incl. Heat Dial steps + no-image fallback); image paths resolve.

### Design exploration + Buldak Night integration
- Scraped current mega-menu + sidebar pattern galleries; 6 parallel agents produced 3 live preview options each (previews/*.html) + specs (docs/explorations/*.md) for: product listing, comparison, mega nav, side rail, floating support bar, and the UX-kit/theme — all on a striking dark Korean-spicy theme with real product photos.
- Nathan chose: theme "Buldak Night" (near-black + molten red/ember + gold); product listing C (immersive cursor-glow); comparison B (versus/battle w/ animated stat bars); mega nav B (split panel + live preview pane); side rail B (rich context rail w/ photo); support bar C (compact floating status bar).
- Externalized preview data to preview-data.js (template now editable); archived the light "Gochu Pop" build to previews/_archive/.
- Integration agent rebuilt preview.html into the dark Buldak Night skin (no beige) with the 5 chosen components wired into the FF data + state + data-act pipeline, plus a persistent focus-trapped support FAB. Independently verified: app syntax OK; 0 leftover cream hexes; 0 stray ../public paths; 9 string-render branches non-empty + nav/rail/support + full render() run with 0 throws.

### Finish — remaining chapters + final QA (single-file build complete)
- Added the CX-intelligence + trust chapters: CX Command Center preview (drill-down synthetic KPI tiles + case queue), Product Signals (inquiry→pattern→root cause→action→measure loop, 6 signals), Brand Universe (four differentiated brand panels), and FAQ (10 honest answers). Reordered to Explore → Resolve → Command → Signals → Brands → Methodology → FAQ. Nav + footer links updated; all synthetic ops data clearly labeled.
- Final QA on preview.html (118KB): app syntax OK; 13 anchors all resolve (no dead links); new section ids present; headless smoke test 6/6 render paths + full render() with 0 failures.
- PROJECT_STATE updated to reflect two tracks: Track A single-file build = COMPLETE + verified deliverable (preview.html + preview-data.js + public/products); Track B React app = core built, Buldak Night dark-theme + component port pending (needs npm to build/verify).

### React port to Buldak Night (Track B)
- Foundation agent: rewrote tokens.css (dark semantic tokens + compatibility aliases + Anton/Inter @import), base.css (dark-native), and the four primitives' CSS to dark/neo; wired real photos into ProductStage via imageForVariant (additive optional familyId/variantId props).
- Three parallel agents: dark-restyled Explore (Portfolio/Rankings/Comparison/Dossier) + Resolve (InquiryPaths/Simulator) modules and wired product images/thumbnails; built new React components CommandCenter, ProductSignals, BrandUniverse, HomepageFAQ, Methodology, MegaNav (split panel), SelectedProductRail (rich context), SupportBar (floating); reassembled HomePage in IA order with a dark footer.
- Verification (npm blocked here, so static only): fixed the one real build-breaker — added missing `export type UserMode` to domain.ts (the store imported it); confirmed all `@/` imports resolve, every named import has a matching export, 0 unused, all 91 CSS tokens resolve. Final `npm run build` on Nathan's machine is the remaining gate.
