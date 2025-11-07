import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/admin',
  assetPrefix: '/admin',

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  },

  // Optimize for production
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dshome.dev',
      },
    ],
  },
};

export default nextConfig;
