import { test, expect } from "@playwright/test";
import { resetEmulators, seedUser, uniqueEmail } from "../support/emulator.js";
import { AuthModal } from "../support/auth-modal.js";

test.beforeEach(async ({ page }) => {
  await resetEmulators();
  await page.goto("/");
});

test("signs in an existing user and shows the account menu", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("signin"), firstName: "Ada" });

  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await modal.expectSignInMode();
  await modal.signIn({ email: user.email, password: user.password });

  await modal.expectClosed();
  await expect(page.getByRole("button", { name: "Account menu" })).toBeVisible();

  // The Firestore profile should be merged in, not just the bare auth record.
  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(page.getByText("Ada Lovelace")).toBeVisible();
});

test("rejects an empty email", async ({ page }) => {
  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await modal.signInButton.click();
  await modal.expectError(/email is required/i);
});

test("rejects a malformed email", async ({ page }) => {
  // The email input is type="email" inside a form with no noValidate, so the
  // browser blocks submit with a native tooltip and the app's own validation
  // message never renders — two different error styles for the same mistake.
  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await modal.email.fill("not-an-email");
  await modal.password.fill("Password123");
  await modal.signInButton.click();
  await modal.expectError(/invalid email/i);
});

test("rejects an empty password", async ({ page }) => {
  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await modal.email.fill("someone@example.com");
  await modal.signInButton.click();
  await modal.expectError(/password is required/i);
});

test("a wrong password does not claim the account is missing", async ({ page }) => {
  // Firebase returns auth/invalid-credential for both an unknown email and a
  // wrong password. Mapping it to "No account found — want to sign up?" sends
  // a user with a typo'd password into a signup that then rejects them.
  const user = await seedUser({ email: uniqueEmail("wrongpw") });

  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await modal.signIn({ email: user.email, password: "TotallyWrong123" });

  await modal.expectError(/incorrect|didn't match|try again/i);
  await expect(modal.error.first()).not.toHaveText(/no account found/i);
});

test("an unknown email reports a failed sign-in", async ({ page }) => {
  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await modal.signIn({ email: uniqueEmail("ghost"), password: "Password123" });
  await expect(modal.error.first()).toBeVisible();
  // The modal must stay open so the user can correct the mistake.
  await expect(modal.dialog).toBeVisible();
});

test("the submit button is disabled while the request is in flight", async ({ page }) => {
  // Button renders a spinner for isLoading but never sets `disabled`, so a
  // double-click fires two sign-in requests.
  const user = await seedUser({ email: uniqueEmail("dbl") });

  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await modal.email.fill(user.email);
  await modal.password.fill(user.password);

  // Slow the auth call down so we can observe the in-flight state.
  await page.route("**/identitytoolkit.googleapis.com/**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.continue();
  });

  await modal.signInButton.click();
  await expect(modal.signInButton).toBeDisabled();
});

test("clears a stale error when the user edits the form", async ({ page }) => {
  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await modal.signInButton.click();
  await expect(modal.error.first()).toBeVisible();

  await modal.email.fill("someone@example.com");
  await expect(modal.error).toHaveCount(0);
});

test("clears a stale error when the password is edited", async ({ page }) => {
  // handlePasswordChange does not reset the error, unlike handleEmailChange.
  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await modal.email.fill("someone@example.com");
  await modal.signInButton.click();
  await modal.expectError(/password is required/i);

  await modal.password.fill("Password123");
  await expect(modal.error).toHaveCount(0);
});

test("offers a password reset path", async ({ page }) => {
  // There is no forgot-password affordance anywhere in the app today.
  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await expect(modal.dialog.getByText(/forgot (your )?password/i)).toBeVisible();
});
