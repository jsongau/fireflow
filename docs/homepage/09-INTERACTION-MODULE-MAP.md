# 09 — Interaction Module Map

**Prepared:** 2026-07-07 · **Status:** Core doc, complete

One meaningful interaction per chapter. Every interaction must help select, explain, reveal, compare, gather, route, resolve, or measure — never decorate. For each module: purpose · user action · state written/read · data · animation · keyboard · reduced-motion · empty · error · mobile · analytics event · job skill.

Notation: **W** = writes state slice, **R** = reads.

---

### M1 · Product Signal Hero
- **Purpose:** hook + seed product context. **Action:** cycle brand / category / format / experience; pick a product; toggle Consumer/Vendor; choose Explore / Compare / Ask-consumer / Ask-vendor.
- **State:** W selectedFamily/Variant/Brand, userMode; R returningUser.
- **Data:** flagship subset (6 anchors + a few recognizable families), brand accents.
- **Animation:** focus transition as selection changes (transform/opacity only). **Reduced motion:** cross-fade → instant swap.
- **Keyboard:** selector is a listbox/radiogroup (arrow keys, Enter); all four actions are buttons in tab order.
- **Empty:** first-visit prompt state. **Error:** if a product image fails, show a labeled package silhouette + name.
- **Mobile:** selector becomes a horizontally-scrollable segmented control; product image scales; actions stack full-width.
- **Analytics:** `hero_product_selected`, `hero_mode_toggled`, `hero_action_clicked`. **Job skill:** product knowledge; customer-first framing. **Not a passive carousel** — selection changes the rest of the page.

### M2 · Chapter Nav (scroll-spy)
- **Purpose:** orientation through a long page. **Action:** click chapter / scroll. **State:** R selection (chip), userMode (indicator).
- **Animation:** active-underline slide. **Reduced motion:** instant active state.
- **Keyboard:** roving tabindex list; Enter scrolls + moves focus to section H2. **Mobile:** condensed scrollable strip + current-chapter label.
- **Analytics:** `chapter_viewed`. **Job skill:** operational navigability.

### M3 · Selected Product Rail
- **Purpose:** persistent context; never re-enter. **Action:** view selection, consumer/vendor action, reset. **State:** R product/mode/compare; W (reset), savedProductIds.
- **Empty:** "No product selected — pick one from the portfolio." **Mobile:** collapses to a bottom bar (product · chapter · compare count · inquiry) expandable to a drawer.
- **Analytics:** `rail_action_clicked`, `product_saved`. **Job skill:** continuity; proactive service.

### M4 · Portfolio Pulse
- **Purpose:** teach the 45-family / 76-variant portfolio and family→format normalization. **Action:** click brand → mix updates; click category → filters; toggle **family view ↔ format view**; focus a family to preview.
- **State:** W selectedBrand; R families. **Data:** all 45 families + counts.
- **Animation:** count/mix reflow. **Reduced motion:** no reflow tween. **Keyboard:** brand + category chips are buttons; grid is a list with arrow navigation.
- **Empty:** filter with no matches → "No families match — clear filters." **Mobile:** brand chips scroll; grid one-column.
- **Analytics:** `portfolio_brand_selected`, `portfolio_view_toggled`, `portfolio_category_filtered`. **Job skill:** portfolio organization; taxonomy. **No decorative numbers** — every count is real.

### M5 · Rankings Lab
- **Purpose:** transparent multi-axis ranking. **Action:** switch ranking view (tabs); sort; filter; open product; add to compare; expand "How this is calculated."
- **State:** W rankingMode, compareIds, selection; R families/rankings.
- **Animation:** bar-grow on sort; panel expand. **Reduced motion:** bars appear at final width; panel toggles instantly.
- **Keyboard:** tablist (arrows/Home/End); sortable columns with `aria-sort`; sort changes announced via live region.
- **Empty:** view excluding products (e.g., First-Time Fit with unknown heat) explains the exclusion. **Error:** missing input struck-through + tooltip; confidence badge drops.
- **Mobile:** tabs scroll; table → ranked cards with score bars. **Analytics:** `ranking_view_changed`, `ranking_sorted`, `ranking_filter_applied`, `ranking_methodology_opened`. **Job skill:** data integrity; measurement.

### M6 · Flavor & Format Explorer *(Wave 2)*
- **Purpose:** guided discovery. **Action:** read scatter (Approachable↔Adventurous × Simple↔Layered); switch axis mode; filter; select a point → drawer; add to compare. Always paired with a **table fallback**.
- **State:** W flavorMapMode, selection, compareIds. **Animation:** point settle. **Reduced motion:** static positions.
- **Keyboard:** points are a keyboard-navigable list mirroring the table; Enter opens drawer. **Empty/Error:** table always available even if canvas/SVG fails.
- **Mobile:** defaults to the table/list view; scatter optional. **Analytics:** `flavor_mode_changed`, `flavor_point_selected`. **Job skill:** customer guidance. **No invented scientific precision** — axes are editorial, labeled.

### M7 · Comparison Lab
- **Purpose:** decision support. **Action:** add/remove (max 4); change each product's format; hide matching rows; highlight differences; share; launch inquiry per column.
- **State:** R/W compareIds; R product facts; W selection/mode on inquiry.
- **Keyboard:** semantic table; tray items removable via button; toggles are switches. **Empty:** "Add two products to compare" with preset chips. **Error:** unknown compare id ignored.
- **Mobile:** stacked per-product accordion + difference toggle. **Analytics:** `compare_opened`, `compare_product_added`, `compare_diff_toggled`, `compare_shared`. **Job skill:** product knowledge; guidance. **Allergens/prep bound to the chosen format.**

### M8 · Product Dossier
- **Purpose:** deep single-product truth. **Action:** switch format → facts update; expand anatomy/allergens; open consumer/vendor questions; save; launch inquiry.
- **State:** R selectedFamily; W selectedVariant, savedProductIds, mode/selection on inquiry.
- **Data:** full anchor data (brand, category, flavor story, heat positioning, soup/stir-fry, prep, component anatomy, storage, official allergens, related formats/products, common consumer + vendor questions, source, last-verified, confidence).
- **Animation:** format-swap fact update. **Reduced motion:** instant. **Keyboard:** format selector radiogroup; disclosures are `<button>`+`aria-expanded`.
- **Empty:** non-anchor family → shows available fields, marks the rest "editorial / not yet verified" or "requires approved sell sheet." **Error:** missing image → labeled silhouette.
- **Mobile:** single column; sticky format selector. **Analytics:** `dossier_format_switched`, `dossier_section_expanded`, `dossier_inquiry_started`. **Job skill:** product mastery; data honesty. **Format-bound facts enforced.**

### M9 · Two Paths — Consumer & Vendor
- **Purpose:** turn a product into a routed inquiry. **Action:** pick path; pick issue (adapts to product category/format); proceed through Identify → Verify → Evidence → Route → Resolve → Update preview.
- **State:** R product/mode; W mode, selectedScenarioId (handoff to simulator).
- **Data:** consumer + vendor issue taxonomies (catalog `11`,`12`), pre-filled with selected product/format.
- **Keyboard:** issue list is a radiogroup; steps are a labeled progress structure. **Empty:** no product yet → prompts selection first. **Error:** validation summarized at top, focus moved to it.
- **Mobile:** vertical stepper. **Analytics:** `path_opened_consumer`, `path_opened_vendor`, `inquiry_issue_selected`. **Job skill:** consumer care + retailer/distributor support. Serious issues (allergen/injury/foreign material/tampering) show the specialist-escalation notice; **no medical advice**.

### M10 · Resolution Simulator
- **Purpose:** show governed case handling. **Action:** pick a scenario (consumer/vendor cards); advance the timeline; inspect each stage's verified facts, evidence, severity, owner, collaborators, update commitment, resolution options, approvals, root cause, corrective action.
- **State:** W selectedScenarioId (→ Command). **Data:** representative scenarios (missing Carbonara sauce, crushed chips, leaking bottle, allergen question, tastes-different; partial Carbonara order, delivery delay, pricing mismatch, deduction, EDI failure, damaged cases).
- **Timeline:** Reported → Verified → Routed → Resolution proposed → Customer updated → Resolved → Improvement review.
- **Animation:** stage advance (progress fill). **Reduced motion:** step jumps. **Keyboard:** scenario cards are buttons; timeline is a labeled list; Prev/Next controls. **Empty/Error:** default scenario preselected.
- **Mobile:** vertical timeline. **Analytics:** `simulator_scenario_selected`, `simulator_stage_viewed`, `simulator_completed`. **Job skill:** escalation, complex resolution, deductions/disputes. Interactive, **not a static diagram**.

### M11 · Command Center preview *(Wave 2)*
- **Purpose:** manager operating picture. **Action:** drill any metric → cases → case → owner/next action/source. **State:** R simulator output. **Data:** synthetic, labeled.
- **Every metric drills down**; no dead KPI cards. **Analytics:** `command_metric_drilled`. **Job skill:** order management; SLA; leadership. All values badged **Synthetic**.

### M12 · Product Signals *(Wave 2)*
- **Purpose:** cases → improvement. **Action:** select a signal → evidence, affected products, impact, proposed action, owner, measurement, confidence. **State:** W selectedSignalId; R patterns.
- **Flow:** repeated inquiry → pattern → root cause → content/process update → outcome measured. **Analytics:** `signal_opened`. **Job skill:** continuous improvement.

### M13 · Brand Universe *(Wave 3)*
- **Purpose:** portfolio texture. Four **differentiated** brand panels (not four identical cards) — Buldak (breadth), Samyang (heritage), Tangle (protein pasta), MEP (soup). **Analytics:** `brand_explored`. **Job skill:** portfolio breadth.

### M14 · Methodology & Trust
- **Purpose:** how we know / what we don't. Disclosure of normalization, ranking construction, source separation, synthetic labeling, unknowns, last-reviewed. Part of the experience, not hidden legal text. **Analytics:** `methodology_viewed`, `source_opened`. **Job skill:** data integrity; governance.

### M15 · FAQ
- Accessible `<details>/<summary>`; the 10 brief questions. **Analytics:** `faq_opened`. **Job skill:** clarity/honesty.

---

## Cross-cutting interaction standards
Loading → skeleton; empty → guidance; success → confirmation; error → recoverable with a summary. No important information exists only on hover or only in color. Full keyboard path through every module. `prefers-reduced-motion` honored globally (motion tokens collapse to instant). Touch targets ≥ 44px. One dominant interaction per chapter; immersive and calm chapters alternate.
