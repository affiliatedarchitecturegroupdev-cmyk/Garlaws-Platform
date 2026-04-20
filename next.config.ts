import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for Docker containerization
  output: 'standalone',

  // Image optimization configuration
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['recharts', '@headlessui/react', '@heroicons/react'],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Turbopack configuration
  turbopack: {},
};

export default nextConfig;