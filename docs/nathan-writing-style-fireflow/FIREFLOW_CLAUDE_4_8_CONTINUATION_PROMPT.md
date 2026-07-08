# Claude Opus 4.8 Prompt: Finish FireFlow, Add Explore with Nathan, and Prepare the Employer Experience

You are Claude Opus 4.8 working inside the existing FireFlow repository.

This is a continuation of a working project. Do not rebuild it from scratch. Do not replace the visual language. Do not flatten the experience into a résumé site. Preserve the existing Buldak Night system, product intelligence architecture, shared selected-product state, React component structure, and the strongest interactions already present.

The purpose of this pass is to make FireFlow feel complete, reliable, and clearly connected to Nathan J. Song's application for **Manager, Customer Experience at Samyang America**.

The new employer layer must work through an optional entry path called **Explore with Nathan**. Once activated, the feature is called **Operator Notes**.

FireFlow must still work as a believable customer experience operating model when Operator Notes are off.

---

## First: read before editing

Read all of the following before changing code:

1. The repository `CLAUDE.md`, if present
2. `README.md`
3. `PROJECT_STATE.md`
4. `DECISIONS.md`
5. `CHANGELOG.md`
6. `KNOWN_LIMITATIONS.md`
7. `DATA_SOURCES.md`
8. `CASE_STUDY.md`
9. `docs/homepage/MASTER-FIREFLOW-HOMEPAGE-BUILD-PLAN.md`
10. `docs/homepage/04-TARGET-JOB-TO-HOMEPAGE-MAP.md`
11. `docs/homepage/10-SELECTED-PRODUCT-STATE-MODEL.md`
12. `docs/homepage/13-CONTENT-AND-BRAND-VOICE.md`
13. `docs/homepage/14-MOBILE-EXPERIENCE.md`
14. `docs/homepage/15-ACCESSIBILITY-AUDIT-AND-PLAN.md`
15. `docs/enhancements/motion-and-sound-system.md`
16. `docs/explorations/side-rail.md`
17. The full `src/` tree
18. The target job description in `samyang job.pdf`
19. Every file in the supplied `nathan-writing-style-fireflow` package, beginning with `SKILL.md`

After reading, give a brief implementation plan that names the files or component areas you expect to touch. Then continue directly into the work. Do not wait for approval unless a decision would require inventing personal contact information, résumé content, private company information, or unsupported experience.

---

## Canonical implementation

The React + Vite + TypeScript application under `src/` is the canonical product.

Treat `preview.html` and `preview-data.js` as a legacy or archival demonstration unless you intentionally bring them into parity after the React work is complete. Do not spend the main implementation budget maintaining two independent products.

Update project documentation so this hierarchy is unambiguous.

---

## Non-negotiable product rules

- Preserve the Buldak Night visual identity.
- Preserve the current product data model and source labeling.
- Preserve the distinction between official, public retail signal, editorial, and synthetic information.
- Preserve the selected-product thread across the homepage.
- Do not invent backend behavior.
- Do not imply access to Samyang systems, customers, employees, sales, orders, inventory, or performance data.
- Do not claim Nathan has professional SAP SD tenure that he cannot defend.
- Do not add a large UI library, state library, animation library, or sound library unless there is a proven need that cannot be met cleanly with the current stack.
- Keep the project understandable and maintainable by a beginner working with Claude.
- Prefer small modular files and clear component boundaries.
- Do not redesign unrelated sections merely because you would have built them differently.

---

# Phase 1: establish a verified baseline

Run these commands before feature work:

```bash
npm install
npm run build
npm run verify:data
```

Record the actual results.

The current known baseline is:

- `npm run build` succeeds.
- `npm run verify:data` fails because `scripts/verify-data.ts` imports through the `@/` alias and `tsx` is not resolving that alias in this command.

Repair the data verification path cleanly. A simple relative import is acceptable if it keeps the script clear. A configuration fix is also acceptable if it is small and reliable. Do not add a heavy dependency for this.

After the repair, both commands must pass.

Also run a static scan for:

- broken in-page anchors
- invalid nested interactive controls
- duplicate IDs
- visible arrows
- em dash sentence separators
- underline-only hover styling
- links that route to missing sections

Document the findings before or while fixing them.

---

# Phase 2: repair confirmed interaction and architecture defects

## 2.1 Fix vendor routing

There is no valid top-level `#vendor` destination in the React page.

Current confirmed problem areas include:

- `src/components/home/ProductDossier/ProductDossier.tsx`
- `src/components/home/ComparisonLab/ComparisonLab.tsx`

Vendor actions must:

1. Set `userMode` to `vendor`.
2. Preserve or set the relevant selected product.
3. Route to the shared `#resolve` section.
4. Present the vendor path as active when the section appears.

Scan the full repository for every `#vendor` reference and remove any dead route.

## 2.2 Remove nested anchors and buttons

The code currently includes patterns where an anchor contains the shared `Button` component. That creates invalid nested interactive controls and inconsistent keyboard behavior.

Confirmed areas include:

- `ProductSignalHero`
- `ProductDossier`
- `InquiryPaths`

Refactor the primitive system so a button-styled link is rendered as one interactive element.

A clean solution may include one of these approaches:

- Add an anchor variant to the shared button system.
- Add an `as` or `href` path that renders the correct native element.
- Apply shared button classes to anchors through a dedicated component.

Choose the smallest maintainable solution. Keep native semantics correct.

## 2.3 Repair the mobile selected-product rail

The desktop rail was moved below the sticky navigation, but the mobile version can still wrap into several sticky rows.

At narrow widths, replace the full desktop control set with a compact one-row summary:

- product thumbnail
- shortened product name
- current mode
- one clear expand control

The expanded state should open a compact drawer or disclosure panel with:

- consumer care
- vendor support
- add to compare
- view compare count
- reset
- current format and heat context when available

Requirements:

- The collapsed rail must remain one row at 390px.
- It must not hide section headings after anchor navigation.
- It must not consume a large part of the viewport.
- The expanded controls must be keyboard accessible.
- The expanded state must close with Escape.
- Focus behavior must be logical.
- Desktop behavior should remain rich and useful.

Centralize sticky offsets. Do not scatter hard-coded top values across components.

Test at these viewport widths:

- 390px
- 768px
- 1024px
- 1440px

## 2.4 Resolve documentation drift

Update `PROJECT_STATE.md`, `README.md`, `CHANGELOG.md`, and any conflicting notes so they describe the real current state.

The React app is now the canonical implementation. Do not continue calling the older single-file build the finished primary deliverable if it lacks newer chapters or behavior.

Clearly state what remains legacy, what is canonical, and what commands have actually passed.

---

# Phase 3: build the Explore with Nathan entrance

Create a restrained employer-context entry layer at the top of the experience.

This must not feel like an unrelated landing page pasted in front of FireFlow. It should feel like the cover card for a serious interactive case study.

## Required content

Use wording close to this, refined through Nathan's writing style package:

**Independent application concept by Nathan J. Song**

FireFlow is a customer experience operating model created for the Manager, Customer Experience opportunity at Samyang America. It demonstrates how Nathan approaches product knowledge, order management, customer communication, escalation, resolution, and continuous improvement.

Nathan brings more than eight years across consumer products, retail customer operations, billing, customer communication, process training, and complex issue resolution.

FireFlow is not affiliated with Samyang America and does not represent access to its internal systems. Product information comes from public sources. Customers, orders, cases, metrics, and outcomes are synthetic and labeled.

## Required entry actions

Provide two primary actions:

- **Enter FireFlow**
- **Explore with Nathan**

Behavior:

- `Enter FireFlow` continues with Operator Notes off.
- `Explore with Nathan` continues with Operator Notes on.
- The visitor can change the setting later.
- The choice should persist locally on the same device.
- The visitor should not be forced through the full entrance on every return.
- Provide a quiet way to reopen the introduction.
- Do not use a blocking full-screen takeover that feels like an ad.

The recruiter should understand within five seconds:

- who built FireFlow
- which role it supports
- that it is independent
- that it is a working concept
- that operational data is synthetic

---

# Phase 4: create the Operator Notes system

The employer-facing mode is entered through **Explore with Nathan**. Inside the product, call the feature **Operator Notes**.

## 4.1 State and persistence

Add a clear state field such as:

```ts
operatorNotesEnabled: boolean
```

Persist only this preference and other non-sensitive interface choices.

Do not store inquiry text, personal information, or pretend submissions in persistent storage unless the data is clearly synthetic and limited to the current demonstration.

Add actions that clearly express intent, such as:

- `SET_OPERATOR_NOTES`
- `TOGGLE_OPERATOR_NOTES`

Update reset behavior carefully. Resetting a selected product should not unexpectedly erase the visitor's chosen narration preference unless the control explicitly says it will.

## 4.2 Shared component

Create a reusable Operator Note component with a clear visual identity separate from the product UI.

Possible component family:

```text
src/components/employer/OperatorNote/
src/components/employer/OperatorNotesToggle/
src/components/employer/EmployerIntro/
src/components/employer/EmployerClose/
```

The component should support:

- eyebrow or label: `Nathan's read`
- short title
- concise body copy
- optional role connection
- optional expandable detail
- dismiss or collapse behavior where useful
- correct heading structure
- reduced motion support

It should not look like:

- a system error
- a real Samyang internal annotation
- a chat bubble
- a cartoon speech bubble
- a tooltip covering the interface
- a résumé card

## 4.3 Placement limit

Use no more than six major Operator Note moments across the main experience.

Recommended placements:

1. Portfolio normalization
2. Consumer and vendor inquiry routing
3. Resolution workflow and escalation ownership
4. SAP SD aligned order-to-cash chapter
5. Command Center and team accountability
6. Product Signals and continuous improvement

The SAP chapter may continue changing one note based on the selected stage. That counts as one note system, not eight simultaneous interruptions.

## 4.4 Narration rule

Operator Notes must explain judgment, not clicks.

Do not write:

> Click the product to open its details.

Write:

> A customer sees one flavor, but the operation may see several formats, packages, preparation methods, and data records. I normalized the portfolio so the interface stays simple without erasing the differences that matter.

Use the supplied writing style package. Keep the notes short enough that the product remains the main experience.

## 4.5 Operator Notes control

Add a quiet control in the navigation or another globally reliable location:

**Operator Notes: On**

or

**Operator Notes: Off**

Requirements:

- clear accessible name
- visible focus state
- works with keyboard
- no color-only state
- no crowded mobile placement
- preference persists
- turning notes off removes the commentary without changing product selections

---

# Phase 5: strengthen the employer connection without creating a résumé wall

## 5.1 Add an employer evidence section

Create a compact section that answers:

**What this demonstrates**

Do not paste the full job description into the page. Organize the evidence by capability:

- Customer operations and order management
- Escalation standards and complex issue resolution
- Cross-functional coordination
- Team process and training
- Metrics and accountability
- Continuous improvement
- SAP SD aligned learning and order-to-cash understanding

Each capability should link to or reference a working part of FireFlow.

Example structure:

```text
Capability
What FireFlow demonstrates
What informed Nathan's approach
Open the relevant chapter
```

Keep each item concise. Use progressive disclosure if needed.

## 5.2 Add the final employer close

Create a final section before the footer using wording close to this:

**Why I built FireFlow**

I built FireFlow because a résumé can list responsibilities, but it cannot fully show how someone thinks through a complicated operation. My background is in consumer products, retail customer operations, billing, customer communication, process training, and complex issue resolution. FireFlow shows how I organize information, make ownership visible, protect the customer experience, and turn repeated problems into a better process.

Add actions for:

- **View Nathan's experience**
- **Open Nathan's résumé**
- **Discuss the role**

Important:

- Use an existing résumé only if one is supplied in the project.
- Use an existing email or contact destination only if it is supplied.
- Do not invent contact details.
- If a destination is missing, create a single clearly documented configuration file or constant and hide the unavailable action in production until configured.
- Do not publish a dead button.

---

# Phase 6: upgrade the inquiry experience into a real local demonstration

The current support bar routes the visitor to the inquiry section but does not complete a satisfying submission demonstration.

Build a polished local inquiry flow for both consumer and vendor paths.

## 6.1 Inquiry modal or dialog

Use a native accessible dialog pattern or a carefully implemented modal.

The form should inherit the selected product and format. Do not ask the visitor to re-enter information already in shared state.

Suggested fields:

### Consumer

- selected product and format
- issue type
- purchase context
- what happened
- evidence available
- preferred update method as a synthetic demonstration field

### Vendor

- selected product and format
- order or account context using clearly synthetic sample values
- issue type
- affected quantity or shipment context
- evidence available
- operational urgency

Do not collect real sensitive information. Do not ask for health details. Do not claim the form sends data to Samyang.

## 6.2 Submission result

On submit:

1. Validate required fields.
2. Create a clearly synthetic local case ID.
3. Show a polished confirmation state.
4. Explain the route, owner, evidence, and update commitment.
5. Allow the visitor to open the case in the Resolution Simulator or Command Center.
6. Add the local synthetic case to the current in-memory command queue when practical.

Preferred confirmation voice:

> Case FF-2047 was added to the synthetic queue. The product, issue, evidence, routing decision, and update commitment are now connected. Review the case or continue through the resolution stages.

Never say an inquiry was sent to Samyang or stored on a real server.

## 6.3 Modal requirements

- focus moves into the dialog
- focus is contained while open
- Escape closes the dialog
- focus returns to the triggering control
- background content is not keyboard interactive while the dialog is open
- visible close control
- clear cancel action
- scroll works on small screens
- no clipped content at 390px
- success and validation states are announced to assistive technology

---

# Phase 7: add restrained sound and interaction polish

Sound must support the experience, not turn the site into a game.

## 7.1 Central sound system

Create a small centralized sound controller using the Web Audio API or small local assets already approved for use.

Requirements:

- muted by default
- activated only after a user gesture
- global sound toggle
- preference stored locally
- low volume
- no hover sounds
- no autoplay
- no repeated sound while scrolling
- no external audio dependency
- no sound required to understand state

Suggested sound moments:

- Operator Notes mode activated
- product selected
- comparison item added
- inquiry case created
- resolution milestone completed

Use distinct but related tones. The submission confirmation may have the richest sound, but it should still feel professional.

## 7.2 Motion

Keep motion purposeful:

- entrance framing reveal
- Operator Note expansion
- mobile rail drawer
- case confirmation
- command queue insertion

Respect `prefers-reduced-motion`. Avoid long parallax, excessive bounce, constant pulsing, or motion that delays access to content.

---

# Phase 8: global writing-style pass

Run the supplied Nathan writing-style system over every visible React string, not only the SAP chapter.

Scan for and rewrite:

- em dash sentence separators
- visible arrows and arrow chains
- generic AI language
- `not just X, but Y`
- `seamless`
- `robust`
- `leverage`
- vague `Learn more` CTAs
- overly dense explanation
- claims that sound stronger than the evidence
- repeated disclaimers where one clear disclosure would work better

Do not blindly remove punctuation from code comments or data tokens where it is technically meaningful. The priority is visible copy.

Keep standard terms such as order-to-cash, cross-functional, first-person, and end-to-end when grammatically useful.

Also remove underline-only hover effects where they conflict with the current visual system. Use a deliberate color, background, border, or transform change while preserving visible link affordance.

---

# Phase 9: SAP honesty and interview defensibility

The SAP chapter is a learning and workflow demonstration.

Add or refine a clear line near the chapter entrance:

> FireFlow is not an SAP implementation. This chapter demonstrates how I understand the operational sequence around order entry, pricing, delivery, billing, customer records, deductions, and resolution. It also shows how I would approach learning and supporting the company's SAP SD environment.

Transaction codes may appear as secondary glossary references, labeled as common SAP references. Do not make transaction-code recall the primary proof of competence.

Do not write or imply:

- SAP expert
- extensive hands-on SAP tenure
- built in SAP
- integrated with SAP
- implemented SAP SD
- real Samyang order data
- production-ready SAP platform

The strongest evidence is the operational logic:

- required data
- dependencies
- exception visibility
- ownership
- customer communication
- pricing differences
- delivery commitments
- billing disputes
- deductions
- corrective action

---

# Phase 10: accessibility, responsive, and functional QA

## Required automated commands

Run and report:

```bash
npm run build
npm run verify:data
```

Also add a small repository script for internal link and visible-copy checks if it can be done without a heavy dependency. It should catch at least:

- missing in-page anchor targets
- `href="#vendor"`
- nested anchor and button patterns where statically detectable
- duplicate IDs where detectable
- banned visible arrow characters

Do not pretend a regex scan proves full accessibility.

## Required browser checks

Use the browser and test at:

- 390px
- 768px
- 1024px
- 1440px

At each size, verify:

- navigation
- entrance choice
- Operator Notes toggle
- selected-product rail
- product selection
- comparison actions
- consumer path
- vendor path
- inquiry modal
- success state
- Resolution Simulator handoff
- Command Center handoff
- SAP stage interaction
- final employer close
- footer links

## Keyboard checks

Verify:

- skip link
- navigation and mobile menu
- segmented controls
- product cards and compare controls
- Operator Notes toggle
- Operator Note disclosures
- mobile rail disclosure
- modal focus behavior
- Escape behavior
- focus restoration

## Console checks

The completed experience must have:

- no uncaught errors
- no missing key warnings
- no failed local asset requests
- no broken anchors
- no dead buttons

## Reduced motion and sound checks

- reduced-motion mode removes nonessential movement
- sound remains muted until enabled
- no interaction depends on sound
- sound preference survives refresh

---

# Phase 11: documentation and handoff

Update:

- `README.md`
- `PROJECT_STATE.md`
- `CHANGELOG.md`
- `KNOWN_LIMITATIONS.md`
- `CASE_STUDY.md`

Create or update documentation for:

- Operator Notes architecture
- employer entry behavior
- inquiry modal and local synthetic case flow
- sound consent and sound events
- responsive rail behavior
- contact and résumé configuration
- exact tests run

At the end, provide a structured report with:

1. What changed
2. Why it changed
3. How the new state and component flow works
4. Files created
5. Files edited
6. Commands run and exact results
7. Viewport and keyboard checks completed
8. Remaining honest limitations
9. Technical terms Nathan should learn from this pass
10. Better or more scalable alternatives for a later version

Do not write that the project is complete, verified, production ready, or accessible unless the listed checks actually passed.

---

# Multi-agent execution plan

Use parallel agents only where they reduce risk. Do not allow several agents to edit the same files at once.

Recommended division:

### Agent 1: read-only reliability audit

Inspect anchors, interactive semantics, state persistence, current scripts, documentation drift, and responsive sticky behavior. Return findings only.

### Agent 2: read-only writing and claims audit

Use the Nathan writing style package and the job description. Identify visible copy that is generic, repetitive, overstated, or inconsistent. Return exact file and line recommendations only.

### Agent 3: read-only accessibility and interaction audit

Review the planned entrance, toggle, disclosure, modal, mobile rail, sound consent, and keyboard behavior. Return risks and acceptance criteria only.

### Primary implementation agent

Own all code edits, integration, testing, and documentation updates. Incorporate audit findings without allowing agents to create competing architectures.

---

# Definition of done

This pass is complete only when all of the following are true:

- The React app remains the canonical build.
- `npm run build` passes.
- `npm run verify:data` passes.
- No `#vendor` dead routes remain.
- No anchor contains a native button.
- The mobile selected-product rail stays compact at 390px.
- Anchor navigation does not hide headings behind sticky elements.
- The opening identifies Nathan, the target role, the independent nature of the concept, and synthetic data within five seconds.
- `Enter FireFlow` works with Operator Notes off.
- `Explore with Nathan` works with Operator Notes on.
- Operator Notes can be toggled later without changing product state.
- No more than six major narration moments appear.
- Operator Notes explain judgment rather than obvious clicks.
- Consumer and vendor inquiry dialogs work.
- Submission creates a clearly synthetic local case and a meaningful confirmation.
- The case can move into the Resolution Simulator or Command Center.
- Sound is off by default and consent based.
- Reduced motion is respected.
- A final employer close exists.
- Missing résumé or contact destinations are not fabricated or published as dead actions.
- SAP positioning is honest and interview-defensible.
- Visible copy passes Nathan's style audit.
- Documentation reflects the real final state.
- The final report includes exact test results and remaining limitations.

Proceed carefully. Improve the existing product. Do not replace it.
