import { OpsDashboard } from "@/components/ops/OpsDashboard/OpsDashboard";

/**
 * OpsPage — `/ops`. OpsDashboard renders its own full-page chrome (a "Back to
 * FireFlow" link and its own footer), so this page is a thin wrapper that leaves
 * it untouched.
 */
export function OpsPage() {
  return <OpsDashboard />;
}
