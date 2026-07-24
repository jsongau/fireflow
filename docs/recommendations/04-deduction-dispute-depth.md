# Recommendation 04 — Deduction Dispute Depth (make the deduction path a showcase)

## Why this exists (role fit)
The JD calls out "deductions, and order disputes" and "driving long-term corrective
actions," and lists Deduction Aging as a service metric. Deductions are where Customer
Experience, Finance, Sales, and Supply Chain either coordinate or fail, and they are a
real margin problem in CPG (deductions plus trade spend can run ~30% of gross sales).
Turning the deduction path into a small, governed sub-flow shows Nathan understands the
money, the clock, and the cross-functional handoff, which is exactly what this role is
accountable for.

## What to build
1. A **deduction type** selector on the deduction/chargeback case (trade/promo, shortage
   OS&D, pricing, compliance/OTIF, returns, freight), each carrying its likely owner and
   the backup it needs.
2. A **validity + dispute-window** panel: a valid/invalid/needs-research state, a dispute
   window with a countdown framing, and a Days Deductions Outstanding note.
3. A **required backup checklist** (POD, BOL, PO, invoice, ASN, pricing/promo agreement)
   that changes by deduction type.
4. Reinforce the "fix it upstream" Operator Note with the root cause for that deduction
   type.

## Researched facts to use (industry-general, label synthetic)
Deduction categories:
- **Trade / promotional** — off-invoice allowances, scan-based/bill-back, markdowns,
  MDF/co-op, coupons. Largest by dollars, hardest to validate (must match a promo that
  may have run months earlier).
- **Shortage / OS&D** (over, short, damaged) — retailer received fewer/more/damaged vs
  billed. Prove shipped vs scanned.
- **Pricing** — retailer paid a different (often stale) cost; a leading cause of invalid
  deductions.
- **Compliance / vendor chargebacks** — OTIF fines, ASN/label violations, routing,
  pallet config. Small individually, "death by a thousand cuts" in aggregate.
- **Returns / RA** — unsaleable or authorized returns; gray area on what counts.
- **Freight** — detention, late delivery, carrier penalties.

Valid vs invalid:
- Invalid (not owed): duplicate claims, already-paid events, penalty on the wrong
  vendor, stale-cost pricing, vague admin fees.
- Roughly 5–10% of deduction dollars are invalid for most brands; ~40% of companies
  report invalid rates of 10%+. Post-audit deductions can be up to half erroneous.
- "Invalid" does not equal "recovered." Well-run programs recover a large majority
  (often cited ~70%+) of the invalid charges they actually dispute in time.

Lifecycle and ownership:
`Identify (remittance / EDI 820 / portal) → research + gather backup → code + determine
validity → accept or dispute → resolve + log outcome.`
- AR / deductions analyst owns intake, coding, filing, clearing.
- Sales / Trade / Broker validates promotional deductions.
- Supply Chain / Logistics owns shortage, OS&D, freight, compliance backup.
- Customer Experience / Order-to-Cash is the natural coordinator across all three plus
  the retailer. The recurring failure mode: finance emails ops emails sales while the
  dispute window closes.

Windows and aging:
- Dispute windows are hard deadlines (illustrative: Walmart ~90 days, Target ~60, Costco
  ~60, Kroger ~45, Amazon Vendor ~30). Miss it and a valid claim is unrecoverable.
- **Days Deductions Outstanding (DDO)** = open deductions / average daily deductions;
  common target under ~20 days. Age in buckets (0–30 / 31–60 / 61–90 / 90+).

Required backup:
- **POD** (proof of delivery, receiver-signed) for prepaid; **BOL** (carrier-signed) for
  collect; **PO + invoice**; **ASN / packing list**; **pricing agreement** for pricing;
  **promo agreement / trade calendar** for promo; **photos** where count/condition is
  contested.

## How it weaves into the build
- **Model enhancement (primary):** extend the deduction case with a `deductionType`
  selector; each type maps to owner, required backup, window, and root cause. Render the
  validity + window panel and the backup checklist on Step 3/4.
- **Cross-links:** compliance deductions link to the EDI/ASN facts (Recommendation 03);
  shortage deductions link to the SAP delivery object (Recommendation 02); the window
  and DDO tie to the service-metric glossary (Recommendation 01).
- **Optional page/panel:** a compact "deduction lifecycle" strip (identify → research →
  validity → dispute → resolve) with the owner under each step, reusable in the Command
  Center.

## Honesty guardrails
- All amounts, PO/deduction numbers, and windows are synthetic and labeled; retailer
  window examples are illustrative, not Samyang policy.
- Recovery/invalid percentages are labeled industry ranges.

## Acceptance criteria
- The deduction case shows a type selector; owner, backup checklist, window, and root
  cause all change with the type.
- Validity state is shown with a glyph and word (colorblind-safe), never color alone.
- Copy passes the style sweep; `tsc -b` green.

## Sources
- iNymbus, CPG trade claims and deductions: https://blog.inymbus.com/cpg-trade-claims-and-deductions-explained
- iNymbus, disputing invalid deductions: https://blog.inymbus.com/disputing-invalid-deductions
- CPGvision, mastering deduction management: https://www.cpgvision.com/blog/how-to-master-deduction-management-in-the-cpg-industry
- HighRadius, Days Deductions Outstanding: https://www.highradius.com/resources/Blog/calculating-the-age-of-open-deductions-with-days-deductions-outstanding/
- SupplierWiki, dispute deductions and recover revenue: https://supplierwiki.supplypike.com/articles/how-to-dispute-deductions-and-recover-revenue
- RetailPath, Walmart OTIF fines: https://retailpath.xyz/articles/walmart-otif-fines
