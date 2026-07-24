# Recommendation 05 — Obangsaek Glossary + a Reusable Hover-Term System

## Why this exists (role fit + brand fit)
Two goals in one build. First, a **reusable glossary primitive** (`<GlossaryTerm>`) that
gives any term in the site a hover/tap definition. That primitive powers the SAP SD,
EDI, and KPI tooltips in Recommendations 01–04, which is where the operational credit
lives. Second, an **obangsaek (Korean five-color) layer** that ties the product's
palette to Korean culture. Samyang America is positioned as a Gen Z Korean food brand;
showing that Nathan connected the visual system to Korea's traditional color philosophy
reads as brand fluency and care, not just operations. It is a warm, human touch on an
otherwise operational portfolio.

## What to build
1. A shared **`GlossaryTerm` component + `glossary` data module** with multiple
   dictionaries: `sap`, `edi`, `kpi`, `obangsaek`. Hover on desktop, tap on touch, fully
   keyboard-accessible, colorblind-safe (dotted underline replacement uses a marker
   glyph, not color alone), respects reduced motion.
2. An **obangsaek dictionary** with the five colors, each mapped to its direction,
   element, season, and meaning, plus a short brand line.
3. A small, optional **"Five colors" strip** near the Brand Universe / Methodology
   section that presents obangsaek respectfully with a one-line food connection.

## Researched facts to use (accuracy of Korean terms matters most)
**Obangsaek** (오방색, "five direction colors") comes from eumyang-ohaeng (yin-yang and
the five elements). The five cardinal colors:

| Color | Korean (romanized + Hangul) | Direction | Element | Season | Meaning |
|---|---|---|---|---|---|
| Blue/Green | Cheong 청 | East | Wood | Spring | Youth, vitality, growth, new life |
| Red | Jeok 적 (also Hong 홍) | South | Fire | Summer | Passion, energy, life force; wards off evil |
| Yellow | Hwang 황 | Center | Earth | — | The center; nobility, sacredness (imperial) |
| White | Baek 백 | West | Metal | Autumn | Purity, truth; "the white-clad people" |
| Black | Heuk 흑 | North | Water | Winter | Wisdom, rest, the end of a cycle |

Supporting facts (optional deeper tooltips or the strip):
- **Ogansaek** (오간색) are the five secondary colors made by blending obangsaek. Sources
  vary on the exact list, so hedge with "commonly given as…" if named.
- Real-world uses: **saekdong** (rainbow-striped children's hanbok sleeves, worn for
  first-birthday doljanchi; embodies warding off evil and praying for blessings),
  **bojagi** (wrapping cloth, "wrapping of luck"), **dancheong** (temple/palace
  painting), **hanbok**.
- Food: Korean cuisine deliberately balances five colors and five flavors. Bibimbap is
  the classic showcase (yellow yolk center, green vegetables, red gochujang, white rice,
  black mushrooms). This is a tasteful, accurate bridge from color to Samyang's food.

Language note for accuracy: in Korean, one word historically covers blue and green
(*pureun*), so *cheong* spans blue-green; in cooking the "blue" slot is usually filled by
green. Note this in the tooltip rather than forcing "blue."

## How the FireFlow palette maps (respectful, not forced)
The existing "Buldak Night" tokens already lean red/gold. Map lightly and honestly:
- Accent red (`--accent`) → **Jeok** (fire, south, energy) — the Buldak heat.
- Gold (`--gold`) → **Hwang** (earth, center, nobility).
- The cool operator system (`--op-accent`) → **Cheong** (wood, east, growth) — a natural
  home for the "Nathan's Notes" voice.
- Cream/paper surfaces → **Baek** (metal, west, purity).
- Deep near-black surfaces → **Heuk** (water, north, wisdom).
Present this as "how I read the palette against obangsaek," clearly a designer's note,
never a claim about Samyang's official brand system.

## How it weaves into the build
- **New primitive:** `src/components/primitives/GlossaryTerm.tsx` + module CSS.
- **New data:** `src/data/glossary.ts` exporting the four dictionaries.
- **Reuse everywhere:** Recommendations 01–04 wrap their key terms in `<GlossaryTerm>`.
- **Optional strip:** an obangsaek panel in `#brands` or `#methodology`.

## Honesty + respect guardrails
- Keep Korean terms, directions, elements, and meanings accurate; cite sources in the
  data file comments.
- Where sources diverge (jeok vs hong, ogansaek list), hedge, do not assert one canon.
- Frame the palette mapping as a personal design reading, not Samyang brand doctrine.
- Respectful tone: this is cultural appreciation tied to the brand's own heritage, kept
  brief and accurate, never costume or cliché.

## Accessibility
- `GlossaryTerm` is a `<button>`/`<abbr>` with `aria-describedby`; opens on hover, focus,
  and tap; Escape/blur closes; the affordance is a marker glyph plus a dotted underline,
  never color alone; respects `prefers-reduced-motion`.

## Acceptance criteria
- `GlossaryTerm` works with keyboard and touch, and passes a colorblind check.
- All five obangsaek entries render with correct direction/element/meaning.
- SAP/EDI/KPI terms in the other recommendations use the same primitive.
- Copy passes the style sweep; `tsc -b` green.

## Sources
- Obangsaek (Wikipedia): https://en.wikipedia.org/wiki/Obangsaek
- Korea.net (KOCIS), Korean cuisine and color palette: https://www.korea.net/NewsFocus/HonoraryReporters/view?articleId=194270
- Korean Cultural Center (KOCIS) webzine, Hansik colors: https://www.korean-culture.org/eng/webzine/202103/sub10.html
- Leehwa, Korean tradition saekdong: https://www.leehwawedding.com/blogs/leehwa-blog/korean-tradition-saekdong
- Bojagi (Wikipedia): https://en.wikipedia.org/wiki/Bojagi
- Gastro Tour Seoul, the five colors of Korea: https://gastrotourseoul.com/the-five-colors-of-korea-what-do-you-know-about-o-bang-saek/
