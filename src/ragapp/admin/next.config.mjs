/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/admin",
  env: {
    ENVIRONMENT: process.env.ENVIRONMENT,
  },
};

export default nextConfig;
