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
  async headers() {
    return [
      {
        // static logo/icon assets — safe to cache hard, they change with a new filename
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:3000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
