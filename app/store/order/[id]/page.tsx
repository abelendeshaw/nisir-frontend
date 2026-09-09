import type { Metadata } from "next";
import { OrderView } from "@/components/shop/order-view";
import { getUser } from "@/lib/auth/dal";
import { getOrder, OrderError } from "@/lib/shop/orders-server";

export const metadata: Metadata = {
  title: "Order",
  description: "Your order, and where it is in the queue.",
  robots: { index: false },
};

export default async function OrderPage({ params }: PageProps<"/store/order/[id]">) {
  const { id } = await params;
  const user = await getUser();

  // Readable by order number so a guest can reload their own receipt. The
  // token goes along when there is one, which is what lets the backend refuse
  // an order belonging to a different account.
  let order = null;
  try {
    order = await getOrder(id, user?.token);
  } catch (cause) {
    if (!(cause instanceof OrderError)) throw cause;
    // Missing, or not theirs — the view says so rather than crashing.
  }

  return <OrderView id={id} order={order} />;
}
