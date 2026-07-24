# Recommendation 03 — EDI / SPS Commerce Channel Awareness

## Why this exists (role fit)
The JD says "experience with SPS Commerce or similar EDI platforms is preferred" and the
role owns end-to-end order-to-cash for retailers and distributors. In real CPG, those
orders arrive as EDI documents, and a large share of deductions trace back to EDI
failures (late ASN, invoice mismatches, label/compliance chargebacks). Showing that
FireFlow knows how a case arrives, and can name the EDI transaction behind it, signals
Nathan understands the plumbing of retail order management, not just the front desk.

## What to build
1. An **order-channel** signal on retailer/distributor/broker cases: EDI (with the
   transaction set), Portal, Email/Manual. Shown as a small pill on the details step and
   a summary line.
2. An **EDI document reference** where relevant (850 PO, 856 ASN, 810 invoice), so an
   order-status or invoice case can name the exact transaction in play.
3. A hover glossary for the EDI transaction sets (850, 855, 856, 810, 852, 820, 997) and
   for SPS Commerce, ASN, and GS1-128 / SSCC.
4. Optional: an **"EDI order did not post"** internal case type (inbound ORDERS IDoc in
   error), which links this recommendation to the SAP SD map in Recommendation 02.

## Researched facts to use (accurate X12 / retail EDI, keep volumes synthetic)
Core retail EDI transaction sets:

| # | Name | Direction | Purpose |
|---|---|---|---|
| 850 | Purchase Order | Retailer → Supplier | The electronic PO that starts the order |
| 855 | PO Acknowledgment | Supplier → Retailer | Accept / reject / accept-with-change |
| 860 | PO Change | Retailer → Supplier | Revise or cancel a prior 850 |
| 856 | Advance Ship Notice (ASN) | Supplier → Retailer | Electronic packing slip sent before delivery; carries the SSCC |
| 810 | Invoice | Supplier → Retailer | Must reconcile to the 850 and 856 |
| 852 | Product Activity Data | Retailer → Supplier | POS sales + inventory for replenishment |
| 820 | Payment / Remittance | Retailer → Supplier | Which invoices are paid, and deductions taken |
| 997 | Functional Acknowledgment | Both | Technical "your file arrived and parsed" |

Facts worth a tooltip or an Operator Note:
- **SPS Commerce** is the largest retail EDI network; its Fulfillment product holds each
  retailer's maps and compliance rules so suppliers do not build them per partner.
  Retailers mandate EDI to standardize onboarding, so it is effectively table stakes to
  trade with national retail.
- **850 → ERP order:** an ERP cannot consume raw EDI; a translator (or SPS) maps the 850
  into a sales order. In SAP that is the inbound ORDERS IDoc.
- **ASN + labels → chargebacks:** every carton carries a GS1-128 label (older name
  UCC-128) encoding an SSCC; the retailer scans it and matches it to the 856. A late,
  missing, or mismatched ASN is the single largest driver of compliance chargebacks.
- **810 vs 856 vs 850 mismatches** (billing more than the ASN shipped, wrong PO number,
  bad totals) cause short-pays. The fix is driving the 810 and 856 from the same
  fulfillment data and blocking transmission until they reconcile.
- Industry sources estimate EDI errors can cost 1–5% of gross invoice value in
  chargebacks (illustrative, not Samyang).

## How it weaves into the build
- **Model enhancement:** add `orderChannel` to account/vendor cases and an optional
  `ediRef` label. Render a channel pill on Step 3 and a summary line on Step 4.
- **Cross-link:** compliance and short-shipment cases point to the deduction path
  (Recommendation 04); "EDI did not post" points to the SAP SD IDoc object
  (Recommendation 02).
- **Glossary:** an `edi` dictionary in the shared glossary system.
- **Optional page:** a compact "How a retail order actually arrives" strip inside the
  Order-to-Cash chapter, showing 850 → order → 856 → 810 → 820 with the chargeback
  pressure points marked.

## Honesty guardrails
- All PO/ASN/invoice numbers stay synthetic and labeled.
- SPS Commerce and GS1 are described from public documentation; no claim of a live
  connection or that Samyang uses any specific setup.
- The 1–5% chargeback figure is labeled an industry illustration.

## Acceptance criteria
- Retailer/distributor/broker cases show an order-channel pill and, where relevant, an
  EDI document reference.
- Glossary hovers render for 850, 856, 810, 997, ASN, SPS Commerce, GS1-128/SSCC.
- Copy passes the style sweep; `tsc -b` green.

## Sources
- EDI Basics, transaction sets: https://www.edibasics.com/edi-transaction-sets/
- TrueCommerce, EDI transaction codes: https://www.truecommerce.com/blog/edi-transaction-codes/
- SPS Commerce, Fulfillment EDI: https://www.spscommerce.com/products/fulfillment/edi/
- SPS Commerce, UCC-128 label: https://www.spscommerce.com/edi-document/ucc-128-label/
- SAP Community, SD EDI ORDERS 850: https://community.sap.com/t5/enterprise-architecture-blog-posts/sap-sd-edi-orders-850-interface-configuration-complete-setup-guide/ba-p/14430807
- Orderful, EDI compliance errors and chargebacks: https://www.orderful.com/blog/edi-compliance-errors-retailer-chargebacks
- Commport, EDI chargebacks: https://www.commport.com/edi-chargebacks/
