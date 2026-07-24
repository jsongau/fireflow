# Recommendation 01 — Service-Level Targets (put a clock on every case)

## Why this exists (role fit)
The JD makes the Manager, Customer Experience "accountable for service levels, fill
rates, on-time fulfillment, and CSAT" and asks them to "establish, implement, and
govern customer service, order management, and escalation standards." Right now the
FireFlow intake routes a case to an owner and a metric, but it never commits to a
response or resolution target. Attaching a service-level clock to each case is the
single clearest way to show a hiring manager that Nathan governs to a standard, not
just triages tickets.

## What to build
1. A **priority → target** table baked into the intake taxonomy, so every case shows an
   acknowledgement target and a resolution target in the routing summary and the
   confirmation.
2. A short **KPI glossary** (Service Level, Fill Rate, OTIF, CSAT, FCR, Deduction Aging,
   Billing Accuracy, Data Integrity) that the routing summary's "Service metric
   affected" can link or hover to, so the metric is defined, not just named.
3. Optional: a tiny **"measured by"** line under the metric on the summary card.

## Researched facts to use (all industry-general, label synthetic)
Priority tiers and typical B2B response/resolution targets:

| Priority | Acknowledge | Resolve (target) |
|---|---|---|
| Standard | 1 business day | 2 business days |
| Elevated | 4 business hours | 1 business day |
| High | 1 business hour | Same business day |
| Critical | 30 minutes | 4 hours |

Design rule from the research: set targets you can hit ~90%+ of the time, and always
state whether "hours" means business hours or 24/7. FireFlow should label these as a
**synthetic service-level design**, not Samyang's actual SLAs.

KPI definitions (for the glossary and tooltips):
- **Service Level** — probability that stock is available during an order cycle (a
  forward-looking planning target, commonly 95%+). Distinct from fill rate.
- **Fill Rate** — realized performance: cases (or lines) shipped complete on the first
  order divided by cases ordered. CPG average ~95%, leaders 98%+.
- **OTIF (On-Time In-Full)** — delivered complete, to the right place, inside the
  delivery window. Walmart is the canonical example (~95% in-full expectation; ~3% of
  cost-of-goods penalty on non-compliant cases). Thresholds vary by retailer.
- **CSAT** — post-interaction satisfaction, (positive / total) × 100. Good 75–84%,
  world-class 85%+.
- **First-Contact Resolution** — % resolved on first contact, benchmark ~70%.
- **Deduction Aging / Days Deductions Outstanding (DDO)** — open deductions / average
  daily deductions; lower is better, common target under ~20 days.
- **Billing Accuracy / first-pass invoice match** — leading indicator that prevents
  deductions.

## How it weaves into the build
- **Model enhancement (primary):** add `ackTarget` and `resolveTarget` to the priority
  ladder in `src/components/home/SupportBar/intake.ts`. Render two new rows on the
  Step 4 routing summary and the Step 5 confirmation ("Acknowledged within…",
  "Resolution target…"). No new page required.
- **Glossary reuse:** the KPI definitions become entries in the shared glossary from
  Recommendation 05's hover system (the same `<GlossaryTerm>` primitive, different
  dictionary), so "Service metric affected: Fill Rate" is hoverable.
- **Command Center tie-in (optional):** the existing Command Center chapter can show the
  same targets as column headers, so the intake promise and the dashboard agree.

## Honesty guardrails
- Label the whole ladder "synthetic service-level design" wherever it appears.
- Do not attribute any target to Samyang. Frame as "how I would set targets," which is
  exactly the governance the JD asks for.
- Keep the Walmart/retailer numbers as illustrative benchmarks, never as Samyang data.

## Acceptance criteria
- Every category, at every priority, shows an acknowledge + resolve target on summary
  and confirmation.
- Targets change correctly when the urgency override changes the priority.
- Copy passes the style sweep (no arrows, no em-dash separators, no underlined links).
- `tsc -b` stays green.

## Sources
- Emailmeter, SLA response benchmarks: https://www.emailmeter.com/blog/understanding-industry-standard-sla-response-times
- Plain, B2B SaaS SLAs: https://www.plain.com/blog/customer-support-slas-b2b-saas-2026
- Netstock, fill rate vs service level: https://www.netstock.com/blog/analyzing-the-relationship-between-fill-rate-and-service-level/
- GAINS, service level vs fill rate: https://gainsystems.com/blog/service-level-vs-fill-rate-key-differences-in-supply-chains/
- Profit.co, Fill Rate KPI: https://www.profit.co/blog/kpis-library/supply-chain/fill-rate/
- Orderful, Walmart OTIF: https://www.orderful.com/blog/walmart-otif
- SQM Group, service metrics: https://www.sqmgroup.com/resources/library/blog/7-essential-customer-service-metrics-and-how-you-measure-them
- Geckoboard, average resolution time: https://www.geckoboard.com/best-practice/kpi-examples/average-resolution-time/
