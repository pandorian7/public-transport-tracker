/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  serverActions: {
    bodySizeLimit: "10mb",
    allowedOrigins: [
      "localhost:3000",
      "localhost:8081",
      "localhost",
      "127.0.0.1:3000", 
      "127.0.0.1:8081",
      "127.0.0.1",
      "0.0.0.0:3000",
      "0.0.0.0",
    ],
  },

  // Ensure proper hostname binding in Docker
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
