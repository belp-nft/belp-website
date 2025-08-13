import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.stamp.fyi',
      },
      {
        protocol: 'https',
        hostname: 'devnet.irys.xyz',
      },
    ],
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
