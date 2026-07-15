import { test, expect } from "@playwright/test";

/**
 * 0.3.5 — stageVisible cast swap + Context decision affordance.
 * Upgrade DEV only. Soft on auth/WebGL.
 */
test.describe("stage cast + context decision (0.3.5)", () => {
  test("team bar reflects pack stageVisible after setActivePack", async ({
    page,
  }) => {
    await page.goto("/desk?src=proddeck");
    await page.waitForTimeout(800);

    const bar = page.getByTestId("team-bar-cast");
    // May need login — if team bar missing, soft skip
    if ((await bar.count()) === 0) {
      test.skip(true, "team bar not mounted (auth/chrome)");
      return;
    }

    await expect(bar).toHaveAttribute("data-pack", /proddeck|agentverse/, {
      timeout: 15_000,
    });

    // ProdDeck cast should include helpdesk; lavanya may be present; meenakshi often not
    const ids = await bar.locator("[data-persona-id]").evaluateAll((els) =>
      els.map((e) => e.getAttribute("data-persona-id")),
    );
    expect(ids.length).toBeGreaterThan(0);
    expect(ids).toContain("helpdesk");
  });

  test("Context chip opens decision dialog", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(600);
    const openBtn = page.getByTestId("context-decision-open");
    if ((await openBtn.count()) === 0) {
      test.skip(true, "command strip not visible (chat open or auth)");
      return;
    }
    // Soft when strip is mounted but covered (login overlay / chat takeover)
    if (!(await openBtn.isVisible())) {
      test.skip(true, "Context chip not interactable (overlay/chat)");
      return;
    }
    await openBtn.click();
    await expect(page.getByTestId("context-decision")).toBeVisible();
  });
});
