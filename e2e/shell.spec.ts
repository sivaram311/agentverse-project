import { test, expect } from "@playwright/test";

test.describe("shell cold load", () => {
  test("shows AgentVerse / Digital office or login UI (no WebGL required)", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const shellOrLogin = page
      .getByText(/AgentVerse|Digital office|Enter the hub|Join lobby|Sign in/i)
      .first();

    await expect(shellOrLogin).toBeVisible({ timeout: 30_000 });
  });
});
