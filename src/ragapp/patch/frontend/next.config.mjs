// Apply patch to set assetPrefix to use https://static-assets.ragapp.org for exported assets

/** @type {import('next').NextConfig} */

import fs from "fs";
import withLlamaIndex from "llamaindex/next";
import webpack from "./webpack.config.mjs";

const nextConfig = JSON.parse(fs.readFileSync("./next.config.json", "utf-8"));

// Add transpilePackages configuration
nextConfig.transpilePackages = ["highlight.js"];

process.env.ENVIRONMENT === "dev"
  ? (nextConfig.assetPrefix = undefined)
  : // This prefix will be rewritten by BASE_URL when deployed, see entrypoint.sh
    (nextConfig.assetPrefix = "https://static-assets.ragapp.org");

nextConfig.webpack = webpack;

// use withLlamaIndex to add necessary modifications for llamaindex library
export default withLlamaIndex(nextConfig);
