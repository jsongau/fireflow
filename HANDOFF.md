# FireFlow — Handoff / Continuation Brief

Read this first, then `CHANGELOG.md` (detailed history), then the two doc packs in
`docs/` when you touch copy or the employer layer.

## What this is
FireFlow Product Intelligence — an independent, interactive Customer Experience
operating model built by **Nathan J. Song** to support an application for
**Manager, Customer Experience at Samyang America**. It is a portfolio artifact,
not a real product. Everything operational is synthetic and labeled.

## Canonical implementation (important)
The **React + Vite + TypeScript app under `src/` is the real product.** Entry:
`index.html` → `src/main.tsx` → `src/app/App.tsx` → `src/pages/HomePage.tsx`.
`preview.html` + `preview-data.js` are a **legacy** single-file demo and are
NOT in sync with the React app — do not treat them as canonical, and don't spend
effort maintaining them unless explicitly asked.

## Live URL + deploy
- Live: **https://samyang-xi.vercel.app** (Vercel, CoverCapy Hobby account, project `samyang`).
- Deploy method — HARD RULE (`skills/deploy-from-project/SKILL.md`): always the
  chained form `cd ~/Claude/Projects/Samyang && npx vercel --prod`, never a bare
  deploy from wherever the shell happens to be. On 2026-07-09 a bare `npx vercel
  --prod` from `~` nearly deployed the entire home directory. Verify
  `.vercel/project.json` names `samyang` before deploying. It uploads the
  working directory and builds on Vercel's Linux servers. When prompted, do NOT
  connect the git repo (it would deploy stale committed code instead of the
  working tree). Re-run the same command to publish updates.
- The old `fireflow-capy-j.vercel.app` (CapyJ Pro-trial) is a stale earlier deploy — ignore it.

## Build / verify
- `tsc -b` (type-check) runs anywhere and currently **passes clean**. Use it as your gate.
- `npm run build` (= `tsc -b && vite build`) and `npm run verify:data` need a
  `node_modules` matching the machine's platform. They build fine on the user's
  Mac and on Vercel, but FAIL in a Linux sandbox if `node_modules` was installed
  on macOS (rollup/esbuild native binary mismatch). On a fresh machine: `npm install` first.
- `verify:data` was fixed by adding `baseUrl`+`paths` to the root `tsconfig.json`
  so `tsx` resolves the `@/` alias.

## Architecture quick map
- State: `src/state/homeStore.tsx` — context+reducer. Notable fields:
  `selectedFamilyId/selectedVariantId/selectedBrand`, `userMode` (explore|retailer|distributor),
  `compareIds` (**MAX_COMPARE = 2**, head-to-head), `introDismissed`, `routedCases`/
  `selectedCaseId` (live case board; only identifiers persist via `stripCase`).
  Persists non-sensitive prefs to `localStorage`; URL-syncs selection. Operator Notes
  are **always on** now: no `operatorNotesEnabled` flag, no nav toggle.
- Data: `src/data/*` — `families` (45), `variants` (76), `brands`, `categories`,
  `rankings` (8 views), `issues`, `scenarios`, `sources`, `spiciness`, `images`,
  and `sapsd.ts` (SAP SD glossary + order-to-cash flow + exceptions + disclosure),
  and `dataArch.ts` (the star-schema dimensional model + the integration map, both
  synthetic studies, typed and labeled).
- Home route sections (2026-07-10): ProductSignalHero, OrderTourEntry,
  PortfolioPulse, ComparisonLab, OrderBuilder, OpsTeaser, **StudiesBand**
  (#studies, the landing-page index of the five /intelligence studies; cards
  derive their copy from nav.ts so band and menu never drift). The MegaNav
  group / footer column / route label for /intelligence is now
  **"Order-to-Cash"** (URL unchanged).
- Home chapters: `src/components/home/*` — ProductSignalHero, PortfolioPulse,
  RankingsLab, ComparisonLab, ProductDossier, InquiryPaths, ResolutionSimulator,
  **SapProcessIntelligence** (#o2c, "Work the book of orders.": a scored Order Queue
  workbench; `triageOrder` in `sapsd.ts` builds each score from four visible factors
  and the UI shows the math; selecting an order drives the stage spine and exception
  panels. The queue's first row is the **Retailer Order Lifecycle** featured order:
  `src/data/ediLifecycle.ts` is a reducer-driven X12 study (850/997/855/856/810/820,
  line decisions, gated document generation, shortage deduction, corrective action,
  Reset) rendered by `OrderLifecycle.tsx` when that order is selected; its queue row
  derives live from the same state. ComparisonLab links in via a sessionStorage
  handoff, `O2C_OPEN_ORDER_KEY`; the deduction routes to the board as FF-2231),
  CaseBoard (#simulate), CrossFunctionalWarRoom, CustomerMasterRecord,
  **IntegrationArchitecture** (#integration, "One order, five systems.": selectable
  ERP/CRM/EDI/web/warehouse systems and the flows between them, each with object,
  pattern, cadence, failure mode, owner, and a source-of-truth governance strip),
  **DataModelStudio** (#data-model, "The model under the questions.": a star-schema
  study of the CX domain, fact/dimension picker with grain, columns, conformed
  dimensions, all modeled from real FireFlow data files),
  CommandCenter, ProductSignals, BrandUniverse,
  Methodology, HomepageFAQ, SupportBar (floating), SelectedProductRail (sticky top,
  compact on mobile), **CompareRail** (collapsible left tray, ≥900px), **InquiryDialog**,
  **SoundToggle**.
- Ops page: `src/components/ops/OpsDashboard/*` at hash route `#/ops`
  (`src/lib/router/useHashRoute.ts`); draggable case kanban with a keyboard-equal
  "Move to" select, seeded from `src/data/seedCases.ts`.
- Tour: `src/components/tour/OrderTour.tsx` + `src/lib/tour/orderTour.ts` — the
  "Follow the order" six-stop guided path (home compare, #o2c queue, lifecycle
  decisions, deduction, resolution, /ops board). Bar mounts in App; entry strip
  renders below the home hero. Step persists in sessionStorage
  (`fireflow:tour:step`); #o2c advances its lifecycle reducer on the
  `fireflow:o2c-tour` milestone event (idempotent via reducer gates).
- Employer layer: `src/components/employer/*` — EmployerIntro (Enter FireFlow /
  Explore with Nathan cover), OperatorNote (the "Nathan's read" system, always on;
  the toggle was removed), EmployerEvidence (#fit role→feature map),
  EmployerClose (#why). Config: `src/config/employer.ts` (résumé/contact actions are
  hidden until filled in — never ship a dead button).
- Primitives: `src/components/primitives/*` — Button, **ButtonLink** (use this for a
  button-styled anchor; never nest `<Button>` inside `<a>`), Segmented, badges,
  PepperScale, ProductStage.
- Sound: `src/lib/sound/sound.ts` — Web Audio, **on by default** (an explicit "off" persists in
  localStorage), lazily created on the first user gesture so nothing autoplays, safe no-op.
- Sticky offsets: tokens `--nav-h`/`--rail-h`/`--sticky-h` in `src/styles/tokens.css`;
  sections use `scroll-margin-top: var(--sticky-h)` so anchors clear the sticky headers.
- **Page shell (2026-07-09):** the content column is one token. `--shell-max` and
  `--shell-pad` in `tokens.css` are the only place a width is set; every section
  wrapper reads them. Above 900px `--shell-max` is
  `min(1120px, 100vw - 2 * --gutter-reserve)` so the fixed gutter trays always have
  clear space. Never reintroduce a hardcoded `max-width: 1200px`. `--spine-w` (60px)
  is derived from the MiniNav's own box model; if you change that component's padding
  or marker column, recompute `--spine-w` and `--gutter-reserve` together.
- **Full-bleed bands: MegaNav site-wide, plus one owner-approved exception.** Bar and
  dropdown span the viewport and inset by `--nav-pad`; they do NOT use `--shell-max`.
  Group labels must never wrap. Exception (2026-07-09, owner decision): the
  IntegrationArchitecture flows block (`.band`) is a second `--nav-pad` full-bleed band,
  a two-pane layout with the flow list scrolling left and a sticky reading pane right
  (the deliberate flip of DataModelStudio's sticky-left picker), so picking a flow
  visibly changes the detail beside it. Do not add further full-bleed bands without an
  owner decision.
- **Both gutter trays are hidden on /intelligence** (owner decision, 2026-07-09): the
  Integration Map's full-bleed reading pane needs the gutters, and SubNav already
  covers section navigation there. `showGutterRails` in `App.tsx` is the switch.
- **Both gutter trays rest as spines.** MiniNav (right) and CompareRail (left) are
  `--spine-w` wide at rest and widen on `:hover`, `:focus-within`, or `.railPinned`.
  Expansion is pure CSS; React holds only the pin. Collapsed content is **clipped**
  (`max-width: 0` / `max-height: 0` + `overflow: hidden`), never `display: none`, so
  assistive tech keeps the full list and `:focus-within` guarantees a control can
  never take focus while invisible. Two traps if you touch either rail: a flex `gap`
  is drawn between zero-width siblings, so collapse the gap too; and a `margin` set
  in a rule later in the file beats the collapse rule on source order, so let the
  expanded-state rules own margins by specificity. MiniNav persists its pin to
  `localStorage`; CompareRail's is session-only.
- **MegaNav dropdown copy** lives in `src/data/nav.ts` as `NavDetail`
  (`kicker`/`sub`/`blurb`/`proof`/`cta`). A new nav destination without `proof` and a
  `cta` renders a thin card. Fill all five, and put the synthetic-data disclosure in
  the last proof line, not in the blurb.

## Hard rules (do not break)
- **Honesty:** no SAP implementation/integration/tenure claims; no "8 years of SAP";
  no real Samyang data, customers, orders, or metrics; all ops data synthetic + labeled.
  SAP section is "Order-to-Cash Process Intelligence · SAP SD aligned workflow study."
- **Writing style** (see `docs/nathan-writing-style-fireflow/`): no arrows in visible
  copy (no →, ->, ↗); no em dashes as sentence separators (a lone `—` as a "no value"
  table cell is fine); no underlined links (color/weight only); plain American English;
  CTAs name the action. Run a grep sweep after copy edits.
- **Accessibility:** Nathan is colorblind — never signal state by color alone (add
  glyph/word/shape). Keyboard operable; respect `prefers-reduced-motion`; visible focus.
- **Fourth wall:** break it at the threshold (intro) and in Operator Notes only; notes
  are always on now (no toggle); never popups on every section. **Open flag:** placements
  have drifted to about 8 against the documented cap of 6 (War Room, Customer Master,
  Ops Dashboard additions); needs an owner decision on which notes to keep.

## Reference packs in the repo
- `docs/nathan-writing-style-fireflow/` — Nathan's voice + banned patterns.
- `docs/employer-layer-pack/` — the employer-layer brief, approved copy bank, SAP
  guardrails, role→feature map, fourth-wall rules, and a QA acceptance checklist (file 10).

## Verified vs not (as of this handoff)
- Verified: `tsc -b` exit 0; all in-page anchors resolve; no nested anchor/button;
  no dead `#vendor` routes; style scans clean; data references resolve.
- NOT verified here (needs a real desktop browser + a redeploy): runtime console
  errors, exact responsive behavior at 1440/1366/1280/1024, screen-reader pass, and
  the mega-nav submenu-on-hover (the sandbox browser only renders the mobile drawer).

## Open threads / good next steps
- Redeploy and confirm on real desktop: submenu-on-hover, card→dossier scroll, the
  left CompareRail opening when 2 products are compared.
- Full responsive + a11y QA at the four widths above; check for horizontal overflow.
- Optionally sync `preview.html` to the React app, or delete it and rely on the deploy.
- More `playSound` trigger points if desired (engine + toggle already exist).
- Work through the employer-pack QA checklist (`docs/employer-layer-pack/10-*`) on the live site.

## Session briefs
- `SESSION-2026-07-09-LAYOUT-AND-NAV.md` — the page-shell gutter, full-bleed mega nav,
  rich dropdown previews, spine rails, compact footer. Read it before touching layout
  or navigation: it carries the derived-token math, the three CSS collapse traps, and
  the deploy command that does not silently fail.

## How to continue in a new session
Point the new Claude at this folder and say: "Read HANDOFF.md and CHANGELOG.md,
then continue." Keep the React app in `src/` canonical; don't rebuild from scratch;
preserve the Buldak Night visual system and the honesty guardrails.
