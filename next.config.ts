import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['ssh2-sftp-client', 'ssh2', 'cpu-features'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    minimumCacheTTL:2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lvartsmusic-ny.b-cdn.net',
        port: '',
        pathname: '**',
      }
    ],
    formats: ['image/webp'],
    qualities: [100]
  },
};

export default nextConfig;
