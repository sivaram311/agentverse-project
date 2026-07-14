import { test, expect } from "@playwright/test";
import { baseURL, isUpgradeHost, softGoto } from "./helpers";

/**
 * Tiny scaffold smoke — Lane SPECS owns the full suite.
 * Keeps `npm run test:e2e` runnable before other specs land.
 */
test.describe("scaffold smoke", () => {
  test("baseURL targets upgrade fleet by default", () => {
    expect(isUpgradeHost(baseURL())).toBeTruthy();
  });

  test("cold load / does not 5xx", async ({ page }) => {
    await softGoto(page, "/");
    await expect(page.locator("body")).toBeAttached();
  });
});
