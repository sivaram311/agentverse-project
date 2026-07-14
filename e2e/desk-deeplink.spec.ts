import { test, expect } from "@playwright/test";

test.describe("desk session-desk deeplink", () => {
  test("opens Session Desk or login — not a bare 500", async ({ page }) => {
    await page.goto("/desk?intent=session-desk&src=e2e-test", {
      waitUntil: "domcontentloaded",
    });

    const bodyText = await page.locator("body").innerText({ timeout: 30_000 });
    expect(bodyText).not.toMatch(/Internal Server Error|Application error|HTTP ERROR 500/i);
    expect(bodyText.trim().length).toBeGreaterThan(0);

    const sessionDesk = page.getByText(/Session Desk/i).first();
    const loginUi = page
      .getByText(/Enter the hub|Join lobby|Sign in|Username|Password/i)
      .first();

    await expect(sessionDesk.or(loginUi)).toBeVisible({ timeout: 30_000 });
  });
});
