import { test, expect } from "@playwright/test";
import { resetEmulators } from "../support/emulator.js";
import { gotoReady } from "../support/hydration.js";

/**
 * Page-level smoke tests for the v2 tree.
 *
 * `smoke.spec.js` covers v1's four pages and has never been extended, so the
 * ten public v2 pages below had no spec of any kind — the booking flow, the
 * account pages and the auth routes are well covered, and everything a client
 * reads before they book was not covered at all.
 *
 * Same contract as the v1 smoke file: the page renders, and nothing throws
 * during effects or hydration. On top of that, two things specific to this
 * tree. Every page must wear the v2 shell (`.v2-root`) — the split that keeps
 * framer-motion, gsap and swiper out of v2 is what a stray v1 import would
 * undo. And every page must carry its own <title>: the root layout used to
 * declare `metadata` without exporting it and hand-write a literal <title>
 * into <head>, so each page emitted two, generic one first. Titles are
 * asserted as a set at the bottom, because that bug is invisible one page at
 * a time — every page had a title, just the same one.
 */

// The pages a client can reach from the nav or a shared link.
const PAGES = [
  "/v2",
  "/v2/services",
  "/v2/salon",
  "/v2/about",
  "/v2/gallery",
  "/v2/journal",
  "/v2/shop",
  "/v2/contact",
  "/v2/consultation",
  "/v2/free-guide",
];

// The layout's fallback, which no page should be left wearing.
const GENERIC_TITLE = "Flourish Roots Hair";

test.beforeEach(async () => {
  await resetEmulators();
});

for (const path of PAGES) {
  test(`${path} renders in the v2 shell without uncaught errors`, async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await gotoReady(page, path);
    // Let client effects and dynamic imports settle.
    await page.waitForLoadState("networkidle");

    expect(pageErrors, `Uncaught errors on ${path}:\n${pageErrors.join("\n")}`).toEqual([]);

    await expect(page.locator(".v2-root")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    // Every page is a route to a booking — that is what the site is for.
    await expect(
      page.getByRole("link", { name: /book/i }).first(),
      "a way to book from this page"
    ).toBeVisible();

    const title = await page.title();
    expect(title, `${path} has its own title`).not.toBe(GENERIC_TITLE);
    expect(title.length, `${path} has a title at all`).toBeGreaterThan(0);
  });
}

test("no two v2 pages share a title", async ({ page }) => {
  const seen = new Map();

  for (const path of PAGES) {
    await page.goto(path);
    const title = await page.title();
    // The shadowing bug emitted two <title> elements, generic one first.
    expect(await page.locator("head title").count(), `${path} emits one <title>`).toBe(1);

    const owner = seen.get(title);
    expect(owner, `${path} and ${owner} share the title "${title}"`).toBeUndefined();
    seen.set(title, path);
  }

  expect(seen.size).toBe(PAGES.length);
});
