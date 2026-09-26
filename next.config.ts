import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["firebase-admin"],
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] },
};
export default nextConfig;
