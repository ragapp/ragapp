/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "",
  env: {
    ENVIRONMENT: process.env.ENVIRONMENT,
  },
};

export default nextConfig;
