import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Disable React Strict Mode to prevent double rendering during development
  reactStrictMode: false,
  
  // Static export for Netlify deployment (uncomment if needed)
  // output: 'export',
  // trailingSlash: true,
  
  // Exclude experimental folder from build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Production und Development Config
  turbopack: {
    root: path.resolve(".")
  },
  experimental: {
    optimizeCss: true
  },
  
  // Webpack configuration to exclude experimental folder
  webpack: (config) => {
    config.resolve.alias['@experimental'] = false;
    return config;
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
