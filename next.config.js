/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // This setting is required for static export
  images: {
    unoptimized: true,
  },
  // Disable server components for static export
  experimental: {
    appDir: true,
  },
  // Ensure trailing slashes for better compatibility with static hosting
  trailingSlash: true,
  // Disable strict mode for compatibility
  reactStrictMode: false,
};

module.exports = nextConfig; 