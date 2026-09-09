"use client";

import { setCatalog, type CatalogPayload } from "@/lib/shop/catalog-store";

/**
 * Fills the client's catalogue tables from the payload the root layout already
 * fetched — no second round trip from the browser.
 *
 * The fill runs during render rather than in an effect, and this component
 * wraps the tree rather than sitting beside it, so React cannot render a child
 * that prices something before the tables exist. It is idempotent, which is
 * what makes running it on every render (and twice under StrictMode)
 * uninteresting.
 */
export function CatalogHydrator({
  data,
  children,
}: {
  data: CatalogPayload;
  children: React.ReactNode;
}) {
  setCatalog(data);
  return children;
}
