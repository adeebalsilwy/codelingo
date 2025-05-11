import withPWA from 'next-pwa';
import withBundleAnalyzer from '@next/bundle-analyzer';

// تعطيل withPWA في حالة تشغيل BUILD_STANDALONE
const pwaEnabled = process.env.BUILD_STANDALONE !== 'true';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  distDir: process.env.BUILD_STANDALONE === 'true' ? '.next-standalone' : '.next',
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
    serverComponentsExternalPackages: ['bcryptjs', 'argon2'], // حزم لتضمينها كوحدات خارجية
  },
  // إضافة متغيرات بيئية للعامة
  env: {
    NEXT_IGNORE_TS_ERRORS: 'true',
    NEXT_PUBLIC_APP_VERSION: '0.1.5',
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
      os: false,
      child_process: false,
      util: false,
      stream: false
    };
    
    // تجاهل أخطاء واردة
    config.ignoreWarnings = [
      { message: /Critical dependency/i },
      { message: /Failed to parse source map/i },
      { message: /Can't resolve/i }
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

// استخدم withPWA فقط إذا كان ممكناً
const withPlugins = pwaEnabled 
  ? (config) => withPWA({
      ...config,
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
    })
  : (config) => config;

// تطبيق الإضافات
const config = withPlugins(nextConfig);
export default withAnalyzer(config);
