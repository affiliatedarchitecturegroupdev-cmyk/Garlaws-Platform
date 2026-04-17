import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    domains: ['garlaws.co.za', 'supabase.co', 's3.af-south-1.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Build optimization
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // TypeScript
  typescript: {
    ignoreBuildErrors: false, // Enable strict checking in production
  },

  // ESLint
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint in production builds
  },
};

export default nextConfig;