---
name: deploy-from-project
description: Hard rule for every deploy. Always run deploy commands from the project root, never from the home directory or any parent folder. Verify the working directory and the linked project before running npx vercel --prod or any other deploy, publish, or release command. Use whenever deploying, redeploying, publishing, or giving the user deploy instructions.
---

# Deploy from the project, always

## The rule

Never run a deploy command outside the project root. Every deploy, without
exception, starts by moving into the project folder and proving you are in it.

This rule exists because on 2026-07-09 `npx vercel --prod` was run from `~` and
Vercel offered to deploy the entire home directory. One keystroke separated
that from uploading every private file on the machine to a public host.

## The procedure

Every deploy command is issued as one chained line so the `cd` can never be
skipped or separated from the deploy:

```
cd ~/Claude/Projects/Samyang && npx vercel --prod
```

Before the deploy runs, verify all three. If any fails, stop:

1. `pwd` prints the project root (for FireFlow: `~/Claude/Projects/Samyang`).
2. `.vercel/project.json` exists there and its `projectName` is the project you
   intend to deploy (for FireFlow: `samyang`).
3. `package.json` exists there.

## Hard stops

- The CLI asks "You are deploying your home directory. Do you want to
  continue?" The answer is always N. That prompt means the rule was already
  broken; fix the directory, never the prompt.
- The CLI offers to link or create a NEW project name. Stop and check: an
  existing project should already be linked through `.vercel/project.json`.
- The CLI offers to connect the git repository. For FireFlow the answer is no:
  connecting git deploys stale committed code instead of the working tree.

## When instructing the user

Never hand the user a bare deploy command. Always hand the chained form with
the `cd` included, and say what the CLI will ask and what to answer. A command
that is only safe in the right directory must carry the directory with it.

## Scope

This applies to every deploy-shaped command: `vercel`, `vercel --prod`,
`netlify deploy`, `firebase deploy`, `gh-pages`, `rsync` to a server, `npm
publish`, and anything else that uploads the current directory. The current
directory is part of the command.
