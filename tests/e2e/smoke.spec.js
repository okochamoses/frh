import { test, expect } from "@playwright/test";
import { resetEmulators } from "../support/emulator.js";
import { gotoReady, retryInteraction } from "../support/hydration.js";

/**
 * Page-level smoke tests.
 *
 * These catch the class of failure where a component destructures something
 * the context no longer provides — the page renders, then throws on the first
 * interaction or during effects. We fail the test on any uncaught page error.
 */

const PAGES = ["/", "/services", "/bookings", "/settings"];

test.beforeEach(async () => {
  await resetEmulators();
});

for (const path of PAGES) {
  test(`${path} renders without uncaught errors`, async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto(path);
    // Let client effects and dynamic imports settle.
    await page.waitForLoadState("networkidle");

    expect(pageErrors, `Uncaught errors on ${path}:\n${pageErrors.join("\n")}`).toEqual([]);
  });
}

test("header exposes a sign-in entry point when signed out", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Sign in" }).first()).toBeVisible();
});

test("@mobile mobile users can reach sign-in", async ({ page }) => {
  // The header's sign-in button is `hidden md:inline-flex` and the SplitMenu
  // has no auth entry, so on a phone there is no way to sign in except the
  // booking gate. This should pass once a mobile entry point exists.
  //
  // The menu click races hydration the same way as every other
  // click-right-after-navigate site (see tests/support/hydration.js): before
  // hydration it is a no-op, so a plain click-then-check can find the sign-in
  // button still hidden for reasons that have nothing to do with the
  // product bug this test actually guards.
  await gotoReady(page, "/");
  await retryInteraction(async () => {
    await page.getByRole("button", { name: /menu/i }).first().click();
    await expect(page.getByRole("button", { name: /sign in/i }).first()).toBeVisible({ timeout: 1_000 });
  });
});
