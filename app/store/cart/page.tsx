import type { Metadata } from "next";
import { CartView } from "@/components/shop/cart-view";

export const metadata: Metadata = {
  title: "Cart",
  description: "What you have chosen, before anything is confirmed.",
  robots: { index: false },
};

export default function CartPage() {
  return <CartView />;
}
