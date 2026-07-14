import { expect, type Page, type Locator } from "@playwright/test";

/** Default upgrade fleet staging origin (port 4312 behind Cloudflare). */
export const DEFAULT_BASE_URL =
  "https://agentverse-upgrade-staging.delena.buzz";

export const UPGRADE_PROD_BASE_URL =
  "https://agentverse-upgrade.delena.buzz";

export const DEFAULT_PD_BASE_URL = "https://home-staging.delena.buzz";

export function baseURL(): string {
  const fromEnv = process.env.AV_E2E_BASE_URL?.trim();
  return fromEnv || DEFAULT_BASE_URL;
}

export function prodDeckBaseURL(): string {
  const fromEnv = process.env.PD_E2E_BASE?.trim();
  return fromEnv || DEFAULT_PD_BASE_URL;
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

/** Password is the gate; username defaults to admin when only password is set. */
export function hasAuthPassword(): boolean {
  return Boolean(process.env.AV_E2E_PASSWORD?.trim());
}

export function hasAuthCredentials(): boolean {
  return hasAuthPassword();
}

export function authCredentials(): { user: string; password: string } | null {
  if (!hasAuthPassword()) return null;
  return {
    user: process.env.AV_E2E_USER?.trim() || "admin",
    password: process.env.AV_E2E_PASSWORD!.trim(),
  };
}

/**
 * Canonical ProdDeck → AgentVerse upgrade deep-link (DEEP-LINK-CONTRACT).
 * Staging host is the closeout SoT unless `env: "prod"`.
 */
export function buildDispatchDeskUrl(opts: {
  avHost?: string;
  crew?: string;
  intent?: "session-desk" | "hire";
  brief?: string;
  returnUrl?: string;
  src?: string;
  env?: "dev" | "preprod" | "prod";
}): string {
  const host =
    opts.avHost ??
    (opts.env === "prod"
      ? UPGRADE_PROD_BASE_URL
      : DEFAULT_BASE_URL);
  const u = new URL("/desk", host.endsWith("/") ? host : `${host}/`);
  u.searchParams.set("src", opts.src ?? "proddeck");
  u.searchParams.set("intent", opts.intent ?? "session-desk");
  if (opts.crew) u.searchParams.set("crew", opts.crew);
  if (opts.brief) u.searchParams.set("brief", opts.brief);
  if (opts.returnUrl) u.searchParams.set("return", opts.returnUrl);
  if (opts.env) u.searchParams.set("env", opts.env);
  return u.toString();
}

/**
 * Fill Join lobby / #av-username #av-password when visible; no-op if already authed.
 * Waits for CSS login HTTP + overlay dismiss + Sessions chrome (CommandStrip).
 */
export async function loginViaJoinLobby(page: Page): Promise<void> {
  const creds = authCredentials();
  if (!creds) {
    throw new Error("loginViaJoinLobby requires AV_E2E_PASSWORD");
  }

  const passwordField = page.locator("#av-password");
  const sessionsBtn = page.getByRole("button", { name: /^Sessions$/i });

  // Either already in, or login form — do not early-return on a slow hydrate.
  const formOrSessions = passwordField.or(sessionsBtn);
  await expect(formOrSessions.first()).toBeVisible({ timeout: 45_000 });

  if (await sessionsBtn.isVisible().catch(() => false)) return;

  await page.locator("#av-username").fill(creds.user);
  await passwordField.fill(creds.password);
  await expect(passwordField).toHaveValue(creds.password);

  const join = page.getByRole("button", { name: /Join lobby|Sign in/i });
  await expect(join).toBeEnabled();

  const loginResponse = page.waitForResponse(
    (r) =>
      r.url().includes("/api/css/auth/login") &&
      r.request().method() === "POST",
    { timeout: 45_000 },
  );
  await join.click();
  const res = await loginResponse;
  if (!res.ok()) {
    const text = await res.text().catch(() => "");
    throw new Error(`CSS login HTTP ${res.status()}: ${text.slice(0, 200)}`);
  }

  // Overlay stays on portal reject — surface on-page error instead of hanging.
  await expect(passwordField).toBeHidden({ timeout: 45_000 });

  // PWA / last-desk restore may open ChatPanel — that unmounts CommandStrip Sessions.
  const closeChat = page.getByRole("button", { name: /Close chat/i });
  if (await closeChat.isVisible().catch(() => false)) {
    await closeChat.click();
  }

  // Prefer CommandStrip; else open office chrome for TopBar Sessions.
  if (!(await sessionsBtn.isVisible().catch(() => false))) {
    const showOffice = page.getByRole("button", {
      name: /Show office controls|Office/i,
    });
    if (await showOffice.first().isVisible().catch(() => false)) {
      await showOffice.first().click();
    }
  }

  await expect(sessionsBtn).toBeVisible({ timeout: 30_000 });
}

/** Open Session Desk from Sessions chip (assumes logged in; closes chat if needed). */
export async function openSessionDesk(page: Page): Promise<void> {
  const closeChat = page.getByRole("button", { name: /Close chat/i });
  if (await closeChat.isVisible().catch(() => false)) {
    await closeChat.click();
  }
  const sessionsBtn = page.getByRole("button", { name: /^Sessions$/i });
  if (!(await sessionsBtn.isVisible().catch(() => false))) {
    const showOffice = page.getByRole("button", {
      name: /Show office controls|Office/i,
    });
    if (await showOffice.first().isVisible().catch(() => false)) {
      await showOffice.first().click();
    }
  }
  await expect(sessionsBtn).toBeVisible({ timeout: 20_000 });
  await sessionsBtn.click();
  await expect(page.getByText(/Session Desk/i).first()).toBeVisible({
    timeout: 20_000,
  });
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
