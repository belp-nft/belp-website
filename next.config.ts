import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tối ưu compiler
  poweredByHeader: false,
  compress: true,
  
  // Disable App Router to use Pages Router
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'react-icons',
      'swiper',
      'clsx'
    ],
    webpackBuildWorker: true,
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 hours
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.stamp.fyi',
      },
      {
        protocol: 'https',
        hostname: 'devnet.irys.xyz',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
      },
      {
        protocol: 'https',
        hostname: 'dweb.link',
      },
    ],
    loader: 'custom',
    loaderFile: './src/lib/ipfsImageLoader.js',
  },

  // Headers cho performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icons/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
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
