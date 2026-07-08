# Deployment Clarity SOP

## Purpose

Prevent the strongest employer-facing work from living in the wrong file.

A hiring manager should not be sent an old static preview while the polished employer layer exists only inside the React source.

## Step 1 — Identify the deployed entry point

Check the Vercel project settings and local file structure.

Confirm:

- Which branch is deployed.
- Which build command is used.
- Which output directory is served.
- Whether `index.html` loads `src/main.tsx`.
- Whether `preview.html` is only a standalone preview or the actual shared demo.

## Step 2 — Run local build checks

Run:

```bash
npm install
npm run build
npm run verify:data
```

If any command fails, stop and fix before copy edits.

## Step 3 — Open local production build

Run the local preview command used by the project, usually:

```bash
npm run preview
```

Then verify:

- First visible screen includes the employer intro or a clear path to it.
- “Explore with Nathan” is available.
- Operator Notes can be turned on.
- Order-to-Cash Process Intelligence exists.
- Final employer close exists.

## Step 4 — Compare with `preview.html`

Open `preview.html` separately.

If it does not include the employer layer, clearly label it as an old static preview or port the employer layer into it.

Do not let two versions compete.

## Step 5 — Decide the single shareable version

Choose one:

### Preferred

Deploy the React / Vite app and make that the only link Nathan sends.

### Acceptable

Port the employer layer into the standalone preview if the preview is the only reliable shareable artifact.

## Step 6 — Final report

At the end, report:

- Actual deploy entry point.
- Whether `preview.html` is used.
- Whether the employer layer appears on the public link.
- Build result.
- Data verification result.
- Files changed.
- Remaining risks.
