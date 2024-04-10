// webpack config must be a function in NextJS that is used to patch the default webpack config provided by NextJS, see https://nextjs.org/docs/pages/api-reference/next-config-js/webpack
export default function webpack(config) {
  // See https://webpack.js.org/configuration/resolve/#resolvealias
  config.resolve.alias = {
    ...config.resolve.alias,
    sharp$: false,
    "onnxruntime-node$": false,
  };
  return config;
}
