import withPWA from 'next-pwa';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true, // تجاهل أخطاء TypeScript أثناء البناء
    tsconfigPath: './tsconfig.json' // مسار ملف التكوين
  },
  eslint: {
    ignoreDuringBuilds: true, // تجاهل أخطاء ESLint أثناء البناء
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'framer-motion'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
    nodeMiddleware: true,
    esmExternals: true, // تحسين التعامل مع وحدات ESM
    typedRoutes: false, // تعطيل مسارات مكتوبة
    swcMinify: true, // استخدام SWC للتقليل
    serverComponentsExternalPackages: ['bcryptjs'], // حزم لتضمينها كوحدات خارجية
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  webpack: (config, { dev, isServer }) => {
    // إضافة حل لمشاكل وحدات ESM ومكتبات صعبة
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      path: false,
      os: false
    };
    
    // تجاهل أخطاء واردة
    config.ignoreWarnings = [
      { message: /Critical dependency/i }
    ];
    
    return config;
  },
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Content-Range",
            value: "bytes : 0-9/*",
          },
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

const config = withPWA({
  ...nextConfig,
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      {
        urlPattern: /^https:\/\/api\/.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
        },
      },
    ],
  }
});

export default withAnalyzer(config);
