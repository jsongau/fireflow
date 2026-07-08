/**
 * SAP SD / Order-to-Cash process intelligence — data layer.
 *
 * This powers the "SAP SD Process Intelligence" chapter. It is a FireFlow
 * interpretation of the order-to-cash process. It is not a reproduction of the
 * SAP GUI and not a claim of access to Samyang's SAP environment. Every order
 * number, customer, amount, and outcome below is SYNTHETIC and labeled.
 *
 * Voice note: the `nathanNote` fields are written in Nathan J. Song's own
 * first person on purpose. The chapter lets him narrate what he actually knows
 * and where his transferable retail customer-operations experience maps onto
 * the SAP SD flow, without overstating hands-on SAP tenure.
 */

export interface GlossaryTerm {
  id: string;
  term: string;
  /** Plain-language definition, no SAP jargon inside the jargon. */
  short: string;
}

/** SAP SD vocabulary, explained the way a colleague would explain it. */
export const GLOSSARY: GlossaryTerm[] = [
  { id: "sold-to", term: "Sold-to party", short: "The customer account that places the order. This is who is legally buying." },
  { id: "ship-to", term: "Ship-to party", short: "Where the goods actually go. Often a specific store or distribution center, not the head office." },
  { id: "bill-to", term: "Bill-to party", short: "Who receives the invoice. Sometimes a central AP office, not the store." },
  { id: "payer", term: "Payer", short: "Who actually pays and carries the credit terms. Sold-to, ship-to, bill-to, and payer can all be different parties." },
  { id: "partner-function", term: "Partner function", short: "The role a party plays on an order. Sold-to, ship-to, bill-to, and payer are all partner functions on the customer master." },
  { id: "customer-master", term: "Customer master", short: "The stored record of a customer: addresses, partner functions, terms, tax, and account data reused on every order." },
  { id: "material-master", term: "Material master", short: "The stored record of a product: its number, unit of measure, weight, and the data that delivery and billing depend on." },
  { id: "sales-area", term: "Sales area", short: "The combination of sales organization, distribution channel, and division that a sales document belongs to." },
  { id: "sales-org", term: "Sales organization", short: "The selling unit responsible for the sale, such as Samyang America, that owns pricing and terms." },
  { id: "distribution-channel", term: "Distribution channel", short: "How product reaches the customer, such as retail, wholesale, or e-commerce." },
  { id: "division", term: "Division", short: "A product grouping used to organize sales and reporting." },
  { id: "sales-document", term: "Sales document", short: "The order object itself (inquiry, quotation, sales order, or return) that drives everything downstream." },
  { id: "item-category", term: "Item category", short: "What a line item behaves like (standard sell, free good, return, or text), which controls pricing, delivery, and billing." },
  { id: "schedule-line", term: "Schedule line", short: "The delivery commitment on a line: how much is confirmed for which date, set by the availability check." },
  { id: "pricing-condition", term: "Pricing condition", short: "A building block of the price, such as base price, a promotional discount, freight, or tax, layered into the net figure." },
  { id: "availability-check", term: "Availability check (ATP)", short: "The check of what can actually be promised from stock and supply for the requested date." },
  { id: "delivery-block", term: "Delivery block", short: "A hold that stops a delivery from being created. Used for credit, pricing, or verification reasons." },
  { id: "billing-block", term: "Billing block", short: "A hold that stops an invoice from being generated until something is confirmed." },
  { id: "credit-memo-request", term: "Credit memo request", short: "A document that proposes crediting the customer. It usually needs approval before it becomes a credit memo." },
  { id: "billing-document", term: "Billing document", short: "The invoice generated from the delivery. It posts to accounting and goes to the customer." },
  { id: "post-goods-issue", term: "Post goods issue (PGI)", short: "The moment stock officially leaves the warehouse. It reduces inventory and enables billing." },
  { id: "return-order", term: "Return order", short: "A sales document for goods coming back. It can trigger a credit and a quality review." },
  { id: "document-flow", term: "Document flow", short: "The linked chain of documents (order, delivery, goods issue, invoice) so any one can be traced end to end." },
];

export const GLOSSARY_BY_ID: Record<string, GlossaryTerm> =
  Object.fromEntries(GLOSSARY.map((g) => [g.id, g] as const));

export interface FlowStage {
  id: string;
  /** Short label for the spine node. */
  label: string;
  /** The SAP document or event this node represents. */
  doc: string;
  /** Glyph (icon, never colour alone) for the node. */
  glyph: string;
  represents: string;
  requiredData: string;
  owner: string;
  cxWatch: string;
  failurePoints: string[];
  evidence: string;
  downstream: string;
  metric: string;
  /** Glossary term ids relevant to this stage. */
  terms: string[];
  /** Nathan, first person, breaking the fourth wall. */
  nathanNote: string;
}

/**
 * The order-to-cash spine, told as ONE synthetic B2B order.
 * Northgate Grocers orders Buldak Carbonara. A promo price mismatch and a
 * short-dated item cause a hold, the order is released and shipped, then a
 * retailer deduction arrives and is worked to a credit memo.
 */
export const FLOW_STAGES: FlowStage[] = [
  {
    id: "po",
    label: "Customer PO",
    doc: "Inbound purchase order (EDI 850)",
    glyph: "▤",
    represents: "The retailer's purchase order arrives, often as an EDI 850. It states what Northgate wants, where it goes, and the price they expect.",
    requiredData: "Sold-to account, ship-to location, product numbers, quantities, expected price, and requested delivery date.",
    owner: "Customer Experience and EDI, with Sales visibility.",
    cxWatch: "Does every line map cleanly to our material master and this customer's stored data? A mismatch here becomes a dispute later.",
    failurePoints: [
      "The ship-to on the PO doesn't match a valid location on the customer master",
      "The retailer's item number can't be mapped to our material",
      "The expected price on the PO differs from our current condition record",
    ],
    evidence: "The original PO or EDI 850, and the customer master record it should match.",
    downstream: "Everything. A clean translation from PO to order is the cheapest place to stop a deduction before it starts.",
    metric: "Order entry accuracy · clean-order rate",
    terms: ["sold-to", "ship-to", "customer-master", "material-master"],
    nathanNote: "This is the exact moment I spent years living in: the handoff from what a customer says they want to what the system can actually honor. In retail operations I learned that most downstream friction is born right here, in a ship-to or a price that quietly doesn't match. Catch it at intake and you never fight it at invoice.",
  },
  {
    id: "order",
    label: "Sales Order",
    doc: "Sales order (VA01)",
    glyph: "▦",
    represents: "The PO becomes a sales order. Pricing conditions apply, lines get item categories, and the availability check sets the delivery commitments.",
    requiredData: "Sales area, partner functions, item categories, pricing conditions, and requested dates.",
    owner: "Customer Experience and Order Management.",
    cxWatch: "Two things: did the promotional condition actually apply, and did every line confirm on the requested date?",
    failurePoints: [
      "A promotion condition record is expired or missing, so the promo price doesn't apply",
      "A line only partially confirms because of limited availability",
      "The wrong item category changes how the line prices or delivers",
    ],
    evidence: "The order's pricing breakdown, meaning the condition records that did and didn't fire, plus the schedule lines.",
    downstream: "Sets the price that will be billed and the quantity that can ship. Those are the two things retailers deduct against.",
    metric: "Pricing accuracy · line fill at entry",
    terms: ["sales-document", "sales-area", "pricing-condition", "item-category", "availability-check", "schedule-line", "partner-function"],
    nathanNote: "Here is the fork in this synthetic order. Northgate expected the Carbonara promo, but the condition record lapsed a day early, and one pack size is short. I separate the price question from the supply question on purpose. They route to different people, Sales owns the promo and Supply Chain owns the fill, so I never make the customer chase both.",
  },
  {
    id: "hold",
    label: "Validation & Hold",
    doc: "Delivery / billing block",
    glyph: "⧗",
    represents: "The order is validated. Because of the price mismatch and the short line, it takes a temporary hold instead of flowing straight to delivery.",
    requiredData: "Credit status, pricing approval, and availability resolution.",
    owner: "Customer Experience, coordinating Sales, Supply Chain, and Finance.",
    cxWatch: "Is the hold visible, owned, and time-bound? A silent hold is how a 'where is my order?' call starts.",
    failurePoints: [
      "The hold sits with no owner and no promised update",
      "A credit hold is confused with a pricing hold, which need different teams and different fixes",
      "The customer is never told the order is paused",
    ],
    evidence: "The block reason, the approval trail, and the customer communication log.",
    downstream: "Decides whether the order ships today or slips. That lands straight on on-time fulfillment.",
    metric: "Hold cycle time · on-time release",
    terms: ["delivery-block", "billing-block", "availability-check"],
    nathanNote: "A hold is not a failure. An invisible hold is. My rule from service work: the moment something pauses, it gets one owner and one promised next update the customer can see. That single habit is most of what governing escalation standards actually means day to day.",
  },
  {
    id: "delivery",
    label: "Delivery",
    doc: "Outbound delivery (VL01N)",
    glyph: "▧",
    represents: "Once released, a delivery document is created against the confirmed quantities. It is the instruction to the warehouse to pick and pack.",
    requiredData: "Confirmed schedule lines, ship-to, shipping point, and packing data.",
    owner: "Logistics and the warehouse, with CX watching the commitments.",
    cxWatch: "Does the delivery match what we promised after the hold: the quantities, the date, and the ship-to?",
    failurePoints: [
      "The delivery is created to the wrong ship-to",
      "A partial delivery goes out without telling the customer",
      "Packing data is missing and the load is delayed",
    ],
    evidence: "The delivery document and its link back to the order, which is the document flow.",
    downstream: "Feeds goods issue and, in the end, the invoice quantity.",
    metric: "On-time in-full (OTIF)",
    terms: ["ship-to", "document-flow", "schedule-line"],
    nathanNote: "This is where a promise becomes a pallet. If we agreed to a partial after the hold, the customer should already know before the truck moves. I would rather make the awkward call early than let a surprise short shipment turn into a deduction and a trust problem.",
  },
  {
    id: "pgi",
    label: "Goods Issue",
    doc: "Post goods issue (PGI)",
    glyph: "▲",
    represents: "Stock officially leaves the warehouse. Inventory drops, ownership transfers, and billing becomes possible.",
    requiredData: "The picked delivery and the confirmed quantities.",
    owner: "The warehouse and Logistics.",
    cxWatch: "The PGI quantity is the number the invoice will bill and the retailer will check against their receiving.",
    failurePoints: [
      "The shipped quantity differs from the order, which seeds a shortage claim",
      "Damage in transit is not documented at dispatch",
    ],
    evidence: "The PGI record, the proof of delivery (POD), and the carrier or BOL.",
    downstream: "Locks the billable quantity. Every deduction is measured against this number.",
    metric: "Ship accuracy · claim-free delivery rate",
    terms: ["post-goods-issue", "document-flow"],
    nathanNote: "Post goods issue is the quiet hinge of the whole cycle. It is the number both sides argue about later. If the POD and the counts are clean here, a future deduction is a five-minute reconcile instead of a five-email fight.",
  },
  {
    id: "invoice",
    label: "Invoice",
    doc: "Billing document (VF01)",
    glyph: "▥",
    represents: "The billing document is generated from the delivery and posts to accounting. This is the invoice the retailer receives.",
    requiredData: "Delivery and PGI quantities, pricing conditions, tax, and freight.",
    owner: "Finance and Billing, with CX on disputes.",
    cxWatch: "Does the invoice price match what we agreed after the promo question, and does the quantity match PGI?",
    failurePoints: [
      "The invoice bills the pre-resolution price, which re-opens the promo dispute",
      "The quantity does not match what was received",
      "A re-run creates a duplicate invoice",
    ],
    evidence: "The billing document, the order pricing, and the delivery it came from.",
    downstream: "Sets up payment. If anything is off, it sets up a deduction instead.",
    metric: "Invoice accuracy · dispute rate",
    terms: ["billing-document", "pricing-condition", "document-flow"],
    nathanNote: "An invoice is a claim you are making to the customer, so it had better reconcile to the price we settled and the quantity we shipped. When those two tie out, you have earned the right to be paid in full. You have also removed the retailer's easiest reason to pay short.",
  },
  {
    id: "deduction",
    label: "Payment / Deduction",
    doc: "Short-pay / chargeback",
    glyph: "◆",
    represents: "The retailer pays, but pays one line short, taking a deduction for the promo price difference they expected.",
    requiredData: "Remittance detail, the deduction reason code, and the invoice and PO it references.",
    owner: "Customer Experience and Deductions, with Finance.",
    cxWatch: "Is the deduction valid? Reconcile the claim against proof: the POD, the agreed price, and the PO terms.",
    failurePoints: [
      "The deduction is accepted with no validation, so margin is lost",
      "A valid deduction is disputed anyway, which wastes effort and damages the relationship",
      "There is no reason code, so the pattern stays invisible",
    ],
    evidence: "Remittance, reason code, PO, invoice, POD, and any promo agreement.",
    downstream: "Becomes a write-off, a dispute, or a credit memo, plus a data point for improvement.",
    metric: "Deduction dollars recovered · valid vs invalid split",
    terms: ["payer", "bill-to", "document-flow"],
    nathanNote: "Deductions are where customer experience and the P&L meet. My instinct from claims and billing work: never reflexively accept, and never reflexively fight. Reconcile first. Here the retailer is partly right, since the promo should have applied, so fighting the whole thing would be wrong. I honor the valid part fast and only dispute what the evidence does not support.",
  },
  {
    id: "resolution",
    label: "Resolution",
    doc: "Credit memo + root cause",
    glyph: "✔",
    represents: "The valid portion becomes a credit memo request, gets approved, and posts as a credit memo. The invalid portion is documented. The root cause, a lapsed promo condition, feeds continuous improvement.",
    requiredData: "The approval, the credit memo request, and an owner for the corrective action.",
    owner: "Customer Experience, with Finance approval.",
    cxWatch: "Close the loop: credit the customer, record why it happened, and fix the condition record process so it does not repeat.",
    failurePoints: [
      "The credit memo is delayed, so the account ages and the retailer escalates",
      "The case closes without a root cause, which guarantees a repeat",
    ],
    evidence: "The credit memo request and its approval, and the corrective action record.",
    downstream: "Feeds Product Signals and continuous improvement. One case becomes a prevented pattern.",
    metric: "Time to credit · repeat-deduction rate",
    terms: ["credit-memo-request", "billing-document", "return-order"],
    nathanNote: "This is the part I care about most. Anyone can clear a deduction. The job is making sure this exact one never happens again. A lapsed promo condition is a process fix, not a person to blame. You route it to whoever owns condition records, set the fix, and measure whether the repeat rate actually drops. That is the whole continuous-improvement loop in one honest example.",
  },
];

export interface Exception {
  id: string;
  label: string;
  atStage: string;
  signal: string;
  validation: string;
  owner: string;
  partners: string[];
  evidence: string;
  customerUpdate: string;
  resolution: string;
  prevention: string;
}

/** Selectable order exceptions, the failure modes CX actually manages. */
export const EXCEPTIONS: Exception[] = [
  {
    id: "promo-mismatch",
    label: "Promo price didn't apply",
    atStage: "order",
    signal: "The order price is higher than the retailer's expected promo price.",
    validation: "Check the condition record dates against the PO date, and confirm the promo was authorized.",
    owner: "Customer Experience",
    partners: ["Sales", "Finance"],
    evidence: "The PO expected price, the order pricing breakdown, and the promo authorization.",
    customerUpdate: "Confirm the promo is valid and being applied, and give a corrected-price time.",
    resolution: "Apply the condition, or credit the difference after invoice, with approval.",
    prevention: "Alert on condition records expiring within the order horizon.",
  },
  {
    id: "unavailable",
    label: "Product unavailable or short",
    atStage: "order",
    signal: "A line only partially confirms, or confirms for a later date.",
    validation: "Read the availability check against the real supply picture, and confirm the true date.",
    owner: "Supply Chain",
    partners: ["Customer Experience", "Sales"],
    evidence: "The schedule lines, the ATP result, and the supply plan.",
    customerUpdate: "Offer the confirmed partial now with the balance later, or a full later date. The customer chooses.",
    resolution: "Split the schedule line, or reschedule with the customer's agreement.",
    prevention: "Flag chronically short items before they hit high-volume promo orders.",
  },
  {
    id: "ship-to-mismatch",
    label: "Ship-to doesn't match master",
    atStage: "po",
    signal: "The PO ship-to can't be matched to a valid location on the customer master.",
    validation: "Reconcile the PO ship-to against the customer master, and confirm with the retailer if it is ambiguous.",
    owner: "Customer Experience",
    partners: ["Sales", "Master Data"],
    evidence: "The PO ship-to and the customer master partner functions.",
    customerUpdate: "Confirm the correct destination before anything ships.",
    resolution: "Correct the order, or add the location to the master through the right process.",
    prevention: "Validate ship-to at intake, not at the dock.",
  },
  {
    id: "partial-delivery",
    label: "Partial delivery",
    atStage: "delivery",
    signal: "The delivery is created for less than the ordered quantity.",
    validation: "Confirm the partial matches the plan we agreed after the hold.",
    owner: "Logistics",
    partners: ["Customer Experience"],
    evidence: "The delivery document against the order, and the agreed plan.",
    customerUpdate: "Tell the customer the partial is shipping and when the balance follows, before dispatch.",
    resolution: "Ship the partial, and track the balance as an open commitment.",
    prevention: "Make agreed partials explicit so they are never a surprise.",
  },
  {
    id: "short-ship-claim",
    label: "Short-shipment claim",
    atStage: "deduction",
    signal: "The retailer claims they received fewer units than were invoiced.",
    validation: "Reconcile the invoiced quantity against PGI and against the POD or carrier count.",
    owner: "Customer Experience",
    partners: ["Logistics", "Finance"],
    evidence: "The PGI record, the POD, the BOL, and carrier confirmation.",
    customerUpdate: "Share what the proof shows. Credit if valid, explain if not.",
    resolution: "Credit the genuine shortage, or dispute with the POD if the count ties out.",
    prevention: "Clean PGI counts and legible PODs at dispatch.",
  },
  {
    id: "damage-claim",
    label: "Damage claim",
    atStage: "deduction",
    signal: "The retailer reports damaged cases on receipt.",
    validation: "Check the dispatch condition, packaging, and carrier handling, and assess whether it is a quality or a transit issue.",
    owner: "Customer Experience",
    partners: ["Quality", "Logistics"],
    evidence: "Photos, POD notes, the carrier claim, and lot info (synthetic).",
    customerUpdate: "Acknowledge it, avoid diagnosing on the spot, and route quality concerns to specialists.",
    resolution: "Credit or replace per policy, and open a quality review if warranted.",
    prevention: "Trend damage by lane and packaging to fix the real cause.",
  },
  {
    id: "invoice-qty",
    label: "Invoice quantity mismatch",
    atStage: "invoice",
    signal: "The invoiced quantity does not equal what was received.",
    validation: "Reconcile the invoice against PGI, and find where the numbers diverged.",
    owner: "Finance",
    partners: ["Customer Experience", "Logistics"],
    evidence: "The invoice, the PGI, and the POD.",
    customerUpdate: "Correct the invoice, or explain the tie-out.",
    resolution: "Issue a corrected invoice, or a credit for the difference.",
    prevention: "Bill strictly from PGI, never from the order quantity.",
  },
  {
    id: "duplicate-billing",
    label: "Duplicate billing concern",
    atStage: "invoice",
    signal: "The retailer flags what looks like two invoices for one delivery.",
    validation: "Trace the document flow. Is it a re-run, a split, or a true duplicate?",
    owner: "Finance",
    partners: ["Customer Experience"],
    evidence: "Both billing documents and their delivery links.",
    customerUpdate: "Confirm which invoice is valid, and cancel the duplicate.",
    resolution: "Cancel or reverse the duplicate billing document.",
    prevention: "Put guardrails on billing re-runs.",
  },
  {
    id: "deduction-chargeback",
    label: "Retailer deduction / chargeback",
    atStage: "deduction",
    signal: "The remittance pays an invoice short with a reason code.",
    validation: "Reconcile the deduction against the PO terms, the invoice, and the POD, and classify it valid or invalid.",
    owner: "Customer Experience and Deductions",
    partners: ["Finance", "Sales"],
    evidence: "The remittance, the reason code, the PO, the invoice, and the POD.",
    customerUpdate: "Acknowledge it, state the decision with evidence, and give the credit or dispute path.",
    resolution: "Credit the valid portion, and dispute the rest with documentation.",
    prevention: "Trend deductions by reason code to kill the recurring causes.",
  },
  {
    id: "return",
    label: "Return request",
    atStage: "resolution",
    signal: "The retailer requests to return product.",
    validation: "Confirm return eligibility and the reason, decide credit or replace, and flag quality reasons.",
    owner: "Customer Experience",
    partners: ["Quality", "Logistics", "Finance"],
    evidence: "The return authorization, the reason, and the product condition (synthetic).",
    customerUpdate: "Provide the return instructions and the credit timeline.",
    resolution: "Create a return order, and issue a credit memo on receipt.",
    prevention: "Trend return reasons into product and shelf guidance.",
  },
  {
    id: "credit-delay",
    label: "Credit memo delay",
    atStage: "resolution",
    signal: "An agreed credit has not posted and the account is aging.",
    validation: "Find where the credit memo request is stuck in approval.",
    owner: "Customer Experience",
    partners: ["Finance"],
    evidence: "The credit memo request, the approval status, and the account age.",
    customerUpdate: "Give a firm post date, and hold to it.",
    resolution: "Escalate the approval, and post the credit.",
    prevention: "Put an SLA and visibility on open credit memo requests.",
  },
];

/** Synthetic scenario header. Everything here is fictional and labeled. */
export const SAP_SCENARIO = {
  customer: "Northgate Grocers (synthetic)",
  po: "PO 4500-88213 (synthetic)",
  product: "Buldak Carbonara, Multi (5-pack)",
  summary:
    "A retail chain orders Buldak Carbonara. A lapsed promotional condition and one pack size running short trigger a hold. The order is released and shipped, then a retailer deduction for the promo difference is worked to a credit memo, and the lapsed condition becomes a prevention.",
};

/** Honest positioning, shown in the chapter, stated once, with confidence. */
export const SAP_DISCLOSURE =
  "FireFlow is not an SAP implementation and does not claim access to Samyang's internal systems. It is an independent front-end operations concept that shows how I understand the customer-facing workflow around order entry, pricing, delivery, billing, customer information, ownership, and resolution. All orders, customers, amounts, and outcomes here are synthetic and labeled.";
