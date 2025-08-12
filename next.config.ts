import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["cdn.stamp.fyi"],
  },
  async rewrites() {
    return [
      {
        source: "/api/nft/:path*",
        destination: "http://localhost:4444/nft/:path*",
      },
    ];
  },
};

export default nextConfig;
