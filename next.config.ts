import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],
  async rewrites() {
    // Serve JPEG bytes for legacy .jfif URLs (Safari/iPad-safe)
    return [
      {
        source: "/uploads/:name.jfif",
        destination: "/uploads/:name.jpg",
      },
      {
        source: "/uploads/:name.jfi",
        destination: "/uploads/:name.jpg",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/uploads/:path*.jfif",
        headers: [{ key: "Content-Type", value: "image/jpeg" }],
      },
      {
        source: "/uploads/:path*.jpg",
        headers: [{ key: "Content-Type", value: "image/jpeg" }],
      },
    ];
  },
};

export default nextConfig;
