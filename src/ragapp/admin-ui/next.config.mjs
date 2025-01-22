/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "/admin",
  env: {
    ENVIRONMENT: process.env.ENVIRONMENT,
  },
};

export default nextConfig;
