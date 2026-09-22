import type { ReactNode } from "react";
import { SiteChrome } from "@/components/chrome/site-chrome";

/**
 * The storefront: every public page, wrapped in the site's chrome. The admin
 * panel sits beside this group rather than inside it, so it gets none of it.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[110] focus:rounded-full focus:bg-gold focus:px-5 focus:py-3 focus:text-ink"
      >
        Skip to content
      </a>
      <SiteChrome>{children}</SiteChrome>
    </>
  );
}
