import { test, expect } from "@playwright/test";
import {
  listBookingsWhere,
  resetEmulators,
  seedAdmin,
  uniqueEmail,
  writeUserProfile,
} from "../support/emulator.js";
import { gotoReady, retryInteraction } from "../support/hydration.js";

/**
 * The front desk's booking page, driven through the browser.
 *
 * Signing in is the awkward part. `/admin` offers only "Sign in with Google",
 * and `signInWithPopup` cannot be driven against the emulator — but
 * `subscribeAdminSession` never asks which provider was used. It listens to
 * `onAuthStateChanged` and then reads `admins/{email}`. So the session is
 * established through the ordinary customer log-in page, and the dashboard
 * accepts it because the allowlist is the only thing it actually checks.
 *
 * The assertion worth having here is the last one. `/admin/bookings/new` reuses
 * the public services grid, whose sheet portals into `.v2-root`; without the
 * wrapper on that route the sheet mounts on <body> instead, loses v2's type
 * styles, and nothing else in the suite would notice.
 */

// A look with no size variants, so one click adds it. `src/app/salon/services.json`.
const SIMPLE_SERVICE = "Barrel Twist";

async function signInAsAdmin(page, admin) {
  await gotoReady(page, "/v2/login?next=%2Fadmin%2Fbookings");
  await retryInteraction(async () => {
    const main = page.getByRole("main");
    await main.getByLabel("Email").fill(admin.email);
    await main.getByLabel("Password", { exact: true }).fill(admin.password);
    await main.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/bookings$/, { timeout: 5_000 });
  });
}

/** An allowlisted admin who also has a customer profile, so the app can render them. */
async function seedAdminWithProfile() {
  const admin = await seedAdmin({ email: uniqueEmail("desk-admin") });
  await writeUserProfile(admin.uid, {
    firstName: "Mariam",
    lastName: "Salon",
    email: admin.email,
    mobileNumber: "+2348090000000",
  });
  return admin;
}

test.describe("recording a walk-in", () => {
  test.beforeEach(async () => {
    await resetEmulators();
  });

  test("records a served visit and shows it on the bookings list", async ({ page }) => {
    const admin = await seedAdminWithProfile();
    await signInAsAdmin(page, admin);

    await page.getByRole("link", { name: "New booking" }).click();
    await expect(page).toHaveURL(/\/admin\/bookings\/new$/);

    // The desk opens in list view, where a look with no variants toggles
    // straight from the row and the row's accessible name is the look itself.
    await retryInteraction(async () => {
      await page.getByRole("button", { name: SIMPLE_SERVICE, exact: true }).first().click();
      await expect(page.getByRole("button", { name: "Record visit" })).toBeEnabled({
        timeout: 3_000,
      });
    });

    await page.getByLabel("Phone").fill("08031234567");
    await page.getByLabel("First name").fill("Ngozi");

    await page.getByRole("button", { name: "Record visit" }).click();

    await expect(page.getByRole("heading", { name: "Visit recorded" })).toBeVisible();

    const rows = await listBookingsWhere("channel", "walk-in");
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("completed");

    await page.getByRole("link", { name: "Back to bookings" }).click();
    await expect(page.getByRole("cell", { name: "Ngozi" })).toBeVisible();
  });

  /*
   * The regression test for the whole portal-container problem. It fails the
   * moment the sheet portals to <body> instead of into `.v2-root`.
   */
  test("the service sheet opens inside the v2 wrapper", async ({ page }) => {
    const admin = await seedAdminWithProfile();
    await signInAsAdmin(page, admin);
    await gotoReady(page, "/admin/bookings/new");

    await retryInteraction(async () => {
      await page.getByRole("button", { name: `See photo: ${SIMPLE_SERVICE}` }).first().click();
      await expect(page.locator('.v2-root [role="dialog"]')).toBeVisible({ timeout: 3_000 });
    });
  });
});
