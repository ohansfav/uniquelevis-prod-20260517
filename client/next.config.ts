import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins:
    process.env.NODE_ENV === "development"
      ? [
          "localhost",
          "127.0.0.1",
          "*.ngrok-free.dev",
          "*.ngrok-free.app",
          "*.ngrok.app",
          "*.ngrok.io",
          "192.168.*",
          "10.*",
          "172.*",
        ]
      : undefined,
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
