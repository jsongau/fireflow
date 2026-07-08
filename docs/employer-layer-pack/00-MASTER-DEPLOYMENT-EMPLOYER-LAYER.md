# MASTER BUILD BRIEF — FireFlow Employer Layer

## Mission

You are refining FireFlow from a strong product demo into a hiring-grade customer experience operating model.

The next step is not adding more features. The next step is deployment clarity, sharper opening language, and making sure the employer layer is visible in the actual link Nathan sends.

The target reaction from a hiring manager is:

> “Whoa. This person built a working CX operating model, understands customer operations, thought about SAP SD order flow honestly, and can explain systems like a trainer.”

## Primary outcome

Make the deployed FireFlow experience prove three things within the first 30 seconds:

1. Nathan can think in systems.
2. Nathan can translate customer operations into usable workflows.
3. Nathan understands SAP SD / Order-to-Cash concepts honestly without overstating direct SAP implementation experience.

## Non-negotiable deployment check

Before editing copy or visuals, confirm the actual deploy path.

Determine whether the public Vercel link is using:

- `index.html` with the React / Vite app mounted through `src/main.tsx`
- or the standalone `preview.html`

If `preview.html` is the visible version, port the employer layer into `preview.html` or update the deployment so the React version is the visible version.

Do not assume. Verify.

## Employer layer required on the visible site

The visible deployed version must include:

- Employer intro
- “Enter FireFlow” mode
- “Explore with Nathan” mode
- Operator Notes toggle
- SAP SD aligned Order-to-Cash chapter
- Role-to-feature evidence map
- Nathan’s Read sections
- Final employer close
- Clear honesty line about SAP scope
- No dead CTAs
- No hidden employer material that a recruiter would miss

## Core positioning

FireFlow is not merely a product catalog.

FireFlow is a customer experience operating model for a consumer products company. It demonstrates how product knowledge, customer communication, order flow, escalation, billing friction, issue resolution, and continuous improvement can live in one clear system.

## Opening copy target

The first screen should answer four questions quickly:

1. What is this?
2. Who built it?
3. Why did he build it?
4. How should the employer explore it?

Recommended direction:

> FireFlow is an independent customer experience operating model I built for the Manager, Customer Experience opportunity at Samyang America.
>
> It shows how I think through product knowledge, order flow, customer communication, escalation, billing friction, issue resolution, and continuous improvement.
>
> Explore it as a working product, or turn on Operator Notes to see the decisions behind each workflow.

Buttons:

- Enter FireFlow
- Explore with Nathan

## Fourth-wall principle

The product should stay immersive. Nathan’s voice should appear as an optional training and operator layer, not as random popups.

The employer should feel guided, not interrupted.

Use:

- Entry framing
- Optional Operator Notes
- Inline “Nathan’s Read” panels
- Margin notes on desktop
- Expandable cards on mobile
- Final close panel

Avoid:

- Repeated modals
- Self-congratulatory callouts
- Notes on every component
- Resume walls
- Fake metrics
- Claims that imply direct SAP implementation experience

## Site architecture goal

The experience should have two clean modes:

### 1. Product Mode

The employer can browse FireFlow as if it is a real CX product.

Tone: operational, polished, product-native.

### 2. Nathan Mode

The employer sees why the product is built the way it is.

Tone: experienced operator, trainer, SOP writer, system thinker.

## SAP / Order-to-Cash naming

Visible section title:

> Order-to-Cash Process Intelligence

Supporting label:

> SAP SD aligned workflow study

Approved honesty line:

> FireFlow is not an SAP implementation and does not claim access to Samyang’s systems. It is an independent front end operations concept that shows how Nathan understands the customer-facing workflow around order entry, pricing, delivery, billing, customer information, ownership, and resolution.

## Required role connection line

Add this near the employer intro or evidence section:

> For a consumer products company, customer experience is not only answering messages. It is knowing the product, understanding the order, protecting the customer relationship, and making sure Sales, Supply Chain, Finance, Quality, and Operations are working from the same truth.

## Build order

1. Confirm deployment path.
2. Make employer layer visible in the deployed version.
3. Tighten EmployerIntro copy.
4. Rename and refine SAP / Order-to-Cash section.
5. Add the role-to-feature evidence map.
6. Strengthen Operator Notes using the approved voice files.
7. Add or refine the final employer close.
8. Run build and QA.
9. Report changed files and the final URL behavior.

## Final QA standard

The project is not complete until:

- The public link opens to the employer intro or makes the employer layer obvious.
- “Explore with Nathan” turns on the note layer.
- “Enter FireFlow” lets the product stand on its own.
- The SAP section is honest and visible.
- The role evidence map is easy to scan.
- Mobile does not bury the notes.
- No primary actions are broken.
- No console errors.
- No unsupported claims.
- No hidden or duplicate versions confuse deployment.
