import { test, expect } from "@playwright/test";
import { resetEmulators, seedUser, uniqueEmail } from "../support/emulator.js";
import { AuthModal, signInViaUi } from "../support/auth-modal.js";

test.beforeEach(async ({ page }) => {
  await resetEmulators();
  await page.goto("/");
});

test("the session survives a page reload", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("persist") });
  await signInViaUi(page, user);

  await page.reload();
  await expect(page.getByRole("button", { name: "Account menu" })).toBeVisible();
});

test("signing out returns the header to its signed-out state", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("logout") });
  await signInViaUi(page, user);

  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("button", { name: /log ?out|sign ?out/i }).click();

  await expect(page.getByRole("button", { name: "Sign in" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Account menu" })).toBeHidden();
});

test("a signed-out visitor is prompted on /bookings", async ({ page }) => {
  await page.goto("/bookings");
  await expect(page.getByRole("button", { name: /sign in/i }).first()).toBeVisible();
});

test("a signed-in user sees their bookings page without a prompt", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("bookings") });
  await signInViaUi(page, user);

  await page.goto("/bookings");
  await expect(page.getByRole("button", { name: "Account menu" })).toBeVisible();
  // No auth prompt should be rendered for an authenticated visitor.
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("the settings page shows the signed-in user's profile", async ({ page }) => {
  const user = await seedUser({
    email: uniqueEmail("settings"),
    firstName: "Ada",
    lastName: "Lovelace",
  });
  await signInViaUi(page, user);

  await page.goto("/settings");
  await expect(page.getByRole("textbox", { name: "First name" })).toHaveValue("Ada");
  await expect(page.getByRole("textbox", { name: "Last name" })).toHaveValue("Lovelace");
  await expect(page.getByRole("textbox", { name: "Email" })).toHaveValue(user.email);
});

test("the auth modal can be dismissed and reopened", async ({ page }) => {
  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await page.keyboard.press("Escape");
  await modal.expectClosed();

  await modal.openFromHeader();
  await expect(modal.dialog).toBeVisible();
});

test("the mode switch is reachable by keyboard", async ({ page }) => {
  // "Sign up" / "Sign in" are <span onClick> elements — not focusable, and
  // not activatable with Enter.
  const modal = new AuthModal(page);
  await modal.openFromHeader();

  await modal.switchToSignUp.focus();
  await page.keyboard.press("Enter");
  await modal.expectSignUpMode();
});

test("validation errors are announced to assistive tech", async ({ page }) => {
  // The error paragraph has no role="alert" / aria-live, so a screen reader
  // never announces it.
  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await modal.signInButton.click();
  await expect(modal.dialog.locator("[role='alert'], [aria-live]").first()).toBeVisible();
});
