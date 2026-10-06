/**
 * Playwright smoke over the built app (`mise run e2e` builds first). Two
 * viewports, desktop and phone; screenshots land in docs/screens/.
 * E2E_PORT (set by `mise run e2e` to a free port) lets worktrees run at once.
 */
import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 4173);

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}/`,
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
    command: `pnpm exec vite preview --port ${port} --strictPort`,
    port,
    // Never test another worktree's build on the same port.
    reuseExistingServer: false,
  },
});
