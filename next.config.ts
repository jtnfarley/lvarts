import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    remotePatterns: [new URL('https://lvartsmusic-ny.b-cdn.net/**')],
  },
};

export default nextConfig;
