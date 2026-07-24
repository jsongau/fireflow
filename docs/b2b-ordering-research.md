# B2B Online Bulk Ordering Research Brief

Context: research to inform the FireFlow Product Intelligence portfolio prototype (a Customer Experience artifact for a Samyang America Manager, CX application). Samyang America sells Buldak and related products to retailers and distributors, not individual consumers. This brief covers how trade customers order in bulk online, how quotes and standing orders work, and the order-to-cash and service-metrics vocabulary a CX manager owns. All prototype data will remain synthetic and labeled. This document is research only; it does not claim any real Samyang systems or metrics.

---

## Executive summary

B2B ordering for a food and CPG brand looks nothing like consumer checkout. The buyer is a purchasing contact at a retailer or distributor who orders by the case or pallet, against negotiated pricing, on credit terms, and often against a compliance program (OTIF, EDI, routing guides) with financial penalties attached. The four flows the FireFlow prototype should model map cleanly onto how real trade commerce works:

1. **Bulk / case ordering** is the everyday path. Customers order in case-pack multiples, above a minimum order quantity (MOQ), at a price that steps down by volume tier, shipped to a specific location, with a PO number and net payment terms. Modern platforms (Shopify B2B, BigCommerce B2B, Faire, and brand trade portals) all encode case packs, MOQ, volume pricing, quick-order pads, and net terms as first-class features.

2. **Request for quote (RFQ)** is the path when price is not fixed and public: large volumes, new accounts, custom terms, or promotional buys. The buyer submits requirements (items, volume, ship-to, requested terms, target date) and a human or a CPQ engine responds within an SLA that ranges from same-day to several days depending on complexity, then converts the accepted quote into an order.

3. **Standing orders / subscription replenishment** automate recurring buys on a cadence (weekly, biweekly, monthly), can auto-generate the PO, and tie directly to fill rate and forecast accuracy. At the sophisticated end this becomes vendor-managed inventory (VMI), where the supplier manages the customer's stock levels against agreed thresholds and consumption data.

4. **Order-to-cash and service metrics** are the language the CX manager lives in: fill rate, OTIF (on-time-in-full), service level, order cutoff, lead time, deductions and chargebacks, and the EDI transaction set (850 purchase order, 856 ASN, 810 invoice) exchanged through networks like SPS Commerce, all flowing through an SAP SD order cycle of inquiry, quotation, sales order, delivery, and billing.

The design implication section translates each of these into concrete fields, steps, and states for the four prototype flows.

---

## 1. B2B / wholesale online ordering and bulk-order UX

### The unit of ordering is the case, not the item

Trade customers do not buy singles. Products are sold in **case packs** (for example, a case of 6, 12, or 24 units), and the ordering UI enforces ordering in case-pack increments so the warehouse never has to break a case. Shopify B2B implements this as **quantity rules**: a minimum, a maximum, and a required increment per product, set at the variant level. If a product is boxed in tens, the increment rule forces purchases of 10, 20, 30, and so on. This reduces picking errors and matches how the goods physically move.

### Minimum order quantity (MOQ) and opening vs reorder minimums

A **minimum order quantity** sets the floor for an order, protecting the supplier's per-order economics. Faire (a large wholesale marketplace) is a useful reference: brands set an **opening order minimum** (the first order a new retailer places, often with low minimums or free returns to reduce trial risk) separately from a **reorder minimum** for returning buyers. The MOQ can be expressed as a unit count, a case count, or a dollar threshold on the whole cart.

### Volume pricing and tiers

B2B pricing is negotiated and tiered, not a single public price. **Volume pricing** offers price breaks as quantity rises, and on Shopify B2B the displayed unit price changes dynamically as the buyer adjusts quantity, so a buyer sees the tier they qualify for in real time. Different customer groups (for example, distributor vs independent grocer) can be assigned different catalogs and price lists.

### Order-by-SKU: quick-order pads and CSV upload

Because trade buyers reorder known items in volume, the fast path is **not** browsing a catalog. It is:

- A **quick-order form / order pad** where the buyer types SKUs and quantities directly for fast repeat ordering.
- **CSV upload** of a SKU-and-quantity list for large orders, common on BigCommerce B2B and other enterprise platforms.
- **Reorder from history / saved lists**, so a buyer can repeat a prior order in a click.

Catalog browsing still exists for discovery, but the everyday motion is SKU-driven.

### Ship-to selection, lead times, and order cutoffs

A single B2B account (the "sold-to" company) often has many **ship-to** locations (stores, DCs, warehouses). The order flow must let the buyer pick the ship-to, which drives lead time, freight, and sometimes price. Two time concepts matter:

- **Lead time**: the interval between order placement and delivery.
- **Order cutoff**: the daily or weekly deadline after which an order rolls to the next shipping window. Cutoffs are how suppliers batch picking and honor delivery cadences.

### PO number, credit terms, and checkout

B2B checkout is built around procurement, not a credit card:

- **PO number entry**: buyers reference their internal purchase order number, which they expect to see carried onto the invoice.
- **Net payment terms**: the order is placed on credit, commonly **Net 30**, with **Net 60** and **Net 90** for larger or strategic accounts. Net 30 (pay within 30 calendar days of invoice date) is the most common. Faire, for instance, extends eligible retailers Net 60 while paying the brand up front.
- **Credit limit enforcement**: at submission the system knows the account's outstanding balance and whether the new cart would exceed the approved credit limit, and can block or route for approval.
- Payment options at checkout typically include net terms, PO, and ACH, with a line of credit for larger accounts.

As of April 2026, Shopify made foundational B2B features (company profiles, multiple catalogs, volume pricing, quantity rules, and net payment terms) available on its lower-tier plans, which signals how standard these building blocks now are.

### Reference platforms

- **Shopify B2B / Plus wholesale channel**: quantity rules, volume pricing, company profiles, catalogs, net terms, quick order.
- **BigCommerce B2B Edition**: quick-order pads, CSV upload, quote requests, buyer roles.
- **Faire and Mable**: marketplace model connecting brands to independent retailers, with opening-order minimums, case sizes, and net terms handled by the platform.
- **Brand trade portals** (dedicated ordering sites for retail/distributor accounts): the pattern the FireFlow prototype most resembles.

---

## 2. Request for quote (RFQ) and price-inquiry flows

### When and why buyers request a quote instead of instant checkout

RFQ is the inbound process where a buyer specifies requirements **before a price exists**. Unlike retail checkout where price is fixed and public, a quote request opens a dialogue: the buyer submits requirements and the seller responds with tailored pricing. B2B buyers use RFQ when:

- Volume is large enough to negotiate a better break than the standard tier.
- The account is new and has no assigned price list yet.
- The buyer wants custom terms (extended dating, freight allowance, promotional pricing).
- Products are configured, made to order, or not openly priced.

### What a quote request captures

Typical fields on an RFQ:

- **Requesting company and contact** (name, email, phone, company); configurable as required or optional.
- **Line items**: product / SKU, variant, and requested quantity (often case or pallet counts) per line.
- **Ship-to** location(s).
- **Requested terms** (for example, desired net terms or dating).
- **Target / requested delivery date**.
- **Notes / message** for context.

### Routing and SLA / turnaround

Quotes route to a sales rep, an account manager, or a CPQ (configure-price-quote) engine. Turnaround varies widely by vertical: industry ranges run from roughly 48 hours to about three weeks, with custom-engineered manufacturing quoting against roughly four-week SLAs. Modern automated quote management targets **minutes to same-day for standard quotes**, and **24 to 48 hours for complex quotes** that need multi-tier approval. Well-run operations attach ownership and SLAs to the flow (portal manager, ERP integration owner, order-operations owner, CS lead), rather than leaving it ad hoc.

### Quote-to-order conversion

The goal is to collapse a multi-day back-and-forth into minutes or hours. A quoting portal with real-time pricing and inventory (ATP, available to promise), automated order entry, and status visibility lets an accepted quote convert into an order without rekeying. The quote carries its line items, agreed price, and terms straight into the order, and status (submitted, in review, quoted, accepted, expired) is visible to the buyer throughout.

---

## 3. Standing orders and subscription replenishment for wholesale

### Recurring / scheduled orders

**Recurring orders** are automated purchases scheduled at regular intervals (weekly, monthly, or a custom cadence) so the buyer does not re-enter the same order each cycle. They fit any customer who replenishes the same items repeatedly, which is exactly the retail and foodservice pattern (a distributor restocking the same Buldak SKUs every week). Suppliers can run auto-replenishment **per ship-to location** against that location's historical consumption, for example a beverage distributor replenishing restaurants or a coffee roaster replenishing cafes.

### Auto-PO generation

At the automated end, systems analyze stock levels, committed sales, incoming orders, and vendor costs to **generate purchase orders automatically** on the cadence or when a threshold is crossed, reducing manual procurement work.

### Tie to fill rate and forecast accuracy

Standing orders give the supplier forward visibility of demand, which improves **forecast accuracy** and lets the supplier stage inventory so the recurring order ships complete. That directly protects **fill rate** (the share of ordered units actually shipped) and, downstream, OTIF. Predictable recurring demand is easier to fulfill in full and on time than spiky ad-hoc demand.

### Vendor-managed inventory (VMI), at a high level

**VMI** is a collaborative model where the **supplier** manages the customer's stock levels using real-time consumption data and agreed min/max thresholds, rather than waiting for the customer to place each PO. Shifting replenishment responsibility to the supplier reduces the customer's manual procurement, lowers carrying costs, and improves forecast accuracy. It is the mature form of standing-order replenishment and a credible "future state" concept for a CX-owned account program.

---

## 4. Order-to-cash and service-metrics vocabulary for a CX manager

This is the operational language the role owns. Definitions below are drawn from retail-supply-chain and EDI sources.

### Fill rate

The percentage of a customer's ordered quantity that is actually shipped from available stock without backorder. Order 1,000 units, ship 900, and the fill rate is 90 percent. It is the "in-full" half of OTIF.

### OTIF (on-time-in-full)

A retail supply-chain metric measuring whether a shipment arrived **on the agreed delivery date** with **100 percent of the ordered quantity**. An order passes only if **both** conditions are met. Walmart pioneered the modern OTIF program in 2017 with a 98 percent compliance threshold and a 3 percent cost-of-goods penalty on non-compliant cases. Other major retailers run their own versions under different names (for example, Target's On Time and fill-rate metrics, Kroger's ORAD, Costco's ASN-driven delivery accuracy).

### Service level

The broader commitment to fulfill demand within a target (often expressed as a target fill rate or in-stock percentage). OTIF and fill rate are how service level is measured against retail customers.

### Order cutoff and lead time

**Order cutoff** is the deadline after which an order moves to the next shipping window; **lead time** is the interval from order to delivery. Both are set in the routing guide / trading agreement and both feed OTIF, because "on-time" is measured against the delivery date the lead time and cutoff imply.

### Deductions and chargebacks

When a supplier misses a compliance requirement, the retailer **deducts** a fee from payment (a chargeback) to cover the disruption. Categories include OTIF penalties, ASN errors, shortage claims, routing violations, and post-audit deductions. They compound across thousands of shipments, dispute windows close quickly, and they erode margin and lengthen DSO. Disciplined deduction management (with evidence such as signed proof of delivery, warehouse shipping docs, and EDI acknowledgment timestamps) keeps more invoices paid in full and shortens days sales outstanding.

### EDI transaction set and SPS Commerce

Retail and foodservice trading runs on **EDI** (electronic data interchange). The core transactions a CX manager references:

- **850**: purchase order (the retailer's order to the supplier).
- **856**: advance ship notice (ASN), telling the retailer exactly what is coming, including carton counts, item quantities, and SSCC-18 labels that must match the physical pallets. ASN errors are among the most frequent compliance-deduction categories for brands new to retail fulfillment.
- **810**: invoice (the supplier's bill to the retailer).

**SPS Commerce** is a widely used EDI network and full-service provider that handles these documents and connects to ERP, WMS, and TMS systems; it has established connections with foodservice distributors (for example, US Foods, Reinhart FoodService), which is directly relevant to a food brand's distributor channel.

### SAP SD order flow

In **SAP Sales and Distribution (SD)**, the order-to-cash cycle runs in a standard sequence: **Inquiry, then Quotation, then Sales Order, then Delivery (picking, packing, goods issue), then Billing (invoice).** Key document types include IN (inquiry), QT (quotation), and OR (standard order); delivery and billing are separate documents. The **sold-to** and **ship-to** parties are distinct partner functions on the order, mirroring the company-and-ship-to structure of B2B ordering above. This is the transaction backbone the CX role's order management sits on.

---

## 5. Design implications for the FireFlow prototype

Recommendations below are concrete fields, steps, and states for each of the four flows. All should render with synthetic, clearly labeled data, and follow the project's accessibility rules (never state-by-color-alone; add a glyph, word, or shape).

### Flow A: Bulk / case ordering (the everyday path)

**Steps:** select account and ship-to, add items (quick-order pad primary, catalog secondary), review cart against rules, enter PO and terms, submit, confirmation.

**Fields and controls:**
- Account (sold-to) selector, then **ship-to location** selector.
- **Quick-order pad**: SKU plus quantity rows, with **CSV upload** and **reorder-from-history** as accelerators.
- Per line: enforce **case-pack increment** and **MOQ**; show unit and case counts.
- **Volume pricing** that updates unit price live as quantity crosses a tier; show current tier and the next break.
- Cart-level minimum (units, cases, or dollars) with a clear "you need X more to meet minimum" state.
- **PO number** field.
- **Payment terms** shown (Net 30 / 60), and a **credit-limit** check at submit.
- **Lead time** and **order cutoff** displayed (for example, "order by 2pm Thursday for next-week delivery").

**States:** below MOQ / below case increment (blocked with reason), over credit limit (blocked or routed for approval), draft, submitted, confirmed. Show estimated delivery date derived from lead time and cutoff.

### Flow B: Price / quote inquiry (RFQ)

**Steps:** build request, submit, track status, receive quote, accept and convert to order.

**Fields:**
- Requesting contact and company (prefilled from account).
- Line items: SKU, requested quantity (cases or pallets) per line.
- Ship-to.
- **Requested terms** (desired net terms / dating).
- **Target delivery date**.
- Notes.

**States and SLA:** submitted, in review, quoted (with agreed price, terms, and an **expiration date**), accepted, expired, declined. Display a **turnaround SLA** (for example, "standard quotes same business day, complex quotes 24 to 48 hours") so the buyer knows what to expect. On accept, **convert to order** carrying line items, price, and terms without rekeying.

**When to surface RFQ over instant order:** new account with no price list, quantities above the top volume tier, or a request for custom terms. The prototype can show a "Request a quote" affordance appearing when an order trips one of these conditions.

### Flow C: Subscription / standing order (replenishment)

**Steps:** choose items and quantities, set cadence and ship-to, set start date, confirm, manage.

**Fields:**
- Line items with case-pack quantities (reuse Flow A rules).
- **Cadence**: weekly, biweekly, monthly, or custom.
- **Ship-to** (support per-location schedules).
- **Start date** and optional end date; next-order date shown.
- **Auto-PO** toggle (auto-generate the PO each cycle) with PO reference handling.
- Payment terms carried from the account.

**States:** active, paused, skipped-next, ended. Allow **skip**, **pause**, **edit quantities**, and **adjust cadence**. Surface the tie to service metrics: show how a standing order improves forecast visibility and helps the order ship in full. A high-end "VMI concept" note can frame the future state where the supplier manages min/max thresholds on the account's behalf (label clearly as a concept).

### Flow D: Retailer account issue / escalation

**Steps:** open case, classify, capture evidence, route, resolve, close, with SLA tracking throughout.

**Fields and issue types:** short shipment / fill-rate shortfall, late delivery / OTIF miss, **deduction or chargeback dispute**, ASN (856) error, invoice (810) discrepancy, damaged goods, pricing discrepancy.

**Per case capture:**
- Related order / PO number and ship-to.
- Issue type and description.
- **Evidence attachments** (proof of delivery, shipping docs, EDI acknowledgment timestamps) for deduction disputes.
- Dollar impact (for deductions).
- **Dispute window / due date** (deductions expire quickly).

**States and SLA:** new, acknowledged, in progress, awaiting customer, resolved, closed; won / lost / partial for disputes. Track **time-to-first-response** and **time-to-resolution** against an SLA, since these are CX-owned service metrics. Roll case data up into a service dashboard showing **fill rate, OTIF, and deduction totals** by account, which is the vocabulary the hiring role uses.

### Cross-cutting

- Model the **sold-to vs ship-to** distinction everywhere (matches SAP SD partner functions).
- Use **SAP SD order-cycle language** (inquiry, quotation, order, delivery, billing) for order status, so the artifact reads as SAP-SD-aligned without claiming a real integration.
- Reference **EDI (850 / 856 / 810)** and an EDI network (SPS Commerce) in status and issue flows to show fluency, keeping all data synthetic.
- Keep honesty rules: label everything synthetic, make no real-Samyang or real-integration claims, and frame the SAP content as an aligned workflow study.

---

## Sources

- Shopify Help Center, Setting up quantity rules and volume pricing in B2B: https://help.shopify.com/en/manual/b2b/catalogs/quantity-pricing
- Shopify Plus Wholesale Channel Guide (case packs, tiers, net terms): https://easyappsecom.com/guides/shopify-plus-wholesale-channel-guide.html
- Shopify B2B ecommerce and custom pricing guide: https://easyappsecom.com/guides/shopify-b2b-ecommerce-guide
- Selling in packs or cases on Shopify: https://programminginsider.com/how-to-sell-in-packs-or-cases-on-shopify-quick-guide-2026/
- Faire wholesale guide for retailers (opening/reorder minimums, Net 60, case sizes): https://multisellr.com/blog/faire-for-retailers-complete-guide
- Faire wholesale overview (marketplace model, net terms): https://www.cahoot.ai/faire-marketplace-fueling-b2b-retailers/
- Virto Commerce, B2B quote management from RFQ to quote-to-cash: https://virtocommerce.com/blog/b2b-ecommerce-quote-management
- Creatuity, B2B quote-to-order workflow optimization (SLA ranges, ownership): https://www.creatuity.com/insights/b2b-quote-to-order-workflow-optimization-2026/
- AddToQuote, Request a quote / RFQ form fields on Shopify: https://www.addtoquote.com/request-a-quote
- KVY Technology, quote-based ordering in B2B ecommerce: https://kvytechnology.com/blog/ecommerce/quote-based-ordering-in-b2b/
- commercetools, B2B recurring orders: https://commercetools.com/blog/b2b-product-spotlight-recurring-orders
- Swell, B2B subscription ecommerce guide: https://www.swell.is/content/b2b-subscription-ecommerce
- LooperBuy, wholesale inventory management and VMI: https://looperbuy.com/blog/mastering-inventory-management-in-wholesale-a-b2b-experts-guide-to-2025.html
- Logicbroker, B2B distributor replenishment and auto-PO: https://logicbroker.com/business-model/b2b-distributors/
- FIDELITONE, What is OTIF and avoiding chargebacks: https://www.fidelitone.com/blog/what-is-otif-how-to-meet-on-time-in-full-requirements-and-avoid-chargebacks/
- inNymbus, What is OTIF on-time-in-full: https://blog.inymbus.com/what-is-otif-on-time-in-full-explained
- SPS Commerce, working capital and OTIF / fill rate / deductions: https://www.spscommerce.com/community/articles/how-working-capital-is-affected-by-otif-fill-rate-and-deductions
- RetailPath, Walmart OTIF fines explained: https://retailpath.xyz/articles/walmart-otif-fines
- SPS Commerce Fulfillment (EDI 850 / 856 / 810): https://www.spscommerce.com/edi/
- SPS Commerce EDI with US Foods (foodservice distributor): https://www.spscommerce.com/network/find-a-partner/view/us-foods/
- SAP Community, SAP Order-to-Cash process (SD): https://community.sap.com/t5/enterprise-resource-planning-blog-posts-by-members/sap-order-to-cash-process-sd/ba-p/13551270
- SAP SD sales document types: https://www.itpathshaala.com/tutorials/sap-sd/sales-document-types.html
- Resolve, Net 30/60/90 terms guide for B2B ecommerce: https://resolvepay.com/blog/net-terms-guide-for-b2b-e-commerce-stores-manufacturing-distribution
- Optimum7, Shopify B2B payment terms Net 30 and credit limits: https://www.optimum7.com/blog/advanced-b2b-payment-terms-in-shopify-how-to-support-net-30-credit-limits-invoice-logic-at-scale.html
