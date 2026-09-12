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
