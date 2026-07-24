# FireFlow — Master Restructure Plan

Owner: Nathan J. Song. Purpose: take a 19-section single page and turn it into a
multi-page Customer Experience portfolio that answers the Samyang America
**Manager, Customer Experience** posting line by line, with a guided Nathan's Notes tour
on every section and a persistent support layer on every page.

Read alongside:
- `01-SITE-ARCHITECTURE.md` — routes, shell, state, code splitting, meta, Vercel
- `02-NAVIGATION-SYSTEM.md` — mega nav, sub nav, mini nav, breadcrumbs
- `03-CONTENT-MIGRATION-MAP.md` — every section, anchor, and link call site
- `04-NEW-PAGES-JD-GAPS.md` — what to build to close the JD gaps
- `05-OPERATOR-NOTES-RIDE-GUIDE.md` — the guided-tour note system and the voice rules
- `06-HONESTY-AND-RISK-REGISTER.md` — **read this first**

---

## The finding that reorders everything

A four-agent audit rated the build against the JD. It proves **process command** and is
silent on **people leadership** and **track record**. Those are the posting's two
screening filters. It also found a documentation over-claim: `CASE_STUDY.md` says the
Command Center has a team workload and coaching view. It does not exist.

So the restructure is not only a routing exercise. The most valuable thing in this plan is
a new `/leadership` page, and the cheapest thing in it is promoting real results that are
currently buried in a collapsed `<details>`.

---

## Target route model

| Route | Contents |
|---|---|
| `/` | Hero, Portfolio Pulse, Comparison Lab, featured Ops board preview, guided map |
| `/products` | Rankings Lab, Product Dossier, Brand Universe |
| `/order` | Bulk order, Quote, Standing order |
| `/support` | Open a case, Resolution walkthrough |
| `/ops` | Ops Dashboard (featured workflow) |
| `/intelligence` | Order-to-Cash, Customer Master, Command Center, War Room, Signals |
| `/leadership` | **NEW.** Team and coaching, Standards and SOP, First 90 days, Track record |
| `/about` | What this demonstrates, Why I built it, Five Colors, Methodology, FAQ |

Mega nav gains a **Leadership** group. `SupportBar` mounts once in `App` and therefore
appears on every route, including `/ops`.

---

## Waves

Each wave is independently shippable. `tsc -b` and `npm run build` stay green at every step.

### Wave 0 — Integrity (do this first, it is cheap)
1. Fix the `CASE_STUDY.md` / `04-TARGET-JOB-TO-HOMEPAGE-MAP.md` over-claim about a team
   coaching view. Either correct the docs now, or accept that Wave 3 makes them true.
   Do not leave both wrong.
2. Decide consciously: real retailer banners in fabricated disputes, and unlicensed product
   imagery. Both are disclaimed; the audience is Samyang. See the register.
3. Update `CLAUDE.md` to record the new Operator Notes rule (one per section, collapsed by
   default) so the old cap is superseded on purpose rather than broken by accident.

### Wave 1 — Router, with no visible change
1. `npm install react-router-dom`.
2. Wrap `main.tsx` in `BrowserRouter`. Convert `App.tsx` to `Routes` with a single
   `path="*"` rendering today's `HomePage`, plus `/ops`. Add `vercel.json`.
3. Add `ScrollAndFocusManager` so in-page anchors keep working under the router.
4. Teach `ButtonLink` to render a router `<Link>`. This is the choke point.
5. Deploy. The site looks identical, on real URLs.

### Wave 2 — Extract the shell, then split pages one per commit
1. Move `MegaNav`, `SelectedProductRail`, `SupportBar`, `CompareRail`, `EmployerIntro`,
   the footer, and `#main` from `HomePage` up into `App`. Verify the SupportBar intake
   survives a manual URL change mid-form.
2. Fix `--rail-h` default to `0`; add `--subnav-h` and `--z-subnav: 25`; recompose `--sticky-h`.
3. Create `src/data/nav.ts` as the single source for routes and sections. Refactor
   `MegaNav.GROUPS` and the footer to consume it (they are duplicated and drifting today).
4. Split `/products`, `/order`, `/support`, `/intelligence`, `/about`, then `/ops` last.
   One page per commit, rewriting only the links that point into it.
5. Grep-sweep for any residual `href="#"` that is not `#main`.

### Wave 3 — The pages that win the job
Build in this order, from `04-NEW-PAGES-JD-GAPS.md`:
1. **E, Track record** (`/leadership#results`). Impact 4, effort 1. Promote the real,
   non-Samyang wins out of the collapsed `<details>` in `EmployerEvidence`.
2. **B, Standards and SOP playbook** (`/leadership#standards`). Impact 5, effort 2.
3. **A, Team operating model and coaching board** (`/leadership#team`). Impact 5, effort 3.
   Mandatory despite the ratio: it is the only thing on the site that answers "3+ years
   managing supervisors, managers, or team leads." It also makes `CASE_STUDY.md` honest.
4. **C, KPI trend and cost-to-serve** (`/intelligence#command`). Impact 5, effort 3.
   Replaces the invented constants in `CommandCenter.buildScorecard` with a named driver
   model, and puts at least one metric in a watch state so the scorecard stops looking
   invented.

D, First 90 days, is the runner-up and pairs naturally with B.

### Wave 4 — Navigation layers
1. `SubNav` (sticky per-page section bar) with one shared `usePageSections` IntersectionObserver.
2. `MiniNav` (right-gutter progress rail), hidden below 900px, reusing the SupportBar step-rail
   `data-state` glyph pattern.
3. Dynamic breadcrumbs: `FireFlow / {Route} / {Section}`, with the **monochrome pepper
   separator** (Option A) and optionally one static obangsaek tick at the trail head. Both
   decorative and `aria-hidden`. Do not build the per-section color coder.

### Wave 5 — The guided tour
Write one Nathan's Note per section, roughly 27, collapsed to a teaser by default and
expanding into the docked panel. **Read `03-OPERATOR-NOTES-VOICE.md` and
`08-BANNED-AI-PATTERNS.md` before writing any of them.** Each note answers: what is this,
what problem does it prevent, why did I build it this way, how would I resolve it as a
manager. Add a `NotesProvider` so only one panel is open at a time.

### Wave 6 — Performance and reach
1. `React.lazy` per route with one Suspense boundary. Expect the entry to drop from about
   169 KB gzip to roughly 90-115 KB.
2. Per-route `<title>`, description, canonical, and Open Graph via a `RouteMeta` hook.
3. A prerender `postbuild` (`vite-react-ssg` or `react-snap`) so a link pasted into Slack
   or LinkedIn previews correctly. This is the biggest indexability win.
4. Delete `src/lib/router/useHashRoute.ts`.

---

## Definition of done, every wave

1. `node_modules/.bin/tsc -b --force` exits 0.
2. `npm run build` exits 0 on a Linux machine with a fresh `npm install`.
3. `npm run verify:data` passes.
4. Style sweep: no visible `→ -> ↗`, no prose em-dash separators, no `text-decoration: underline`
   on links, no nested `<Button>` inside `<a>`.
5. Honesty sweep: no SAP implementation, integration, or tenure claims; all operational data
   synthetic and labeled.
6. Accessibility: keyboard operable, visible focus, `aria-current` on active nav, state carried
   by glyph or word and never color alone, `prefers-reduced-motion` respected, focus moves to
   `#main` on route change.
7. No horizontal overflow at 1440, 1280, 1024, and 390.
8. `CHANGELOG.md` updated; `HANDOFF.md` updated if architecture changed.
9. Deploy with `npx vercel --prod` from the folder. Do not connect git.

---

## Risks

- **`ButtonLink` is a single choke point.** Convert it in Wave 1 or many CTAs break at once.
- **Lazy plus hash timing.** An anchor target does not exist until its chunk resolves. The
  scroll manager must retry after Suspense commits.
- **Two history writers.** `homeStore.writeUrl` calls `replaceState` alongside the router.
  Low risk, query-only, path-preserving. Verify `useLocation().search` is not stale; migrate
  to `useSearchParams` only if it is.
- **`EmployerIntro` double-mount** would flash the cover. Mount once in `App`.
- **Parallel work streams.** Two agents edited this tree today and left an orphaned component
  that broke `tsc`. Confirm no other stream is live before starting Wave 2, and run
  `tsc -b --force` before every deploy.

---

## Suggested first move

Wave 0 plus Proposal E. Both are cheap, and together they fix the only integrity problem on
the site while answering the JD requirement the build currently ignores. Then Wave 1, which
changes nothing a visitor can see but unlocks everything after it.
