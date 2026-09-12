import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutFlow } from "@/components/shop/checkout/flow";
import { getUser, verifiedUser } from "@/lib/auth/dal";
import { nextQuery } from "@/lib/auth/next-path";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Contact, delivery, payment, review.",
  robots: { index: false },
};

/** Where signing in has to return them to. */
const HERE = "/store/checkout";

/**
 * Checkout, behind an account.
 *
 * The whole store is open right up to this page — browsing, product pages,
 * the cart and the drawer all work signed out, because asking for an account
 * before somebody has decided to buy anything costs more sales than it earns
 * records. This is the line: nisir-backend-php will accept a guest order
 * quite happily (`POST /orders` is public, and `placeOrder` attaches an
 * account only when a token comes with it), so nothing below this page would
 * ever ask. An order nobody can be contacted about later, or that never
 * appears under "my orders", is a support problem with no thread to pull.
 *
 * Gated here rather than in `proxy.ts` because that file's matcher covers
 * `/account` only, and widening it would put a cookie decrypt on every store
 * request to guard one page.
 *
 * Two different failures, two different destinations:
 *
 *   no session       -> signup, because somebody stopped at the till by a
 *                       login form they cannot fill in is simply stuck; the
 *                       form itself links to sign-in for people who have an
 *                       account already.
 *   disowned session -> login with `?expired=1`, the established route for a
 *                       cookie the backend no longer honours. `proxy.ts`
 *                       clears it there. Without this branch a revoked
 *                       session would sail through the gate and quietly place
 *                       a guest order, which is the exact outcome the gate
 *                       exists to prevent.
 */
export default async function CheckoutPage() {
  const session = await getUser();
  if (!session) redirect(`/account/signup${nextQuery(HERE)}`);

  // Cached with the call above, so this costs one backend request, not two.
  const customer = await verifiedUser();
  if (!customer) redirect(`/account/login?expired=1&next=${encodeURIComponent(HERE)}`);

  /*
   * The contact step asks for a name and an email the account already knows.
   * Passed down as a starting value rather than a fixed one — the person
   * paying is not always the person it ships to.
   */
  return <CheckoutFlow customer={{ name: customer.name, email: customer.email }} />;
}
