import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  experimental: {},
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

export default nextConfig;
