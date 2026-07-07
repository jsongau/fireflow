# DECISIONS — FireFlow Product Intelligence

Format: each decision states what, why (job link), the concept in plain terms, alternatives, and the tradeoff accepted.

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
