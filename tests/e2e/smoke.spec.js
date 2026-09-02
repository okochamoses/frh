import { test, expect } from "@playwright/test";
import { resetEmulators } from "../support/emulator.js";

/**
 * Page-level smoke tests.
 *
 * These catch the class of failure where a component destructures something
 * the context no longer provides — the page renders, then throws on the first
 * interaction or during effects. We fail the test on any uncaught page error.
 */

const PAGES = ["/", "/services", "/salon", "/bookings", "/settings"];

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

test("the /salon booking CTA does not throw", async ({ page }) => {
  // salon/page.js destructures displayAuthModal / isValidToken / token from
  // useAuth(), none of which the current AuthContext provides. The page
  // renders fine and only throws when the CTA handler runs.
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await page.goto("/salon");
  await page.waitForLoadState("networkidle");

  // The Continue button stays disabled until a service is picked, so select
  // one first — the "+" control on the first service row.
  await page.locator("div.cursor-pointer >> text=+").first().click();

  const cta = page.getByRole("button", { name: "Continue" }).first();
  await expect(cta).toBeEnabled();
  await cta.click();
  await page.waitForTimeout(500);

  expect(pageErrors, `Uncaught errors on /salon:\n${pageErrors.join("\n")}`).toEqual([]);
});

test("header exposes a sign-in entry point when signed out", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Sign in" }).first()).toBeVisible();
});

test("@mobile mobile users can reach sign-in", async ({ page }) => {
  // The header's sign-in button is `hidden md:inline-flex` and the SplitMenu
  // has no auth entry, so on a phone there is no way to sign in except the
  // booking gate. This should pass once a mobile entry point exists.
  await page.goto("/");
  await page.getByRole("button", { name: /menu/i }).first().click();
  await expect(page.getByRole("button", { name: /sign in/i }).first()).toBeVisible();
});
