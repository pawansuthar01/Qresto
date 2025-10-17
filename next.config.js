/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,

  images: {
    // Production: allow only listed domains
    domains:
      process.env.NODE_ENV === "production"
        ? ["pawansuthar.in", "another-allowed-domain.com"]
        : [],

    // Development: allow all remote images using remotePatterns
    remotePatterns:
      process.env.NODE_ENV === "development"
        ? [
            { protocol: "https", hostname: "**" },
            { protocol: "http", hostname: "**" },
          ]
        : [],
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["http://localhost:3000"],
    },
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = withPWA(nextConfig);
