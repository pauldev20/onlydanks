import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['static.usernames.app-backend.toolsforhumanity.com'],
  },
  allowedDevOrigins: ['0893-83-144-23-157.ngrok-free.app'], // Add your dev origin here
  reactStrictMode: false,
  output: 'standalone',
};

export default nextConfig;
