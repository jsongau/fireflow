import { ProductSignalHero } from "@/components/home/ProductSignalHero/ProductSignalHero";
import { PortfolioPulse } from "@/components/home/PortfolioPulse/PortfolioPulse";
import { ComparisonLab } from "@/components/home/ComparisonLab/ComparisonLab";
import { OrderBuilder } from "@/components/home/OrderBuilder/OrderBuilder";
import { OpsTeaser } from "@/components/home/OpsTeaser/OpsTeaser";
import { StudiesBand } from "@/components/home/StudiesBand/StudiesBand";
import { OrderTourEntry } from "@/components/tour/OrderTour";

/**
 * HomePage — the landing route (`/`). The persistent shell (nav, rail, footer,
 * SupportBar, CompareRail) lives in App and wraps this. HomePage renders only its
 * own sections.
 */
export function HomePage() {
  return (
    <>
      <ProductSignalHero />
      <OrderTourEntry />
      <PortfolioPulse />
      <ComparisonLab />
      <OrderBuilder />
      <OpsTeaser />
      <StudiesBand />
    </>
  );
}
