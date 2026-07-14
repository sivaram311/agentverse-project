import { test, expect } from "@playwright/test";
import {
  buildDispatchDeskUrl,
  DEFAULT_BASE_URL,
  prodDeckBaseURL,
} from "./helpers";

test.describe("Home → Dispatch → Desk path", () => {
  test("pack 0.8.x + AV health 0.3.1 + dispatch URL contract + optional land", async ({
    page,
    request,
  }, testInfo) => {
    const pdBase = prodDeckBaseURL();

    // (a) ProdDeck pack version starts with 0.8
    const packRes = await request.get(`${pdBase.replace(/\/$/, "")}/api/pack`);
    expect(packRes.ok(), `GET ${pdBase}/api/pack → ${packRes.status()}`).toBeTruthy();
    const pack = (await packRes.json()) as { version?: string };
    expect(pack.version ?? "", "pack.version starts with 0.8").toMatch(/^0\.8\b/);

    // (b) Upgrade staging health carries 0.3.1
    const healthRes = await request.get(`${DEFAULT_BASE_URL}/health`);
    expect(healthRes.ok(), `GET ${DEFAULT_BASE_URL}/health`).toBeTruthy();
    const healthBody = await healthRes.text();
    expect(healthBody).toMatch(/"status"\s*:\s*"ok"/);
    expect(healthBody).toContain('"version":"0.3.1"');

    // (c) Unit-style dispatch URL helper includes upgrade-staging host
    const deskUrl = buildDispatchDeskUrl({
      intent: "session-desk",
      crew: "rajesh",
      brief: "E2E dispatch path",
      returnUrl: pdBase,
      src: "proddeck",
      env: "preprod",
    });
    expect(deskUrl).toContain("agentverse-upgrade-staging");
    expect(deskUrl).toMatch(/[?&]src=proddeck/);
    expect(deskUrl).toMatch(/[?&]intent=session-desk/);
    expect(deskUrl).toContain("return=");

    // Soft UI probe on Home staging — login wall is OK (skip note).
    await page.goto(pdBase, { waitUntil: "domcontentloaded" }).catch(() => null);
    const loginWall = page.getByText(
      /Sign in|Log in|Enter the hub|Join lobby|Username|Password/i,
    );
    const cloudOsNav = page.getByText(/Dispatch|Forge|Places|Cloud OS|ProdDeck/i);
    const needsLogin = await loginWall
      .first()
      .isVisible({ timeout: 8_000 })
      .catch(() => false);
    const hasNav = await cloudOsNav
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (needsLogin && !hasNav) {
      testInfo.annotations.push({
        type: "note",
        description: `Home staging login wall — skipped UI Dispatch click (${pdBase})`,
      });
    } else if (hasNav) {
      const dispatchLink = page.getByRole("link", { name: /Dispatch/i }).or(
        page.getByText(/^Dispatch$/i),
      );
      const canClick = await dispatchLink
        .first()
        .isVisible()
        .catch(() => false);
      if (canClick) {
        await dispatchLink.first().click().catch(() => undefined);
      }
    }

    // (d) Optional: land constructed AV desk URL — login OR Session Desk
    await page.goto(deskUrl, { waitUntil: "domcontentloaded" });
    const bodyText = await page.locator("body").innerText({ timeout: 30_000 });
    expect(bodyText).not.toMatch(
      /Internal Server Error|Application error|HTTP ERROR 500/i,
    );
    const deskOrLogin = page
      .getByText(/Session Desk/i)
      .or(
        page.getByText(/Enter the hub|Join lobby|Sign in|Username|Password/i),
      );
    await expect(deskOrLogin.first()).toBeVisible({ timeout: 30_000 });
  });
});
