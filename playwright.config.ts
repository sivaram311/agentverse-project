import { defineConfig } from "@playwright/test";

const baseURL =
  process.env.AV_E2E_BASE_URL?.trim() ||
  "https://agentverse-upgrade-staging.delena.buzz";

/** CI or common CI-ish envs → one retry. */
const ciIsh = !!(
  process.env.CI ||
  process.env.GITHUB_ACTIONS ||
  process.env.TF_BUILD
);

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 30_000 },
  retries: ciIsh ? 1 : 0,
  outputDir: "e2e-artifacts/",
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    browserName: "chromium",
    viewport: { width: 360, height: 780 },
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
