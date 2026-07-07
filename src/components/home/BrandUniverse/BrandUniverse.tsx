import type { CSSProperties } from "react";
import { useHome } from "@/state/homeStore";
import { BRAND_BY_ID } from "@/data/brands";
import { FAMILIES, FAMILY_BY_ID } from "@/data/families";
import { imageForVariant } from "@/data/images";
import type { BrandId } from "@/types/domain";
import styles from "./BrandUniverse.module.css";

interface BrandAngle {
  id: BrandId;
  flagshipId: string;
  consumer: string;
  vendor: string;
}

const ANGLES: Record<BrandId, BrandAngle> = {
  buldak: {
    id: "buldak",
    flagshipId: "buldak-carbonara",
    consumer: "Heat questions, missing sauce packets, and “which one is milder?” dominate the queue.",
    vendor: "The volume line — format availability, sell sheets, and shelf heat-communication.",
  },
  samyang: {
    id: "samyang",
    flagshipId: "samyang-ramen",
    consumer: "Soup-versus-stir-fry confusion and heritage-flavor expectations, not defects.",
    vendor: "Legacy SKUs that need clear positioning against the Buldak spotlight.",
  },
  tangle: {
    id: "tangle",
    flagshipId: "tangle-bulgogi-alfredo",
    consumer: "Protein and fiber claims drive the questions — nutrition, not spice.",
    vendor: "A better-for-you story for buyers building a health-forward set.",
  },
  mep: {
    id: "mep",
    flagshipId: "mep-black-pepper-beef",
    consumer: "Broth expectations and flavor-pairing curiosity — the calmest path.",
    vendor: "A focused soup range for accounts that want depth over breadth.",
  },
};

function countFor(brand: BrandId): number {
  return FAMILIES.filter((f) => f.brand === brand).length;
}

function ExploreLink({ brand, label }: { brand: BrandId; label: string }) {
  const { dispatch } = useHome();
  return (
    <a
      href="#portfolio"
      className={styles.explore}
      onClick={() => dispatch({ type: "SET_BRAND", brand })}
    >
      {label}
    </a>
  );
}

function Flagship({ brandId, flagshipId }: { brandId: BrandId; flagshipId: string }) {
  const family = FAMILY_BY_ID[flagshipId] ?? null;
  if (!family) return null;
  const photo = imageForVariant("", family.id);
  return (
    <div className={styles.flagship}>
      {photo ? (
        <img className={styles.flagshipImg} src={photo} alt={`${family.name} package`} loading="lazy" />
      ) : (
        <span className={styles.flagshipMark} aria-hidden="true" data-brand={brandId}>
          {family.name.charAt(0)}
        </span>
      )}
      <span className={styles.flagshipMeta}>
        <span className={styles.flagshipLabel}>Flagship</span>
        <span className={styles.flagshipName}>{family.name}</span>
      </span>
    </div>
  );
}

export function BrandUniverse() {
  const buldak = BRAND_BY_ID["buldak"];
  const samyang = BRAND_BY_ID["samyang"];
  const tangle = BRAND_BY_ID["tangle"];
  const mep = BRAND_BY_ID["mep"];

  const accent = (id: BrandId): CSSProperties =>
    ({ "--brand-accent": `var(${BRAND_BY_ID[id]?.accentToken ?? "--accent"})` } as CSSProperties);

  return (
    <section id="brands" className={styles.section} aria-labelledby="brands-h">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>About</p>
          <h2 id="brands-h" className={styles.h2}>The Brand Universe</h2>
          <p className={styles.lede}>
            One house, four distinct positions. FireFlow treats each brand on its own terms — because the
            questions consumers and vendors bring differ as much as the flavors do.
          </p>
        </header>

        <div className={styles.grid}>
          {/* Buldak — large feature panel */}
          {buldak && (
            <article className={`${styles.panel} ${styles.buldak}`} style={accent("buldak")}>
              <div className={styles.panelBody}>
                <span className={styles.brandName}>{buldak.name}</span>
                <span className={styles.stat}>
                  <span className={styles.statNum}>{countFor("buldak")}</span>
                  <span className={styles.statLabel}>families across noodles, sauces, snacks &amp; frozen</span>
                </span>
                <p className={styles.positioning}>{buldak.positioning}</p>
                <dl className={styles.angles}>
                  <div><dt>Consumer</dt><dd>{ANGLES.buldak.consumer}</dd></div>
                  <div><dt>Vendor</dt><dd>{ANGLES.buldak.vendor}</dd></div>
                </dl>
                <ExploreLink brand="buldak" label="Explore Buldak" />
              </div>
              <Flagship brandId="buldak" flagshipId={ANGLES.buldak.flagshipId} />
            </article>
          )}

          {/* Samyang — heritage editorial panel */}
          {samyang && (
            <article className={`${styles.panel} ${styles.samyang}`} style={accent("samyang")}>
              <span className={styles.heritageTag}>Heritage</span>
              <span className={styles.brandName}>{samyang.name}</span>
              <p className={styles.heritageQuote}>{samyang.positioning}</p>
              <p className={styles.count}><strong>{countFor("samyang")}</strong> heritage families — soup, not stir-fry.</p>
              <dl className={styles.angles}>
                <div><dt>Consumer</dt><dd>{ANGLES.samyang.consumer}</dd></div>
                <div><dt>Vendor</dt><dd>{ANGLES.samyang.vendor}</dd></div>
              </dl>
              <ExploreLink brand="samyang" label="Explore Samyang" />
            </article>
          )}

          {/* Tangle — protein stat panel */}
          {tangle && (
            <article className={`${styles.panel} ${styles.tangle}`} style={accent("tangle")}>
              <span className={styles.brandName}>{tangle.name}</span>
              <span className={styles.proteinBadge}>Protein pasta</span>
              <p className={styles.positioning}>{tangle.positioning}</p>
              <ul className={styles.flavorList}>
                {FAMILIES.filter((f) => f.brand === "tangle").map((f) => (
                  <li key={f.id}>{f.name.replace(/^Tangle\s/, "")}</li>
                ))}
              </ul>
              <dl className={styles.angles}>
                <div><dt>Consumer</dt><dd>{ANGLES.tangle.consumer}</dd></div>
                <div><dt>Vendor</dt><dd>{ANGLES.tangle.vendor}</dd></div>
              </dl>
              <ExploreLink brand="tangle" label="Explore Tangle" />
            </article>
          )}

          {/* MEP — compact soup panel */}
          {mep && (
            <article className={`${styles.panel} ${styles.mep}`} style={accent("mep")}>
              <span className={styles.brandName}>{mep.name}</span>
              <p className={styles.count}><strong>{countFor("mep")}</strong> broth-led soup noodles.</p>
              <p className={styles.positioning}>{mep.positioning}</p>
              <dl className={styles.angles}>
                <div><dt>Consumer</dt><dd>{ANGLES.mep.consumer}</dd></div>
                <div><dt>Vendor</dt><dd>{ANGLES.mep.vendor}</dd></div>
              </dl>
              <ExploreLink brand="mep" label="Explore MEP" />
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
