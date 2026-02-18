import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Disable React Strict Mode to prevent double rendering during development
  reactStrictMode: false,
  
  // Static export for Netlify deployment (uncomment if needed)
  // output: 'export',
  // trailingSlash: true,
  
  // Production und Development Config
  turbopack: {
    root: path.resolve(".")
  },
  experimental: {
    optimizeCss: true
  },
  // Allow cross-origin access for testing
  ...(process.env.NODE_ENV === "development" && {
    allowedDevOrigins: [
      "192.168.178.122",
      "localhost", 
      "127.0.0.1"
    ]
  }),
  // Output standalone for Railway deployment
  output: 'standalone'
};

export default nextConfig;
