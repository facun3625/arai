import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  experimental: {},
  images: {
    domains: ['lh3.googleusercontent.com'],
    unoptimized: true,
  },
};

export default nextConfig;
