import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize production builds
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.percolator.site wss://api.percolator.site; script-src 'self' 'unsafe-eval' 'unsafe-inline' https: blob:; style-src 'self' 'unsafe-inline' https:; style-src-elem 'self' 'unsafe-inline' https:; font-src 'self' data: https:; frame-src 'self' https:; connect-src * wss: ws: https: http: https://api.percolator.site wss://api.percolator.site; img-src 'self' data: https: http: blob:; object-src 'none'; base-uri 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
