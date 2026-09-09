import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Cursor } from "@/components/chrome/cursor";
import { Intro } from "@/components/chrome/intro";
import { ScrollProgress } from "@/components/chrome/scroll-progress";
import { CartDrawer } from "@/components/shop/cart-drawer";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="grain min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[110] focus:rounded-full focus:bg-gold focus:px-5 focus:py-3 focus:text-ink"
        >
          Skip to content
        </a>
        <ScrollProgress />
        <Cursor />
        <Intro />
        <Header />
        {children}
        <Footer />
        {/* Outside the route tree: the drawer has to survive navigation. */}
        <CartDrawer />
      </body>
    </html>
  );
}
