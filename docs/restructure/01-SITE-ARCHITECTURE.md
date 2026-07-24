# 01 — Site Architecture: from one page to real routes

## The problem
`src/pages/HomePage.tsx` renders **19 sections** in one `<main>`. The mega nav's five
groups are already a sitemap for pages that do not exist. Everything ships in one
eager bundle (about 560 KB raw, 169 KB gzip, 156 modules), every deep link shares one
`<title>`, and the back button does not move between sections.

## The route model

Seven routes. The grouping honors the owner's instruction: browsing and buying stay
prominent, while the operations, process, and leadership proof each get their own page.

| Route | Page component | Sections (anchor ids) |
|---|---|---|
| `/` | `HomePage` | Hero `#hero`, Portfolio Pulse `#portfolio`, Comparison Lab `#compare`, featured Ops board preview, guided map to the other routes |
| `/products` | `ProductsPage` | Rankings Lab `#rankings`, Product Dossier `#product`, Brand Universe `#brands` |
| `/order` | `OrderPage` | Bulk order `#order`, Request a quote `#quote`, Standing order `#standing-order` |
| `/support` | `SupportPage` | Open a case `#resolve`, Resolution walkthrough `#simulate` |
| `/ops` | `OpsPage` | Ops Dashboard `#ops` (featured workflow) |
| `/intelligence` | `IntelligencePage` | Order-to-Cash `#o2c`, Customer Master `#customer-master`, Command Center `#command`, War Room `#warroom`, Product Signals `#signals` |
| `/leadership` | `LeadershipPage` | Team & coaching `#team`, Standards & SOP `#standards`, First 90 days `#plan`, Track record `#results` |
| `/about` | `AboutPage` | What this demonstrates `#fit`, Why I built it `#why`, Five Colors `#colors`, Methodology `#methodology`, FAQ `#faq` |

`/leadership` is new and exists to close the JD's biggest gap. See `04-NEW-PAGES-JD-GAPS.md`.

### Open decision for the owner
The owner said comparison and bulk ordering belong on the main page. Order Builder,
Quote Request, and Standing Order share the `orderLines` cart and link to each other,
so splitting them is costly. Two options:

- **A (recommended):** Home keeps Portfolio Pulse and Comparison Lab, plus a
  prominent "Build a bulk order" entry card. The full order trio lives on `/order`.
- **B:** Home also embeds Order Builder, and `/order` holds only Quote and Standing
  Order. This duplicates the cart's entry point across two routes.

Decide before Wave 2.

---

## Router choice: real paths, not hash routes

Adopt `react-router-dom` v6 with `BrowserRouter` and real paths. Delete
`src/lib/router/useHashRoute.ts` at the end of the migration.

Hash routes (`#/ops`) were the right call for one page under time pressure, but they
are disqualifying here: search engines treat `#fragment` as the same document, so
`/#/portfolio` and `/#/order` are one indexable URL. No per-page canonical, no per-page
Open Graph card, no sitemap. A portfolio a recruiter will deep-link and share must have
real URLs. The hash is also already overloaded: `#portfolio` is a scroll anchor and
`#/ops` is a route.

Cost: one dependency (about 10-12 KB gzip) and one `vercel.json`.

---

## The persistent shell

Move the chrome **out of `HomePage` and up into `App`** so it never remounts on
navigation:

```
HomeStateProvider
  ScrollAndFocusManager      (new)
  RouteMeta                  (new)
  EmployerIntro              (mounts once; introDismissed prevents re-show)
  MegaNav
  SelectedProductRail        (only where relevant; see --rail-h note below)
  <main id="main">
    Suspense
      Routes  ...  lazy pages
  SiteFooter                 (extracted from HomePage FOOTER_COLUMNS)
  CompareRail
  SupportBar                 (mounts once, never unmounts)
```

Why this matters:

- **`SupportBar` holds the entire intake as local state** (`open`, `step`, `role`,
  `categoryId`, `values`, `priority`, `channel`, `deductionTypeId`, `noteOpen`). If it
  mounted per page, navigating mid-intake would wipe the form. Mounted once in `App`,
  above the `Routes`, React never unmounts it. See `05` and the support layer note below.
- **`useStickyHeightVar` publishes `--nav-h` and `--rail-h`** from `MegaNav` and
  `SelectedProductRail`. Because both persist in `App`, the sticky tokens are measured
  once and stay correct across navigation. Every `scroll-margin-top: var(--sticky-h)`
  keeps working untouched.

### Required token fix
`--rail-h` defaults to `56px` in `tokens.css`. On routes where the product rail is not
mounted, that phantom height pushes content down. Change the default to `0` and let
`useStickyHeightVar` set the real height only when the rail mounts.

---

## Global state across navigation

`HomeStateProvider` stays **above** `Routes`. Every field then survives navigation with
no per-section ownership to untangle:

| Field | Spans | Note |
|---|---|---|
| `selectedFamilyId` / `selectedVariantId` / `selectedBrand` | `/`, `/products`, `/order`, `/support` | The product thread. `SelectedProductRail` persists, so it stays visible everywhere. |
| `compareIds` | `/`, `/products` | `CompareRail` persists in `App`. |
| `orderLines` | `/order` | Self-contained. Cleanest split. |
| `routedCases` / `selectedCaseId` | `SupportBar` writes; `/support` and `/ops` read | Routing a case on `/products` and then opening `/ops` works, because state lives in the provider. |
| `userMode`, `rankingMode`, `savedProductIds`, `introDismissed` | global | Persisted. |

### The one real pitfall: two history writers
`homeStore.writeUrl` calls `window.history.replaceState` on every state change,
rebuilding the URL from `window.location.pathname`. Under `BrowserRouter` this is a
second history writer. It is *probably* safe, because it only replaces the query string
and preserves the live pathname, so selecting a product on `/products` yields
`/products?product=...`. But verify that `useLocation().search` is not stale afterward.
If it is, migrate `writeUrl`/`readUrl` to `useSearchParams`. Do not do that refactor
preemptively.

---

## Code splitting

`React.lazy` at the route level, one `Suspense` boundary in `App`. Keep `HomePage`
eager (it is the landing).

Expected splits out of the entry bundle:

- `/ops` chunk: `OpsDashboard`, drag logic, `data/caseBoard`, `data/seedCases`. Roughly 25-40 KB gzip. Never needed on first paint.
- `/products` chunk: the catalog subtree, image maps, rankings, comparison, dossier. Roughly 40-60 KB gzip. Likely the heaviest.
- `/intelligence` chunk: `SapProcessIntelligence`, `CustomerMasterRecord`, `CommandCenter`, `CrossFunctionalWarRoom`, `ProductSignals`, glossary data. Roughly 30-45 KB gzip.
- `/order` chunk: builder, quote, standing order. Roughly 15-25 KB gzip.

Realistic first-load target: entry drops from about 169 KB gzip to roughly **90-115 KB gzip**.

`SupportBar` cannot be route-split (it must persist), and it is heavy because it pulls
`intake.ts`, `CaseEmail`, the glossary, and `OperatorNotePanel`. Second-order
optimization: lazy-load the drawer *body* inside `SupportBar` only once `open` is true,
keeping just the FAB in the entry. Optional.

---

## Scroll, focus, and hash targets

React Router intercepts navigation, so native hash scrolling stops working. Build one
`ScrollAndFocusManager` under `Routes`:

1. On `location` change: if `location.hash`, `document.getElementById(hash)?.scrollIntoView()`
   (CSS `scroll-margin-top` handles the sticky offset automatically). Otherwise
   `window.scrollTo(0, 0)`.
2. **Wait for the lazy chunk.** With `React.lazy`, the anchor target does not exist in
   the DOM until the chunk resolves. Run the scroll inside `requestAnimationFrame` or a
   `setTimeout(0)` after Suspense commits, and retry once if the element is missing.
3. Scroll restoration: reset to top on `PUSH`, restore on `POP` (back/forward). Key off
   `useLocation().key`. `<ScrollRestoration>` requires a data router, which we are not using.
4. **Focus:** on route change, move focus to `<main id="main">` (`tabIndex={-1}`,
   `.focus({ preventScroll: true })`) and announce the new page title in an `aria-live`
   region. Without this, keyboard and screen-reader users stay stranded at the old focus.
5. `scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" })`.

---

## Per-route metadata

No framework here, so no built-in head management.

Ship a dependency-free `useDocumentMeta({ title, description, canonical })` hook, or a
single `RouteMeta` component keyed off `useLocation().pathname` with a lookup table. It
sets `document.title` and updates `<meta name="description">`, `<link rel="canonical">`,
and the Open Graph tags in an effect. About 30 lines, no dependency, consistent with the
project's minimal-dependency posture.

**Caveat that matters for a portfolio:** client-set titles work for Google's rendering
crawler but are unreliable for social scrapers, and there is no per-route HTML at
request time. If a recruiter pasting a link into Slack or LinkedIn should see the right
preview, add a **prerender step** (`vite-react-ssg` or `react-snap`) as a `postbuild`,
emitting static `dist/<route>/index.html` with baked-in title, description, and OG tags.
This is the single biggest indexability win and it pairs with the real-paths decision.

---

## Vercel

Without a rewrite, `GET /portfolio` 404s. Add `vercel.json` at the repo root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "cleanUrls": true,
  "trailingSlash": false
}
```

Vercel serves an existing static file before applying a rewrite, so prerendered
per-route HTML wins over the fallback automatically. Keep deploying with
`npx vercel --prod` and do not connect git.

---

## Files that change

- `src/main.tsx` (wrap in `BrowserRouter`)
- `src/app/App.tsx` (shell, `Routes`, lazy, Suspense)
- `src/pages/HomePage.tsx` (slim to `/`; footer extracted)
- New: `src/pages/{ProductsPage,OrderPage,SupportPage,OpsPage,IntelligencePage,LeadershipPage,AboutPage,NotFoundPage}.tsx`
- New: `src/app/{ScrollAndFocusManager,RouteMeta,SiteFooter}.tsx`
- New: `src/data/nav.ts` (single source for routes + sections; see `02`)
- `src/components/navigation/MegaNav/MegaNav.tsx` (hrefs become paths, render `<Link>`)
- `src/components/primitives/ButtonLink.tsx` (**choke point**: teach it to render a router `<Link>` or accept `to`; many CTAs depend on it)
- The 20 link call sites in `03-CONTENT-MIGRATION-MAP.md`
- `src/components/ops/OpsDashboard/OpsDashboard.tsx` (the `#/` back link becomes `/`)
- `src/styles/tokens.css` (`--rail-h: 0` default; add `--subnav-h`, `--z-subnav`)
- New: `vercel.json`
- `package.json` (add `react-router-dom`; optional prerender + `postbuild`)
- Delete last: `src/lib/router/useHashRoute.ts`

**Not touched:** section component internals and their `id=` anchors; `homeStore.tsx`
(unless the history conflict appears); `useStickyHeightVar.ts`.
