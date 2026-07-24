# Recommendation 02 — SAP SD Object Mapping (name the object each case touches)

## Why this exists (role fit)
The JD lists "extensive experience using SAP, particularly the Sales & Distribution (SD)
module, including order entry, pricing, delivery, billing, customer master data, and
order management" as a top requirement. FireFlow already has an Order-to-Cash chapter
framed as an "SAP SD aligned workflow study." The gap: the intake collects PO, SO,
invoice, and SKU but never connects a case to the SAP SD object a real analyst would
open. Tagging each case type to its SD object is the highest-value keyword move in the
whole build, because it demonstrates the SD literacy the posting scans for, without
ever claiming implementation experience.

## What to build
1. A **case type → SD object** map added to the intake taxonomy, surfaced as one line on
   the routing summary: "SAP SD object (aligned): …".
2. A hover glossary for the SAP terms (VA03, VL03N, VF03, condition record, KNVP partner
   functions, ATP, IDoc), reusing the Recommendation 05 glossary primitive.
3. A "Open the order-to-cash chapter" link on order/pricing/deduction cases that jumps
   to the existing `#o2c` section, so the intake and the process study reinforce each
   other.

## Researched facts to use (standard SD process knowledge, not implementation claims)
The order-to-cash document flow: `Inquiry → Quotation → Sales Order → (Pricing / ATP) →
Outbound Delivery → Picking/Packing → Goods Issue → Billing → Accounts Receivable →
Payment`. Each step copies from the prior document, so status is traceable end to end.

Case type → SD object mapping (the core deliverable):

| FireFlow case type | SAP SD object / transaction (aligned) | What an analyst opens |
|---|---|---|
| Order status | Sales order + document flow (VA03), delivery VL03N, goods-issue status | Header/item + status |
| Pricing review / mismatch | Condition record / pricing procedure (VK13) | Pricing analysis on the order item |
| Short shipment / fill rate | Delivery picking, confirmed qty; schedule-line ATP (VL03N) | Picked qty vs order schedule line |
| Late delivery | Outbound delivery + goods issue (VL03N) | Delivery status, route |
| Invoice / billing dispute | Billing document vs delivery/order (VF03) | Compare invoice to delivery and PO |
| Deduction / chargeback | Credit memo request (CR) or returns (RE); open AR item | Doc type CR/RE against the payer |
| Master data setup / correction | Customer master, partner functions (KNVP), condition records (BP / VK11) | Sold-to, ship-to, bill-to, payer |
| EDI order did not post | Inbound ORDERS IDoc in error (WE02 / BD87) | Order-entry failure before an order exists |

Supporting facts worth a tooltip:
- **Partner functions** (sold-to AG, ship-to WE, bill-to RE, payer RG) live in table KNVP,
  not the general address record. A "wrong invoice recipient" case is a bill-to/partner
  function issue.
- **Pricing** is the condition technique: condition type, access sequence, condition
  record, pricing procedure. A pricing mismatch is almost always a missing/expired
  condition record or wrong pricing procedure determination, not a code defect.
- **ATP (available-to-promise)** runs at the schedule-line level and confirms the
  delivery date.
- **Goods issue (PGI)** is the pivotal event: it reduces inventory and posts the first
  accounting document.
- **Blocks**: delivery block stops VL01N; billing block stops VF01; credit block is a
  status released in VKM1.
- **EDI** enters SD as IDocs (ORDERS/850 in, ORDRSP/855 out, DESADV/856 out,
  INVOIC/810 out). Failed inbound ORDERS IDocs are their own support queue.

## How it weaves into the build
- **Model enhancement:** add `sapObject` (label + optional t-code) and `o2cLink` to each
  category in `intake.ts`. Render one summary row and, where relevant, the jump link.
- **New/expanded page (optional):** deepen the existing `#o2c` chapter with the document
  flow diagram and the case-type map above as a small table, so the intake row links to
  a real explainer.
- **Glossary:** SAP terms become a `sap` dictionary in the shared glossary system.

## Honesty guardrails (non-negotiable, from CLAUDE.md)
- Framing stays "SAP SD aligned workflow study." Never claim a live SAP instance, an
  integration, tenure, or "8 years of SAP."
- Word the object line as "SAP SD object (aligned)" so it reads as a conceptual mapping.
- All order numbers, IDoc references, and screenshots stay synthetic and labeled.

## Acceptance criteria
- Order, pricing, delivery, billing, deduction, and master-data cases each show the
  correct SD object line.
- Order/pricing/deduction cases expose the `#o2c` jump link; consumer cases do not.
- Glossary hovers render for at least VA03, VF03, condition record, KNVP, ATP, IDoc.
- Honesty scan: no implementation/tenure claims anywhere in the new copy.

## Sources
- SAP OTC process (SAP Community): https://community.sap.com/t5/enterprise-resource-planning-blog-posts-by-members/sap-order-to-cash-process-sd/ba-p/13551270
- Customer master / Business Partner (SAP Learning): https://learning.sap.com/courses/fundamental-customizing-in-sap-s-4hana-sales/customizing-customer-master-data-and-the-sap-business-partner
- Condition technique (SAP Help): https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/7b24a64d9d0941bda1afa753263d9e39/d69fbe532789b44ce10000000a174cb4.html
- ATP in SAP SD (SAP Community): https://community.sap.com/t5/enterprise-resource-planning-blog-posts-by-members/available-to-promise-atp-in-sap-sd/ba-p/12894937
- Credit management / blocks (SAP PRESS): https://blog.sap-press.com/credit-management-operations-in-sap-sd-sap-erp
- IDoc inbound sales order (SAP Help): https://help.sap.com/docs/sap-solution-sales-configuration/application-help/idoc-inbound-interface-for-sales-order-creation
