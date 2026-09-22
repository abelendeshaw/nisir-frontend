import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderFailed } from "@/components/shop/order-failed";

export const metadata: Metadata = {
  title: "Payment not completed",
  description: "The authorisation did not go through. Nothing was charged.",
  robots: { index: false },
};

export default function CheckoutFailedPage() {
  // `useSearchParams` suspends during prerender; the boundary is what lets the
  // rest of the page stay static.
  return (
    <Suspense fallback={<main id="main" className="min-h-[70svh]" />}>
      <OrderFailed />
    </Suspense>
  );
}
