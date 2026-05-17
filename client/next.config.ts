import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET;

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
    if (!apiProxyTarget) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
