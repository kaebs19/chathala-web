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
        source: "/:path*",
        headers: [
          // Private messages and profiles live here — don't let another origin
          // frame the app and trick a signed-in user into clicking through it.
          { key: "X-Frame-Options", value: "DENY" },
          // Stop /profile/{id} and /chats/{id} paths leaking to external sites.
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // The web client uses none of these today (photo upload is a plain
          // file input and needs no camera grant). Add `self` to an entry when
          // the matching feature actually ships.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
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
