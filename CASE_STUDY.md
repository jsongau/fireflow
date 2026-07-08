# FireFlow — Case Study

**Role this was built for:** Manager, Customer Experience — Samyang America.
**Premise:** rather than describe how I'd run a CX function, I built one — organized around Samyang's real public U.S. portfolio — so the judgment is visible in the artifact itself.

Every feature below maps to a responsibility in the job posting. Operational data is synthetic and labeled; nothing implies access to Samyang systems, sales, or SAP.

## Responsibility → where FireFlow demonstrates it

**Lead the CX function from order entry through fulfillment and issue resolution.**
The Two Paths inquiry launchers and the Resolution Simulator carry a case end to end: reported → verified → routed → resolution proposed → customer updated → resolved → improvement review. The Command Center preview shows the same cases as a manager's queue.

**Own the end-to-end order-to-cash process.**
Vendor scenarios are structured along O2C stages — purchase order, partial fill / backorder, delivery, invoice, pricing discrepancy, deduction / chargeback, EDI. Each names the stage and the cross-functional owners.

**Establish and govern escalation standards.**
Cases carry severity, required approvals (nothing commits money, credit, substitution, or a delivery date without sign-off), and specialist-escalation triggers for allergen / injury / foreign-material / tampering / regulatory matters — with an explicit "no diagnosis, no medical advice" rule.

**Accountability for service levels, fill rates, on-time fulfillment, and CSAT.**
The Command Center surfaces SLA exposure, overdue customer updates, open deductions, and product concerns as drill-down tiles — every value labeled synthetic, every tile opening the underlying cases.

**Lead resolution of complex issues, deductions, and disputes; drive corrective action.**
The deduction / chargeback scenario reconciles proof-of-delivery against the claim, decides accept-vs-dispute with approval, and feeds a deduction-by-reason-code signal so the pattern gets fixed, not just cleared.

**Drive continuous improvement; analyze customer trends.**
The Product Signals section turns repeated inquiries into a loop: pattern → root cause → action → measurement, with affected products and confidence.

**Serve as the primary operational liaison; proactive communication.**
The selected-product rail and the "next customer update" field make context and the next promised update first-class — the customer never repeats themselves, and the update commitment is always visible.

**Partner with Supply Chain, Sales, Logistics, Finance, Quality.**
Each case names its collaborating teams; the vendor path routes to the right function per issue type.

**Lead, coach, and develop the CX team.**
The Command Center includes a team workload / coaching view (synthetic, labeled).

**Oversee SAP / ERP process compliance and data integrity.**
This is framed honestly: FireFlow demonstrates *conceptual command* of order entry, pricing, delivery, billing, customer master, order status, and EDI, and rigorous source/confidence labeling as a data-integrity habit — it is **integration-ready / system-agnostic** and does **not** claim extensive hands-on SAP SD tenure. The **SAP SD Process Intelligence** chapter makes this concrete: one synthetic B2B order walked through the full order-to-cash document flow (PO → sales order → delivery → goods issue → invoice → deduction → credit memo → prevention), a 23-term SAP SD glossary in plain language, and 11 order exceptions worked end to end — with a stated disclosure that it is a process demonstration, not an SAP replica or a claim of system access.

## Product and measurement judgment

- **45 families / 76 formats** normalized so a shopper browses flavors, not repetition; allergens and preparation are bound to the exact format, never inherited.
- **Multi-axis rankings** (Portfolio Priority, First-Time Fit, Customer Guidance Opportunity, Vendor Opportunity, Support Complexity, Format Versatility, Retail Visibility, Evidence Confidence) instead of one misleading "best" score — each showing inputs, source type, confidence, and last-reviewed date. Retail review counts are labeled engagement snapshots, never sales.
- **Spiciness** as an official-style five-level scale (aligned to Buldak's public scale, labeled editorial pending confirmation), because a large share of first-time consumer questions are really about heat.

## Craft signals

React + Vite + TypeScript with a typed data model and shared state; accessibility-first (keyboard, reduced motion, status as icon/word never color alone); an honest, non-AI editorial voice; and a design system built for a fast-moving Gen-Z food brand while staying credible as an operations tool.

## What it is not

Not affiliated with Samyang. Not a place to submit a real complaint or place a real order. Not a claim of real metrics, systems, or SAP experience. It is a demonstration of how I think about Customer Experience — made concrete.
