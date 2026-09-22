import type { Metadata } from "next";
import { WishlistView } from "@/components/shop/wishlist-view";

export const metadata: Metadata = {
  title: "Saved",
  description: "Objects kept for later, held on this device.",
  robots: { index: false },
};

export default function WishlistPage() {
  return <WishlistView />;
}
