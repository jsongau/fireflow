# Nathan's Notes: Website Voice Companion

Companion to `03-OPERATOR-NOTES-VOICE.md`. That file governs the voice. This file governs where the notes go on the site and what each one must earn.

Read both before writing or editing any note.

## What a note is

A short piece of fourth-wall commentary that explains the operating judgment behind something visible on screen.

Notes are not decorative. They are the argument.

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

## What the customer's inquiry reveals

- Where the account is confused, and whether that is their fault or ours.
- Where an SOP is missing.
- Where a handoff has no owner.
- Where product, billing, delivery, or master data keeps producing the same failure.
- Where leadership has no visibility.

## Skills a note may demonstrate

Pick one or two per note. Never all of them.

SOP design. Inquiry triage. Escalation logic. Named internal ownership. Team coaching. Follow-up standards. Cross-functional coordination. Repeat-issue detection. Root cause analysis. Leadership visibility. Cost-to-serve judgment. Operational accountability.

## Placement map

Notes appear where a design decision needs a reason.

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

One note per location. Never two notes visible at once.

## The four gates, restated

A note ships only if it contains:

1. **The customer's cost.** Specific. A person, a consequence.
2. **The operational cause.** Upstream of the symptom.
3. **The owner and the next action.** A name and a date.
4. **Nathan's judgment.** A decision, a refusal, or the first thing he checks.

## The concierge line

The burden of coordination sits on our side of the line.

The account says it once. The account does not chase. The account does not learn the org chart. The account hears from us before the date slips, not after. The account gets a name, not a queue.

Write notes that show this being engineered, not announced.

## Lines that pass

> The account should not have to know our org chart. The system captures the facts once, routes the work, and keeps one voice on the account.

> A hold is not a failure. An invisible hold is. A buyer who knows can still protect their shelf.

> Structured intake is not there to make the team faster. It is there so the customer explains the problem once, to one person, and is understood.

> Closing the case restores one customer. Reviewing the pattern protects the next hundred.

> Bad news arrives early and specific. A customer can plan around a known delay. Nobody can plan around silence.

> The acknowledgment is where the account learns whether this case is being managed or filed.

> A repeated question is not a customer problem. It is a training gap, a policy gap, or a data problem wearing a customer's voice.

> An SOP that a person cannot follow at four o'clock on a Friday is not an SOP. It is a compliance artifact.

> Ownership without a date is not ownership.

> Every case has a person on the other end who has already explained this once.

## Lines that fail

> We are committed to delighting every customer.

> This AI-powered journey creates a seamless support experience.

> I love helping people and I am passionate about service.

> This innovative widget streamlines engagement.

> Look at how thoroughly I built this.

## Tone rules

Do:

- Lead with the operational truth, flat and unhedged.
- Put the reader in the customer's chair for exactly one sentence.
- Use the buying-side memory when it explains a decision. Once per note at most.
- Name the owner. Name the date.
- Keep it to two to four sentences.

Do not:

- Announce empathy. Demonstrate it through specificity.
- Say "AI powered" unless the feature uses AI.
- Write like a SaaS landing page.
- Claim SAP implementation, configuration, or tenure. Reading SAP SD and owning the process around it is the honest claim.
- Reference real Samyang customers, orders, or metrics. All operational data is synthetic and labeled.
- Use arrows in visible copy. Do not use an em dash as a sentence separator.

## Implementation direction

1. Notes render through the existing `OperatorNote` and `OperatorNotePanel` components. Do not invent a new note surface.
2. Notes are always on. There is no toggle and no per-section popup.
3. No cap on the number of notes. One note per section, collapsed to a teaser by default. The test is per note: it explains a decision visible on screen, or it does not ship.
4. A note must look like builder commentary, never like a system status or a real Samyang annotation.
5. State is never signaled by color alone.
6. Every note connects a visible feature to a real customer operations principle and to a person on the other end of it.

## The idea to preserve

This is not a support widget. It is the first layer of a customer experience operating system, designed by someone who has been on both ends of it.
