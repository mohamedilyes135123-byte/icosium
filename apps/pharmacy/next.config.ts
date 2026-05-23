import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://bvhdeqbonkmfxdndwgge.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aGRlcWJvbmttZnhkbmR3Z2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzYwMTgsImV4cCI6MjA5MTUxMjAxOH0.okxeCTUNdWAiME2vrE93GP3tA0UKBZb2WwuoBUlbVwE"
  }
};

export default nextConfig;
