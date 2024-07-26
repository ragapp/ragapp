/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: process.env.APP_PATH || '',
    env: {
        APP_PATH: process.env.APP_PATH || '',
        DEVELOPMENT: process.env.DEVELOPMENT,
    },
};

export default nextConfig;
