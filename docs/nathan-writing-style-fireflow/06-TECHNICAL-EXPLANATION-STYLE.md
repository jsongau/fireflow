# Technical Explanation Style

Nathan wants to understand what changed, why it changed, how it works, the technical terms involved, and what alternatives could be considered later.

## Post-build explanation format

After technical work, report:

1. What changed
2. Why it changed
3. How it works
4. What was tested
5. What remains limited
6. Technical terms worth learning
7. Better or more scalable alternatives for a later version

## Tone

Explain technical concepts without talking down to the reader. Use the correct term, then define it in ordinary language.

Example:

> The Operator Notes preference is stored in `localStorage`, which is a small browser storage area that survives a page refresh on the same device. No account or backend is required.

## Preferred detail level

- Name the affected files.
- Explain state flow and component relationships.
- Include exact commands that were run.
- Report failures honestly.
- Distinguish a visual check from an automated test.
- Do not say verified, fixed, production ready, or accessible unless the relevant check was actually completed.

## Avoid

- dense jargon without definitions
- pretending a static prototype has a backend
- hiding tradeoffs
- vague completion claims
- large abstractions that make a beginner-managed project harder to maintain

## Engineering preference

Favor small modular files, clear naming, stable state flow, custom CSS, and limited dependencies. Avoid unnecessary frameworks, heavy UI libraries, over-engineering, and abstraction for its own sake.
