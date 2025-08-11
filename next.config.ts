import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["cdn.stamp.fyi"],
  },
};

export default nextConfig;
