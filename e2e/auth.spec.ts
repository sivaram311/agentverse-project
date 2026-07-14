import { test, expect } from "@playwright/test";

const password = process.env.AV_E2E_PASSWORD;
const username = process.env.AV_E2E_USER ?? "admin";

test.describe("optional CSS login", () => {
  test.skip(!password, "no credentials (set AV_E2E_PASSWORD)");

  test("login then reach Sessions / Session Desk", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const passwordField = page.locator("#av-password");
    const loginVisible = await passwordField
      .isVisible({ timeout: 20_000 })
      .catch(() => false);

    if (loginVisible) {
      const userField = page.locator("#av-username");
      await userField.fill(username);
      await passwordField.fill(password!);
      await page.getByRole("button", { name: /Join lobby|Sign in|Sign/i }).click();
    }

    const sessionsOrDesk = page
      .getByRole("button", { name: /^Sessions$/i })
      .or(page.getByText(/Session Desk/i));

    await expect(sessionsOrDesk.first()).toBeVisible({ timeout: 30_000 });
  });
});
