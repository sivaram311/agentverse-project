import { test, expect } from "@playwright/test";
import { hasAuthPassword, loginViaJoinLobby } from "./helpers";

test.describe("optional CSS login", () => {
  test.skip(!hasAuthPassword(), "no credentials (set AV_E2E_PASSWORD)");

  test("login via Join lobby then reach Sessions / Session Desk", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await loginViaJoinLobby(page);

    const sessionsOrDesk = page
      .getByRole("button", { name: /^Sessions$/i })
      .or(page.getByText(/Session Desk/i));

    await expect(sessionsOrDesk.first()).toBeVisible({ timeout: 30_000 });
  });
});
