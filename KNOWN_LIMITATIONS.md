# KNOWN_LIMITATIONS — FireFlow Product Intelligence

Honest boundaries. These are surfaced in the Methodology chapter and the footer, not buried.

## Independence & affiliation
FireFlow CX is an independent portfolio concept created from publicly available information. It is not affiliated with, commissioned by, or connected to Samyang America or Samyang Foods. All customers, orders, shipments, complaints, employees, metrics, financial values, lot codes, and outcomes shown are fictional.

## Data limitations
1. **Product imagery rights.** All product photos (the original 54 plus a later pass covering the remaining Tangle, MEP, and Samyang-branded families) come directly from samyangamerica.com's own public product pages. Formal reuse rights for a public portfolio are unresolved, same posture as the original set. This is treated as low-risk given the portfolio is explicitly built to apply to Samyang America and names its subject, but it is not a licensed use. Families with no matching photo on samyangamerica.com stay unmapped and fall back to a labeled placeholder rather than a broken image.
2. **No official sales/popularity data.** Only single-listing retail engagement snapshots exist. Rankings are multi-axis and labeled; nothing is presented as an official Samyang bestseller list.
3. **Format-specific gaps.** Full official facts exist mainly for Tier-A anchors. Non-anchor families show available fields and mark the rest editorial/unverified or "requires an approved sell sheet."
4. **Vendor logistics unknown.** Case packs, dimensions, pallet configs, wholesale pricing, shelf life, inventory — not invented. Shown as unavailable / requires an approved sell sheet.
5. **Heat is positioning, not a number.** No Scoville/scientific heat values are attached to products (no product-specific official source), to avoid invented precision.

## Capability limitations
6. **No real backend.** The prototype runs on local synthetic data. It is structured so Supabase (products, cases, evidence metadata, tasks, communications, users, roles, audit events, root causes, corrective actions) could be added later; none exists now, and none is implied to exist.
7. **No live systems.** No claim of access to Samyang systems, SAP, EDI, or any internal data. The system is integration-ready / system-agnostic.
7a. **The Retailer Order Lifecycle is a workflow study, not an EDI integration.** The X12 documents in #o2c are simplified, synthetic, and generated in the browser from one reducer; there is no parser, no VAN, no SPS Commerce connection, and no trading-partner guide compliance. The study is labeled as such on screen, its lifecycle state intentionally resets when the page is left, and reason code 22 plus all control numbers are invented. No UPCs appear anywhere in the documents.
8. **Consumers/vendors cannot submit real inquiries or orders.** The inquiry paths and simulator demonstrate a model; they do not transmit anything.

## Professional-claim limitations
9. **SAP experience is not overstated.** The project demonstrates conceptual command of order-to-cash, pricing, delivery, billing, customer master, and order management — not extensive hands-on SAP SD tenure.

## Safety limitations
10. **No medical/diagnostic function.** Potential allergic reactions, injury, foreign material, tampering, serious package-integrity, and regulatory matters route to specialist escalation. The system does not diagnose, minimize, or provide treatment advice.
11. **Facts can change.** Ingredients, allergens, packaging, and preparation may change; the current physical package is authoritative.

## Layout limitations
12. **Both gutter trays overlay content while they are open, by design.** The page shell reserves an 84px gutter on each side, which fits the 60px resting spine of the MiniNav (right) and the CompareRail (left) with clearance. Expanding either tray, by hover, keyboard focus, or pinning, widens it over the content column. That is a deliberate trade: the expansion is transient and visitor-initiated, and reserving 280px of permanent gutter would cost the content column more than the tray is worth. A pinned tray stays over the column until it is unpinned.
13. **Below 900px both gutter trays are hidden,** so on tablet and phone the only floating chrome is the SupportBar FAB. Section progress is still available at those widths through the in-page SubNav.
