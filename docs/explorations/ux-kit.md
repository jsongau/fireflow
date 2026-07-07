# Exploration — Theme / UX-kit decision surface

**Prepared:** 2026-07-07 · **Status:** Exploration, for selection · **Preview:** `previews/ux-kit.html`

Nathan wants to replace the beige/cream skin (`docs/homepage/12-VISUAL-SYSTEM.md`) with something striking and themed to Samyang's spicy brand and Korean culture. This document specifies three complete dark themes and recommends one. The preview renders each theme as the identical component sampler so they compare directly. Every theme meets WCAG AA (≥4.5:1) for body text and UI; status is always carried by an icon plus a word, never colour alone; keyboard focus is visible on every control.

All three are **dark** by default because the product packaging is the hero, and glossy Buldak photography reads best on a dark ground. Where an accent is used as text on a fill, the fill takes the shade that passes AA and that shade is named below.

Contrast ratios were computed with the WCAG relative-luminance formula. Body/UI targets are ≥4.5:1; large display type only needs ≥3:1 but every display value below also clears 4.5:1.

---

## How the sampler is built

One set of component CSS references theme variables only (`--bg`, `--panel`, `--raised`, `--text`, `--muted`, `--accent`, `--on-accent`, `--accent-text`, `--ok/--warn/--risk`, `--line`, radii, shadow, fonts). Each theme is a wrapper class (`.theme-a/.theme-b/.theme-c`) that sets those variables. Swapping the skin is swapping one class — that is the point of the exercise and mirrors how the React app themes through tokens today.

The sampler shows, per theme: a display headline plus subhead; primary / secondary / ghost / disabled buttons; a real product card (photo, name, heat pips plus word, a 매운맛 chip, View product / Compare); the four source-type badges (Official, Retail signal, Editorial, Synthetic) plus a confidence badge; a ranked row with a score bar; the on-track / attention / at-risk status states as icon plus word; and an input plus a segmented control.

---

## Option A — Buldak Night

Warm near-black charcoal, molten Samyang red and ember orange, a gold pop, warm off-white text. Heavy condensed display type. The most product-forward and the most "spicy-brand" of the three.

### Tokens

```css
.theme-a{
  /* surfaces */
  --bg:#0f0b0d;        /* warm charcoal, page ground */
  --panel:#171013;     /* cards, tables */
  --raised:#221619;    /* inputs, secondary fills, chips */
  /* text */
  --text:#f5ede4;      /* warm off-white */
  --muted:#b7a698;     /* warm grey */
  /* accent — molten red; used as FILL, text on it is near-black */
  --accent:#e8331c;
  --on-accent:#160d0b; /* near-black text on red fill */
  --accent-text:#ff8a3c;   /* ember — the shade used when the accent is TEXT on dark */
  --accent-wash:#e8331c1f; --accent-line:#e8331c55;
  --accent-shadow:0 6px 18px #e8331c40;
  /* status */
  --ok:#8fd14f;        /* lime */
  --warn:#f5b301;      /* gold */
  --risk:#ff6a4a;      /* ember-red */
  /* source types */
  --src-official:#e0a94c; --src-retail:#c8b6a6; --src-editorial:#ff8a3c; --src-synthetic:#c58bd6;
  /* lines / track / focus */
  --track:#2c1f22; --line:#ffffff14; --line-strong:#ffffff2a; --focus:#f5b301;
  /* media ground — a warm ember radial so packaging glows */
  --media-bg:radial-gradient(120% 100% at 50% 12%,#3a1e17 0%,#1a1012 55%,#0d090b 100%);
  --shadow:0 10px 34px #00000070;
}
```

### Type

- **Display:** `"Anton"` — a single-weight heavy condensed grotesque, uppercase, tight leading (`line-height:.94`). This is the "intense, premium" voice; it looks like fight-night / limited-drop packaging.
- **Body/UI:** `"Archivo"` (400–800) — a workhorse grotesque that stays legible at dashboard sizes and pairs cleanly with Anton.
- **Korean:** `"Gothic A1"` for the 매운맛 chip and any Hangul.
- Fallbacks: `system-ui, sans-serif` throughout.

### Component treatment

- Radii: buttons 8px, cards 14px. Not pill-round; squared enough to feel premium and product-led.
- Borders: hairline warm-white at `#ffffff14`, stronger at `#ffffff2a` for inputs/segmented.
- Shadow: deep, soft (`0 10px 34px #00000070`) plus a red-tinted glow under the primary button. Product images carry a strong `drop-shadow` so they lift off the ember ground.

### Contrast notes

| Pair | Ratio | Verdict |
|---|---|---|
| `--text #f5ede4` on `--bg #0f0b0d` | ~16.8:1 | Pass AAA |
| `--text` on `--panel #171013` | ~15.5:1 | Pass AAA |
| `--muted #b7a698` on `--panel` | ~8.0:1 | Pass AA |
| Primary button: `--on-accent #160d0b` on `--accent #e8331c` | ~4.8:1 | Pass AA |
| `--accent-text #ff8a3c` (ember) on `--bg` | ~8.3:1 | Pass AA |
| Molten red `#e8331c` as text on `--bg` | ~5.0:1 | Passes, but reserved |

**AA risk handled:** molten red `#e8331c` is only ~5.0:1 as text and drops toward the 4.5 line on lighter panels, and white-on-red is ~3.9:1 which **fails** for normal text. So red is used as a *fill* with near-black text (4.8:1), or as a border/wash — never as small white text on red, and never as body text. Coloured links and inline accent text use the ember `--accent-text` (8.3:1) instead. Status "at-risk" uses `--risk #ff6a4a` as the icon colour while the word stays in `--text`, so the label itself is always high-contrast.

### Korean-culture rationale

Buldak (불닭, "fire chicken") is the flagship. The palette is the brand's own: the pack red, the ember of the sauce, gold foil accents seen across the lineup. It reads as Korean spicy-noodle culture directly, without borrowing traditional motifs. The risk is that it reads as *Buldak* specifically rather than *Samyang the company* (which also owns Samyang, Tangle, MEP).

### Where it's strong / risky for an operational CX tool

- **Strong:** hero, Command preview, Brand Universe, launch-anchor storytelling. Photography looks expensive. Highest emotional pull for a portfolio piece.
- **Risky:** red is doing double duty as brand accent *and* the at-risk status colour. In dense dashboards that can blur "brand" and "alarm." Mitigation in the tokens: brand red is a fill/border, risk red (`#ff6a4a`) is a distinct ember shade used only as a status icon beside the word. Condensed Anton is display-only; body stays in Archivo so tables never inherit the condensed rhythm.

---

## Option B — Obangsaek

Deep ink navy base with the five traditional Korean colours (오방색) used as a disciplined accent system: 청 blue/cobalt, 적 red, 황 yellow/gold, 녹 green/jade, 백 white. Modern editorial, culturally grounded, and the most credible for an operations tool because the five-colour system maps cleanly onto a status-and-source taxonomy.

### Tokens

```css
.theme-b{
  /* surfaces */
  --bg:#0d1017;        /* deep ink navy */
  --panel:#141926;
  --raised:#1c2333;
  /* text */
  --text:#eef1f6;      /* cool near-white — 백 */
  --muted:#a6b0c3;
  /* accent — 청 cobalt; primary, white text passes AA on it */
  --accent:#2f6fe0;
  --on-accent:#ffffff;
  --accent-text:#6f9bf0;   /* lighter cobalt for accent TEXT on dark */
  --accent-wash:#2f6fe01f; --accent-line:#2f6fe055;
  --accent-shadow:0 6px 18px #2f6fe040;
  /* status — mapped to obangsaek */
  --ok:#3fb98a;        /* 녹 jade — on track */
  --warn:#f0b429;      /* 황 gold — attention */
  --risk:#f2685f;      /* 적 red (text-safe shade) — at risk */
  /* source types */
  --src-official:#6f9bf0; --src-retail:#9aa7bd; --src-editorial:#f0b429; --src-synthetic:#b48be0;
  /* lines / track / focus */
  --track:#232c40; --line:#ffffff12; --line-strong:#ffffff26; --focus:#f0b429;
  --media-bg:radial-gradient(120% 100% at 50% 14%,#22314f 0%,#141b2b 55%,#0c0f17 100%);
  --shadow:0 10px 30px #00000066;
}
```

Full obangsaek reference (the five as a system): 적 red `#e23b34`, 청 cobalt `#2f6fe0`, 황 gold `#f0b429`, 녹 jade `#2f9e6f`, 백 white `#f4f6fa`. The tokens above use text-safe shades of these where they carry text on the dark ground.

### Type

- **Display:** `"Archivo"` at 800 (Archivo Black in feel), tightened tracking (`-.012em`). Editorial and confident without shouting; sets the "modern, credible" tone.
- **Body/UI:** `"IBM Plex Sans KR"` — excellent Latin and Hangul in one family, engineered for interfaces and dense data. One family for both scripts keeps the 매운맛 chip visually consistent with the rest of the UI.
- Fallbacks: `system-ui, sans-serif`.

### Component treatment

- Radii: buttons 6px, cards 10px — the crispest, most editorial of the three. Hairline borders (`#ffffff12`). Restrained shadow. This is the least "styled" surface, which is exactly why it reads as an instrument rather than a promo.
- The five colours are keyline / dot / small-fill accents only. No large colour blocks, so it stays balanced rather than costumey.

### Contrast notes

| Pair | Ratio | Verdict |
|---|---|---|
| `--text #eef1f6` on `--bg #0d1017` | ~16:1 | Pass AAA |
| `--muted #a6b0c3` on `--panel #141926` | ~8:1 | Pass AA |
| Primary button: white `#ffffff` on cobalt `#2f6fe0` | ~4.7:1 | Pass AA |
| `--accent-text #6f9bf0` on `--bg` | ~6.8:1 | Pass AA |
| `--ok #3fb98a` (jade) as text on `--bg` | ~7.6:1 | Pass AA |
| `--warn #f0b429` (gold) as text on `--bg` | ~9:1 | Pass AA |
| `--risk #f2685f` (red) as text on `--bg` | ~6.2:1 | Pass AA |

**AA risk handled:** cobalt at 4.7:1 with white text sits just over the 4.5 line, so the primary button uses pure white (not off-white) to hold the margin; if the cobalt is ever darkened for hover, white still passes. The raw obangsaek 적 red `#e23b34` is only ~4.8:1 as text, so status "at risk" uses the lighter `#f2685f` (6.2:1) and always ships beside the word plus the octagon icon. Each of the five colours is separately AA as text on the ink base, which is what makes the coding trustworthy.

### Korean-culture rationale

Obangsaek is the traditional five-direction colour system (blue-east, red-south, yellow-centre, white-west, black-north) seen in dancheong architecture, hanbok, and ceremonial design. Using it as a *coding system* rather than decoration is both culturally literate and functionally honest: the same five colours that organise traditional design here organise the tool's taxonomy (source type, status, confidence). It signals Korean heritage at the level of *system*, not costume, which suits a company portfolio spanning four brands.

### Where it's strong / risky for an operational CX tool

- **Strong:** dense dashboards, rankings, compare tables, dossier. The disciplined five-colour system gives every category (four source types, three status states, confidence) a distinct, AA-legible token without inventing arbitrary colours. Cool navy reduces eye strain over long sessions. Most "operationally credible" of the three.
- **Risky:** it is the least immediately *spicy* — a reviewer skimming for "Samyang energy" may find it calm. Mitigation: the 적 red and product photography still carry the heat; the hero can lean warmer while the operational surfaces stay in this cool system. Also, five accent colours demand discipline; the spec restricts them to keylines/dots/small fills so no screen turns into a rainbow.

---

## Option C — Seoul Neon

Dark plum-black base, neon coral-pink and cyan accents, night-market Gen-Z energy with a little gloss. The boldest option, and the one flagged for dense-data legibility risk.

### Tokens

```css
.theme-c{
  /* surfaces */
  --bg:#120810;        /* dark plum-black */
  --panel:#1c0f1a;
  --raised:#271523;
  /* text */
  --text:#f7ecf3;      /* soft near-white, warm */
  --muted:#c9a9bf;
  /* accent — neon coral-pink; used as FILL, text on it is near-black */
  --accent:#ff3d81;
  --on-accent:#1a0710;
  --accent-text:#ff5c95;   /* pink for accent TEXT on dark */
  --accent-wash:#ff3d811c; --accent-line:#ff3d8155;
  --accent-shadow:0 0 0 1px #ff3d8140,0 8px 24px #ff3d8140;
  /* status — kept distinct from the pink/cyan brand accents */
  --ok:#37d67a; --warn:#ffb020; --risk:#ff5252;
  /* source types — cyan reserved for Official */
  --src-official:#2ee6d6; --src-retail:#c9a9bf; --src-editorial:#ffb020; --src-synthetic:#c58bff;
  /* lines / track / focus */
  --track:#2c1524; --line:#ffffff14; --line-strong:#ff9ac733; --focus:#2ee6d6;
  --media-bg:radial-gradient(120% 100% at 50% 12%,#3a1130 0%,#1e0f1b 55%,#120810 100%);
  --shadow:0 0 0 1px #ffffff10,0 12px 34px #00000070;
}
```

### Type

- **Display:** `"Black Han Sans"` — a heavy Korean display face (Hangul + Latin) with real night-market poster energy. It is the most overtly Korean display choice of the three.
- **Body/UI:** `"Gothic A1"` (400–800) — clean Korean-first sans that keeps body and tables calm under the loud display.
- Fallbacks: `system-ui, sans-serif`.

### Component treatment

- Radii: buttons 14px, cards 18px — the roundest, glossiest surface. Neon 1px keylines (`#ff9ac733`), a cyan focus ring, and an accent glow on the primary button and cards. Gloss is applied through the shadow/keyline, not through heavy gradients on text.

### Contrast notes

| Pair | Ratio | Verdict |
|---|---|---|
| `--text #f7ecf3` on `--bg #120810` | ~15:1 | Pass AAA |
| `--muted #c9a9bf` on `--panel #1c0f1a` | ~8.3:1 | Pass AA |
| Primary button: `--on-accent #1a0710` on coral `#ff3d81` | ~5.6:1 | Pass AA |
| `--accent-text #ff5c95` (pink) on `--bg` | ~6.6:1 | Pass AA |
| Cyan `#2ee6d6` as text / focus on `--bg` | ~12:1 | Pass AAA |

**AA risk handled:** white-on-coral is only ~3.4:1 and **fails**, so the primary button uses near-black text on the coral fill (5.6:1). Neon coral and cyan are extremely bright on near-black, which causes halation (the "vibration" that hurts dense reading). Mitigations baked into the tokens: body text stays in soft near-white `#f7ecf3`, never neon; neon is confined to keylines, focus, small fills, and status icons; cyan is reserved as a single meaning (Official source / focus) rather than sprinkled; there is no neon-on-neon and no neon body text.

### Korean-culture rationale

References Seoul night-market and Hongdae/Gen-Z visual culture — neon signage, glossy street-food stalls, K-pop poster energy. It matches Buldak's younger, viral audience well. It is contemporary Korea rather than traditional Korea, which is a legitimate reading of the brand's actual fan base.

### Where it's strong / risky for an operational CX tool

- **Strong:** hero, social-forward moments, anything meant to feel viral and young. Highest scroll-stopping power.
- **Risky:** this is the weakest choice for the tool's actual job. Neon-on-dark reduces sustained-reading comfort in tables and long rankings; the glow and round gloss push it toward "consumer app" and away from "operational instrument." It can also read as the generic crypto/neon interface that `12-VISUAL-SYSTEM.md` explicitly rules out. Usable at AA with the mitigations above, but it fights the dense-data brief rather than serving it.

---

## Recommendation

**Adopt Option B — Obangsaek** as the primary skin for FireFlow, with **Option A — Buldak Night** kept as the warm hero/immersive surface.

Reasoning:

1. **It serves the actual job.** FireFlow is an operational CX tool with rankings, compare tables, source badges, confidence, and status states. Obangsaek's disciplined five-colour system gives every one of those categories a distinct, separately-AA token — the coding is trustworthy because no two meanings share a colour, and red is not overloaded as both brand and alarm (the flaw Buldak Night has to work around).

2. **Cultural literacy without costume.** Using obangsaek as a *system* rather than decoration signals Korean heritage at the level of structure, and it reads across all four brands (Buldak, Samyang, Tangle, MEP) rather than tying the whole tool to Buldak red.

3. **Legibility and stamina.** The cool ink base and IBM Plex Sans KR are the most comfortable for long, dense sessions; the crisp 6/10px radii and hairline borders read as an instrument, which is what a CX manager should feel they are using.

4. **It is still striking.** Deep ink navy with cobalt, gold, and jade against glowing product photography is a clear, confident break from the beige/cream skin — just striking in a credible register rather than a loud one.

Keep Buldak Night for the hero and Brand Universe (its photography glow and condensed type are unmatched for a portfolio first impression), and treat Seoul Neon as a rejected-but-documented direction: strongest energy, weakest fit for dense data, retained only if a future marketing surface needs it.

---

## Copy / voice check

All sampler strings follow the binding rules in `CoverCapy_Writing_Style_Anti_AI_Rules.md`: no arrows in CTAs or links (`View product`, `Compare`, `Reset filters`), no em-dash sentence separators, no hype or banned words, no invented metrics (the 92 / 87 scores are illustrative sample data, labelled as a demo). Status is icon plus word; confidence is a labelled badge with a dots glyph, never colour alone.
