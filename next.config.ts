import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dh1msuk8kbcis.cloudfront.net',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ]
      }
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
