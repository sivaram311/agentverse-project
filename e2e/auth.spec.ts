import { test, expect } from "@playwright/test";
import { hasAuthPassword, loginViaJoinLobby } from "./helpers";

test.describe("optional CSS login", () => {
  test.skip(!hasAuthPassword(), "no credentials (set AV_E2E_PASSWORD)");

  test("login via Join lobby then reach Sessions / Session Desk", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await loginViaJoinLobby(page);

    // loginViaJoinLobby already waits for Sessions (CommandStrip after auth).
    await expect(page.getByRole("button", { name: /^Sessions$/i })).toBeVisible();
  });
});
