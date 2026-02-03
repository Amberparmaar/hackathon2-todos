/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      'https://amberparmaar-backend-todo.hf.space',
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
