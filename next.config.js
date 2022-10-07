/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: { styledComponents: true },
  eslint: {
    dirs: [
      "components",
      "constants",
      "contexts",
      "data",
      "graph",
      "helpers",
      "hooks",
      "pages",
      "scripts",
      "stories",
      "styles",
      "types",
      "web3",
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      typescript: true,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

module.exports = nextConfig;
