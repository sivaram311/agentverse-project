import { test, expect } from "@playwright/test";

test.describe("hire + brief deeplink", () => {
  test("shows incident Brief strip or login — CSS gate is OK", async ({
    page,
  }) => {
    await page.goto(
      "/desk?intent=hire&crew=rajesh&brief=E2E%20brief&src=e2e-test",
      { waitUntil: "domcontentloaded" },
    );

    const bodyText = await page.locator("body").innerText({ timeout: 30_000 });
    expect(bodyText).not.toMatch(/Internal Server Error|Application error|HTTP ERROR 500/i);

    const briefOrIncident = page
      .getByRole("region", { name: /Incident brief/i })
      .or(page.getByText(/\bBrief\b|E2E brief/i));
    const loginUi = page
      .getByText(/Enter the hub|Join lobby|Sign in|Username|Password/i)
      .first();

    await expect(briefOrIncident.first().or(loginUi)).toBeVisible({
      timeout: 30_000,
    });
  });
});
