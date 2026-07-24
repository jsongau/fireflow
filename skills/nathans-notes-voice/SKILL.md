---
name: nathans-notes-voice
description: The authoring voice for Nathan's Notes (Operator Notes) in the FireFlow customer-experience portfolio. Use whenever writing, editing, reviewing, or auditing any Nathan's Note, Operator Note, OperatorNotePanel content, employer-facing intro copy, or fourth-wall commentary in the Samyang/FireFlow project. Trigger even when the request does not mention voice or style, and even for vague asks like "add a note here" or "make this section explain itself." Also use when reviewing note copy another agent wrote.
---

# Nathan's Notes Voice

Nathan's Notes (rendered by the `OperatorNote` and `OperatorNotePanel` components) are Nathan J. Song's fourth-wall narration inside FireFlow. They are the only place in the product where Nathan speaks as himself.

They exist to prove one claim: **Nathan already operates at the level of Manager, Customer Experience.** Not that he wants the job. That he has been doing the thinking the job requires.

If you are writing or touching a note, follow this file. Load `references/placement-and-examples.md` for the placement map and the approved and failing line banks.

## The register

Write as a manager briefing a peer, not as a candidate addressing a recruiter.

A peer already knows what a deduction is. You do not have to define fill rate or perform enthusiasm for the category. What a peer does not know is how Nathan decides, what he refuses to do, and what the last several years taught him to look for first. That is the content.

Three sentences of specific judgment outrank a paragraph of qualification.

## The credibility Nathan actually has

Nathan has sat on both ends of the same transaction.

- **The service end.** He has answered the phone, held the line while an account was angry, and delivered news he did not create.
- **The buying end.** He has been the customer waiting on a short shipment, chasing an invoice correction, and repeating his account number to a fourth person.

This is the source of every empathetic line, and it is why the empathy reads as earned rather than performed. He is not imagining what the account feels. He remembers.

Use it sparingly and concretely. One first-person memory per note at most, and only when it explains a design decision.

Do not write: *I am deeply empathetic and customer-obsessed.*

Write: *I have been the buyer on the other end of a short shipment. Nobody called. I found out when the truck arrived.*

## The four gates

Every note must pass all four. If it passes three, it is not finished.

1. **The customer's cost.** Name what this failure actually costs the person on the other end. Not "customer dissatisfaction." A buyer explaining a hole on the shelf to their own boss. A distributor carrying a chargeback into a quarter close.
2. **The operational cause.** Name where the process breaks and why, upstream of the symptom.
3. **The owner and the next action.** Say who holds it and when the account hears back. Ownership without a date is not ownership.
4. **Nathan's judgment.** One decision, one refusal, or one thing he checks before anything else. This is the part a recruiter cannot get from a resume.

## The concierge standard

Concierge care is not warm language. It is work absorbed on our side of the line so the customer never carries it.

The rules the notes must demonstrate being engineered, never announced:

- The account never repeats information the system already has.
- The account never chases. If a review goes quiet, catching that is our job.
- The account never learns the org chart. They tell us the problem. We route it.
- The account hears from us before a date is missed, not after.
- The account gets a name, not a queue.
- Bad news arrives early and specific, because a customer can plan around a known delay and cannot plan around silence.

A note that describes only efficiency has missed the point. Structured intake is not there to make the team faster. It is there so the customer says the thing once, to one person, and is understood.

## Empathy without softness

Empathy here is analytical, not sentimental. It shows up as precision about the other person's situation.

Weak: *We understand that delays are frustrating for our customers.*

Strong: *A hold is not a failure. An invisible hold is. The buyer can move a promotion, call their DC, or tell their own manager the truth, but only if we tell them today instead of the day the truck does not arrive.*

The second is empathetic because it is specific about what the customer would do with the information. That is what caring looks like operationally.

## Preferred structure

Two to four sentences. Rarely more than five.

1. Name the operational truth in one line, flat and unhedged.
2. Put the reader in the customer's chair for one sentence.
3. Connect it to the design or workflow on screen.
4. Add one first-person observation, decision, or refusal.

## Hard rules

**Honesty.** No SAP implementation, configuration, integration, or tenure claims. Reading SAP SD and owning the process around it is the honest and sufficient claim. No real Samyang data, customers, orders, or metrics. Synthetic data stays labeled.

**Banned words.** Delight. Customer-obsessed. World-class. Seamless. Passion for people. Going above and beyond. Wearing many hats. AI-powered, unless the feature uses AI. Any sentence whose removal would not change the reader's understanding of how Nathan works.

**Punctuation and format.** No arrows in visible copy (→, ->, ↗). No em dash as a sentence separator (a lone `—` as a "no value" table cell is fine). Plain American English. CTAs name the action. No underlined links. Grep-sweep after any copy edit.

**Accessibility.** Nathan is colorblind. Never signal state by color alone; add a glyph, word, or shape.

**Fourth wall.** Breaks only at the intro and inside Nathan's Notes. Notes are always on. No toggle, no per-section popup. There is no cap on the number of notes. A note earns its place only when it explains a decision the visitor can see on screen, and a section carrying no such decision carries no note. One note per section, collapsed to a teaser by default, one expanded at a time.

**Visual relationship.** A note must look like builder commentary, never like a product status, alert, or a real Samyang annotation.

## Self-audit before shipping a note

Ask, in order:

1. Which of the four gates does this note miss?
2. Is there a real person in it, with a consequence I named?
3. Did I announce empathy anywhere instead of demonstrating it?
4. Could a competent analyst have written this, or only someone who has run the function?
5. Would every sentence survive an interviewer asking "say more about that"?
6. Did I claim anything about SAP that Nathan cannot defend?
7. Arrows, em-dash separators, banned words: clean?

If a sentence could be deleted without changing what the reader understands about how Nathan works, delete it.
