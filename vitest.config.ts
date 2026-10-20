import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  // Next.js preserves JSX for its own compiler; component tests need it
  // transformed before Vite's import analysis.
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    alias: {
      "@uma/contracts-frontend": new URL(
        "tests/__mocks__/uma-contracts-frontend.ts",
        import.meta.url
      ).pathname,
    },
  },
  test: {
    environment: "node",
    globals: true,
    // don't pick up compiled copies of tests from the next build output
    exclude: ["**/node_modules/**", "**/.next/**", "**/cypress/**"],
  },
});
