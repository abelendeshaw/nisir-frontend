import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountView } from "@/components/account/account-view";
import { getUser, verifiedUser } from "@/lib/auth/dal";
import { myOrders, OrderError, type OrderSummary } from "@/lib/shop/orders-server";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false },
};

export default async function AccountPage() {
  // `proxy.ts` already redirects signed-out visitors before this runs — this
  // check is the boundary, not a formality. See lib/auth/dal.ts.
  //
  // Two steps rather than one because the two ways in are not the same event.
  // No cookie at all is somebody who is simply not signed in: send them to a
  // plain login form.
  if (!(await getUser())) redirect("/account/login");

  // A cookie nisir-backend-php disowns is somebody who *was* signed in until
  // the token inside it was revoked — signed out on another machine, or the
  // account deleted. The cookie itself stays cryptographically perfect for
  // seven days, so without asking, this page would go on showing their name
  // and fetching their orders that entire time.
  //
  // `?expired=1` is not cosmetic: it tells `proxy.ts` to clear the cookie
  // (a page cannot) and it is what stops this redirect and the proxy's own
  // from bouncing each other forever.
  const user = await verifiedUser();
  if (!user) redirect("/account/login?expired=1");

  // An unreachable backend should not take the whole account page down with
  // it; the name and email come from the session and are still worth showing.
  // (`verifiedUser()` has already decided the same way about the check above:
  // an API that cannot answer does not sign anybody out.)
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
