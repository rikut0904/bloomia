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
  env: {
    // Load environment variables from .env instead of .env.local
    customKey: process.env.CUSTOM_KEY,
  },
  // Enable standalone output for Docker
  output: 'standalone',
}

export default nextConfig
