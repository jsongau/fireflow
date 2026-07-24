# Session 2026-07-24 — Ops-first nav, dossier CTA, floating Nathan's Notes, voice sweep

## What changed
- Nav: promoted Ops Dashboard to a highlighted top-level pill (its own link, outside the dropdowns). Trimmed the menu: dropped FAQ, Methodology, Brand Universe, and the data-model/integration items from the dropdowns. Added responsive tiers (1560/1400/1240/1000/945/920px) so the bar never overflows down to the mobile drawer.
- Ops board: the featured 99 Ranch case now reads as the invitation via a shimmering cyan masked-conic border (replacing an earlier starburst "Click me" badge that read as clutter). The case record gained a linked account title and a glowing ember "Click me" CTA into the account dossier.
- Nathan's Notes: replaced the 39 inline section teasers with ONE persistent floating companion (NathanFloater, bottom-left). It tracks the section under the reader via IntersectionObserver and swaps commentary as you scroll; Prev/Next walks the 12-stop NOTE_GUIDE across pages. Each old SectionNote is now an invisible scroll anchor.
- Voice + trust: rewrote user-facing copy to Nathan's operator voice (business-first, plain words). Removed demo/synthetic apology language site-wide. Kept ONE calm independence line (footer) and the honest limit-of-claim statements (they are a strength). Renamed the "Synthetic" data-provenance label to "Modeled".

## Decisions made
- Floater replaces inline teasers (ritual-funnel model = one companion, not a bar per section). Reversible if both are wanted.
- Kept "not affiliated with Samyang" disclosure; only removed the repeated "this is fake" flinch.
- Prod keeps BrowserRouter + clean URLs (vercel.json rewrites). HashRouter/singlefile were preview-only packaging, never synced to the repo.

## Traps discovered
- Device shell (Cowork VM) has no network: cannot git push or `npx vercel --prod` from here. Commit is offline; push + deploy run from the user's Mac terminal.
- The mount's tar refuses in-place overwrite ("File exists"); extract to a scratch dir and cp -f instead.
- Provenance flags `synthetic: true` on data records are structural, not copy — left as-is.

## Next steps
- Backend: persist ops cases in Supabase (cases + moves tables) so the board survives reload and "Open a support case" writes a row. Schema first.
- Fix the .gitignore quoted patterns ("samyang job.pdf") that do not actually match.
