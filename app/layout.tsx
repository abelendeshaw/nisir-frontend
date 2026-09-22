import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { connection } from "next/server";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
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

/**
 * The document, and nothing else. The storefront's chrome lives in
 * `app/(site)/layout.tsx` and the admin panel's in its own layout, so neither
 * section carries the other's.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  // Force runtime rendering so GoDaddy runtime environment variables
  // like SESSION_SECRET and NISIR_API_URL are available.
  await connection();

  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="grain min-h-dvh antialiased">{children}</body>
    </html>
  );
}
