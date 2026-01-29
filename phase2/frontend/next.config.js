/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      'https://amberparmaar-backend-todo.hf.space',
  },
  experimental: {
    // Ensure CSS is properly processed
    optimizeCss: true,
  },
  // Ensure all static assets are handled properly
  assetPrefix: './',
};

module.exports = nextConfig
