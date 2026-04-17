import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude garlaws-platform from the build
  ignoredRoutes: ['/garlaws-platform/**'],
  webpack: (config, { dev }) => {
    // Ignore node_modules patterns for NestJS
    config.resolve.modules = [...(config.resolve.modules || [])];
    return config;
  },
};

export default nextConfig;