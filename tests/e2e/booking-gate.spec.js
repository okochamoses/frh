import { test, expect } from "@playwright/test";
import { resetEmulators, seedUser, uniqueEmail } from "../support/emulator.js";
import { AuthModal } from "../support/auth-modal.js";

/**
 * The booking flow on /services is the main place an anonymous visitor meets
 * the auth modal, so it is where the sign-in UX actually matters.
 */

/** Selects the first bookable service so the sticky booking bar appears. */
async function selectFirstService(page) {
  await page.goto("/services");
  await page.getByRole("button", { name: "Book", exact: true }).first().click();
  await expect(page.getByRole("button", { name: "Book Now" })).toBeVisible();
}

test.beforeEach(async () => {
  await resetEmulators();
});

test("Book Now opens the auth modal for a signed-out visitor", async ({ page }) => {
  await selectFirstService(page);
  await page.getByRole("button", { name: "Book Now" }).click();

  const modal = new AuthModal(page);
  await expect(modal.dialog).toBeVisible();
  await modal.expectSignInMode();
});

test("signing in from the booking gate resumes the booking", async ({ page }) => {
  // Signing in must continue the booking the user started, not drop them back
  // on the page having to find and press Book Now a second time.
  const user = await seedUser({ email: uniqueEmail("resume") });

  await selectFirstService(page);
  await page.getByRole("button", { name: "Book Now" }).click();

  const modal = new AuthModal(page);
  await modal.signIn(user);
  await modal.expectClosed();

  // The flow should have advanced to date/time selection on its own. This user
  // already has a phone number, so no phone prompt should appear either.
  await expect(page.getByText("Select Date & Time")).toBeVisible();
  await expect(page.getByRole("heading", { name: /add phone number/i })).toBeHidden();
});

test("a user without a phone number is asked for one", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("nophone"), mobileNumber: null });

  await selectFirstService(page);
  await page.getByRole("button", { name: "Book Now" }).click();

  const modal = new AuthModal(page);
  await modal.signIn(user);
  await modal.expectClosed();

  // Resumed automatically — no second Book Now click needed.
  await expect(page.getByRole("heading", { name: /add phone number/i })).toBeVisible();
});

test("the phone dialog rejects a badly formatted number", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("badphone"), mobileNumber: null });

  await selectFirstService(page);
  await page.getByRole("button", { name: "Book Now" }).click();
  const modal = new AuthModal(page);
  await modal.signIn(user);
  await modal.expectClosed();

  await page.getByLabel("Mobile Number").fill("12345");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(/must start with \+234 or 0/i)).toBeVisible();
});

test("a user with a phone number goes straight to date selection", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("hasphone"), mobileNumber: "+2348012345678" });

  await selectFirstService(page);
  await page.getByRole("button", { name: "Book Now" }).click();
  const modal = new AuthModal(page);
  await modal.signIn(user);
  await modal.expectClosed();

  await expect(page.getByRole("heading", { name: /add phone number/i })).toBeHidden();
  await expect(page.getByText("Select Date & Time")).toBeVisible();
});
