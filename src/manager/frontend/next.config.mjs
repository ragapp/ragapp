/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '',
    env: {
        DEVELOPMENT: process.env.DEVELOPMENT,
    },
};

export default nextConfig;
