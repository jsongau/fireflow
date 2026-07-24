# Placement Map and Line Banks

Companion to `SKILL.md`. That file governs the voice. This one governs where a note goes and what it must earn.

## The reaction to design for

A hiring manager reading three notes should think:

> This person has run the function. He knows what the customer feels, what breaks upstream, and who owns the fix. He is not describing customer service. He is describing customer operations.

Not:

> He seems enthusiastic about customer service.

## The positioning idea underneath every note

Customer experience is the front layer of the company's operating system, and the customer is a person with their own boss, their own shelf, and their own quarter.

Every inquiry is two things at once:

- A moment where one person's confidence in the company is protected or lost.
- A signal about where the operation is confusing, slow, or wrong.

A note that only handles the first is sentimental. A note that only handles the second is cold. The good notes hold both.

## Skills a note may demonstrate

Pick one or two per note. Never all of them.

SOP design. Inquiry triage. Escalation logic. Named internal ownership. Team coaching. Follow-up standards. Cross-functional coordination. Repeat-issue detection. Root cause analysis. Leadership visibility. Cost-to-serve judgment. Operational accountability.

## Placement map

Notes appear where a design decision needs a reason. One note per location. Never two notes visible at once.

| Location | What the note must earn |
| --- | --- |
| Before the support flow begins | Why intake is structured at all, in the customer's interest |
| Inquiry type selection | Why one SOP cannot serve six issue types |
| Detail collection | Why we ask for this much and not more |
| Confirmation | Why the acknowledgment names an owner and a date |
| Escalation language | When a case leaves the first layer and who then owns it |
| Reporting or dashboard views | How individual cases become a pattern leadership can act on |
| SOP or training sections | Why a document nobody uses under pressure is not an SOP |
| Order-to-cash and master data views | How a data field becomes a customer's chargeback |

## Approved lines

> The account should not have to know our org chart. The system captures the facts once, routes the work, and keeps one voice on the account.

> A hold is not a failure. An invisible hold is. A buyer who knows can still protect their shelf.

> Structured intake is not there to make the team faster. It is there so the customer explains the problem once, to one person, and is understood.

> Closing the case restores one customer. Reviewing the pattern protects the next hundred.

> Bad news arrives early and specific. A customer can plan around a known delay. Nobody can plan around silence.

> The acknowledgment is where the account learns whether this case is being managed or merely filed.

> A repeated question is not a customer problem. It is a training gap, a policy gap, or a data problem wearing a customer's voice.

> An SOP that a person cannot follow at four o'clock on a Friday is not an SOP. It is a compliance artifact.

> Ownership without a date is not ownership.

> Every case has a person on the other end who has already explained this once.

> Chasing a vendor is unpaid work for a customer who has already lost something.

> Assembling proof of something the vendor already had on file is why accounts stop calling and start deducting.

> An order can be entered correctly and still be operationally at risk.

> I have not configured SAP. I can read it, and reading it is the job.

## Failing lines

> We are committed to delighting every customer.

> This AI-powered journey creates a seamless support experience.

> I love helping people and I am passionate about service.

> This innovative widget streamlines engagement.

> Click here to learn more about this section.

> Look at how thoroughly I built this.

> This proves I am the perfect candidate.

> We understand that delays are frustrating for our customers.

## Before and after

**Before.** A queue is only useful if it shows risk. I designed this view around ownership, severity, service timing, and the next promised update, because those are the things that prevent silent drift.

*Misses gate 1 (no customer, no cost) and gate 4 (no personal judgment).*

**After.** A queue sorted by arrival tells you what is new. It does not tell you which account is about to be surprised. I built this view around ownership, severity, service timing, and the date of the next promised update, because a case with no owner and no date never looks urgent to the team. It only looks urgent to the buyer waiting on it. Ownership without a date is not ownership. That is the first thing I check on any board I inherit.

---

**Before.** A retailer or distributor should not have to know whether their issue belongs to Order Management, Supply Chain, Logistics, or Finance. The system should capture the facts, route the work, and keep the account updated.

*Correct, but bloodless. No person in it.*

**After.** A retailer or distributor should not have to know whether their issue belongs to Order Management, Supply Chain, Logistics, or Finance. I have been transferred four times to explain the same thing, and by the fourth call I was not frustrated with the problem anymore. I was frustrated with the company. The system captures the facts once, routes the work, and keeps the account updated. The routing is our burden to carry, not theirs to figure out.

## Implementation direction

1. Notes render through the existing `OperatorNote` and `OperatorNotePanel` components. Do not invent a new note surface.
2. Notes are always on. There is no `operatorNotesEnabled` flag and no nav toggle.
3. No cap on the number of notes. The old six-note limit existed to stop notes becoming wallpaper; collapsing every note to a teaser by default achieves that instead. The test is per note, not per site: it explains a decision visible on screen, or it does not ship. A note that only narrates what the section already shows is the failure the cap was guarding against, and deleting it is still the right call.
4. State is never signaled by color alone.
5. Every note connects a visible feature to a real customer operations principle and to a person on the other end of it.

## The idea to preserve

This is not a support widget. It is the first layer of a customer experience operating system, designed by someone who has been on both ends of it.
