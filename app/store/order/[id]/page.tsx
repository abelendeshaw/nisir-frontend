import type { Metadata } from "next";
import { OrderView } from "@/components/shop/order-view";

export const metadata: Metadata = {
  title: "Order",
  description: "Your order, and where it is in the queue.",
  robots: { index: false },
};

export default async function OrderPage({ params }: PageProps<"/store/order/[id]">) {
  const { id } = await params;
  return <OrderView id={id} />;
}
