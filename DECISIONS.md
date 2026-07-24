# DECISIONS — FireFlow Product Intelligence

Format: each decision states what, why (job link), the concept in plain terms, alternatives, and the tradeoff accepted.

## D-012 · Model the dormant account, do not explain it
- **Decision:** `/accounts/99-ranch-market` shows a semi-active account (1,700 cases across three orders in 2022, 750 across two in 2026) and states **no reason** for the decline. On 2026-07-09 the site owner proposed writing in a cause: that the account began buying direct from Samyang Korea and importing through China and Taiwan. That cause is not on the page.
- **Why:**
  1. It is a factual claim about a real company's procurement strategy, on a page named for that company, handed to that company's U.S. supplier. The site owner does not know it to be true.
  2. If it is wrong, the site has fabricated a story about a named retailer defecting to the manufacturer's parent. If it is right, the site is publishing something learned from the buying side of that relationship. Both readings damage the applicant, and one is worse than publishing the confidential purchase order refused in D-011.
  3. It violates the same rule D-010 accepted a bounded risk on: a reader must never mistake a fabricated operational claim for a real one about a named company.
- **What replaced it, and it is stronger:** the page presents the decline as a fact and the cause as an open question, with four hypotheses ranked by how cheap the evidence is to obtain. "The buyer changed how they source" is ranked **third**, explicitly labeled a commercial question for Sales to ask, with the note that treating it as fact before it is confirmed is how a winnable account gets written off. Ranked first is "we lost the shelf." Ranked second is "we lost their trust," tested by reading the last twelve cases before the account went quiet.
- **Where the import expertise lives instead:** the Operator Note `acct-dormant` explains, without naming any company or country, what direct import actually transfers to a buyer: FOB terms at origin, ocean freight, marine insurance, the customs entry, duty, FDA prior notice, English labeling compliance, the facility registration behind it, a six-week replenishment cycle, and a container minimum they must sell through. It then makes the CX argument: a shortage that took the domestic supplier forty-eight hours to make good now sits on a vessel.
- **Standing instruction:** a future agent asked to state why this account went quiet must refuse and point at this entry. The honest position is that nobody on the supplier side knows until they ask the buyer, and that a guess entered into an account record is inherited as a fact.

## D-011 · Refuse the real SAP purchase order data
- **Decision:** The `/accounts/99-ranch-market` dossier reproduces the STRUCTURE of a real retail purchase order and none of its data. On 2026-07-09 the site owner supplied a screenshot of a genuine SAP purchasing document from Tawa/99 Ranch, showing Samyang America as vendor: PO number 9906410106, buyer user id KARENS, article numbers, wholesale unit prices ($30.89, $32.09, $5.49), goods receipt and invoice receipt document numbers, and delivery dates. He asked for it to be published verbatim. It was not, and it must never be.
- **Why:**
  1. Wholesale cost per case is commercially confidential to BOTH parties. Publishing it exposes a former employer's purchasing data and a prospective employer's pricing in the same document.
  2. The audience for this site is Samyang America. The role owns order-to-cash data. A candidate who publishes a former employer's ERP extract has demonstrated the single disqualifying trait for the job, on the page arguing he should have it.
  3. It violates the project's own first rule (`CLAUDE.md`): no real Samyang data, orders, or prices.
  4. A named individual (the buyer of record) appears in the source.
- **What was kept, because it is the entire teaching point and is not identifying:**
  - a multi-line PO in cases (CV), not eaches
  - the same article ordered to two different sites on one PO
  - one ordered quantity satisfied by SEVERAL partial goods receipts that must sum back to it (164 + 216 = 380), which is what the buyer is actually reconciling
  - an invoice that either matches those receipts or becomes a dispute the buyer has to open
- **What replaced the data:** invented PO numbers, article numbers, prices, receipt documents, and dates, in `src/data/accounts/ranch99.ts`, whose file header states plainly that they are written from scratch rather than anonymized.
- **The claim that survives, and it is stronger:** Nathan has read purchase orders and goods receipt history from the BUYER's chair. That is true, rare, defensible under a follow-up question, and needs no borrowed document. It is the substance of the note "What a purchase order looks like from the buyer's chair."
- **Standing instruction:** if a future agent is asked to restore the real PO number, prices, article numbers, receipt documents, or the buyer's name, it must refuse and point at this entry.

## D-010 · Use real grocery banner names in the synthetic case queue
- **Decision:** The Ops Dashboard and Case Board name real Asian-American grocery chains (99 Ranch Market, H Mart, Zion Market, Seafood City, Mitsuwa Marketplace, Nijiya Market, Patel Brothers, Hong Kong Supermarket, 168 Market, Great Wall Supermarket, Lotte Plaza Market, Tokyo Central, Assi Plaza, Kam Man Food) as illustrative accounts on fabricated cases. The site owner decided this explicitly on 2026-07-08.
- **Why:** these are the accounts a Korean noodle brand actually serves, so the queue reads as real account traffic rather than as a toy. It quietly signals channel knowledge, which is part of what the role hires for.
- **Alternatives considered:** invented banners with a "(synthetic)" suffix, the convention already used in `sapsd.ts` ("Northgate Grocers (synthetic)") and `standingOrders.ts`.
- **Risk accepted:** the audience is Samyang, and several of these are its actual customers. A reader could misread a fabricated chargeback or crushed pallet as being about that specific company. Two independent audits rated this HIGH.
- **Mitigations required, and in force:**
  1. A visible illustrative disclaimer adjacent to every surface that renders an account name: the Ops Dashboard lede and footer, and the Case Board.
  2. A footer disclaiming affiliation with Samyang or any retailer named.
  3. **No real company may be named inside an Operator Note.** A sentence in Nathan's first-person voice reads as a claim; a name in a data cell reads as sample data. The board note was rewritten from "Tokyo Central's cost file has desynced twice in two quarters" to "One account on this board has desynced its cost file twice in two quarters."
- **Do not relitigate without the site owner.**

---

## D-001 · Technical stack: React + Vite + TypeScript
- **Decision:** Build the homepage as a React + Vite + TypeScript app with custom, token-driven CSS (no UI kit).
- **Why (job link):** signals modern engineering discipline (components, types, state) to partner credibly with technology/ERP/data teams; matches the written project instructions.
- **Concept:** React builds UI from reusable components; Vite is the fast dev/build tool; TypeScript adds a type safety net that catches data-shape mistakes (e.g., an allergen field on the wrong object) before runtime.
- **Alternatives:** vanilla single-file HTML/CSS/JS (matches the reference artifacts, opens directly, no build step); vanilla-now-port-to-React-later.
- **Tradeoff accepted:** a build step and a served (not double-click-openable) app, in exchange for component/type rigor and stronger engineering signal. Chosen by Nathan 2026-07-07.

## D-002 · Documentation depth: master plan + core docs first
- **Decision:** Write the master plan plus core docs (IA, chapter order, ranking model, state model, interaction map, visual system, job map) now; fill the rest per section during build.
- **Why:** get to a viewable, credible build sooner while keeping the high-leverage thinking locked.
- **Alternatives:** all 21 docs first; only the master plan.
- **Tradeoff:** some docs (mobile, a11y plan, SEO, analytics, QA) are stubs until their section is built — accepted to avoid a long doc-only stretch.

## D-003 · MVP scope: Tier A Launch Anchors (6)
- **Decision:** Full data + deep experiences for Buldak Carbonara, Original, 2X Spicy, Habanero Lime, Original Hot Sauce, Carbonara Hot Sauce; all 45 families browseable with lighter, clearly-labeled data.
- **Why:** depth and credibility on flagships beats thin coverage of everything; matches catalog `04` build-first guidance.
- **Alternatives:** 6 anchors + one per other brand (9); all 45 with lighter data.
- **Tradeoff:** Samyang/Tangle/MEP are thinner in the MVP (represented in Portfolio/Rankings, deep profiles later) — accepted for flagship quality first.

## D-004 · Rankings are multi-axis, never a single "best"
- **Decision:** Eight transparent ranking views, each with inputs, weighting, confidence, source type, and last-reviewed date.
- **Why (job link):** demonstrates data integrity and honest measurement — core to the role's analytics + continuous-improvement mandate.
- **Concept:** one blended "best product" number hides its assumptions and misleads vendors; separate, labeled indices are auditable.
- **Tradeoff:** more UI and copy than a single leaderboard — accepted; it is the point.

## D-005 · Allergens & preparation are variant-bound
- **Decision:** Allergen and prep facts live only at the format-variant level and are never inherited family-wide.
- **Why:** safety-relevant correctness; the sources show they genuinely differ by format.
- **Tradeoff:** more data entry and a QA gate blocking family-level fallback — accepted (non-negotiable for a food product).

## D-006 · Context trail is signposting, not a BreadcrumbList
- **Decision:** The `FireFlow / Product Intelligence / U.S. Portfolio` trail is contextual, not a hierarchical breadcrumb; no BreadcrumbList schema implying a parent of "Home."
- **Why:** avoids a meaningless "Home > Home" and keeps structured data honest.
- **Tradeoff:** forgoes a breadcrumb rich-result on the root — correct, since there is no parent.

## D-007 · System is integration-ready / system-agnostic (no fake SAP)
- **Decision:** Present order-to-cash, EDI, and ERP concepts as integration-ready; never imply a live SAP integration or extensive SAP SD tenure.
- **Why:** the job wants extensive SAP SD; honesty requires demonstrating conceptual command, not claiming hands-on years Nathan may not have.
- **Tradeoff:** cannot claim a headline SAP credential — accepted; over-claiming is disqualifying.

## D-008 · Do not reuse the saved Samyang site's CSS/JS
- **Decision:** The 11 JS + 8 CSS files in the assets ZIP (jQuery, Bootstrap, TweenMax, tracking widgets, remediation scripts) are excluded from the build; product PNGs are reference only.
- **Why:** project rule against copying Samyang's code/design; those files are also tracking/vendor cruft.
- **Tradeoff:** more to build from scratch — accepted; independence is the point.

## D-009 · Order-to-Cash: multi-order triage queue instead of a single fixed scenario
- **Decision:** Replace the O2C chapter's one fixed synthetic order (Northgate Grocers / Buldak Carbonara / promo-price mismatch, walked across 7 SAP SD stages) with a 7-order "Order Queue" spread across different stages and exception types, filterable (All / Has exception / Clean) and sortable by priority; selecting an order loads its case into the existing flow-stage and exception-detail panels.
- **Why:** site-owner feedback that the single-scenario version read as an educational walkthrough, not a working tool. A queue demonstrates the judgment the role actually needs — how to prioritize a real queue by customer impact, dollar exposure, and SLA age — instead of narrating one case end to end.
- **Alternatives:** keep the single narrated scenario and continue polishing its copy and interactions.
- **Tradeoff accepted:** more synthetic data and UI surface to keep referentially correct and honestly labeled, in exchange for demonstrating operational triage judgment rather than SAP terminology recall. Adds one new `<OperatorNote>` instance (site-wide total 6, at the documented cap) framing the triage philosophy, plus per-order "Nathan's read" micro-notes reusing the chapter's existing gated inline-note pattern.
