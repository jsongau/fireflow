import { Link } from "react-router-dom";
import { INDEPENDENCE_DISCLAIMER } from "@/data/sources";
import { DATA_SUMMARY } from "@/data";
import { FOOTER_COLUMNS } from "@/data/nav";
import styles from "@/pages/HomePage.module.css";

/**
 * SiteFooter — the persistent footer, hoisted out of HomePage so it renders once
 * in the App shell across every route. The columns and their link targets come
 * from the single navigation source of truth (src/data/nav.ts), so they can no
 * longer drift from the MegaNav. Targets that start with "/" render as a
 * react-router <Link>; bare "#anchor" targets stay plain anchors.
 */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>FireFlow</span>
            <p className={styles.footerLead}>
              An independent Customer Experience portfolio concept exploring Samyang America&rsquo;s public
              U.S. portfolio, {DATA_SUMMARY.families} families across {DATA_SUMMARY.variants} formats.
            </p>
          </div>
          <nav className={styles.footerNav} aria-label="Footer">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className={styles.footerCol}>
                <p className={styles.footerColTitle}>{col.title}</p>
                <ul className={styles.footerLinks}>
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      {link.href.startsWith("/") ? (
                        <Link to={link.href} className={styles.footerLink}>{link.label}</Link>
                      ) : (
                        <a href={link.href} className={styles.footerLink}>{link.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.footerMeta}>
          <p className={styles.disclaimer}>{INDEPENDENCE_DISCLAIMER}</p>
          <p className={styles.reviewed}>Research snapshot: 2026-07-07</p>
        </div>
      </div>
    </footer>
  );
}
