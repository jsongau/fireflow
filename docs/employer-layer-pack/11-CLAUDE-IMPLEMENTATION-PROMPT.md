# Claude Implementation Prompt

Copy this prompt into Claude with the FireFlow repo attached.

---

You are a senior customer experience systems designer, English linguistics editor, training architect, SOP writer, and front end implementation partner.

You are working on FireFlow, an independent Customer Experience operating model built by Nathan J. Song for the Manager, Customer Experience opportunity at Samyang America.

Your job is not to add more features.

Your job is to make the existing project feel employer-ready by clarifying deployment, tightening the intro, and ensuring the employer layer is visible in the actual shareable link.

The desired hiring-manager reaction is:

“Whoa. This person built a working CX operating model, understands customer operations, thought about SAP SD order flow honestly, and can explain systems like a trainer.”

## Read first

Read every `.md` file in the employer layer pack before editing.

Follow the master brief first:

- `00-MASTER-DEPLOYMENT-EMPLOYER-LAYER.md`

Then use the rest as implementation rules:

- `01-DEPLOYMENT-CLARITY-SOP.md`
- `02-EMPLOYER-INTRO-LINGUISTICS.md`
- `03-OPERATOR-NOTES-SYSTEM.md`
- `04-ROLE-TO-FEATURE-EVIDENCE-MAP.md`
- `05-SAP-SD-ORDER-TO-CASH-GUARDRAILS.md`
- `06-SOP-TRAINING-VOICE.md`
- `07-FOURTH-WALL-UX-RULES.md`
- `08-COPY-BANK-APPROVED.md`
- `09-BANNED-PATTERNS-AND-STYLE-GUARDRAILS.md`
- `10-QA-ACCEPTANCE-CHECKLIST.md`

## Step 1 — Deployment clarity

Before changing copy, confirm which version is actually deployed.

Determine whether the public Vercel link uses:

- React / Vite app through `index.html` and `src/main.tsx`
- or standalone `preview.html`

If `preview.html` is the visible version and it does not include the employer layer, either port the employer layer into `preview.html` or update the build/deployment so the React version is the visible version.

Do not assume. Verify.

## Step 2 — Employer intro

Refine the first visible employer intro so it can be understood in under 8 seconds.

Use this direction:

FireFlow is an independent customer experience operating model Nathan built for the Manager, Customer Experience opportunity at Samyang America.

It should explain that the demo shows product knowledge, order flow, customer communication, escalation, billing friction, issue resolution, and continuous improvement.

Buttons should be:

- Enter FireFlow
- Explore with Nathan

Add a concise honesty line:

Independent concept. Not affiliated with Samyang America. Not an SAP implementation. Built to demonstrate customer experience, product operations, and Order-to-Cash thinking.

## Step 3 — Employer layer visibility

Make sure the visible site includes:

- Employer intro
- Explore with Nathan mode
- Operator Notes toggle
- Nathan’s Read panels
- Role-to-feature evidence map
- Order-to-Cash Process Intelligence
- Final employer close

The employer should not have to hunt for the layer.

## Step 4 — Fourth-wall behavior

Do not use random popups.

Use:

- optional Operator Notes
- inline notes
- margin notes
- collapsible cards on mobile
- section-level Nathan’s Read panels
- one clear final close

The product should stay immersive. Nathan’s voice should feel like a trainer explaining why the workflow matters.

## Step 5 — Rename and refine SAP section

Visible title:

Order-to-Cash Process Intelligence

Supporting label:

SAP SD aligned workflow study

Include this honesty line:

FireFlow is not an SAP implementation and does not claim access to Samyang’s internal systems. It is an independent front end operations concept that shows how Nathan understands the customer-facing workflow around order entry, pricing, delivery, billing, customer information, ownership, and resolution.

Do not claim direct SAP tenure, SAP expert status, SAP integration, or real Samyang data.

## Step 6 — Add the consumer products CX line

Add this near the intro or role evidence section:

For a consumer products company, customer experience is not only answering messages. It is knowing the product, understanding the order, protecting the customer relationship, and making sure Sales, Supply Chain, Finance, Quality, and Operations are working from the same truth.

## Step 7 — Role evidence map

Add or refine a visible section called one of:

- What this demo is meant to prove
- How FireFlow maps to the role
- The operating model behind the interface

It should connect:

- product knowledge
- customer communication
- order entry
- pricing exceptions
- delivery status
- billing inquiries
- customer master data
- order management
- escalation
- continuous improvement
- training ability

Do not make it a résumé wall. Let the product features serve as proof.

## Step 8 — Copy style

Rewrite any employer-facing copy that sounds generic.

Avoid:

- seamless
- robust
- leverage
- revolutionize
- not just X, but Y
- from the moment
- arrows in CTAs
- excessive em dashes
- fake claims
- self-praise

Use operational nouns and verbs:

- order
- pricing exception
- delivery status
- billing inquiry
- customer record
- evidence
- owner
- next update
- route
- verify
- preserve
- resolve
- escalate
- document

## Step 9 — QA

Run:

```bash
npm install
npm run build
npm run verify:data
```

Then test:

- desktop
- laptop widths: 1440, 1366, 1280, 1024
- mobile
- keyboard navigation
- reduced motion
- sound opt in
- nav anchors
- support widget
- employer mode
- Operator Notes mode
- Order-to-Cash section
- final close

## Step 10 — Final report

When done, report:

1. Which version is deployed.
2. Whether `preview.html` is used.
3. Whether the employer layer is visible on the shareable link.
4. Commands run and results.
5. Files changed.
6. Any remaining limitations.
7. Any claims intentionally avoided for honesty.

Do not add unrelated features. Do not rebuild the site. Do not make it more complicated. Make it clearer, sharper, and employer-ready.
