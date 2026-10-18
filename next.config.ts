import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained server build (.next/standalone) for the Docker
  // image — ships only the traced files, so the runtime image stays small.
  output: "standalone",
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
