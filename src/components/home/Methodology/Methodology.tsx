import { SOURCE_TYPES, VERIFY_PACKAGE_REMINDER } from "@/data/sources";
import styles from "./Methodology.module.css";

const SOURCE_ORDER = ["official", "retail-signal", "editorial", "synthetic"] as const;

const PRINCIPLES: { title: string; body: string }[] = [
  {
    title: "Format-bound allergens",
    body: "Allergen and preparation facts attach only to the exact format we have an official source for. Other formats carry none rather than inherit another format's — always verify the physical package.",
  },
  {
    title: "Multi-axis rankings",
    body: "There is no single 'best.' Each ranking view weighs transparent inputs toward a stated purpose, is labeled editorial, and can be re-weighted. Missing inputs lower confidence; they are never imputed.",
  },
  {
    title: "Unknowns stay unknown",
    body: "Where a fact isn't verified, FireFlow says so. A family moves out of 'unknown' only when an approved sell sheet or official source supplies the detail — not when a plausible guess is available.",
  },
];

export function Methodology() {
  return (
    <section id="methodology" className={styles.section} aria-labelledby="methodology-h">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>About</p>
          <h2 id="methodology-h" className={styles.h2}>Methodology &amp; trust</h2>
          <p className={styles.lede}>
            Every claim on this site carries its origin. Four source labels tell you exactly how much weight
            a fact should hold — and where the line between official record and editorial interpretation sits.
          </p>
        </header>

        <ul className={styles.sources}>
          {SOURCE_ORDER.map((type) => {
            const meta = SOURCE_TYPES[type];
            return (
              <li key={type} className={styles.source}>
                <span className={styles.sourceHead}>
                  <span className={styles.dot} style={{ background: `var(${meta.token})` }} aria-hidden="true" />
                  <span className={styles.sourceLabel}>{meta.short}</span>
                </span>
                <p className={styles.sourceDesc}>{meta.description}</p>
              </li>
            );
          })}
        </ul>

        <div className={styles.principles}>
          {PRINCIPLES.map((p) => (
            <div key={p.title} className={styles.principle}>
              <h3 className={styles.principleTitle}>{p.title}</h3>
              <p className={styles.principleBody}>{p.body}</p>
            </div>
          ))}
        </div>

        <p className={styles.reminder}>{VERIFY_PACKAGE_REMINDER}</p>
      </div>
    </section>
  );
}
