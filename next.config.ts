import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    // React <ViewTransition> for cross-route page transitions
    viewTransition: true,
  },
  async redirects() {
    return [
      {
        source: "/primitives",
        destination: "/systems",
        permanent: true,
      },
      {
        source: "/primitives/:slug",
        destination: "/systems/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
