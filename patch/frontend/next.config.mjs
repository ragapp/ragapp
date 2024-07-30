// Apply patch to set assetPrefix to use ASSET_PREFIX for exported assets
// which is easier to replace with others path under reverse proxy
/** @type {import('next').NextConfig} */

import fs from "fs";
import withLlamaIndex from "llamaindex/next";
import webpack from "./webpack.config.mjs";

const nextConfig = JSON.parse(fs.readFileSync("./next.config.json", "utf-8"));

if (process.env.ENVIRONMENT !== 'dev') {
    // This prefix will be rewritten by BASE_URL when deployed, see entrypoint.sh
    nextConfig.assetPrefix = process.env.ASSET_PREFIX;
}

nextConfig.webpack = webpack;

// use withLlamaIndex to add necessary modifications for llamaindex library
export default withLlamaIndex(nextConfig);
