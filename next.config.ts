import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const video = [
      { key: "Content-Type", value: "video/mp4" },
      { key: "Accept-Ranges", value: "bytes" },
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];
    return [
      { source: "/media/hero-720.mp4", headers: video },
      { source: "/media/hero-480.mp4", headers: video },
    ];
  },
};

export default nextConfig;
