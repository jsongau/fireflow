import { QuoteRequest } from "@/components/home/QuoteRequest/QuoteRequest";
import { StandingOrder } from "@/components/home/StandingOrder/StandingOrder";

/** OrderPage — `/order`. Quote requests and standing orders. */
export function OrderPage() {
  return (
    <>
      <QuoteRequest />
      <StandingOrder />
    </>
  );
}
