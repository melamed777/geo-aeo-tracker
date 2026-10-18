import type { NextConfig } from "next";

// Optional subpath prefix (e.g. "/geo"). Set via NEXT_PUBLIC_BASE_PATH at build
// time; empty in local dev so the app runs at the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  // Serve the whole app under a subpath when deployed (leto.ddns.net/geo).
  basePath,
  // Produce a self-contained server build (.next/standalone) for the Docker
  // image — ships only the traced files, so the runtime image stays small.
  output: "standalone",
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
