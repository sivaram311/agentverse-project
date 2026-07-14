import { expect, type Page, type Locator } from "@playwright/test";

/** Default upgrade fleet staging origin (port 4312 behind Cloudflare). */
export const DEFAULT_BASE_URL =
  "https://agentverse-upgrade-staging.delena.buzz";

export function baseURL(): string {
  const fromEnv = process.env.AV_E2E_BASE_URL?.trim();
  return fromEnv || DEFAULT_BASE_URL;
}

/** True when targeting the AgentVerse upgrade fleet (staging host or :4312). */
export function isUpgradeHost(url: string = baseURL()): boolean {
  try {
    const u = new URL(url);
    if (u.hostname.includes("agentverse-upgrade")) return true;
    if (u.port === "4312") return true;
    // Default HTTPS origins omit port; treat known upgrade hostname as upgrade.
    return u.hostname === "agentverse-upgrade-staging.delena.buzz";
  } catch {
    return /agentverse-upgrade|:4312\b/i.test(url);
  }
}

export function hasAuthCredentials(): boolean {
  return Boolean(
    process.env.AV_E2E_USER?.trim() && process.env.AV_E2E_PASSWORD?.trim(),
  );
}

export function authCredentials(): { user: string; password: string } | null {
  if (!hasAuthCredentials()) return null;
  return {
    user: process.env.AV_E2E_USER!.trim(),
    password: process.env.AV_E2E_PASSWORD!.trim(),
  };
}

/** Soft visibility check — continues the test on failure (Playwright soft expect). */
export async function softVisible(
  locator: Locator,
  message?: string,
): Promise<void> {
  await expect.soft(locator, message).toBeVisible();
}

/** Soft URL / text match helper. */
export async function softUrlContains(
  page: Page,
  fragment: string | RegExp,
): Promise<void> {
  await expect.soft(page).toHaveURL(fragment);
}

/**
 * Soft navigate: goto + soft assert HTTP-ish success (no hard throw on overlay gates).
 * Callers own hard assertions for product behavior.
 */
export async function softGoto(
  page: Page,
  path: string,
): Promise<void> {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect
    .soft(response, `softGoto ${path}: response present`)
    .toBeTruthy();
  if (response) {
    expect
      .soft(response.status(), `softGoto ${path}: status < 500`)
      .toBeLessThan(500);
  }
}
