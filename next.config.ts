import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['@napi-rs/canvas'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allows ANY hostname
      },
      {
        protocol: "http",
        hostname: "**", // if you want to allow http images too
      },
    ],
  },
};

export default nextConfig;
