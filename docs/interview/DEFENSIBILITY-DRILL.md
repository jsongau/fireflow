# Defensibility Drill

Every question below is taken from a line **you already published**. Nathan's Notes are the attack surface. Twenty-five notes, each written in your first person, each making a claim about how you work. A hiring manager who reads them will not ask you about your resume. They will ask you about the notes.

The format for each entry:

- **The line you shipped.** Where it lives, quoted.
- **The question it invites.**
- **What a real answer contains.** Not a script. The substance you must hold.
- **The trap.** The follow-up that separates someone who ran the function from someone who read about it.

Fact-checked against SAP Help Portal, GS1, X12, and retailer supplier documentation. Where the honest answer is "the industry has no agreed number," it says so, because saying that out loud is more credible than quoting a figure you cannot source.

---

## Part 1. The notes that promise SAP depth

### 1. The honest claim, said out loud

> "I have not configured SAP. I have read SAP SD and I own the process around it, and nearly every dispute I have worked traced back to a field on a record like one of these."
> `/intelligence`, o2c note

**Q. Walk me through what you mean by "I've read SAP SD."**

This is the first question, and it is a gift. You wrote the answer already. Say it in this order: you have not implemented, configured, or administered SAP. You have read the SD module's document flow and you own the process that runs on top of it. Then immediately give the specific: name the document chain without being asked.

Sales order, outbound delivery, picking, post goods issue, billing document, accounting document, payment application. That is order-to-cash in SAP SD. If you can say that chain cold and then say which step your disputes traced back to, the "I have not configured it" lands as precision instead of apology.

**The trap.** They ask "so what would you actually do in the system on day one?" The wrong answer is to imply you'd configure anything. The right answer: read. Pull the customer master for the top ten accounts, read the condition records and their validity dates, read the open deduction log by reason code, and read the document flow on the last five disputes. You are not there to build in SAP. You are there to find which field is generating phone calls.

---

### 2. Post goods issue

> The o2c page renders the document flow.

**Q. What does post goods issue actually do?**

This is the single most likely SAP question you get, and the one where a vague answer is most obviously vague. PGI is the moment the shipment stops being a plan and becomes a financial event.

It posts a goods movement (standard movement type 601), creates a **material document** that reduces on-hand inventory, and creates an **accounting document** that relieves inventory value and books cost of goods sold. It also locks the delivery from further change. Picking, by contrast, is a warehouse action with no financial posting: you have confirmed what is physically in the box, nothing has hit the ledger.

Why a CX manager cares: **PGI is the point of no return for a correction.** Before PGI, a quantity error is a delivery change. After PGI, it is a credit memo, a return, or a deduction. Every "can you just fix the order" call your team fields is really a question about which side of PGI the order is sitting on. If your reps do not know that boundary, they promise fixes that finance later refuses.

**The trap.** "Can you reverse a PGI?" Yes, and you should not pretend otherwise. It can be reversed (VL09), but the reversal creates its own documents and, if the invoice has already gone out, the correction moves to billing. The honest framing: it is technically reversible and operationally expensive, which is exactly why the check belongs upstream of it.

Source: [SAP Help, Outbound Delivery](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/7b24a64d9d0941bda1afa753263d9e39/0270b6535fe6b74ce10000000a174cb4.html)

---

### 3. Condition records, and the note that is slightly wrong

> "A price condition with a stale validity date does not look like a customer problem. It looks like a clean order until the retailer receives at a price we no longer honor and deducts the difference."
> `/intelligence`, customer-master note

**Q. Explain how a stale condition record turns into a deduction.**

**Read this carefully, because your note compresses the mechanism and an interviewer who has lived it will notice.**

The precise chain: a **condition type** is the category of pricing element (PR00 is price, K004 is a material discount). A **condition record** is a specific value for that type, tied to a key combination (this customer, this material) and bounded by valid-from and valid-to dates. SAP prices the order using whatever record is active on the pricing date.

If the validity dates are stale, SAP does not know anything is wrong. It invoices at the still-active old price. The retailer's AP system then matches your invoice against *their* records: their purchase order, their cost file, their signed price agreement. The three-way match flags a variance. **They short-pay and file a price-variance deduction.** The deduction is a retailer-side accounts-payable action. SAP did not trigger it. SAP produced an invoice that disagreed with what the retailer had on file, and the retailer took the difference.

That distinction matters because it tells you where the fix lives. You are not fixing a deduction. You are reconciling two systems of record that drifted, and you own the one that drifted.

**The trap.** "So whose fault is it?" Often nobody's, and that is the point worth making. A price change agreed by Sales in April, effective in May, entered in SAP in June, produces six weeks of deductions that no individual did wrong. The failure is that no process required the condition record to be updated *before* the effective date. That is a control you can install, and describing that control is the answer they are actually listening for.

> **Action item:** the note's phrasing ("the retailer receives at a price we no longer honor") is loose. See Part 4.

---

### 4. Customer master and partner functions

> "I can read a customer master and tell which field turns into a phone call."
> `/intelligence`, customer-master note

**Q. What's in a customer master?**

Three data views: **general data** (name, address, shared with finance), **company code data** (reconciliation account, payment terms, the finance view), and **sales area data** (pricing procedure, shipping conditions, partner functions, specific to a sales organization and channel and division).

Four standard **partner functions**: sold-to party, ship-to party, bill-to party, payer. They are frequently four different entities, and that is the whole point. A distributor's headquarters is sold-to, its DC is ship-to, its AP shared-service center is bill-to, and its parent company is payer. The chargeback lands on the payer. The complaint call comes from the ship-to. **If your team resolves with the wrong partner, the money never moves.**

In S/4HANA, the old XD01/XD02/XD03 transactions are retired in favor of the unified **Business Partner** (BP) model. Know this. It signals you read current documentation rather than a decade-old training deck.

**The trap.** "Which field on the master do you check first?" You have already answered this in your own note: the condition records and their validity dates, before the shipping data. Have a second one ready. Payment terms, because a mismatch between the terms in the master and the terms on the retailer's PO produces a discount deduction every single cycle until someone corrects it.

Source: [SAP Help, Customer Master](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/26b08c9979fa435faafcf6033ca0cf93/ba2eb957e2795f5de10000000a44147b.html)

---

### 5. Credit memo request

**Q. A retailer takes a $40,000 deduction for a shortage. Walk me through what happens in the system.**

Careful. **A deduction is not an SAP document.** It is something the retailer did on their side: they short-paid your invoice and netted the difference. On your side it arrives as an open item on the account, usually with a reason code, often via an 820 remittance advice.

What happens next is research, not a transaction. Somebody pulls the delivery, the picking confirmation, the proof of delivery, and the ASN. If the shortage is real, you issue a **credit memo request** (VA01, order type CR, billing type G2), it goes through approval, it becomes a credit memo, and it clears the open item. If the shortage is not real, you dispute it with documentation and pursue repayment.

If the correction involves both price and quantity, the more precise instrument is an **invoice correction request**, not a plain credit memo.

**The trap.** "How do you decide whether to fight it or write it off?" The dollar threshold answer is fine but incomplete. The better answer: you fight the ones that will recur. A $40,000 shortage that is genuinely a one-time pick error may not be worth the cross-functional research hours. A $4,000 deduction under a reason code that appeared three times this quarter is worth all of it, because you are not recovering $4,000, you are closing the thing generating $4,000 a month. That is your own signals note, said in a finance conversation.

---

## Part 2. EDI

### 6. The transaction sets

**Q. Which EDI documents does an order touch?**

Know these cold. They are the vocabulary of the job.

**850** purchase order, inbound from the retailer. **855** PO acknowledgment, your reply. **856** advance ship notice, the electronic packing list sent before the truck arrives. **810** invoice. **820** remittance advice. **846** inventory advice. **852** product activity data, the retailer's POS and sell-through. **997** functional acknowledgment.

Two precisions that mark you as someone who has handled these:

The **997 is a transport receipt, not a business acceptance.** It says the file arrived and parsed. It says nothing about whether the retailer accepted the order. Its *absence* is the operational signal: you have no confirmation the trading partner ever received the transmission, and an unacknowledged 850 shows up weeks later as a chargeback for an order you never knew existed.

The **820 is not a payment.** It is remittance detail. It can instruct a payment or simply describe one made elsewhere. **It is where deductions arrive**, itemized by reason code. Read the 820 and you know what you are being charged for before the cash lands short.

**The trap.** "How does an 850 become a sales order?" It gets translated (by SPS Commerce or a similar provider acting as VAN and translator) into an **IDoc**, typically basic type **ORDERS05**, which SAP consumes to create the sales order. If you say "the EDI comes in and SAP makes an order," you have said nothing. The word is IDoc.

---

### 7. ASN accuracy

> Your seed cases include compliance and OTIF chargebacks.

**Q. Why does a late ASN cause a chargeback when the truck was on time?**

Because the receiving DC's system is built around the ASN, not the truck. The **856** carries the packing hierarchy, and each carton or pallet is identified by an **SSCC-18**, an 18-digit serial shipping container code, printed on the **GS1-128** label on the physical unit. The SSCC on the label must match the SSCC in the ASN. That is what lets a receiver scan a pallet and match it electronically without opening it.

If the ASN is late, missing, or does not match what is on the trailer, the DC cannot receive cleanly. It gets handled manually, or held. The shipment scores as a miss even though the freight arrived in its window, and the compliance chargeback follows.

**The trap.** "What would you do about it?" Not "improve our ASN process." Say where you would look: the 997 for the 856. If your ASNs are being rejected on syntax or arriving after the truck, the acknowledgment record tells you which, and those are two completely different fixes. One is a mapping problem. The other is a warehouse timing problem where the ASN transmits at pick completion instead of at trailer close.

**Say the honest thing about the fine schedules.** Walmart's OTIF program is widely reported at roughly 3% of the cost of goods on non-compliant cases, with thresholds that have moved over time and now differ by prepaid versus collect supplier. Do not quote a precise current number. Say: "the threshold has shifted in recent years and differs by supplier type, so I would confirm it against the account's own scorecard rather than trust a number I read." That answer is stronger than the number, because it is what you would actually do.

Sources: [GS1 SSCC](https://www.gs1.org/standards/id-keys/sscc), [SPS Commerce, EDI 997](https://www.spscommerce.com/edi-document/edi-997-functional-acknowledgement/)

---

## Part 3. Deductions and the metrics you put on screen

### 8. Deduction versus chargeback

**Q. What's the difference?**

A **deduction** is the umbrella: any time a customer pays less than the invoice and nets the difference. A **chargeback** is narrower, usually a compliance-violation fee or a distributor's pass-through. All chargebacks are deductions; not all deductions are chargebacks. In practice the words get used interchangeably on the floor. Knowing that they are not actually synonyms, and saying so lightly rather than pedantically, is the signal.

The categories: trade promotion, shortage and OS&D (over, short, damaged), pricing, compliance and vendor non-compliance, freight, returns, unsaleables. **Trade promotion is the largest by dollar volume in food CPG**, because trade spend itself runs roughly 15 to 25% of gross sales. If you get asked where you would start, that is the answer, and it is also the one where the fix is least likely to be a CX fix. Trade deductions are usually a deal-setup and settlement problem living between Sales and Finance. Saying that shows you know the boundary of your own function.

---

### 9. The dispute window

> "the deduction nearest its window"
> `/leadership`, plan note

**Q. What's the dispute window?**

The window is the deadline the retailer imposes to contest a deduction, and **it varies enormously by retailer and by deduction type.** Walmart allows roughly 15 to 30 days on AP compliance chargebacks but far longer on shortage claims. Amazon's is around 11 days. Target differs by prepaid versus collect. Kroger runs about 180 days.

The correct answer is: "It depends on the retailer and the type, and some are as short as two weeks, which is why the aging report has to be sorted by days-to-window and not by days-open." That second clause is your note. It is also the operational insight: a 60-day-old deduction with 120 days left is not urgent. A 10-day-old Amazon chargeback with 24 hours left is.

**The trap.** "How do you make sure nothing ages out?" This is where you talk about your board. Time-in-stage, not total age. The In-progress column. The unclaimed case that cannot hide in Reported. You built the answer. Say it as an operating practice, not as a feature demo.

Sources: [Inymbus, Walmart AP claims](https://blog.inymbus.com/walmart-accounts-payable-claims-and-deductions)

---

### 10. DDO

**Q. How do you measure deduction performance?**

**Days Deduction Outstanding (DDO)** is real: open deduction dollars divided by average daily deduction volume, the deduction-side analog of DSO, commonly targeted around 30 to 40 days. It is legitimate and defined by finance sources.

It is also **specialist vocabulary**. Plenty of competent CX and sales-ops people have never used it. Define it in one clause as you say it ("days deduction outstanding, so the deduction analog of DSO") rather than dropping the acronym and assuming. Dropping an acronym the room does not use reads as posturing, not expertise. Explaining it in six words reads as fluency.

Source: [Corporate Finance Institute, DDO](https://corporatefinanceinstitute.com/resources/accounting/days-deduction-outstanding-ddo/)

---

### 11. Fill rate, precisely

> "Fill rate, on-time-in-full, CSAT, and cost-to-serve sit next to the queue."
> `/leadership`, command note

**Q. Define fill rate.**

Never say "fill rate" without saying which one. **Case fill rate** is cases shipped over cases ordered. **Line fill rate** is order lines filled complete over total lines. **Order fill rate** is orders shipped complete over total orders. **Value fill rate** weights by dollars.

They diverge, and the divergence is diagnostic. An order can hit 100% line fill and miss case fill if one line shipped short. **Retailer scorecards usually measure what hurts you most**, and a supplier reporting a number that flatters itself against a retailer measuring a different one is the origin of a lot of unproductive meetings.

**OTIF** is stricter than either: the order arrived inside its delivery window **and** complete. Both halves, same order. Your own glossary says this. Know that most OTIF loss in practice is the in-full half, not the on-time half, which is why OTIF is a supply problem wearing a logistics costume.

**Service level** is not a synonym for fill rate. It is a planning metric: the probability of not stocking out during a replenishment cycle, used to set safety stock. Fill rate is execution. If you use them interchangeably in front of a supply chain director, you have told them something about yourself.

Source: [GAINS, service level vs fill rate](https://gainsystems.com/blog/service-level-vs-fill-rate-key-differences-in-supply-chains/)

---

### 12. CSAT

**Q. How would you measure customer satisfaction for retail accounts?**

CSAT is top-two-box: the percentage of respondents choosing 4 or 5 on a five-point scale, after a specific interaction. B2B benchmarks land around 75 to 85%.

Then say the thing that is actually true about B2B CSAT and that most candidates miss: **your survey population is tiny and structurally biased.** You have a few dozen buyers, not thousands of consumers. The buyer who is furious does not fill out your survey; they call your VP of Sales. CSAT on a book of forty accounts is a lagging, noisy, gameable number.

So pair it with something that cannot be gamed. Repeat-contact rate. Reopened-case rate. Time to first meaningful response. Deductions filed per hundred orders, which is a customer satisfaction metric wearing a finance costume, because an account that trusts you calls you and an account that does not just deducts.

That last sentence is worth more than the benchmark, and it is drawn from your own signals note.

**The trap.** "What's a good CSAT?" The number is a trap. "Better than last quarter, measured the same way, with the same population" is the answer.

---

### 13. Cost to serve, and the number on your screen

> The CommandCenter scorecard values an open deduction at **$1,250**.
> `src/components/home/CommandCenter/CommandCenter.tsx`, `unitCents: 125_000`

**Q. Where does $1,250 per deduction come from?**

**Right now: nowhere, and you must not defend it as sourced.**

I had this independently checked. There is no published figure supporting anything close to $1,250 to process one deduction. The nearest real data is for AP invoice exceptions generally, roughly $9 of labor per exception at a fully loaded $45 per hour, or $10 to $40 for full manual invoice processing. A contested trade deduction requiring research across sales, finance, and logistics plausibly costs meaningfully more than a routine exception. **But no credible source puts a number that high**, and if you say "$1,250, that's the industry figure," a finance-literate interviewer will ask for the source and you will not have one.

What to say instead: "It's a modeled assumption, not a benchmark. I put the unit cost on screen precisely so it can be argued with. Published data covers invoice exceptions at tens of dollars of labor; a cross-functional trade deduction is a different animal and I have not found a defensible published figure for it. On a real book of business the first thing I would do is measure it: sample thirty closed deductions, count the hours across every function that touched them, and build the number from our own data rather than borrow one."

**That answer is better than a sourced number would have been.** It demonstrates cost-to-serve reasoning, intellectual honesty under pressure, and a concrete first action. Cost to serve itself is a real discipline: allocate material, warehouse handling, freight, and trade and service costs to each customer so profitability is visible net of the cost of serving them. Freight alone commonly runs 8 to 9% of cost of sales in CPG.

Sources: [HighRadius, AP cost per invoice](https://www.highradius.com/resources/Blog/ap-cost-per-invoice/), [Bedford, cost-to-serve](https://bedfordconsulting.com/the-value-of-a-dynamic-cost-to-serve-model-for-a-cpg-business/)

---

### 14. The SLA ladder

> `PRIORITY_TARGET` in `intake.ts`: standard, elevated, high, critical, with acknowledge and resolve times.

**Q. Where did these targets come from?**

There is no published industry benchmark for CPG order-desk SLAs. The four-tier ladders you see quoted (15 to 30 minutes acknowledge on P1, four hours to resolve, and so on) come from SaaS helpdesk vendors, not from CPG customer operations. **Say that.**

"This is a ladder I would propose, not a standard I am citing. The tiering logic is what I would defend: the clock that matters is not how fast we answer, it is whether the acknowledgment names an owner and a date. A four-hour acknowledgment that says 'we received your inquiry' is worth less than a next-day one that says 'Grace owns this, you'll hear from her Thursday with the credit amount.' On a real book I would set these against the actual dispute windows and the actual delivery cadence, because a target the team cannot hit on a bad Friday just teaches them to stop reading the document."

That last clause is your standards note. It is one of your best lines. Use it.

---

## Part 4. Design decisions they will ask you to defend

These are the ones where "an AI suggested it" is fatal and where you genuinely made the call. Rehearse the *reasoning*, not the feature.

### 15. Why an In-progress column?

Because without it, Reported means two different things: nobody has touched this, and someone is quietly working it. Those cases require opposite actions from a manager. You cannot see an unclaimed account if it is hiding behind work that looks underway.

### 16. Why time-in-stage instead of total age?

Total age tells you how bad the case already looks to the account. Time in the current stage tells you whether anyone is moving it. A four-day-old case that moved three times this morning is healthy. A four-day-old case that has sat in Routed for four days is an owner who has not started. Same age, opposite problems.

### 17. Why are all the cards the same height?

Because card height would otherwise encode message length, and message length has nothing to do with urgency. The quiet one-line report can be the deduction closest to its window. A board that ranks by who typed the most is a board that serves the loudest account.

### 18. Why is manual ordering the default sort?

Because a queue is a set of judgments, and the sort orders you can compute (newest, oldest, alphabetical) encode no judgment at all. Manual order lets a lead say "this one first" and have that survive a page refresh. Sorted views exist for auditing the board, not for working it.

### 19. Why does every stage change carry initials and a timestamp?

A stage change without a name and a time is not accountability, it is activity. When a deduction ages out, the question is not what happened, it is who had it and when they stopped. You cannot coach that conversation from a board that only shows the current state.

### 20. Why hold and notify instead of short-shipping?

**This is your best operational answer, and it is counterintuitive, which is why they will push on it.**

Short-shipping protects the ship date and hides the shortage. It quietly corrupts fill rate, and it corrupts the forecast that plans the next cycle. A hold keeps both honest. More importantly it keeps the buyer honest with *their* boss: a known delay is something they can move a promotion around, and a partial delivery discovered at the dock is not.

**The trap.** "Your fill rate looks worse when you hold." Yes. Say yes. "Fill rate looks worse and is more accurate. The short-ship version books a delivery we did not actually make, and then supply planning reorders against a demand signal we corrupted. I would rather explain a real 92% than defend a 97% that made the next quarter worse."

---

## Part 5. The honesty seams

These four end interviews if you fumble them. There is no clever answer. There is only the prepared, unbothered one.

### 21. "Have you used SAP?"

"Not as an implementer. I have not configured it and I would not claim to. I have read the SD module and I own the process that runs on it. If you want, I can walk the order-to-cash document flow and tell you which step my disputes traced back to."

Then stop talking. The pause is the answer. Candidates who oversell fill silence.

### 22. "Did you build this site yourself?"

Tell the truth, and tell it as a strength: you directed it, you made every product and content decision, you used AI tooling heavily to build it, and you rejected a great deal of what the tooling produced. Have an example ready. The obangsaek color coder is perfect: it was proposed, it would have encoded state by hue, you are colorblind, you killed it and wrote it into `DECISIONS.md` as a rejected option.

That story does three things at once. It proves you direct rather than accept. It demonstrates accessibility judgment. And it shows you keep a decision record, which is a management artifact.

**Do not** pretend you hand-wrote the code. Someone will ask you what `orderBetween` does. (It computes a fractional sort key between two neighbors so a card can be inserted without renumbering the column. You should know that anyway.)

### 23. "Are these real accounts?"

"The banner names are real and used illustratively. Every operational detail attached to them is invented and labeled: the partner-since dates, the store counts, the payment terms, the contacts, the cases. There is a disclaimer inside every profile. I chose real names because a portfolio of fictional grocery chains does not demonstrate that I know who buys this category."

Be ready for the follow-up you may not like: **"Would you have done that if you already worked here?"** No. And say no. Inside the company you would use account IDs, because the invented detail would be indistinguishable from the real record to anyone reading over your shoulder. The judgment being tested is whether you understand the difference between a portfolio artifact and an internal document.

### 24. "The range is $101,000 to $122,000."

Know your number before you are in the room, and know it is not $200,000. If the band does not work for you, that is a fine thing to know now. If it does, do not negotiate against yourself at the screen. "That range works. I'd want to understand the bonus structure and where in the band someone with my background lands."

---

## Part 6. Three things to fix before anyone sees this

**1. The `$1,250` per deduction.** It is on screen at `CommandCenter.tsx:149`. Either relabel the unit assumption as a modeled figure with the reasoning visible, or lower it to something defensible. Right now it is the one number a finance-literate reader can catch you on. Fixing it costs one line and a tooltip.

**2. The customer-master note's mechanism.** "The retailer receives at a price we no longer honor and deducts the difference" compresses the chain in a way that is loose. SAP invoices at the still-active record; the retailer's three-way match catches the variance against *their* cost file; they short-pay. The current phrasing implies the retailer is reacting to receipt, not to invoice reconciliation. Two sentences of repair.

**3. The synthetic OTIF proxy.** `CommandCenter.tsx:167` computes `otif = fillRate - lateCount * 2`. It is labeled synthetic, and it is also not how OTIF works: OTIF is not fill rate minus a penalty, it is the share of orders satisfying both conditions simultaneously. If an interviewer opens the source, that line says you did not know. Compute it as a real intersection over the synthetic cases, or say in the tooltip that it is a display proxy.

---

## How to use this

Read it once. Then have someone read you the twenty-four questions with the answers covered, out of order, and answer out loud. Out loud matters. The failure mode is not ignorance, it is knowing something and discovering, in the room, that you have never once had to say it in a sentence.

Anything you cannot answer twice in a row, you have two options: learn it, or take it off the site. The site raised the bar. It is now yours to clear.
