import type { ReactNode } from "react";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Cursor } from "@/components/chrome/cursor";
import { Intro } from "@/components/chrome/intro";
import { ScrollProgress } from "@/components/chrome/scroll-progress";
import { CookieNotice } from "@/components/chrome/cookie-notice";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { CatalogHydrator } from "@/components/shop/catalog-hydrator";
import { getUser } from "@/lib/auth/dal";
import { loadCatalog } from "@/lib/shop/catalog-server";

/**
 * Everything around a storefront page: the header and footer, the cart, the
 * intro, the cursor, and the catalogue the pricing functions read.
 *
 * Its own component rather than the root layout's body, because two places
 * need it: the storefront's layout, and the root `not-found.tsx` — which
 * renders outside every route group's layout, and would otherwise be the one
 * page on the site with no way back to the rest of it. The admin panel is the
 * one section that does not use it.
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  // A local cookie decrypt, not a network call — the session JWT already
  // carries the name, so this doesn't hold up the first paint the way a
  // database-backed session check would. See lib/auth/session.ts.
  // The catalogue is a cached fetch, deduped per request.
  const [user, catalog] = await Promise.all([getUser(), loadCatalog()]);

  return (
    <CatalogHydrator data={catalog}>
      <ScrollProgress />
      <Cursor />
      <Intro />
      <Header user={user} />
      {children}
      <Footer />
      <CartDrawer />
      <CookieNotice />
    </CatalogHydrator>
  );
}
