import type { NextConfig } from "next";

import { SERVICES_LIVE } from "./lib/flags";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  experimental: {
    serverActions: {
      /*
       * The custom-print upload (`uploadCustomModel`) and the admin panel's
       * product photographs both arrive through Server Actions, and Next
       * refuses any Server Action body over 1MB by default. The customiser
       * promises models up to 120MB (`MAX_BYTES` in `lib/shop/mesh.ts`, and
       * `MeshMeasurer::MAX_BYTES` on the backend), so without this every
       * real-world STL failed at the moment a customer tried to buy the
       * print. The extra megabyte is multipart overhead.
       */
      bodySizeLimit: "121mb",
    },
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    if (SERVICES_LIVE) {
      return [
        { source: "/about", destination: "/studio", permanent: true },
        { source: "/capabilities", destination: "/services", permanent: true },
        {
          source: "/capabilities/:slug",
          destination: "/services/:slug",
          permanent: true,
        },
      ];
    }

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
