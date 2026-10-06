/**
 * Playwright smoke over the built app (`mise run e2e` builds first). Two
 * viewports, desktop and phone; screenshots land in docs/screens/.
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4173/",
    // Headless Chromium renders WebGL through SwiftShader.
    launchOptions: {
      args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: "pnpm exec vite preview --port 4173 --strictPort",
    port: 4173,
    reuseExistingServer: true,
  },
});
