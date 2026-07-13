import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    // React <ViewTransition> for cross-route page transitions
    viewTransition: true,
  },
};

export default nextConfig;
