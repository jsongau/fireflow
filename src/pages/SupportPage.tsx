import { InquiryPaths } from "@/components/home/InquiryPaths/InquiryPaths";
import { ResolutionSimulator } from "@/components/home/ResolutionSimulator/ResolutionSimulator";

/** SupportPage — `/support`. Open a case and walk a resolution. */
export function SupportPage() {
  return (
    <>
      <InquiryPaths />
      <ResolutionSimulator />
    </>
  );
}
