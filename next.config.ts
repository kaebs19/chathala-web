import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "matchhala.khalafiati.io",
      },
      {
        protocol: "https",
        hostname: "matchhala.chathala.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://matchhala.khalafiati.io/api/:path*",
      },
    ];
  },
};

export default nextConfig;
