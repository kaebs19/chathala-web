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
};

export default nextConfig;
