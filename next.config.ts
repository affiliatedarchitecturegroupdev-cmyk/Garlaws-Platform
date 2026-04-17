import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal config for testing
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Minimal config for testing
};

export default nextConfig;