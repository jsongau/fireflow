import { MegaNav } from "@/components/navigation/MegaNav/MegaNav";
import { ProductSignalHero } from "@/components/home/ProductSignalHero/ProductSignalHero";
import { SelectedProductRail } from "@/components/home/SelectedProductRail/SelectedProductRail";
import { PortfolioPulse } from "@/components/home/PortfolioPulse/PortfolioPulse";
import { RankingsLab } from "@/components/home/RankingsLab/RankingsLab";
import { ComparisonLab } from "@/components/home/ComparisonLab/ComparisonLab";
import { ProductDossier } from "@/components/home/ProductDossier/ProductDossier";
import { InquiryPaths } from "@/components/home/InquiryPaths/InquiryPaths";
import { ResolutionSimulator } from "@/components/home/ResolutionSimulator/ResolutionSimulator";
import { CommandCenter } from "@/components/home/CommandCenter/CommandCenter";
import { ProductSignals } from "@/components/home/ProductSignals/ProductSignals";
import { BrandUniverse } from "@/components/home/BrandUniverse/BrandUniverse";
import { Methodology } from "@/components/home/Methodology/Methodology";
import { HomepageFAQ } from "@/components/home/HomepageFAQ/HomepageFAQ";
import { SupportBar } from "@/components/home/SupportBar/SupportBar";
import { INDEPENDENCE_DISCLAIMER } from "@/data/sources";
import { DATA_SUMMARY } from "@/data";
import styles from "./HomePage.module.css";

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Portfolio Pulse", href: "#portfolio" },
      { label: "Rankings Lab", href: "#rankings" },
      { label: "Comparison Lab", href: "#compare" },
      { label: "Product Dossier", href: "#product" },
    ],
  },
  {
    title: "Care & Support",
    links: [
      { label: "Two Paths", href: "#resolve" },
      { label: "Resolution Simulator", href: "#simulate" },
    ],
  },
  {
    title: "CX Intelligence",
    links: [
      { label: "Command Center", href: "#command" },
      { label: "Product Signals", href: "#signals" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Brand Universe", href: "#brands" },
      { label: "Methodology", href: "#methodology" },
      { label: "FAQ", href: "#faq" },
    ],
  },
];

export function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>

      <MegaNav />
      <SelectedProductRail />

      <nav className={styles.trail} aria-label="Breadcrumb">
        FireFlow <span aria-hidden="true">/</span> Product Intelligence <span aria-hidden="true">/</span> U.S. Portfolio
      </nav>

      <main id="main">
        <ProductSignalHero />
        <PortfolioPulse />
        <RankingsLab />
        <ComparisonLab />
        <ProductDossier />
        <InquiryPaths />
        <ResolutionSimulator />
        <CommandCenter />
        <ProductSignals />
        <BrandUniverse />
        <Methodology />
        <HomepageFAQ />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <span className={styles.footerLogo}>FireFlow</span>
              <p className={styles.footerLead}>
                An independent Customer Experience portfolio concept exploring Samyang America&rsquo;s public
                U.S. portfolio — {DATA_SUMMARY.families} families across {DATA_SUMMARY.variants} formats.
              </p>
            </div>
            <nav className={styles.footerNav} aria-label="Footer">
              {FOOTER_COLUMNS.map((col) => (
                <div key={col.title} className={styles.footerCol}>
                  <p className={styles.footerColTitle}>{col.title}</p>
                  <ul className={styles.footerLinks}>
                    {col.links.map((link) => (
                      <li key={link.href + link.label}>
                        <a href={link.href} className={styles.footerLink}>{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <p className={styles.disclaimer}>{INDEPENDENCE_DISCLAIMER}</p>
          <p className={styles.reviewed}>Research snapshot: 2026-07-07</p>
        </div>
      </footer>

      <SupportBar />
    </>
  );
}
