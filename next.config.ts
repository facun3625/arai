import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  experimental: {},
  images: {
    domains: ['lh3.googleusercontent.com'],
    unoptimized: true,
  },
};

export default nextConfig;
