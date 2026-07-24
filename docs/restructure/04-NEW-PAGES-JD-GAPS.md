# 04 — New Pages: closing the JD gaps

A four-agent audit rated every JD line against the running build. The verdict, in short:
FireFlow proves **process command** and is silent on **people leadership** and
**track record**. Those two are the JD's screening filters.

---

## Coverage summary

**PROVEN:** leading the CX function end to end, order-to-cash ownership, complex issue
and deduction resolution, proactive customer communication, cross-functional
coordination, continuous-improvement method, analytical judgment.

**PARTIALLY PROVEN:** strategy and service standards (enacted implicitly, never stated),
KPI monitoring (a static snapshot, no trend), cost-to-serve (one arbitrary number),
SAP SD (conceptual command, correctly hedged), EDI (modeled, but SPS Commerce never
named), operational trend analysis.

**NOT PROVEN:** 3+ years managing supervisors, managers, or team leads. Leading, coaching,
and developing a team. A track record of improving CSAT, service levels, or fill rates.

Full matrix and file citations live in the audit; the register of what to fix is in
`06-HONESTY-AND-RISK-REGISTER.md`.

---

## The five proposals

All are synthetic and labeled. None fabricates employment history, none claims SAP
implementation experience, and none invents a metric attributed to a real job.

### Proposal E — Track record: results I have moved
**Route:** `/leadership#results` · **Impact 4 · Effort 1 · Highest ratio**

The real, defensible, non-Samyang wins already exist in the codebase, buried inside a
collapsed `<details>` in `src/components/employer/EmployerEvidence/EmployerEvidence.tsx`:
reviews grown from roughly 10 to 700+ five-star, back-to-back seven-figure revenue years,
billing and dispute SOPs that stopped recurrence.

Promote them into a real section, attributed to prior roles, explicitly not Samyang.
Answers "demonstrated track record of improving CSAT and operational efficiency."

Credible because these are real numbers from real prior roles. It fabricates nothing.
It is also the cheapest item in the plan and it fixes the weakest claim on the site.

### Proposal B — Service standards and SOP playbook
**Route:** `/leadership#standards` · **Impact 5 · Effort 2**

Consolidate the standards currently scattered across the build into one governed
artifact: the SLA matrix by priority, the escalation ladder and approval authority
(who may commit a credit, a substitution, a delivery date), the order-entry SOP, the
deduction-dispute SOP, the proactive-communication cadence standard, and the master-data
governance rules.

Answers "establish, implement, and govern customer service, order management, and
escalation standards and procedures" and "develop and execute the strategy."

Credible because a standards playbook is literally the artifact this role produces. Most
of the raw material already exists in `SupportBar/intake.ts` and `data/caseBoard.ts`.

### Proposal A — Team operating model and coaching board
**Route:** `/leadership#team` · **Impact 5 · Effort 3 · Build regardless of ratio**

A synthetic CX team: one team lead plus four or five reps, each with a specialty
(deductions, EDI, consumer, key accounts), current queue load, a coaching focus, a
development goal, and a 1:1 cadence. Plus a workload-balancing view, a QA rubric, an
escalation-authority matrix, and an Operator Note on how Nathan builds accountability.

Answers "3+ years managing supervisors, managers, or team leads" and "lead, coach, and
develop the Customer Experience team."

Credible because it is a *how I would run the team* operating model, explicitly synthetic,
the same genre as the existing Cross-Functional War Room. It claims no specific real team.

**This must be built even though its impact-to-effort ratio is mid.** People leadership is
the single most disqualifying gap and nothing else on the site touches it. It also
retroactively makes `CASE_STUDY.md` honest (see the register, BLOCKER 1).

### Proposal C — KPI trend and cost-to-serve scoreboard
**Route:** `/intelligence#command` (expand) or `#trends` · **Impact 5 · Effort 3**

Synthetic six-to-twelve-month trend lines for fill rate, OTIF, CSAT, and deductions, each
annotated with a "what changed" marker tied to a corrective action from `ProductSignals`.
A before-and-after story. Plus a real cost-to-serve breakdown by driver (expedites,
deductions, returns, manual order entry, short ships), replacing the arbitrary constants
in `CommandCenter.buildScorecard`.

Answers "analyze operational performance and customer trends," "drive continuous
improvement," "cost-to-serve," and it upgrades the weakest quantitative claim on the site.

Credible because it is framed as *how I read a trend and tie it to an action*, clearly
synthetic. It demonstrates the method of improving a metric without claiming it happened
at Samyang.

### Proposal D — First 90 days
**Route:** `/leadership#plan` · **Impact 4 · Effort 2**

A 30/60/90: weeks 1-4 assess (queue health, SLA baseline, deduction backlog, team skills),
weeks 5-8 stand up standards, weeks 9-13 launch continuous improvement.

Answers "develop and execute strategy" and signals leadership readiness. Credible because
a 30/60/90 is a classic, honest interview artifact. It is a plan, not a claim.

---

## Ranked

| Rank | Proposal | Impact | Effort | Ratio |
|---|---|---|---|---|
| 1 | E — Track record | 4 | 1 | 4.0 |
| 2 | B — Standards and SOP | 5 | 2 | 2.5 |
| 3 | D — First 90 days | 4 | 2 | 2.0 |
| 4 | A — Team and coaching | 5 | 3 | 1.67 |
| 5 | C — KPI trend and cost-to-serve | 5 | 3 | 1.67 |

**Build order: E, B, A, then C.** D is a strong runner-up and pairs naturally with B if
effort allows. E and B are cheap and high value. A is mandatory despite its ratio. C is
chosen over D because it closes three gaps at once.

E, B, D, and A all live on one new `/leadership` page with a SubNav, which is why the
mega nav gains a **Leadership** group. That page, on its own, converts the site's biggest
weakness into its most direct answer to the posting.

---

## What C changes in existing code

`CommandCenter.buildScorecard` currently computes exposure as
`openDeductions * 125_000 + lateCount * 85_000`. Replace with a named driver model where
every assumption is visible on screen and adjustable, and set at least one metric to a
"watch" or "below target" state. A scorecard where everything sits at or above target
reads as invented.
