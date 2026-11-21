import type { NextConfig } from "next";

const origin = (url: string | undefined) => (url ? new URL(url).origin : '');

// Report-only for now: violations show in the browser console without blocking anything.
// Once a full pass of the site is clean, rename the header to Content-Security-Policy.
// 'unsafe-inline' stays because Next and the theme script use inline scripts and styles.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'production' ? '' : "'unsafe-eval'"} https://js.stripe.com https://maps.googleapis.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://lvartsmusic-ny.b-cdn.net https://*.googleusercontent.com https://maps.gstatic.com https://maps.googleapis.com https://*.stripe.com",
  "media-src 'self' blob: https://lvartsmusic-ny.b-cdn.net https://a6.asurahosting.com:6870",
  `connect-src 'self' ${origin(process.env.NEXT_PUBLIC_UPLOAD_WORKER_URL)} https://a6.asurahosting.com https://api.stripe.com https://maps.googleapis.com`,
  "frame-src https://js.stripe.com https://hooks.stripe.com https://www.youtube-nocookie.com https://player.vimeo.com https://player.twitch.tv https://open.spotify.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  serverExternalPackages: ['ssh2-sftp-client', 'ssh2', 'cpu-features'],
  // Fonts and logos are read from disk at render time, so the tracer can't see them.
  outputFileTracingIncludes: {
    '/api/cards/**': ['./assets/fonts/**', './public/brand/**', './public/logos/arts-abbr-sq.png', './public/logos/insta cards.png'],
  },
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
