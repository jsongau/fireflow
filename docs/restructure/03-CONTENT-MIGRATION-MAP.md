# 03 — Content Migration Map

Every section, every anchor, every link call site. Section component internals do not
change; only where they mount and what their links point at.

---

## Section to route

| # | Component (`src/components/home/…`) | Anchor | Str | Destination |
|---|---|---|---|---|
| 1 | `ProductSignalHero` | `#hero` | 3 | `/` |
| 2 | `PortfolioPulse` (+ `catalog/*`) | `#portfolio` | 4 | `/` |
| 3 | `ComparisonLab` | `#compare` | 3 | `/` |
| 4 | `RankingsLab` | `#rankings` | 3 | `/products` |
| 5 | `ProductDossier` | `#product` | 3 | `/products` |
| 6 | `BrandUniverse` | `#brands` | 2 | `/products` |
| 7 | `OrderBuilder` | `#order` | 4 | `/order` |
| 8 | `QuoteRequest` | `#quote` | 3 | `/order` |
| 9 | `StandingOrder` | `#standing-order` | 3 | `/order` |
| 10 | `InquiryPaths` (+ `InquiryDialog`) | `#resolve` | 4 | `/support` |
| 11 | `ResolutionSimulator` (+ `CaseBoard`) | `#simulate` | 5 | `/support` |
| 12 | `ops/OpsDashboard` | `#ops` | 5 | `/ops` (featured) |
| 13 | `SapProcessIntelligence` | `#o2c` | 5 | `/intelligence` |
| 14 | `CustomerMasterRecord` | `#customer-master` | 4 | `/intelligence` |
| 15 | `CommandCenter` | `#command` | 5 | `/intelligence` |
| 16 | `CrossFunctionalWarRoom` | `#warroom` | 4 | `/intelligence` |
| 17 | `ProductSignals` | `#signals` | 4 | `/intelligence` |
| 18 | `employer/EmployerEvidence` | `#fit` | 5 | `/about` |
| 19 | `employer/EmployerClose` | `#why` | 3 | `/about` |
| 20 | `FiveColors` | `#colors` (add id) | 2 | `/about` |
| 21 | `Methodology` | `#methodology` | 3 | `/about` |
| 22 | `HomepageFAQ` | `#faq` | 2 | `/about` |

New sections (see `04-NEW-PAGES-JD-GAPS.md`): `#team`, `#standards`, `#plan`, `#results`
on `/leadership`.

Strength ratings are the audit's, 5 being strongest proof of expertise.

**Keep together (hard coupling):** `CaseBoard` only renders inside `ResolutionSimulator`;
`InquiryDialog` only inside `InquiryPaths`. Each pair stays on one page.

`FiveColors` currently has **no `id`**. Add `id="colors"` when it moves.

---

## Anchor to link rewrite

Same-page links stay a hash. Cross-page links become `to="/route#anchor"`. React Router
does **not** auto-scroll to a hash: `ScrollAndFocusManager` must handle it (see `01`).

| Anchor | New target |
|---|---|
| `#hero` | `/` |
| `#portfolio` | `/` (was cross-page from BrandUniverse) |
| `#compare` | `/#compare` |
| `#rankings` | `/products#rankings` |
| `#product` | `/products#product` |
| `#brands` | `/products#brands` |
| `#order` | `/order` |
| `#quote` | `/order#quote` |
| `#standing-order` | `/order#standing-order` |
| `#resolve` | `/support` |
| `#simulate` | `/support#simulate` |
| `#/ops` | `/ops` |
| `#o2c` | `/intelligence#o2c` |
| `#customer-master` | `/intelligence#customer-master` |
| `#command` | `/intelligence#command` |
| `#warroom` | `/intelligence#warroom` |
| `#signals` | `/intelligence#signals` |
| `#fit` | `/about#fit` |
| `#why` | `/about#why` |
| `#methodology` | `/about#methodology` |
| `#faq` | `/about#faq` |
| `#main` | unchanged (skip link) |

---

## Every link call site that must change

Verified by grep. `ButtonLink` is the **choke point**: teach it to render a router `<Link>`
or accept a `to` prop first, or many CTAs break at once.

**Nav model and footer (highest value, do first)**
- `MegaNav.tsx` `GROUPS` (lines 29-169) — every `href` becomes a path; render `<Link>`. Keep the `mode` side effect in `onFollow` (dispatches `SET_MODE`). Brand lockup (line 273) `#hero` becomes `/`. The `#/ops` item (line 101) becomes `/ops`.
- `HomePage.tsx` `FOOTER_COLUMNS` (lines 31-76, rendered line 133) — moves to `SiteFooter`; 19 hrefs rewritten.

**Persistent chrome (fires from any page, so all become cross-page)**
- `SelectedProductRail.tsx` lines 106, 114, 121, 192, 199, 214 — `#compare`, `#order`, `#resolve`
- `CompareRail.tsx` line 82 — `#compare`
- `SupportBar.tsx` lines 741, 787 — `#o2c`, `#simulate`. Keep `closeForJump` (line 281) so the drawer closes without stealing focus; convert to `useNavigate` inside the handler.

**Within pages**
- `ProductSignalHero.tsx` 111, 113, 121, 129 — `#product`, `#compare`, `#order`, `#resolve`
- `ProductDossier.tsx` 202, 210, 218 — `#order`, `#resolve`, `#compare` (now cross-page)
- `RankingsLab.tsx` 104 — `#product` (same page)
- `ComparisonLab.tsx` 114, 115 — `#order`, `#resolve` (cross-page)
- `OrderBuilder.tsx` 428, 429 — `#quote`, `#standing-order` (same page)
- `QuoteRequest.tsx` 134, `StandingOrder.tsx` 197 — `#order` (same page)
- `SapProcessIntelligence.tsx` 512, 515 — `#customer-master`, `#signals` (same page)
- `CustomerMasterRecord.tsx` 457 — `#o2c` (same page)
- `CommandCenter.tsx` 284, `CrossFunctionalWarRoom.tsx` 193 — `#simulate` (cross-page)
- `BrandUniverse.tsx` 51 — `#portfolio` (cross-page)
- `EmployerClose.tsx` 31 — `#fit` (same page)
- `InquiryPaths.tsx` 121 — `#simulate` (same page)
- `InquiryDialog.tsx` 197, 200, 288 — `#simulate`, `#command`, `#o2c` (cross-page)
- `OpsDashboard.tsx` 130 — `#/` becomes `/`

---

## Store fields by page (for splitting safely)

| Field | Written by | Read by | Spans |
|---|---|---|---|
| `selectedFamilyId` / `Variant` / `Brand` | Hero, RankingsLab, ProductDossier, ProductQuickView, ProductSignals | Hero, PortfolioPulse, ProductDossier, InquiryPaths, SelectedProductRail | `/`, `/products`, `/support` |
| `compareIds` | RankingsLab, ProductDossier, ProductQuickView, SelectedProductRail | ComparisonLab, CompareRail | `/`, `/products` |
| `orderLines` | OrderBuilder | QuoteRequest, StandingOrder | `/order` only. Clean. |
| `routedCases` / `selectedCaseId` | SupportBar | ResolutionSimulator, CaseBoard, OpsDashboard | chrome, `/support`, `/ops` |
| `userMode` | Hero, MegaNav, rail, several | most | global |
| `selectedScenarioId` | CommandCenter, ResolutionSimulator, InquiryPaths | same | `/intelligence`, `/support` |
| `savedProductIds` | PortfolioPulse, ProductDossier, QuickView | same | `/`, `/products` |
| `introDismissed` | EmployerIntro, EmployerClose | EmployerIntro | global |

All survive navigation because `HomeStateProvider` sits above `Routes`. There is no
per-section ownership to untangle.

---

## Order of operations

Each step keeps `tsc -b` and `npm run build` green and is independently shippable.

1. `npm install react-router-dom`. No behavior change.
2. Wrap `main.tsx` in `BrowserRouter`. Convert `App.tsx` to `Routes` with a single
   `path="*"` rendering the current `HomePage`, plus `/ops`. Add `vercel.json`. Deploy
   and verify deep links. **The app still behaves as one page, but on a real router.**
3. Add `ScrollAndFocusManager` so in-page `#anchor` links still work under the router
   (BrowserRouter intercepts native hash behavior). Verify every anchor jumps.
4. Teach `ButtonLink` to render a router `<Link>`.
5. Extract the shell (MegaNav, rail, SupportBar, CompareRail, EmployerIntro, footer,
   `#main`) from `HomePage` up into `App`. `HomePage` still renders all sections. Verify
   SupportBar state survives a manual URL change.
6. **Split one page per commit.** Create the page, move its sections, add the route,
   rewrite only the links pointing into it. Build, deploy, verify. Repeat.
7. Rewrite remaining links; grep-sweep for any `href="#` that is not `#main`.
8. Add `React.lazy` per route. Verify Suspense plus hash-scroll timing.
9. Add per-route meta and the prerender step.
10. Delete `useHashRoute.ts`; update `OpsDashboard` back link.

**Rollback:** steps 1-2 leave a working single-page app on the router, so any page-split
commit can be reverted alone. The nuclear rollback restores `useHashRoute.ts` and the
`App.tsx` ternary.

## Known traps
- **Lazy plus hash timing.** The anchor target does not exist until the chunk resolves. Retry the scroll after Suspense commits.
- **Dual history writers.** `homeStore.writeUrl` uses `replaceState` alongside the router. Low risk (query-only, path-preserving). Verify `useLocation().search` is not stale after selecting a product.
- **`EmployerIntro` double-mount** would flash the cover. Mount once in `App`.
- **`--rail-h` phantom height** on routes without the product rail. Default it to `0`.
