/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com'
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev'
      }
    ]
  },
  // Headers configuration
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Add headers for API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Total-Count, Content-Range, Range, Accept, Origin, X-Requested-With, X-HTTP-Method-Override',
          },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'Content-Range, X-Total-Count, Content-Length, Range, ETag, Location',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          }
        ],
      }
    ];
  },
  // Development optimization
  webpack: (config, { dev, isServer }) => {
    // Only enable source maps in development
    if (dev) {
      config.devtool = 'eval-source-map';
    }

    // Handle Emotion styling
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@emotion/core': '@emotion/react',
        'emotion-theming': '@emotion/react',
      };
    }

    return config;
  },
  compiler: {
    emotion: true
  }
};

module.exports = nextConfig; 