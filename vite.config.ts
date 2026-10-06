import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// SW_PROFILE selects what ships: `internal` (default, everything, review badges
// shown) or `public` (approved content and publicOk assets only). The profile
// gate itself is a test (tests/profile.test.ts) plus tools/bundle-scan.ts.
const profile = process.env.SW_PROFILE === "public" ? "public" : "internal";

export default defineConfig({
  // Relative base: dist/ works from any path prefix while the host is open (spec OD-4).
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    {
      // Designer infographics are internal-only (spec OD-6): in the public profile
      // their files load as nothing, so none is emitted into dist/.
      name: "internal-only-assets",
      enforce: "pre",
      load: (id) =>
        profile === "public" && id.includes("/src/assets/designer-infographics/")
          ? "export default undefined;"
          : null,
    },
  ],
  define: {
    __SW_PROFILE__: JSON.stringify(profile),
  },
  build: {
    target: "es2022",
    sourcemap: false,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1200,
  },
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    environment: "node",
  },
});
