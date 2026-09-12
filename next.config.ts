import type { NextConfig } from "next";

import { SERVICES_LIVE } from "./lib/flags";

/**
 * Headers every response carries.
 *
 * Deliberately not a Content-Security-Policy: a useful one for this app needs
 * per-request nonces (Next injects inline bootstrap scripts, and the store's
 * three.js views compile shaders), and a CSP written without them either
 * breaks the site or is loose enough to be theatre. That is its own change.
 */
const securityHeaders = [
  // Stop the browser second-guessing a Content-Type. The upload route hands
  // back JSON that describes a user-supplied file; sniffing is how that turns
  // into something executable.
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Nothing here is meant to be framed, and the checkout least of all.
  { key: "X-Frame-Options", value: "DENY" },

  // Send the full URL to ourselves, only the origin to anyone else — so an
  // order page's id doesn't ride along in the Referer to a third party.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // The site asks for none of these, so no embedded frame gets to either.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },

  // One year of https-only for this exact host.
  //
  // `includeSubdomains` is left off on purpose: it would commit every present
  // and future subdomain to TLS for a year, and a mail or blog subdomain still
  // on http would simply stop resolving for anyone who had visited the site.
  // Add it — and only then `preload` — once you know every subdomain has a
  // certificate. Browsers ignore this header over plain http, so it costs
  // nothing before the certificate is live.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  /**
   * Emit `.next/standalone`: the traced server plus only the `node_modules` it
   * actually reaches, and a `server.js` to run it. That is the artifact to put
   * on a host — a few megabytes instead of the whole dependency tree, which
   * matters when the upload path is cPanel's file manager. `npm run
   * build:standalone` also copies `public` and `.next/static` into it, which
   * this option does not do on its own.
   */
  output: "standalone",

  /** No point advertising the framework and version to a scanner. */
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    // Old paths from earlier drafts: /about became /studio, and capabilities
    // became services. Keep both alive rather than breaking shared links.
    if (SERVICES_LIVE) {
      return [
        { source: "/about", destination: "/studio", permanent: true },
        { source: "/capabilities", destination: "/services", permanent: true },
        { source: "/capabilities/:slug", destination: "/services/:slug", permanent: true },
      ];
    }

    /*
     * Services is switched off (see `lib/flags.ts`), so the section is closed
     * at the front door. Redirects are checked before the filesystem, which
     * means nothing under `app/services/` ever runs while it stays in the
     * repo intact — turning the flag back on restores the section with no
     * code to rewrite.
     *
     * `permanent: false` deliberately. A 308 tells Google the page is gone
     * for good and is cached hard by browsers, which would be difficult to
     * undo for anyone who had visited; a 307 keeps the URL in the index to be
     * re-crawled and leaves nothing stale behind. This section is coming back.
     *
     * The `/capabilities` pair is re-pointed rather than left alone: aiming a
     * permanent redirect at a temporarily redirected path would send visitors
     * through two hops and cache the first of them forever.
     */
    return [
      { source: "/about", destination: "/studio", permanent: true },
      { source: "/capabilities", destination: "/", permanent: false },
      { source: "/capabilities/:slug", destination: "/", permanent: false },
      { source: "/services", destination: "/", permanent: false },
      { source: "/services/:slug", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
