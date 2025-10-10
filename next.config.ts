import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
