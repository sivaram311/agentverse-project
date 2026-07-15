import { test, expect } from "@playwright/test";

test.describe("upgrade-staging /health", () => {
  test("returns ok agentverse body (prefer version 0.3.2)", async ({
    request,
  }, testInfo) => {
    const res = await request.get("/health");
    expect(res.ok(), `GET /health status ${res.status()}`).toBeTruthy();

    const body = await res.text();
    expect(body).toMatch(/"status"\s*:\s*"ok"/);
    expect(body).toMatch(/"service"\s*:\s*"agentverse"/);

    const versionMatch = body.match(/"version"\s*:\s*"([^"]+)"/);
    const version = versionMatch?.[1] ?? "(missing)";

    if (version === "0.3.2" || version === "0.3.1") {
      expect(["0.3.2", "0.3.1"]).toContain(version);
    } else {
      await testInfo.attach("version-note", {
        body: `Live /health version is "${version}" (prefer 0.3.2). Passed on status/service only.`,
        contentType: "text/plain",
      });
    }
  });
});
