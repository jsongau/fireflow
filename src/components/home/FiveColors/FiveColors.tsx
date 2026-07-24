import { OBANGSAEK } from "@/data/glossary";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import styles from "./FiveColors.module.css";

/**
 * FiveColors — obangsaek (오방색), Korea's five traditional "five direction"
 * colors, presented as a short, accurate brand-culture note.
 *
 * Why it is here: Samyang is a Korean food brand, and Korean cuisine is
 * deliberately built on balancing the five colors. This strip reads the FireFlow
 * palette against that tradition. The mapping is a designer's personal reading,
 * clearly labeled as such, never a claim about Samyang's official brand system.
 * Terms, directions, elements, and meanings follow Korea.net / KOCIS sources.
 */

/** How the FireFlow palette reads against obangsaek. A personal reading. */
const PALETTE_READ: Record<string, string> = {
  Cheong: "The cool operator voice, where Nathan's Notes speak.",
  Jeok: "The Buldak accent red. The heat the brand is known for.",
  Hwang: "The gold used for emphasis and the center of attention.",
  Baek: "The cream text and paper surfaces.",
  Heuk: "The near-black ground the whole system sits on.",
};

/** Swatch colors are the FireFlow tokens closest to each traditional color. */
const SWATCH: Record<string, string> = {
  Cheong: "var(--op-accent)",
  Jeok: "var(--accent)",
  Hwang: "var(--gold)",
  Baek: "var(--text-0)",
  Heuk: "var(--surface-0)",
};

const ORDER = ["Cheong", "Jeok", "Hwang", "Baek", "Heuk"] as const;

export function FiveColors() {
  return (
    <section id="colors" className={styles.section} aria-labelledby="fivecolors-title">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Obangsaek, the five colors</p>
        <h2 id="fivecolors-title" className={styles.title}>
          Five colors, five directions.
        </h2>
        <p className={styles.lede}>
          Korean tradition organizes color through eumyang-ohaeng, yin and yang with the five
          elements. Each color carries a direction, an element, and a meaning, and Korean cooking
          balances all five on the plate. Here is how I read the FireFlow palette against it.
        </p>

        <ul className={styles.grid}>
          {ORDER.map((key) => {
            const c = OBANGSAEK[key];
            if (!c) return null;
            return (
              <li key={key} className={styles.card}>
                <span
                  className={styles.swatch}
                  style={{ background: SWATCH[key] }}
                  aria-hidden="true"
                />
                <p className={styles.name}>
                  {key} <span className={styles.hangul}>{c.hangul}</span>
                </p>
                <p className={styles.meta}>
                  {c.direction} · {c.element}
                  {c.season ? ` · ${c.season}` : ""}
                </p>
                <p className={styles.meaning}>{c.short}</p>
                <p className={styles.read}>
                  <span className={styles.readLabel}>In FireFlow</span> {PALETTE_READ[key]}
                </p>
              </li>
            );
          })}
        </ul>

        <p className={styles.note}>
          A personal design reading, not Samyang brand doctrine. Sources are listed in the project
          documentation.
        </p>

        <SectionNote sectionId="colors" />
      </div>
    </section>
  );
}
