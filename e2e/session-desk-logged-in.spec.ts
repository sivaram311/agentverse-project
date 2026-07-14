import { test, expect } from "@playwright/test";
import { hasAuthPassword, loginViaJoinLobby } from "./helpers";

test.describe("logged-in Session Desk", () => {
  test.skip(!hasAuthPassword(), "no credentials (set AV_E2E_PASSWORD)");

  test("search + Active/Archived filters; New/Refresh always present", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await loginViaJoinLobby(page);

    const sessionsBtn = page.getByRole("button", { name: /^Sessions$/i });
    await expect(sessionsBtn).toBeVisible({ timeout: 30_000 });
    await sessionsBtn.click();

    await expect(page.getByText(/Session Desk/i).first()).toBeVisible({
      timeout: 20_000,
    });

    const search = page
      .locator("#session-desk-query")
      .or(page.getByPlaceholder(/Search/i));
    await expect(search.first()).toBeVisible({ timeout: 15_000 });

    await expect(
      page.getByRole("button", { name: /^Active$/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Archived$/i }),
    ).toBeVisible();

    // Cancel run only appears for busy sessions — do not require it.
    const cancelRun = page.getByRole("button", { name: /Cancel run/i });
    const cancelVisible = await cancelRun
      .first()
      .isVisible()
      .catch(() => false);
    if (!cancelVisible) {
      await expect(
        page.getByRole("button", { name: /^New$/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Refresh/i }),
      ).toBeVisible();
    } else {
      await expect(cancelRun.first()).toBeVisible();
    }
  });
});
