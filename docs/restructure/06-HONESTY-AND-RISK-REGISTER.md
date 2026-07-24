# 06 — Honesty and Risk Register

Findings from a four-agent audit of the current build. Ordered by severity. Anything
marked **BLOCKER** should be fixed before the site is shown to a recruiter.

---

## BLOCKER 1 — The docs claim a feature that does not exist

`CASE_STUDY.md` (lines 34-35) and `docs/homepage/04-TARGET-JOB-TO-HOMEPAGE-MAP.md`
(line 21) both state that the Command Center includes a **team workload / coaching
view**. It does not. `src/components/home/CommandCenter/CommandCenter.tsx` contains
no team roster, no workload, no coaching.

Why this matters: the entire portfolio is built on an honesty guarantee. A reviewer
who cross-checks the case study against the running site finds a claim that is not
true. That is worse than the missing feature.

Two ways to fix, pick one:
1. **Build it** (see `04-NEW-PAGES-JD-GAPS.md`, Proposal A, Team Operating Model),
   then the docs are correct.
2. **Correct the docs today**, and build it later.

Do not leave both as they are. Recommended: correct the docs now, build in Wave 3.

---

## BLOCKER 2 — People leadership is entirely absent

The JD's hardest screening line is "3+ years of leadership experience managing
supervisors, managers, or team leads" plus "lead, coach, and develop the Customer
Experience team." **Nothing in the build touches this.** Every artifact shows the
manager working the queue alone.

This is the single most disqualifying gap. It is addressed by Proposal A
(`/leadership#team`). It cannot be closed by polish anywhere else.

---

## HIGH — The role-critical proof is buried

In `HomePage.tsx` the sections that actually prove fitness for this job sit far down
the page: Command Center is section 13, Cross-Functional War Room 14, Product Signals
15, and `EmployerEvidence` (#fit, the role-to-feature map) sits near the very bottom,
after nineteen sections.

Everything above them is product discovery and buying. A hiring manager giving the
site four minutes may spend all four in shopping mode and never reach the operations
proof. The restructure in `01-SITE-ARCHITECTURE.md` fixes this by giving operations
its own routes and featuring them from the landing page.

---

## HIGH — "Track record" is unproven, and the real evidence is hidden

The JD asks for a "demonstrated track record of improving CSAT, service levels, fill
rates, and operational efficiency." Every metric on the site is a static synthetic
snapshot with no before or after.

Meanwhile the genuinely defensible, real, non-Samyang wins (reviews grown from roughly
10 to 700+ five-star; back-to-back seven-figure revenue years; billing and dispute SOPs
that stopped recurrence) are buried inside a collapsed `<details>` in
`src/components/employer/EmployerEvidence/EmployerEvidence.tsx`.

Fix: Proposal E in `04-NEW-PAGES-JD-GAPS.md`. Promote real results to a real section,
attributed to prior roles, explicitly not Samyang. Highest impact-to-effort item in
the whole plan.

---

## MEDIUM — Cost-to-serve uses invented precision

`buildScorecard` in `CommandCenter.tsx` computes exposure as
`openDeductions * 125_000 + lateCount * 85_000`, i.e. hard-coded constants of $1,250
per deduction and $850 per late order. It is labeled synthetic, but a sharp operations
reader will read false precision as unserious.

Fix: replace with a driver-based cost-to-serve model (Proposal C), where each driver
(expedites, deductions, returns, manual order entry, short ships) is named and its
assumption is visible and adjustable.

---

## MEDIUM — The scorecard is too clean

CSAT is hard-coded to exactly 4.5 against a 4.5 target and reads "On target." Every
metric sits at or above target. A real queue never looks like that, and a manager
knows it. Put at least one metric in a watch or below state. It is more credible, and
it sets up the improvement narrative the JD asks for.

---

## MEDIUM — Operator Note proliferation

`HANDOFF.md` (line 84) flags that notes drifted past the documented cap of six.
The count is now roughly ten. The cap exists for a reason: if Nathan interrupts on
every surface, the fourth wall stops being a device and becomes wallpaper.

The owner has asked for a note on **every section of every page** (a guided-tour
model). That is a deliberate change to the rule, and it is workable, but only with the
collapse mechanism specified in `05-OPERATOR-NOTES-RIDE-GUIDE.md`: every note is a
one-line teaser by default, and expands on demand. Update `CLAUDE.md` to record the
decision rather than silently breaking the old rule.

---

## MEDIUM — Real retailer banners inside fabricated disputes

The ops board names real chains (99 Ranch Market, H Mart, Zion Market, Seafood City,
Mitsuwa, Nijiya, Patel Brothers, Hong Kong Supermarket, 168 Market, Great Wall,
Lotte Plaza, Tokyo Central, Assi Plaza, Kam Man Food) attached to fabricated deductions,
chargebacks, and short shipments. There is an on-page disclaimer and a footer
disclaiming affiliation.

This is defensible (case studies name companies illustratively) and it makes the board
land. But the audience is Samyang itself, and some of these are its actual customers.
Make this a conscious decision, not a default. The alternative is fictional banners
(for example "Pacific Rim Market," "Golden Harvest Grocery"), which costs about two
minutes and removes the question entirely.

## MEDIUM — Product imagery

`KNOWN_LIMITATIONS.md` item 1 records that product images come from samyangamerica.com
without a license. Same audience problem. Decide consciously.

---

## LOW — Sound on an operations tool

`playSound` fires in `SapProcessIntelligence`, `CaseBoard`, `SupportBar`,
`CommandCenter`, and `OpsDashboard`. Sound is now on by default. A CX or operations
leader may read audio feedback on a case board as gimmicky. Keep it discreet, or
default it off on the operations routes specifically.

---

## LOW — Decorative sections dilute focus

`FiveColors` (obangsaek) and `BrandUniverse` are the most decorative relative to the
JD. The craft is good and the cultural note is genuine, but in a portfolio for an
order-management and leadership role they compete for attention with the proof.

Recommendation: keep both, move them to `/about` (or `/products` for BrandUniverse),
never on the landing page. Do not cut FiveColors; it is the one place brand fluency
shows, and it costs nothing once it is off the critical path.

---

## Standing guardrails (unchanged, restated)

- No SAP implementation, integration, or tenure claims. The SAP work is an
  "aligned workflow study."
- No real Samyang data, customers, orders, or metrics. All operational data synthetic
  and labeled.
- No fabricated employment history and no invented metrics attributed to real jobs.
- Writing: no arrows in visible copy, no em dashes as sentence separators, no
  underlined links, plain American English, CTAs name the action.
- Accessibility: never signal state by color alone; keyboard operable; visible focus;
  respect `prefers-reduced-motion`.
