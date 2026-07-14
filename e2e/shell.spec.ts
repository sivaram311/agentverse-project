import { test, expect } from "@playwright/test";

test.describe("shell cold load", () => {
  test("shows AgentVerse / Digital office or login UI (no WebGL required)", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Prefer interactive login/chrome. Avoid `.hero-copy h1` ("Digital office") —
    // that node is aria-hidden and fails toBeVisible even when the hub renders.
    const shellOrLogin = page
      .getByRole("heading", { name: /Enter the hub/i })
      .or(page.getByRole("button", { name: /Join lobby|Sign in/i }))
      .or(page.getByRole("button", { name: /^Sessions$/i }))
      .or(page.getByRole("strong", { name: /^AgentVerse$/i }));

    await expect(shellOrLogin.first()).toBeVisible({ timeout: 30_000 });
  });
});
