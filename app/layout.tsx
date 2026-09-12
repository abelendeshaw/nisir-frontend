import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
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
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.legalName} — ${site.tagline}`,
    template: `%s — ${site.legalName}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.legalName} — ${site.tagline}`,
    description: site.description,
    type: "website",
    url: site.url,
    siteName: site.legalName,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0a1220",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Force runtime rendering so GoDaddy runtime environment variables
  // like SESSION_SECRET and NISIR_API_URL are available.
  await connection();

  // A local cookie decrypt, not a network call — the session JWT already
  // carries the name, so this doesn't hold up the first paint the way a
  // database-backed session check would. See lib/auth/session.ts.
  // The catalogue is a cached fetch, deduped per request.
  const [user, catalog] = await Promise.all([getUser(), loadCatalog()]);

  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="grain min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[110] focus:rounded-full focus:bg-gold focus:px-5 focus:py-3 focus:text-ink"
        >
          Skip to content
        </a>

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
      </body>
    </html>
  );
}
