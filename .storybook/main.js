const webpack = require("webpack");

module.exports = {
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-addon-next",
    "storybook-addon-pseudo-states"
  ],
  "staticDirs": ["../public"],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-webpack5"
  },
  webpackFinal: async config => {
    // this modifies the existing image rule to exclude .svg files
    // since we want to handle those files with @svgr/webpack
    const imageRule = config.module.rules.find(rule => rule.test.test('.svg'))
    imageRule.exclude = /\.svg$/

    // configure .svg files to be loaded with @svgr/webpack
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })

    config.module.rules.push({
      test: /\.js/,
      resolve: {
        fullySpecified: false
      }
    })

    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify"),
      url: require.resolve("url"),
    });
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
    ]);

    return config
  }
}