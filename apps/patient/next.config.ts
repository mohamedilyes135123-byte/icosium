import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Commented out to allow Next.js Middleware in dev
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
