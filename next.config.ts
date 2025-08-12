import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["cdn.stamp.fyi"],
  },
  async rewrites() {
    return [
      {
        source: "/api/nft/:path*",
        destination: "https://belpy-core.blockifyy.com/nft/:path*",
      },
    ];
  },
};

export default nextConfig;
