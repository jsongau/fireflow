# FABLE 5.0 MASTER PROMPT
## FireFlow — Final Audit, SAP SD Experience Layer, Interaction Repair, and Employer-Ready Production Pass

You are **Fable 5.0**, operating as a coordinated team of senior specialists inside the existing **FireFlow** repository.

Your assignment is to **audit, repair, test, and elevate** the existing FireFlow portfolio created by **Nathan J. Song** for the **Manager, Customer Experience** role at **Samyang America**.

- This is **not** a new concept build.
- This is **not** permission to replace the established design.
- This is **not** permission to simplify the project into a generic résumé website.

Take the existing FireFlow experience and make it: (1) fully functional, (2) visually polished, (3) technically credible, (4) easy for a recruiter to understand, (5) strong enough to support Nathan's candidacy, (6) convincing as a Customer Experience and SAP-SD-adjacent operating model, (7) honest about what is simulated / conceptual / public / editorial / synthetic, (8) stable across desktop, tablet, and mobile, (9) memorable without becoming distracting or gimmicky.

---

## 0. REPOSITORY GROUND TRUTH — read this first (added for accuracy)

**Do not trust any URL or file name from memory. These are the verified facts as of this handoff.**

**Live reference URL (corrected):** `https://fireflow-capy-j.vercel.app/`
The alias `https://fireflow-seven.vercel.app/` also resolves to the same deployment. *(An earlier draft of this prompt referenced `fireflow-kohl.vercel.app` — that URL is wrong and does not belong to this project. Ignore it.)*

**Do not rely only on the live deployment.** Read and inspect the local repository in full before making any change. The live site is a snapshot and may lag the code.

**Stack:** React 18 + Vite 5 + TypeScript (strict). Custom token-driven CSS via **CSS Modules** (no UI framework). Path alias `@/` → `src/`.

**Production entry point (confirmed):** the **Vite + React app** is what Vercel serves.
`index.html` → `/src/main.tsx` → `src/app/*` → `src/pages/HomePage.tsx`.
This React app in `src/` is the **canonical / production** build.

**Two-track situation you must understand:**
- **Track B (canonical / production):** the React app under `src/`. This is what is deployed.
- **Track A (legacy zero-install demo):** `preview.html` + `preview-data.js` + `public/products/` — a single-file vanilla mirror of the React app, meant to open with no `npm install`. It is **not** what production serves. Decide explicitly whether to (a) keep `preview.html` in sync with any React changes, or (b) mark it clearly as a legacy demo in the docs. Do not let the two drift silently. Do **not** edit `preview-data.js` by hand — it is generated data.

**Real npm scripts (`package.json`):**
```bash
npm install
npm run dev          # vite dev server (http://localhost:5173)
npm run build        # tsc -b && vite build   (full typecheck + production bundle -> dist/)
npm run preview      # vite preview of the built bundle
npm run typecheck    # tsc -b --noEmit false --pretty
npm run verify:data  # tsx scripts/verify-data.ts  (data-integrity check)
```
Only `react` and `react-dom` are runtime deps; everything else is dev tooling (`tsx`, `typescript`, `vite`, `@vitejs/plugin-react`, `@types/*`). Keep the dependency footprint minimal — do not add heavy libraries without justification.

**Confirmed source layout:**
- `src/main.tsx`, `src/vite-env.d.ts`
- `src/app/` — app root + providers
- `src/pages/` — `HomePage.tsx` (+ module CSS)
- `src/state/` — shared store (`homeStore.tsx`: React context + reducer, URL sync via `?product/format/mode/compare`, localStorage for **non-sensitive prefs only**, returning-user memory, reset)
- `src/types/` — domain types (`domain.ts`, includes `UserMode = "explore" | "consumer" | "vendor"`)
- `src/hooks/` — includes `useReducedMotion`
- `src/styles/` — `tokens.css` (Buldak Night design tokens + compatibility aliases), `base.css`
- `src/components/primitives/` — `Button`, `Segmented`, source/confidence/synthetic badges, `PepperScale`, `ProductStage`, etc.
- `src/components/home/` — the 14 chapter components (exact names):
  `ProductSignalHero`, `SelectedProductRail`, `PortfolioPulse`, `RankingsLab`, `ComparisonLab`, `ProductDossier`, `InquiryPaths`, `ResolutionSimulator`, `CommandCenter`, `ProductSignals`, `BrandUniverse`, `Methodology`, `HomepageFAQ`, `SupportBar`. (The split-panel mega-navigation also exists as its own component — locate it before editing.)
- `src/data/` — `families.ts` (45 families), `variants.ts` (76 variants), `brands.ts`, `categories.ts`, `images.ts` (`IMAGE_BY_VARIANT` / `IMAGE_BY_FAMILY` / `imageForVariant`), `issues.ts`, `rankings.ts` (8 ranking views + compute engine), `scenarios.ts` (synthetic resolution scenarios), `sources.ts` (source registry + disclaimers), `spiciness.ts` (editorial 0–5 scale + product types), `index.ts` (integrity checks)
- `scripts/verify-data.ts` — the data verification script
- `public/products/` — ~54 real product PNGs (committed)

**In-page anchors currently used by `HomePage.tsx`:**
`#hero #portfolio #rankings #compare #product #resolve #simulate #command #signals #brands #methodology #faq`
(Note: vendor actions route to `#resolve`; there is intentionally no top-level `#vendor` chapter. If you add a SAP SD chapter, add a new anchor such as `#o2c` or `#sap` and wire it into the nav.)

**Data model facts (do not "fix" these into round numbers):** ~**45 product families**, ~**76 format-level variants**, four brands split **Buldak 29 / Samyang 9 / Tangle 4 / MEP 3**. Official facts (allergens, preparation) are bound to the **exact format**, never inherited across a family. Spiciness is an **editorial** 0–5 mapping aligned to Buldak's public scale — labeled editorial, not official.

**Hosting note (context, not a task):** the site is deployed on **Vercel** under the **CapyJ** team (currently a Pro trial). The deploy source is a private clone **`covercapy/fireflow`**, not `jsongau/fireflow` — so pushing to `jsongau/fireflow` does **not** auto-redeploy. New Vercel projects also enable a login wall ("Vercel Authentication") by default that must be turned off for the site to be public. None of this changes the code; it only affects how a redeploy reaches the live URL.

**Accessibility hard constraint:** Nathan is **colorblind**. Status, severity, heat, selection, source type, confidence, routing state, and completion must **never** be communicated by color alone — always pair with a word, icon, shape, or pattern. The existing severity badges already do this (glyph + word); preserve that pattern everywhere.

---

## 1. Read the repository before touching code

Read all relevant files before editing: `README.md`, `PROJECT_STATE.md`, `CASE_STUDY.md`, `DECISIONS.md`, `CHANGELOG.md`, `DATA_SOURCES.md`, `KNOWN_LIMITATIONS.md`, `index.html`, `preview.html`, `preview-data.js`, `package.json`, `vite.config.ts`, every file in `src/`, all TypeScript types, all data files, all components, all CSS modules, global CSS + tokens, all planning docs in `docs/`, the Samyang job description (`samyang job.pdf`), extracted Samyang product docs, and the preview experiments in `previews/`.

Create an **internal feature inventory** before editing anything. Identify what is: already working, partially working, visually broken, hidden by stacking/overflow problems, working in `preview.html` but not in the React app, working in React but not visible in production, placeholder behavior, needing accessibility repair, needing responsive repair, needing stronger employer-facing explanation, or at risk of creating a false/exaggerated professional claim.

**Begin with diagnosis, not with redesigning the hero.**

---

## 2. Preserve the existing FireFlow identity — "Buldak Night"

Preserve: deep charcoal/black surfaces; ember red + molten orange accents; controlled gold highlights; product photography; layered interface panels; heat/flame/operational-signal motifs; premium typography; the three-part journey **Explore → Resolve → Command**; the product-intelligence structure; the comparison experience; the Resolution Simulator; the Command Center; the Product Signals loop; consumer + vendor inquiry paths; the selected-product context system; the evidence + source-labeling system; the existing data architecture; and the distinction among **official / public retail signal / editorial / synthetic / unavailable** information.

Do **not**: flatten into a light corporate dashboard; replace the character with generic SaaS gradients; remove depth, personality, motion, or product storytelling; use arbitrary neon colors; introduce a whole new visual language.

Improve the existing system through consistency, hierarchy, spacing, lighting, motion, typography, responsiveness, and interaction quality.

---

## 3. Primary business objective

Within the first few seconds a recruiter must understand: who created FireFlow; why; which role it supports; what capabilities it demonstrates; that it is an **independent portfolio concept** and **not** an official Samyang site; that operational data is **synthetic**; that Nathan has **8+ years in consumer products and retail customer operations**; that his largest listed gap is **direct, extensive SAP SD tenure**; and that FireFlow demonstrates serious understanding of the SAP-SD-adjacent business processes **without falsely claiming** system access or employment experience he does not have.

Near the opening, add an elegant employer-facing identification layer, e.g.:
> An independent Customer Experience operating model created by Nathan J. Song for Samyang America's Manager, Customer Experience role.

Support it with concise proof points: 8+ years in consumer products & retail customer operations; customer service workflow design; order & issue management; cross-functional escalation; claims/billing/revenue-cycle operations; SOP creation & team training; customer recovery & service improvement; product & portfolio organization; front-end systems prototyping.

Do not turn the opening into a résumé wall — keep it a refined, compact application-context layer that leads into the working system.

Recommended employer-facing actions, integrated into the visual system (not plain résumé buttons): **Enter the CX Operating Model** · **Review the SAP SD Process Map** · **See Nathan's Relevant Experience** · **Read the Case Study**.

---

## 4. Correct the professional positioning

Nathan has **8+ years** in consumer products and retail customer operations — do **not** frame him as lacking that requirement. Emphasize transferability: retail customer operations; consumer-facing service; multi-location operational coordination; customer escalation management; claims & billing workflows; eligibility & transaction verification; high-value customer communication; service recovery; vendor & office coordination; SOP development; team training; customer feedback & review growth; revenue-supporting operational systems; product/inventory/ordering/merchandising exposure; cross-functional problem solving.

The one gap to address honestly: **extensive hands-on SAP SD experience** (order entry, pricing, delivery, billing, customer master data, order management). Show meaningful understanding while preserving this honesty statement:
> FireFlow demonstrates conceptual command of the SAP SD and order-to-cash business processes. It does not claim direct access to Samyang systems or extensive hands-on SAP SD employment tenure.

State it clearly **once** where appropriate; then demonstrate depth through workflow quality. Do not repeatedly apologize for the limitation.

---

## 5. Build a serious SAP SD / order-to-cash experience layer

Create or substantially strengthen an interactive chapter, e.g. **"SAP SD Process Intelligence"** (a better on-brand title is allowed if it stays understandable to recruiters and SAP-aware managers). Add a new anchor for it (e.g. `#o2c`) and wire it into the mega-nav and any role-to-feature map.

Demonstrate the relationship among: customer master data → material/product data → sales inquiry → quotation → sales order creation → order validation → pricing conditions → discounts/promotional pricing → tax & freight → availability check → credit/order hold → delivery creation → picking & packing → post goods issue → billing document → invoice transmission → customer payment → deduction/dispute → credit/debit memo → returns → case resolution → root-cause review → continuous improvement.

**Build a guided operating simulation, not a lifeless diagram** — let the visitor follow a fictional B2B order through the full order-to-cash lifecycle.

**Required synthetic retailer scenario (clearly labeled synthetic):** retailer submits a PO → account & ship-to data validated → products/quantities confirmed → pricing conditions applied → one promotional price doesn't match the customer's expectation → one item has limited availability → order gets a temporary hold → CX coordinates with Sales, Supply Chain, Finance, and the customer → order released → delivery created → goods picked/packed/shipped → billing generated → a retailer deduction later arrives → documentation gathered → deduction researched and disputed / accepted / converted to a credit memo → the case feeds the Product Signals / Continuous Improvement chapter. Label **every** order number, customer name, amount, date, shipment, invoice, deduction, employee, and outcome as synthetic.

**Explain, in plain language, SAP SD concepts:** sold-to / ship-to / bill-to / payer; customer master; material master; sales area; sales organization; distribution channel; division; sales document; item category; schedule line; pricing condition; availability check; delivery block; billing block; partner function; credit memo request; return order; billing document; document flow. **Do not reproduce a fake SAP screenshot** — this is a FireFlow interpretation of the process.

**Interactive document flow:** `Customer PO → Sales Order → Delivery → Goods Issue → Invoice → Payment/Deduction → Resolution`. Each stage opens a polished detail panel: what the document represents; required data; owning team; what CX must monitor; common failure points; evidence needed; downstream impact; metric influenced.

**Selectable exception scenarios:** incorrect customer pricing; missing promotion condition; product unavailable; partial delivery; customer master mismatch; incorrect ship-to; delivery delay; short-shipment claim; damage claim; invoice quantity mismatch; duplicate-billing concern; retailer deduction; return request; credit-memo delay. Each shows: signal · validation step · owner · cross-functional partners · evidence · customer update · resolution decision · prevention opportunity.

**Transparency disclosure (confident, not defensive):**
> Process demonstration, not an SAP system replica. This chapter demonstrates Nathan's study and understanding of SAP-SD-aligned workflows and order-to-cash operations. It does not represent access to Samyang's SAP environment or claim past employment operating Samyang's configuration.

On mobile, render the document flow as a **vertical timeline**, not a shrunken diagram.

---

## 6. Fix the Comparison Lab submenu (`ComparisonLab`, mega-nav, `#compare`)

The nav path to the Comparison Lab is visually or functionally broken. **Audit the root cause, don't hide it.** Check: mega-nav submenu structure; Comparison Lab link targeting (`#compare`); desktop hover + click; keyboard focus; mobile drawer; active-section state; anchor offsets under the sticky nav (`scroll-margin-top`); overflow clipping; **stacking context** (transforms/filters/opacity creating unintended contexts); width constraints; text wrapping; hover areas; dismissal; focus trapping/loss; Escape behavior; touch; resize; scroll restoration; whether a parent clips the submenu; whether z-index tokens are used consistently.

Repair so the submenu never renders off-screen, is fully visible, doesn't overlap text unpredictably, supports keyboard + pointer, closes intentionally, is stable during scroll, works at common laptop widths, works on mobile without hover, has an obvious selected state, and reliably reaches the Comparison Lab. **Do not merely raise z-index and declare victory** — resolve the underlying layout/stacking cause.

---

## 7. Restore & improve the selected-product sticky rail (`SelectedProductRail`)

The rail is not reliably appearing. Audit: whether the React component is rendered; hidden by media queries; whether `position: sticky` has a valid scroll container; whether an ancestor `overflow`/`transform`/`contain`/`height` breaks sticky; whether it's behind another layer; whether its width collapses; whether it only exists in `preview.html`; whether it actually receives the selected product from the store; whether it conflicts with the top sticky nav; whether it's hidden at widths where it should show; whether render/hydration conditions block it; whether scrolling to later chapters disconnects it from the selected product.

Repaired rail should: appear after a product is selected; stay visible during relevant chapters; show product image, name, format, brand, heat positioning, source-confidence context; offer quick actions (jump to dossier, comparison, consumer inquiry, vendor inquiry, SAP SD flow); visually evolve across Explore → Resolve → Command; collapse gracefully on narrow screens into a polished bottom tray / contextual pill / compact floating panel; never cover critical text or controls; never conflict with the support bar. Add a controlled entrance animation communicating continuity + selection (respect reduced motion).

---

## 8. Improve inquiry interactions (`InquiryPaths`)

Improve — without just cranking saturation — via: better microcopy; meaningful hover states; layered elevation; subtle directional light; product-aware cues; iconography; animated focus rings; selection feedback; progress indicators; clear Consumer vs Vendor distinction; context explaining why each question matters; a visible transition from question-selection into case creation; product details carried automatically into the inquiry (no re-entry); better empty / selected / loading / submitted / completed states.

A selected inquiry card should feel like the user initiated an operational process — e.g. a brief ember pulse, a document-stamp animation, a case number assembling, a routing trail illuminating, a product thumbnail transferring into the case panel, an owner/department being assigned, a progress line moving intake → verification. **No confetti.** Tone: responsive, competent, controlled, premium, operational, reassuring.

---

## 9. Add polished submission modals

On completing/submitting a demonstration inquiry, open a high-quality modal (not silent). Because there is **no live backend**, the modal must clearly state that **no real inquiry was transmitted** — never imply a real case reached Samyang.

**Consumer modal:** synthetic case reference; selected product; format; inquiry category; severity; captured info; routing destination; expected next stage; evidence that would be requested; safety-escalation notice when relevant; timeline visualization; buttons to run the Resolution Simulator, inspect the case in the Command Center, and start another scenario. Message: **"Demonstration case created"** →
> This synthetic case has been routed through the FireFlow operating model. No information was transmitted to Samyang or any external system.

**Vendor modal:** synthetic account; partner type; product; order/invoice context; issue type; priority; assigned workflow; cross-functional partners; required documentation; SLA target; next action; link into the SAP SD simulation when relevant.

**Modal standards:** real `dialog` pattern; focus trapped while open; focus restored on close; Escape closes; obvious close control; accessible title + description; background inert; works on mobile; supports long content without clipping; respects reduced motion; no nested-scroll confusion; never behind sticky nav/support elements; consistent z-index tokens; graceful no-JS fallback where practical. Opening sequence (~under 1s unless reduced motion): background dims → selected-product context transfers in → case status appears → routing line activates → primary next action becomes available.

---

## 10. Upgrade the sound system (`SupportBar` / a dedicated sound module + `useReducedMotion`)

Create a restrained FireFlow sound language (Web Audio API or lightweight local assets). Must be: **off by default**; user-controlled; remembered locally; accessible; optional; subtle; fast; free of autoplay violations; respectful of reduced-motion/user preference; functional even when audio is unavailable.

Distinct-but-related sounds for: product selection; navigation confirm; comparison add; comparison complete; heat up; heat down; consumer-path select; vendor-path select; inquiry submission; case routing; stage progression; successful resolution; warning/escalation; modal open; modal complete; SAP document-flow progression. Evoke: soft sizzle; ceramic tap; paper/document confirm; controlled flame ignition; low operational pulse; subtle metallic routing click; warm completion chime. **Avoid** loud alarms, arcade sounds, stock pings, excessive bass, repetitive audio, over-long clips, audio on every hover.

Add a small sound-settings control: on/off; optional low/normal volume; preview; a clear note that sounds are optional interaction feedback. A hiring manager must be able to experience the site **silently** with no information loss.

---

## 11. Improve recruiter comprehension — "Why This Demonstrates Fit"

Add a compact, polished feature→responsibility map. Examples: **Customer service & order management** → inquiry routing, case lifecycle, SLA ownership, Resolution Simulator, SAP SD document flow. **Cross-functional leadership** → Sales/Supply Chain/Finance/Quality/Logistics/CX routing, ownership + escalation rules, evidence collection, shared status. **Continuous improvement** → inquiry→pattern→root cause→corrective action→measurement. **Customer master & order integrity** → synthetic customer validation, sold-to/ship-to/bill-to/payer logic, pricing & order exception checks. **Billing & deductions** → invoice lifecycle, deduction reason codes, dispute evidence, credit/debit memo paths. **Product knowledge** → dossier, format-specific info, allergen/prep binding, comparison + ranking transparency. Keep copy concise; let the interactive product demonstrate the capability.

---

## 12. Strengthen Nathan's experience section

Organize around capabilities (not a pasted résumé):
- **Consumer & retail operations:** 8+ years; direct customer communication; retail/service workflow coordination; operational issue resolution; product/ordering familiarity; multi-location support.
- **Revenue & transaction operations:** eligibility verification; claims follow-up; billing workflows; customer records; high-value/financial communication; revenue-cycle coordination; transaction-exception resolution.
- **Customer experience leadership:** SOP creation; team training; escalation handling; service recovery; review/reputation growth; cross-functional coordination; process improvement.
- **Systems & automation:** building structured workflows; translating operations into interfaces; working across multiple platforms; learning/testing new operational systems; creating FireFlow as an executable CX case study.

Honest SAP-readiness statement:
> Nathan's prior systems experience includes operational platforms supporting eligibility, claims, billing, customer records, and service workflows. FireFlow extends that foundation into a studied SAP SD and order-to-cash process model. It demonstrates process fluency and readiness to learn the employer's SAP environment without misrepresenting direct SAP tenure.

Never use "SAP expert" or describe the prototype as production SAP experience.

---

## 13. Audit every interaction

Create a formal interaction checklist and test every major action: main nav; mega nav; every submenu; mobile menu; sound control; any state controls; hero actions; featured-product selection; portfolio filtering (brand/category/spiciness/type); portfolio sorting; product cards; product images; dossier; format switching; heat controls; comparison presets; manual comparison selection/removal; comparison empty state; ranking controls + weights + reset; consumer path; vendor path; inquiry prompts; inquiry submission; modal open/close; Resolution Simulator; stage progression; escalation conditions; Command Center cases; Product Signal cards; Brand Universe; Methodology; FAQ; selected-product rail; floating support bar; SAP SD simulation; document flow; exception scenarios; employer-facing links; case-study links; external links; footer links; keyboard use; screen-reader naming; reduced motion; sound disabled; browser back; anchor scrolling; refresh with selected state; mobile portrait/landscape; tablet; common laptop widths; large desktop; Safari; Chrome; Firefox where practical.

No button without a meaningful action. No link to an incorrect anchor. No control that silently fails. No demo action that implies real submission.

---

## 14. Production-quality requirements

Run and repair:
```bash
npm install
npm run build
npm run verify:data
```
Must pass: TypeScript checking; Vite production build; data verification; no unresolved imports; no missing assets; no broken image refs; no unhandled runtime errors; no severe console warnings; no duplicate IDs; no invalid anchor targets; no inaccessible unlabeled controls; no focus traps outside dialogs; no accidental horizontal scroll; no clipping at common viewports; no sticky elements hidden behind other sticky elements.

Add lightweight automated checks where they integrate cleanly (Playwright or Vitest — do **not** do a large framework migration just to add tests) for: navigation anchors; dialog behavior; product selection; comparison actions; inquiry submission; SAP SD stage progression; mobile-menu behavior.

---

## 15. Performance

Audit/improve: initial load; JS bundle size; image sizing/formats; lazy loading; layout shifts; font loading; animation cost; excessive blur/box-shadows; large fixed backgrounds; scroll performance; mobile battery; duplicate event listeners; re-render frequency; state-update loops; modal rendering; audio-context creation. Premium **and** fast; don't sacrifice usability for cinematics.

---

## 16. Accessibility (target WCAG 2.2 AA where practical)

Check: color contrast; visible focus; keyboard nav; semantic headings; landmarks; button-vs-link semantics; dialog semantics; status announcements; error messaging; field labels; reduced motion; sound-independent communication; touch-target size; screen-reader reading order; hidden decorative elements; table accessibility; comparison-table captions; sticky-content overlap; product-image alt text.

**Colorblind constraint (repeat):** never use color as the only signal for severity, status, heat, completion, selection, source type, confidence, or routing — always add words, icons, patterns, or shapes.

---

## 17. Responsive behavior

Desktop stays immersive. Mobile is **intentionally redesigned**, not merely compressed: turn the side rail into an accessible contextual tray; don't cover the viewport; simplify comparison layout (cards instead of an unreadable wide table where needed); make modals full/near-full height when appropriate; keep key next-actions reachable; preserve selected-product context; keep sound controls unobtrusive; prevent sticky elements from stacking over one another; keep main nav understandable; avoid tiny operational diagrams; render the SAP document flow as a vertical timeline; keep employer positioning visible but compact.

---

## 18. Data integrity & honest labeling

Do **not** invent: official sales numbers; Samyang internal metrics; customer names; real orders; real employees; inventory; pricing; customer master data; retailer contracts; shipment records; SAP document numbers; invoices; deduction results; product specs requiring approved sell sheets. Synthetic scenarios are encouraged **but must be labeled**. Maintain the source-label system: **Official / Public retail signal / Editorial / Synthetic / Unavailable / Requires approved source**. Do not disguise editorial judgments as official Samyang facts. Do not imply the inquiry form contacts Samyang or that the site is an authorized customer-service channel. Keep the independence disclaimer visible.

---

## 19. Avoid overclaiming SAP experience

**Approved:** SAP SD process understanding; order-to-cash fluency; SAP-aligned workflow study; customer master & document-flow understanding; pricing/delivery/billing/deduction scenario modeling; ERP-ready operational thinking; transferable systems experience; structured SAP learning readiness.

**Unapproved:** SAP SD expert; eight years of SAP SD; extensive SAP configuration; implemented SAP for Samyang; managed Samyang orders; integrated with Samyang SAP; production SAP deployment; real customer-master management inside SAP; direct access to Samyang systems.

Target impression: *"He understands the workflow, has done serious preparation, has strong transferable operational experience, and could become productive in our environment."* — never *"He is disguising a simulation as SAP tenure."*

---

## 20. Visual/interaction direction

Increase polish via layered panels; better depth hierarchy; fine borders; controlled inner highlights; heat-responsive accents; product-aware lighting; smooth state transitions; animated routing paths; progressive disclosure; better empty/selected states; deliberate cursor/hover behavior; small confirmation moments; operational status transitions; refined modal composition; elegant mobile trays; better type spacing; cleaner density. Use motion to **explain** selection, context transfer, routing, stage progression, comparison, resolution, escalation, completion — not merely because animation exists.

---

## 21. Required agent structure

Use coordinated specialist agents that **share findings** (never let two agents redesign the same component in conflicting ways):
1. **Repository & architecture auditor** — read all code/docs; map architecture; find duplicate implementations; confirm production = the React build (see §0); find feature-parity gaps + broken state connections; create the repair plan.
2. **Front-end reliability engineer** — fix nav, comparison submenu, sticky rail, stacking contexts, responsive behavior, state/event handling, build issues; add tests.
3. **SAP SD / order-to-cash experience architect** — design the SAP SD chapter, synthetic document flow, exceptions, deduction workflow; keep terminology accurate + positioning honest; connect SAP SD to CX management.
4. **UX & interaction designer** — inquiry cards, modals, transitions, mobile behavior, recruiter comprehension; preserve Buldak Night; add interaction hierarchy.
5. **Sound & motion designer** — the restrained sound language; modal transitions; routing/completion feedback; complete silent + reduced-motion use; no perf regressions.
6. **Accessibility & QA specialist** — keyboard, screen reader, contrast, dialog behavior, reduced motion, cross-browser, responsive, the interaction checklist, final defect log.
7. **Employer-conversion editor** — clarify the opening; strengthen positioning; present the 8+ years correctly; connect to the job description; improve the case-study journey; keep SAP language strong but truthful; remove vague AI-style wording.

---

## 22. Work sequence (do not skip reliability to jump to visuals)

**Phase 1 — Audit:** inspect repo + live deployment; confirm production entry point (React build, §0); run current build + tests; create issue inventory; reproduce the submenu + sticky-rail failures; inspect all interactive controls.
**Phase 2 — Reliability repairs:** runtime/build; nav; comparison submenu; sticky rail; broken links/anchors; responsive; z-index/overflow.
**Phase 3 — Employer positioning:** clarify opening; add relevant experience; present the 8+ years correctly; add role→feature map; improve case-study access.
**Phase 4 — SAP SD chapter:** process map; synthetic order scenario; document flow; exceptions; deduction/credit workflow; transparent positioning.
**Phase 5 — Inquiry + modal elevation:** prompt cards; selection feedback; consumer + vendor modals; connect submissions to Resolution Simulator + Command Center; synthetic-case disclosure.
**Phase 6 — Sound + motion:** sound vocabulary; motion system; settings; silent + reduced-motion tests.
**Phase 7 — QA + productionization:** build; data verification; automated tests; responsiveness; accessibility; cross-browser; final defects; docs.

---

## 23. Documentation updates

Update `README.md`, `PROJECT_STATE.md`, `CHANGELOG.md`, `DECISIONS.md`, `KNOWN_LIMITATIONS.md`, `CASE_STUDY.md`. Document: what was broken; what was repaired; which implementation is production; how the sticky rail works; how the submenu works; how modal submissions work; how sound preferences work; how SAP SD is represented; which data remains synthetic; which tests were run; remaining limitations; how to deploy. Add a concise testing report (build status; data-verification status; automated tests; manual viewport tests; keyboard tests; known remaining issues). **Do not claim an issue is fixed unless it was reproduced and tested.**

---

## 24. Final acceptance criteria

All must be true: production build succeeds; live entry point clearly identified (the React build); Comparison Lab submenu works; selected-product sticky rail appears correctly; mobile nav works; every primary button performs an action; consumer submission opens a polished modal; vendor submission opens a polished modal; no inquiry implies real transmission; sound is optional + off by default; sound preference is remembered; reduced-motion works; SAP SD chapter is understandable; the synthetic order scenario can be completed; document flow is visible; pricing/delivery/billing/customer-master/order-management are represented; deductions + credit-memo paths are represented; SAP experience is not overstated; Nathan's 8+ years are correctly presented; recruiters understand the purpose quickly; the site works at mobile/tablet/laptop/desktop widths; no major console errors; data verification passes; docs updated; and it still looks and feels like FireFlow.

---

## 25. Final delivery format

Provide: (1) a concise executive summary; (2) diagnosed problems; (3) repairs made; (4) new SAP SD features; (5) interaction/modal improvements; (6) sound/motion improvements; (7) build + test results; (8) accessibility results; (9) responsive testing results; (10) remaining honest limitations; (11) exact files changed; (12) deployment instructions; (13) a final recruiter-view assessment; (14) screenshots of the repaired desktop + mobile experience where supported.

Explain the most important technical decisions in plain language so Nathan can learn: why the sticky rail was failing; why the submenu was failing; how stacking contexts work; how sticky positioning depends on ancestor containers; how the modal focus system works; how Web Audio feedback works; how the SAP SD document flow maps to order-to-cash; and why the project demonstrates process fluency without constituting production SAP experience.

---

## Final directive

Treat FireFlow as a serious application artifact. It should feel like an ambitious candidate studied the company, understood the role, mapped the operational challenges, built a functioning CX operating model, and cared enough to make every interaction work. Do not chase novelty at the expense of reliability. Do not overwrite the existing project merely to look different.

**Audit first. Repair second. Strengthen the SAP SD process demonstration third. Elevate interactions fourth. Test everything.**

The final product should communicate: *Nathan already understands consumer and retail customer operations. FireFlow shows how he thinks about order management, customer experience, SAP-SD-aligned processes, cross-functional resolution, and continuous improvement.*
