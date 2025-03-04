/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'codelingo.app'],
  },
  // Ensure trailing slashes for better compatibility
  trailingSlash: true,
  // Disable strict mode for compatibility
  reactStrictMode: false,
};

module.exports = nextConfig; 