import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/admin',
  assetPrefix: '/admin',

  // Optimize for production
  reactStrictMode: true,

  // Image optimization
  images: {
    // Allow images from same domain (relative URLs like /uploads/...)
    // Nginx will proxy /uploads/* to backend
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dshome.dev',
      },
      {
        protocol: 'https',
        hostname: 'www.dshome.dev',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
