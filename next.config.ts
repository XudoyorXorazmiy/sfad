import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "sfad.uz" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  // Prisma binary'lar server bundle'iga to'g'ri kirishi uchun
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
};

export default nextConfig;
