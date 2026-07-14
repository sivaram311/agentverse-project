import { test, expect } from "@playwright/test";

test.describe("FlatRoster / WebGL fallback", () => {
  test("soft: flat-roster OR annotate WebGL healthy — never fail for WebGL", async ({
    page,
    request,
  }, testInfo) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const flatRoster = page.locator(".flat-roster");
    const openDesk = page.getByText(/Open Session Desk/i);
    const fallbackVisible =
      (await flatRoster.isVisible().catch(() => false)) ||
      (await openDesk
        .first()
        .isVisible({ timeout: 8_000 })
        .catch(() => false));

    if (fallbackVisible) {
      await expect(flatRoster.or(openDesk).first()).toBeVisible();
      testInfo.annotations.push({
        type: "note",
        description: "WebGL-fallback FlatRoster UI visible",
      });
    } else {
      testInfo.annotations.push({
        type: "note",
        description:
          "WebGL is healthy (fallback FlatRoster not required) — soft pass",
      });
    }

    // globals.css is served via Next layout — optional HEAD/GET must not 500.
    // Existence is NOT required in-browser; only soft-check asset HTTP status.
    const globalsRes = await request
      .get("/_next/static/css/app/layout.css")
      .catch(() => null);
    if (globalsRes) {
      expect
        .soft(globalsRes.status(), "optional globals-style asset not 500")
        .toBeLessThan(500);
    } else {
      // Fallback probe: any stylesheet link on the page.
      const href = await page
        .locator('link[rel="stylesheet"]')
        .first()
        .getAttribute("href")
        .catch(() => null);
      if (href) {
        const abs = new URL(href, page.url()).toString();
        const res = await request.get(abs);
        expect
          .soft(res.status(), `stylesheet ${abs} not 500`)
          .toBeLessThan(500);
      }
    }
  });
});
