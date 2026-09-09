import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountView } from "@/components/account/account-view";
import { getUser } from "@/lib/auth/dal";
import { myOrders, OrderError, type OrderSummary } from "@/lib/shop/orders-server";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false },
};

export default async function AccountPage() {
  // `proxy.ts` already redirects signed-out visitors before this runs — this
  // check is the real boundary, not a formality. See lib/auth/dal.ts.
  const user = await getUser();
  if (!user) redirect("/account/login");

  // An unreachable backend should not take the whole account page down with
  // it; the name and email come from the session and are still worth showing.
  let orders: OrderSummary[] = [];
  try {
    orders = await myOrders(user.token);
  } catch (cause) {
    if (!(cause instanceof OrderError)) throw cause;
  }

  return (
    <AccountView user={{ name: user.name, email: user.email }} orders={orders} />
  );
}
