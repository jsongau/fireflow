# CHANGELOG — FireFlow Product Intelligence

## 2026-07-07 — Employer-layer copy refinement (from md pack)
Applied the uploaded employer-layer pack (extracted to `docs/employer-layer-pack/`). The pack's build items (employer intro, Enter/Explore modes, Operator Notes, SAP O2C chapter, role→feature map, Nathan's Read, employer close, honesty line, deployed-on-the-live-link) were already built; this pass adopts the pack's approved wording:
- EmployerIntro → Variant A copy ("independent customer experience operating model… order flow… billing friction…").
- SAP eyebrow renamed to "Order-to-Cash Process Intelligence · SAP SD aligned workflow study"; `SAP_DISCLOSURE` updated to the approved honesty line.
- Added the role-connection line ("customer experience is not only answering messages…") to EmployerEvidence.
- EmployerClose → approved final close, incl. "The goal is not to pretend this is Samyang's system. The goal is to show how I would approach learning, supporting, and improving the real one."
- Two more Operator Notes with approved copy: Consumer Care (InquiryPaths) and Command Center. Total notes now 5 (≤6 cap).
- Verified `tsc -b` exit 0; no arrows/em-dashes in the new copy.

## 2026-07-07 — Post-deploy UX fixes (compare, nav, cards, left rail)
- **Comparison capped at 2** (head-to-head versus): `MAX_COMPARE` 4 → 2; Comparison Lab copy updated to "Compare two products, side by side."
- **Product cards open the profile:** clicking a Portfolio Pulse card now selects the product and smooth-scrolls to its Product Dossier (`#product`) for inspection.
- **Mega-nav submenu opens on hover** as well as click: added `onMouseEnter` on the group buttons and `onMouseLeave` on the whole nav (so moving the pointer down into the panel keeps it open). Click and keyboard still work. (Could not reproduce the reported "submenu doesn't show" in the sandbox browser, which only renders the mobile drawer; hover-open is the reliable desktop fix — verify on redeploy.)
- **New collapsible left CompareRail** (`src/components/home/CompareRail/`): a sticky left tray that appears only when products are added to compare, opens automatically, and can be collapsed by hand to a thin edge tab. Shows the compared products with remove, a "Compare these" jump to `#compare`, and clear. Hidden ≤900px (the compact top rail covers mobile). Verified `tsc -b` exit 0.

## 2026-07-07 — Full-site writing-style sweep + more sound triggers
- **Writing-style sweep (Phase 8):** rewrote ~56 em-dash sentence separators across component copy and data blurbs into sentences/commas/colons per Nathan's pack (40 in components via an agent, 16 in `src/data/*` by the lead); removed the one visible arrow (`Open in simulator →` in CommandCenter); replaced all three hover-underline link rules (`.compare`, `.footerLink`, hero `.textBtn`) with colour changes. Preserved standalone `—` used as "no value" table cells (they aren't prose) and left code comments alone. Whole-repo scan now shows zero visible arrows, zero prose em-dash separators, zero underline-hover links.
- **More sound triggers:** `playSound` wired at product select (PortfolioPulse), compare add (SelectedProductRail, both desktop + mobile panel), resolution advance/complete (ResolutionSimulator: `stageAdvance`/`resolve`), in addition to the earlier SAP stage advance and dialog open. Full vocabulary in use: select, compareAdd, stageAdvance, resolve, modalOpen, confirm.
- Verified: `node_modules/.bin/tsc -b --force` exits 0 across the whole project after all changes.

## 2026-07-07 — Next wave (3 parallel agents): mobile rail, inquiry dialog, sound
Ran three agents with strict file ownership; lead reconciled the shared files. **Full `tsc -b --force` passes (exit 0)** across the whole project after integration — the TypeScript half of `npm run build` genuinely verified here (only `vite`/esbuild bundling still needs Nathan's machine).
- **Mobile compact selected-product rail (Phase 2.3):** at ≤640px the rail collapses to one row (thumbnail + shortened name + mode word + a single expand control with `aria-expanded`/`aria-controls`); the expand opens a disclosure panel with consumer care, vendor support, add to compare, compare count, reset, and format+heat. Escape closes and returns focus to the button. Desktop layout unchanged (CSS-media-query swap). Stays one row at 390px.
- **Inquiry submission dialog (Phase 6):** new `InquiryDialog` opened by a "Submit demonstration inquiry" button in each Two Paths issue. Inherits product/format/mode/issue from state (no re-entry). Consumer and vendor views with a deterministic synthetic case ref (e.g. FF-2047), routing, evidence, SLA, partners, specialist-escalation notice (no medical advice), and a link to the SAP chapter for O2C issues. Real dialog semantics: `role="dialog"`, `aria-modal`, focus trap, Escape, focus restore, body-scroll lock, overlay at `--z-dialog` (60, above the support bar), near-full-height on mobile, reduced-motion aware. States clearly that nothing was transmitted to Samyang.
- **Sound system (Phase 7):** `src/lib/sound/sound.ts` — a dependency-free Web Audio engine, off by default, persisted under `fireflow:sound`, AudioContext created lazily on first gesture, safe no-op when audio is unavailable. Named sounds: select/confirm/compareAdd/stageAdvance/resolve/warning/modalOpen/modalComplete. `SoundToggle` (glyph+word, keyboard, `aria-pressed`) mounted in the nav beside Operator Notes. Lead wired two triggers (SAP stage advance, dialog open); the rest are documented one-line adds. The site is fully usable and information-complete in silence.
- Added `--z-dialog: 60` token. Fixed a pre-existing em dash in the rail's empty-state hint.

## 2026-07-07 — Continuation pass: reliability + employer layer (Explore with Nathan)
Canonical implementation is the React app under `src/`. `preview.html` + `preview-data.js` are a **legacy** single-file demo and are not maintained in parity with newer chapters (SAP SD, employer layer).

**Lane 1 — reliability**
- Repaired `npm run verify:data`: `tsx` was reading the root `tsconfig.json` (a solution file with no `paths`), so the `@/` alias didn't resolve. Added `baseUrl` + `paths` to the root `tsconfig.json` so `tsx` resolves `@/` for the whole data graph. `tsc -b` is unaffected (it builds the referenced configs).
- Fixed dead `#vendor` routes: `ProductDossier` and `ComparisonLab` vendor actions now set `userMode: "vendor"` and route to the shared `#resolve` section. No `#vendor` references remain in `src`.
- Removed invalid nested interactive controls (anchor wrapping `<Button>`): added a `ButtonLink` primitive (an anchor styled as a button, one element) and converted the actions in `ProductSignalHero`, `ProductDossier`, and `InquiryPaths`.

**Lane 2 — employer layer**
- Added `operatorNotesEnabled` + `introDismissed` to the store (persisted; preserved across product `RESET`; new actions `SET_OPERATOR_NOTES`, `TOGGLE_OPERATOR_NOTES`, `DISMISS_INTRO`, `OPEN_INTRO`).
- New `src/components/employer/`: `EmployerIntro` (the "Explore with Nathan" / "Enter FireFlow" cover), `OperatorNote` (reusable "Nathan's read", renders only when notes are on), `OperatorNotesToggle` (quiet nav control, glyph+word, keyboard, aria-pressed), `EmployerEvidence` (`#fit`, capability→feature map), `EmployerClose` (`#why`, with résumé/contact actions gated behind `src/config/employer.ts` so no dead button ships).
- Operator Notes placements (3, within the ≤6 limit), copy from Nathan's writing-style pack: Portfolio normalization, Product Signals continuous improvement, and the SAP chapter's per-stage note (now gated on the toggle). Fixed `→` arrows in the Product Signals lede as part of the copy pass.
- Writing-style pack extracted to `docs/nathan-writing-style-fireflow/` for reference.

Not done this pass (documented for the next wave): mobile compact selected-product rail (Phase 2.3), inquiry submission modals (Phase 6), sound system (Phase 7), and the full-site writing-style sweep (Phase 8). `npm run build` / `npm run verify:data` must be run on Nathan's machine — the sandbox `node_modules` is a macOS esbuild binary and the registry is blocked, so Vite/tsx can't execute here; all changes were statically verified.

## 2026-07-07 — Fable pass: SAP SD / Order-to-Cash chapter (Phase 4)
- New chapter **SAP SD Process Intelligence** (`src/components/home/SapProcessIntelligence/`, anchor `#o2c`), placed between the Resolution Simulator and Command Center; wired into the mega-nav (CX Intelligence group) and footer (Care & Support).
- New data layer `src/data/sapsd.ts`: 23-term SAP SD glossary, an 8-stage order-to-cash document flow (Customer PO → Sales Order → Validation/Hold → Delivery → Goods Issue → Invoice → Payment/Deduction → Resolution), and 11 selectable order exceptions — all referentially verified (Node type-strip check: 0 broken refs).
- Interactive: click a flow node to open its detail (what it represents, data required, owner, what CX watches, where it breaks, evidence, downstream impact, metric) with prev/next stepping; exception explorer marks exceptions tied to the current stage.
- **Accessible glossary tooltips**: each SAP term is a `<button>` with `aria-describedby` (screen readers get the definition on focus), a CSS tip shown on hover **and** keyboard focus, click/tap-to-pin with Escape to close — plus a full always-visible glossary `<details>` so no definition is hover-only. Colorblind-safe: flow states use glyph + step number + label + the words "current"/"completed", never colour alone.
- **Fourth-wall "Nathan's read"** first-person callout on every stage — showcases process knowledge and maps it to his retail customer-operations experience. Honest positioning stated once via `SAP_DISCLOSURE`: process demonstration, not an SAP replica; no claim of Samyang system access or SAP tenure; all orders/customers/amounts synthetic and labeled.

## 2026-07-07 — Fable pass: reliability repairs (Phase 1–2, in progress)
- **Audit:** confirmed production entry point = the Vite/React app (`index.html` → `src/main.tsx`), not the `preview.html` single-file mirror. Reproduced two sticky-layout defects by reading the source.
- **Fixed: selected-product rail was invisible on scroll.** `MegaNav .nav` (sticky `top:0`, z 30) and `SelectedProductRail .rail` (sticky `top:0`, z 20) both stuck to the same `top:0`; once scrolled, the higher-z nav painted over the rail so it vanished. Added `--nav-h`/`--rail-h`/`--sticky-h` tokens and changed the rail to `top: var(--nav-h)` so it sticks directly beneath the nav.
- **Fixed: in-page anchors (incl. #compare / Comparison Lab) landed hidden under the sticky headers.** Sections used an inconsistent `scroll-margin-top` of 64px/72px, but nav+rail together are ~120px. Replaced all 12 hardcoded values across the home CSS modules with `scroll-margin-top: var(--sticky-h)` so every anchor clears both bars.
- Note: `preview.html` (Track A legacy demo) not yet mirrored. Build/test gate (`npm run build`, `verify:data`, Playwright) must run on Nathan's machine — the sandbox `node_modules` is a macOS esbuild binary and the npm registry is blocked here, so Vite/tsx can't execute in this environment.

## 2026-07-07 — Spiciness scale + facets (from buldak.com analysis)
- Analyzed buldak.com/us/product (official 5-level spiciness scale, faceted filters, card anatomy); built a concept preview (previews/spiciness-facets.html) in our dark theme, then integrated into React.
- Added src/data/spiciness.ts (editorial 0–5 map for all 45 families aligned to Buldak's public scale, typesForFamily, SPICE_SOURCE_NOTE), a PepperScale primitive (chili SVG + word, accessible), spiciness badges on Portfolio cards, Spiciness + Type facets in Portfolio Pulse, a Spiciness attribute in Dossier, and a Spiciness row in Comparison. Labeled editorial, not official. Static-verified (0 missing imports/exports/unused; 62 files).

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
