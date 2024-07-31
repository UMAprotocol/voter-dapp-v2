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
      use: ["@svgr/webpack"],
    });

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "polymarket-upload.*.amazonaws.com",
      },
    ],
  },
};

module.exports = nextConfig;
