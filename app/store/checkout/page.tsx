import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/shop/checkout/flow";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Contact, delivery, payment, review.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
