# FireFlow Product Intelligence

An independent, interactive Customer Experience portfolio by **Nathan J. Song**, built to support an application for **Manager, Customer Experience at Samyang America**. It is not a store and not a help desk — it is a customer-experience *operating model*, expressed as a working interface, organized around Samyang's real public U.S. product portfolio.

The goal is to *show* rather than tell: that I can organize a large consumer-product portfolio, design excellent consumer and vendor experiences, run verification-and-escalation workflows, measure things transparently, turn recurring cases into improvement, and build the front-end craft to partner credibly with Sales, Supply Chain, Finance, Quality, and technology / ERP / EDI teams.

> **Disclaimer.** FireFlow CX is an independent portfolio concept created from publicly available information. It is not affiliated with, commissioned by, or connected to Samyang America or Samyang Foods. All customers, orders, shipments, complaints, employees, metrics, financial values, lot codes, and outcomes shown are fictional and labeled as such.

## What it does

Three connected layers, threaded by one shared "selected product" so nothing ever has to be re-entered:

- **Explore** — browse the portfolio (45 normalized product families across 76 formats, four brands), filter by brand / category / spiciness / type, see transparent multi-axis rankings, compare products head-to-head, and open a per-format product dossier.
- **Resolve** — turn a specific retailer or distributor question into a verified, routed, governed case; a resolution simulator walks it through a full lifecycle (reported, verified, routed, resolution proposed, customer updated, resolved, improvement review). There is no individual-consumer complaint path; every case is raised by a trade account.
- **Command** — a manager's synthetic case queue, product-signal / continuous-improvement loop, and brand overview.

Every product fact is labeled by origin (**official / public retail signal / editorial / synthetic**), allergens and preparation are bound to the exact format, rankings show their inputs and confidence, and serious matters (allergen, injury, foreign material, tampering) route to specialist escalation without diagnosing or giving medical advice.

## Tech

React + Vite + TypeScript, custom token-driven CSS (no UI kit), a shared state store, a typed product/rankings/scenario data model, and an accessibility-first component layer (keyboard operable, reduced-motion aware, status shown as icon/pips **plus** word — never color alone). Theme: a dark "Buldak Night" system (charcoal + molten red/ember + gold).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # full typecheck + production bundle -> dist/
npm run verify:data  # data-integrity check (45 families / 76 variants, references valid)
```

An earlier single-file prototype (`preview.html` + `preview-data.js`) is retained for reference only. It is **out of sync** with the current app and is not canonical. The React app in `src/` is the product.

## Documentation

- `docs/homepage/` — the planning set (information architecture, ranking model, state model, interaction map, visual system, job-to-feature map, master build plan).
- `docs/enhancements/` and `docs/explorations/` — component design specs and option studies.
- `CASE_STUDY.md` — how each feature maps to the target role's responsibilities.
- `PROJECT_STATE.md` · `DECISIONS.md` · `CHANGELOG.md` · `DATA_SOURCES.md` · `KNOWN_LIMITATIONS.md` — project governance and honest boundaries.

## Honest limitations

Product imagery is drawn from public sources (reference use); operational data is synthetic and labeled; spiciness ratings are an editorial mapping aligned to Buldak's public five-level scale (to be confirmed per product before being treated as official); vendor specifications that would require an approved sell sheet are shown as unavailable rather than invented; and no real submissions, systems, sales, or SAP access are implied. See `KNOWN_LIMITATIONS.md`.
