import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Old paths from earlier drafts: /about became /studio, and capabilities
    // became services. Keep both alive rather than breaking shared links.
    return [
      { source: "/about", destination: "/studio", permanent: true },
      { source: "/capabilities", destination: "/services", permanent: true },
      { source: "/capabilities/:slug", destination: "/services/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
