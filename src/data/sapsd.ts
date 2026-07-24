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
  /** Which tab of the Customer Master study this term appears on, if any. */
  masterTab?: string;
}

/** SAP SD vocabulary, explained the way a colleague would explain it. */
export const GLOSSARY: GlossaryTerm[] = [
  /* Partner functions — the parties on an order (Partner functions tab). */
  { id: "sold-to", term: "Sold-to party", short: "The customer account that places the order. This is who is legally buying.", masterTab: "partners" },
  { id: "ship-to", term: "Ship-to party", short: "Where the goods actually go. Often a specific store or distribution center, not the head office.", masterTab: "partners" },
  { id: "bill-to", term: "Bill-to party", short: "Who receives the invoice. Sometimes a central AP office, not the store.", masterTab: "partners" },
  { id: "payer", term: "Payer", short: "Who actually pays and carries the credit terms. Sold-to, ship-to, bill-to, and payer can all be different parties.", masterTab: "partners" },
  { id: "partner-function", term: "Partner function", short: "The role a party plays on an order. Sold-to, ship-to, bill-to, and payer are all partner functions on the customer master.", masterTab: "partners" },

  /* Master records and sales area (General, Material, and Sales area tabs). */
  { id: "customer-master", term: "Customer master", short: "The stored record of a customer: addresses, partner functions, terms, tax, and account data reused on every order.", masterTab: "general" },
  { id: "material-master", term: "Material master", short: "The stored record of a product: its number, unit of measure, weight, and the data that delivery and billing depend on.", masterTab: "material" },
  { id: "sales-area", term: "Sales area", short: "The combination of sales organization, distribution channel, and division that a sales document belongs to.", masterTab: "salesarea" },
  { id: "sales-org", term: "Sales organization", short: "The selling unit responsible for the sale, such as Samyang America, that owns pricing and terms.", masterTab: "salesarea" },
  { id: "distribution-channel", term: "Distribution channel", short: "How product reaches the customer, such as retail, wholesale, or e-commerce.", masterTab: "salesarea" },
  { id: "division", term: "Division", short: "A product grouping used to organize sales and reporting.", masterTab: "salesarea" },

  /* Documents in the order-to-cash flow (Documents tab). */
  { id: "sales-document", term: "Sales document", short: "The order object itself (inquiry, quotation, sales order, or return) that drives everything downstream.", masterTab: "documents" },
  { id: "item-category", term: "Item category", short: "What a line item behaves like (standard sell, free good, return, or text), which controls pricing, delivery, and billing.", masterTab: "documents" },
  { id: "schedule-line", term: "Schedule line", short: "The delivery commitment on a line: how much is confirmed for which date, set by the availability check.", masterTab: "documents" },
  { id: "pricing-condition", term: "Pricing condition", short: "A building block of the price, such as base price, a promotional discount, freight, or tax, layered into the net figure.", masterTab: "pricing" },
  { id: "availability-check", term: "Availability check (ATP)", short: "The check of what can actually be promised from stock and supply for the requested date.", masterTab: "material" },
  { id: "delivery-block", term: "Delivery block", short: "A hold that stops a delivery from being created. Used for credit, pricing, or verification reasons.", masterTab: "documents" },
  { id: "billing-block", term: "Billing block", short: "A hold that stops an invoice from being generated until something is confirmed.", masterTab: "documents" },
  { id: "credit-memo-request", term: "Credit memo request", short: "A document that proposes crediting the customer. It usually needs approval before it becomes a credit memo.", masterTab: "documents" },
  { id: "billing-document", term: "Billing document", short: "The invoice generated from the delivery. It posts to accounting and goes to the customer.", masterTab: "documents" },
  { id: "post-goods-issue", term: "Post goods issue (PGI)", short: "The moment stock officially leaves the warehouse. It reduces inventory and enables billing.", masterTab: "documents" },
  { id: "return-order", term: "Return order", short: "A sales document for goods coming back. It can trigger a credit and a quality review.", masterTab: "documents" },
  { id: "document-flow", term: "Document flow", short: "The linked chain of documents (order, delivery, goods issue, invoice) so any one can be traced end to end.", masterTab: "documents" },

  /* Company code data — the accounting and credit relationship (Company code tab). */
  { id: "payment-terms", term: "Terms of payment", short: "The deal on when an invoice is due and whether paying early earns a discount, such as 2 percent off if paid within 10 days, otherwise the full amount in 30.", masterTab: "company" },
  { id: "credit-limit", term: "Credit limit", short: "The most a customer is allowed to owe us at one time, counting open orders plus unpaid invoices. Go past it and new orders take a credit hold.", masterTab: "company" },
  { id: "credit-control-area", term: "Credit control area", short: "The unit that owns and watches a customer's credit across the business, so their limit is checked in one consistent place.", masterTab: "company" },
  { id: "reconciliation-account", term: "Reconciliation account", short: "The general ledger account that every invoice for this customer rolls up into, usually trade receivables, so accounting always ties back to one place.", masterTab: "company" },
  { id: "dunning", term: "Dunning", short: "The standard, step-by-step reminder process for past-due invoices, from a gentle first notice to a firmer final one.", masterTab: "company" },
  { id: "dso", term: "Days sales outstanding (DSO)", short: "The average number of days a customer takes to pay after being invoiced. A rising number means the cash is coming in slower.", masterTab: "company" },

  /* Sales area data — how this account buys from this selling unit (Sales area tab). */
  { id: "customer-group", term: "Customer group", short: "A grouping of similar customers, such as retail chains, used for pricing, reporting, and how their orders are handled.", masterTab: "salesarea" },
  { id: "customer-pricing-procedure", term: "Customer pricing procedure", short: "A code on the customer that, together with the order type, decides which set of pricing rules runs on their orders. A retail account and a distributor can price differently.", masterTab: "salesarea" },
  { id: "price-list", term: "Price list type", short: "The price tier a customer buys at, such as wholesale or retail, which sets the baseline prices their orders start from.", masterTab: "salesarea" },
  { id: "delivering-plant", term: "Delivering plant", short: "The default warehouse or distribution center that ships this customer's orders.", masterTab: "salesarea" },
  { id: "shipping-point", term: "Shipping point", short: "The physical dock or facility where a shipment is staged and leaves from.", masterTab: "salesarea" },
  { id: "complete-delivery", term: "Complete delivery", short: "Whether the customer requires the whole order to ship in one complete load, or will accept it in pieces. When it is required, one short line can hold the whole order.", masterTab: "salesarea" },
  { id: "partial-delivery", term: "Partial delivery", short: "The customer's rule on whether a line can ship in more than one shipment, and how many times.", masterTab: "salesarea" },
  { id: "order-combination", term: "Order combination", short: "Whether several orders for the same customer can be combined onto one delivery to save freight.", masterTab: "salesarea" },
  { id: "incoterms", term: "Incoterms", short: "The shipping terms that decide where title and risk pass from us to the customer, such as at our dock or at theirs. That line is what decides who owns a damage claim while the goods are in transit.", masterTab: "salesarea" },
  { id: "tax-classification", term: "Tax classification", short: "Whether a customer's orders are taxed or exempt, such as grocery food for home consumption being exempt from sales tax.", masterTab: "salesarea" },
  { id: "account-assignment-group", term: "Account assignment group", short: "A code that routes this customer's revenue to the right account in the general ledger, such as domestic sales.", masterTab: "salesarea" },

  /* Material master — the product record sales, shipping, and billing all read (Material master tab). */
  { id: "base-uom", term: "Base unit of measure", short: "The smallest unit the system counts a product in, often an each. Every other unit converts back to this one.", masterTab: "material" },
  { id: "sales-uom", term: "Sales unit of measure", short: "The unit a customer actually orders in, usually a case, even though stock is counted underneath in eaches.", masterTab: "material" },
  { id: "case-pack", term: "Case pack and unit conversion", short: "How many consumer units are inside one case, such as 8 pouches per case. Get this conversion wrong and a shortage claim is automatic.", masterTab: "material" },
  { id: "material-group", term: "Material group", short: "A category that groups similar products together for reporting and planning, such as stir-fry noodles.", masterTab: "material" },
  { id: "storage-location", term: "Storage location", short: "Where inside a warehouse a product is held, such as ambient or refrigerated stock.", masterTab: "material" },
  { id: "gtin", term: "GTIN (Global Trade Item Number)", short: "The GS1 product identifier that names a product worldwide. The case and the single consumer unit each have their own, so the two numbers are not interchangeable.", masterTab: "material" },

  /* Pricing detail (Pricing conditions tab). */
  { id: "condition-record", term: "Condition record", short: "The stored entry that holds an actual price, discount, or allowance, along with the dates it is valid between. When a promo lapses, this is the record that expired.", masterTab: "pricing" },
  { id: "condition-type", term: "Condition type", short: "The kind of pricing element a line represents, such as base price, a discount, freight, or tax. Each one is a separate building block of the final price.", masterTab: "pricing" },

  /* Shipment and delivery evidence (Documents tab). */
  { id: "pod", term: "Proof of delivery (POD)", short: "The signed record that the customer received the shipment, including any note of a shortage or damage. It is the evidence behind most delivery disputes.", masterTab: "documents" },
  { id: "bol", term: "Bill of lading (BOL)", short: "The carrier's document listing what was loaded onto the truck. It backs up what shipped when a count is questioned.", masterTab: "documents" },

  /* EDI and compliance (EDI and compliance tab). */
  { id: "sscc", term: "SSCC (Serial Shipping Container Code)", short: "The serialized license plate number on a pallet's label, unique to that pallet. It has to match the advance ship notice, or the retailer's receiving system rejects it.", masterTab: "edi" },
  { id: "sps-commerce", term: "SPS Commerce", short: "A common EDI network that translates orders, ship notices, and invoices between a supplier and a retailer, so the two systems can exchange documents without email.", masterTab: "edi" },
  { id: "mabd", term: "MABD (must-arrive-by date)", short: "The window a shipment has to land in at the retailer's dock. Miss it and they charge back a fee even when the product itself is perfect.", masterTab: "edi" },
  { id: "remittance-advice", term: "Remittance advice", short: "The detail that comes with a payment explaining which invoices it covers and what was held back, so a short payment can be matched to its reason.", masterTab: "edi" },

  /* Account performance and deduction vocabulary (Account performance tab). */
  { id: "otif", term: "OTIF (on-time in-full)", short: "The order both arrived inside its delivery window and was complete, with nothing short. Both halves have to be true on the same order for it to count.", masterTab: "performance" },
  { id: "fill-rate", term: "Fill rate", short: "Cases shipped measured against cases ordered. It is the plainest read on whether we sent the customer what they asked for.", masterTab: "performance" },
  { id: "deduction", term: "Deduction", short: "Money a retailer holds back from an invoice payment, claiming something was wrong with the order, the price, or the delivery. Some are valid and some are not.", masterTab: "performance" },
  { id: "reason-code", term: "Reason code", short: "The code a retailer puts on a deduction to say why they paid short, such as a price difference or a shortage. No reason code means the pattern stays invisible.", masterTab: "performance" },
  { id: "short-pay", term: "Short pay", short: "Paying an invoice for less than the amount billed. It is the mechanical way a deduction actually arrives: the check simply comes in short.", masterTab: "performance" },
  { id: "chargeback", term: "Chargeback", short: "A fee a retailer bills back to a supplier for breaking a shipping or compliance rule, such as a late arrival or a bad label, separate from the product's price.", masterTab: "performance" },
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
    nathanNote: "Here is the fork in this order. Northgate expected the Carbonara promo, but the condition record lapsed a day early, and one pack size is short. I separate the price question from the supply question on purpose. They route to different people, Sales owns the promo and Supply Chain owns the fill, so I never make the customer chase both.",
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
    nathanNote: "A deduction is a customer conversation and a P&L decision on the same dollars. My instinct from claims and billing work: never reflexively accept, and never reflexively fight. Reconcile first. Here the retailer is partly right, since the promo should have applied, so I honor the valid part fast and dispute only what the evidence does not support. When the evidence cannot settle a claim either way, I switch instruments: a complimentary discount on the account's next order. A credit memo says we owed the money; a courtesy discount says we value the business. The account keeps the same savings either way, and the wording tells them honestly which one they received.",
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
    evidence: "Photos, POD notes, the carrier claim, and lot info.",
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
    resolution: "Credit the valid portion, and dispute the rest with documentation. When the evidence cannot settle the claim either way, offer a complimentary discount on the next order instead of a credit, worded as a courtesy so the account knows nothing was conceded.",
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
    evidence: "The return authorization, the reason, and the product condition.",
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
  customer: "Northgate Grocers",
  po: "PO 4500-88213",
  product: "Buldak Carbonara, Multi (5-pack)",
  summary:
    "A retail chain orders Buldak Carbonara. A lapsed promotional condition and one pack size running short trigger a hold. The order is released and shipped, then a retailer deduction for the promo difference is worked to a credit memo, and the lapsed condition becomes a prevention.",
};

/** Honest positioning, shown in the chapter, stated once, with confidence. */
export const SAP_DISCLOSURE =
  "FireFlow is not an SAP implementation, and I do not claim access to Samyang's systems. It shows how I understand the customer-facing workflow around order entry, pricing, delivery, billing, ownership, and resolution.";

export interface SapOrder {
  id: string;
  /** Invented company name. Clearly fictional, never a real grocery chain. */
  customer: string;
  po: string;
  /** Real Buldak / Tangle / Samyang / MEP product name. Naming a real SKU is fine; the order is synthetic. */
  product: string;
  /** Must match a FLOW_STAGES id. */
  stageId: string;
  /** Must match an EXCEPTIONS id, or null when the order is currently clean. */
  exceptionId: string | null;
  priority: "high" | "medium" | "low";
  /** Small synthetic integer, days sitting at the current stage. */
  ageInStageDays: number;
  /** Synthetic dollar exposure, or "—" when there is none to show yet. */
  exposure: string;
  /** Nathan, first person: his triage judgment on this specific order. */
  nathanCall: string;
}

/**
 * The Order Queue: seven synthetic orders spread across the order-to-cash
 * spine at once, the way a real book of orders actually looks. Priority is
 * a judgment call, not a label, built from dollar exposure, how long the
 * order has been sitting, and how close the failure sits to cash.
 */
export const ORDER_QUEUE: SapOrder[] = [
  {
    id: "northgate-carbonara",
    customer: "Northgate Grocers",
    po: "PO 4500-88213",
    product: "Buldak Carbonara, Multi (5-pack)",
    stageId: "order",
    exceptionId: "promo-mismatch",
    priority: "high",
    ageInStageDays: 5,
    exposure: "$3,400",
    nathanCall:
      "This is the one I'd work first today. The promo price never applied, the gap is real dollars, and it has sat five days without a decision. I'd confirm the condition record lapsed, get the corrected price applied before it ships, and tell Northgate the number before they have to ask.",
  },
  {
    id: "harlow-vance-2x-spicy",
    customer: "Harlow & Vance Foodservice",
    po: "PO 4501-77042",
    product: "Buldak 2X Spicy, Multi (5-pack)",
    stageId: "po",
    exceptionId: "ship-to-mismatch",
    priority: "medium",
    ageInStageDays: 1,
    exposure: "—",
    nathanCall:
      "Nothing has shipped yet, so there is no dollar exposure to chase, only a location I cannot confirm. I would rather spend ten minutes calling Harlow & Vance to verify the dock address now than let a truck leave for the wrong door. This is the cheapest stage in the whole flow to fix a mistake.",
  },
  {
    id: "cascadia-mep-beef",
    customer: "Cascadia Fresh Markets",
    po: "PO 4502-63180",
    product: "MEP Black Pepper & Beef",
    stageId: "order",
    exceptionId: "unavailable",
    priority: "medium",
    ageInStageDays: 3,
    exposure: "—",
    nathanCall:
      "The line only confirmed a partial quantity, so I need Supply Chain's real availability date before I offer Cascadia anything. I would rather give them an honest partial-now, balance-later plan than let the order sit unconfirmed another three days. No dollars have moved yet, but the clock on their shelf reset has.",
  },
  {
    id: "union-route-tangle-alfredo",
    customer: "Union Route Wholesale",
    po: "PO 4503-91527",
    product: "Tangle Bulgogi Alfredo",
    stageId: "delivery",
    exceptionId: "partial-delivery",
    priority: "low",
    ageInStageDays: 2,
    exposure: "—",
    nathanCall:
      "This partial was already agreed and Union Route was told before the truck left, so it is doing exactly what a managed partial should do. I am keeping it on the board only to track the balance shipment, not because anything is at risk. That is the difference between a partial we planned and one that surprises the customer.",
  },
  {
    id: "bellwood-cream-carbonara",
    customer: "Bellwood Grocery Collective",
    po: "PO 4504-50219",
    product: "Buldak Cream Carbonara",
    stageId: "deduction",
    exceptionId: "short-ship-claim",
    priority: "high",
    ageInStageDays: 9,
    exposure: "$5,600",
    nathanCall:
      "Nine days old and the biggest number in the queue, so this is the one I would escalate today. Before I credit or dispute a cent, I am pulling the PGI count and the POD to see whether the shortage is real. Age plus exposure is exactly the math that should move something to the top of anyone's list.",
  },
  {
    id: "fenwick-samyang-extra-spicy",
    customer: "Fenwick Street Market",
    po: "PO 4505-38864",
    product: "Samyang Ramen Extra Spicy",
    stageId: "invoice",
    exceptionId: "duplicate-billing",
    priority: "medium",
    ageInStageDays: 4,
    exposure: "$2,800",
    nathanCall:
      "Fenwick thinks they were billed twice for one delivery, and until I trace the document flow I cannot tell them whether it is a re-run or a real duplicate. Four days in, this needs an answer before it turns into a short payment on the next remittance. I would rather confirm the valid invoice and cancel the extra one now than argue about it after they have already deducted it.",
  },
  {
    id: "pinehaven-quattro-cheese",
    customer: "Pinehaven Retail Group",
    po: "PO 4506-29915",
    product: "Buldak Quattro Cheese",
    stageId: "resolution",
    exceptionId: null,
    priority: "low",
    ageInStageDays: 1,
    exposure: "—",
    nathanCall:
      "This one earns its spot on the board by being clean. It moved through every stage without a hold, the credit question never came up, and the only thing left is closing the record. A triage queue that shows nothing but fires is not telling the truth about the whole book of orders.",
  },
];

/* ------------------------------------------------------------------ */
/* Triage scoring.                                                     */
/* The queue is not sorted by feel. Every order gets a score built     */
/* from four visible factors, and the UI shows the math, because a     */
/* priority you cannot explain is a priority you cannot defend in a    */
/* Monday operations review. All inputs are synthetic and labeled.     */
/* ------------------------------------------------------------------ */

export type TriageFactorId = "exposure" | "age" | "cash" | "exception";

export interface TriageFactor {
  id: TriageFactorId;
  label: string;
  points: number;
  /** Plain-language line shown in the UI. Visible copy: no arrows, no em dashes. */
  detail: string;
}

export interface OrderTriage {
  score: number;
  factors: TriageFactor[];
}

export interface TriageBand {
  id: "work-now" | "today" | "monitor";
  /** Word shown beside the glyph. Never color alone. */
  word: string;
  glyph: string;
}

/** Parse the synthetic exposure string into whole dollars. "—" reads as zero. */
export function exposureDollars(order: SapOrder): number {
  const match = order.exposure.match(/\$([\d,]+)/);
  return match?.[1] ? Number(match[1].replace(/,/g, "")) : 0;
}

const stageIndexOf = (stageId: string): number => {
  const idx = FLOW_STAGES.findIndex((s) => s.id === stageId);
  return idx >= 0 ? idx : 0;
};

/**
 * The rubric, stated once so the UI can teach it honestly:
 * dollars at risk (1 point per $500, capped at 12), days sitting in the
 * current stage (1 point per day, capped at 9), how close the failure sits
 * to cash (the stage index, 0 through 7, because late failures are the
 * hardest to unwind), and whether an exception is open at all (5 points,
 * a clean order scores zero here).
 */
export function triageOrder(order: SapOrder): OrderTriage {
  const stage = FLOW_STAGES[stageIndexOf(order.stageId)]!;
  const dollars = exposureDollars(order);

  const exposurePts = Math.min(12, Math.round(dollars / 500));
  const agePts = Math.min(9, order.ageInStageDays);
  const cashPts = stageIndexOf(order.stageId);
  const exceptionPts = order.exceptionId ? 5 : 0;

  const factors: TriageFactor[] = [
    {
      id: "exposure",
      label: "Dollars at risk",
      points: exposurePts,
      detail:
        dollars > 0
          ? `${order.exposure} unresolved. One point per $500, capped at 12.`
          : "No dollar exposure yet. Zero points.",
    },
    {
      id: "age",
      label: "Age in stage",
      points: agePts,
      detail: `${order.ageInStageDays} day${order.ageInStageDays === 1 ? "" : "s"} sitting at ${stage.label}. One point per day, capped at 9.`,
    },
    {
      id: "cash",
      label: "Proximity to cash",
      points: cashPts,
      detail: `${stage.label} is stage ${cashPts + 1} of ${FLOW_STAGES.length}. The later the failure, the harder it is to unwind.`,
    },
    {
      id: "exception",
      label: "Open exception",
      points: exceptionPts,
      detail: order.exceptionId
        ? "An exception is open on this order. Five points."
        : "Clean. Monitoring only, zero points.",
    },
  ];

  return { score: factors.reduce((sum, f) => sum + f.points, 0), factors };
}

/** Score bands, each carrying a word and a glyph so color is never the signal. */
export function triageBand(score: number): TriageBand {
  if (score >= 18) return { id: "work-now", word: "Work now", glyph: "◆" };
  if (score >= 10) return { id: "today", word: "Today", glyph: "▲" };
  return { id: "monitor", word: "Monitor", glyph: "○" };
}

export type QueueSort = "score" | "age" | "exposure";
export type QueueFilter = "all" | "exception" | "clean";

/** Sort a copy of the queue. Ties break toward age, then queue order. */
export function sortQueue(orders: SapOrder[], sort: QueueSort): SapOrder[] {
  const keyed = orders.map((o, i) => ({ o, i, triage: triageOrder(o) }));
  keyed.sort((a, b) => {
    const primary =
      sort === "score"
        ? b.triage.score - a.triage.score
        : sort === "age"
          ? b.o.ageInStageDays - a.o.ageInStageDays
          : exposureDollars(b.o) - exposureDollars(a.o);
    if (primary !== 0) return primary;
    if (b.o.ageInStageDays !== a.o.ageInStageDays) return b.o.ageInStageDays - a.o.ageInStageDays;
    return a.i - b.i;
  });
  return keyed.map((k) => k.o);
}

export function filterQueue(orders: SapOrder[], filter: QueueFilter): SapOrder[] {
  if (filter === "exception") return orders.filter((o) => o.exceptionId !== null);
  if (filter === "clean") return orders.filter((o) => o.exceptionId === null);
  return orders;
}
