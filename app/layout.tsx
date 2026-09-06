import type { Metadata, Viewport } from "next";
import { sans } from "@/lib/fonts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { themeScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nisir Designs — A brighter tomorrow, by design.",
    template: "%s — Nisir Designs",
  },
  description:
    "Nisir Designs is a multidisciplinary creative practice — web, apps, brand, motion, 3D modelling, 3D printing and fashion education across Ontario and Ethiopia.",
  metadataBase: new URL("https://nisirdesigns.com"),
  openGraph: {
    title: "Nisir Designs — A brighter tomorrow, by design.",
    description:
      "One studio, seven capabilities. Digital development, brand systems, motion, 3D production and fashion education.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5ec" },
    { media: "(prefers-color-scheme: dark)", color: "#070e18" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <head>
        {/* Applies a stored theme choice before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="grain min-h-dvh">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
