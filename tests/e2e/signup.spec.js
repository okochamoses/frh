import { test, expect } from "@playwright/test";
import {
  resetEmulators,
  seedUser,
  uniqueEmail,
  findAuthUserByEmail,
  readUserProfile,
} from "../support/emulator.js";
import { AuthModal } from "../support/auth-modal.js";

async function openSignUp(page) {
  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await modal.switchToSignUp.click();
  await modal.expectSignUpMode();
  return modal;
}

test.beforeEach(async ({ page }) => {
  await resetEmulators();
  await page.goto("/");
});

test("creates an account and its Firestore profile", async ({ page }) => {
  const email = uniqueEmail("newuser");
  const modal = await openSignUp(page);

  await modal.signUp({
    firstName: "Grace",
    lastName: "Hopper",
    email,
    phone: "+2348012345678",
    password: "Password123",
  });

  await modal.expectClosed();
  await expect(page.getByRole("button", { name: "Account menu" })).toBeVisible();

  // The profile must exist in Firestore with every field the form collected.
  const account = await findAuthUserByEmail(email);
  expect(account, "auth account was not created").toBeTruthy();

  const profile = await readUserProfile(account.localId);
  expect(profile).toMatchObject({
    firstName: "Grace",
    lastName: "Hopper",
    email,
    mobileNumber: "+2348012345678",
    provider: "email",
  });
});

test("the signed-up name survives the auth state listener", async ({ page }) => {
  // Regression guard for a latent race: onAuthStateChanged fires as soon as
  // the auth account exists and can read the profile before createUserProfile
  // has written it, overwriting the good profile with a { uid, email }
  // fallback. It does not reproduce reliably against a local emulator, but the
  // window is real over a slow network — this test pins the correct outcome.
  const email = uniqueEmail("race");
  const modal = await openSignUp(page);
  await modal.signUp({ firstName: "Grace", lastName: "Hopper", email });
  await modal.expectClosed();

  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(page.getByText("Grace Hopper")).toBeVisible();
});

test.describe("field validation", () => {
  const cases = [
    { name: "missing first name", overrides: { firstName: "" }, error: /first name is required/i },
    { name: "missing last name", overrides: { lastName: "" }, error: /last name is required/i },
    // @known-bug: type="email" without noValidate lets the browser block
    // submit with a native tooltip, so our own message never renders.
    { name: "malformed email", overrides: { email: "nope" }, error: /invalid email/i },
    { name: "missing phone", overrides: { phone: "" }, error: /phone number is required/i },
    { name: "malformed phone", overrides: { phone: "12" }, error: /invalid phone number/i },
    { name: "short password", overrides: { password: "abc", confirmPassword: "abc" }, error: /at least 8 characters/i },
    {
      name: "mismatched confirmation",
      overrides: { password: "Password123", confirmPassword: "Password456" },
      error: /do not match/i,
    },
  ];

  for (const { name, overrides, error } of cases) {
    test(`rejects a ${name}`, async ({ page }) => {
      const modal = await openSignUp(page);
      await modal.signUp({ email: uniqueEmail("invalid"), ...overrides });
      await modal.expectError(error);
      await expect(modal.dialog).toBeVisible();
    });
  }
});

test("password rules are stated consistently", async ({ page }) => {
  // The client validator requires 8 characters and always fires before
  // Firebase, so the stale "at least 6 characters" copy in the Firebase error
  // map is unreachable today. This guards against that ordering changing.
  const modal = await openSignUp(page);
  await modal.signUp({ email: uniqueEmail("weak"), password: "short1", confirmPassword: "short1" });
  await modal.expectError(/8 characters/i);
});

test("reports a duplicate email clearly", async ({ page }) => {
  const existing = await seedUser({ email: uniqueEmail("dupe") });
  const modal = await openSignUp(page);

  await modal.signUp({ email: existing.email, password: "Password123" });
  await modal.expectError(/already exists|already in use/i);
});

test("a double-click does not create a second request", async ({ page }) => {
  // isLoading shows a spinner but leaves the button clickable, so the second
  // click reports "account already exists" for a signup that just succeeded.
  const email = uniqueEmail("dblsignup");
  const modal = await openSignUp(page);

  await modal.firstName.fill("Grace");
  await modal.lastName.fill("Hopper");
  await modal.email.fill(email);
  await modal.phone.fill("+2348012345678");
  await modal.password.fill("Password123");
  await modal.confirmPassword.fill("Password123");

  await page.route("**/identitytoolkit.googleapis.com/**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.continue();
  });

  await modal.createAccountButton.click();
  await expect(modal.createAccountButton).toBeDisabled();
});

test("switching between sign-in and sign-up keeps the typed email", async ({ page }) => {
  // AuthModal unmounts one modal and mounts the other, discarding form state.
  const email = uniqueEmail("carry");
  const modal = new AuthModal(page);

  await modal.openFromHeader();
  await modal.email.fill(email);
  await modal.switchToSignUp.click();
  await modal.expectSignUpMode();

  await expect(modal.email).toHaveValue(email);
});

test("switching modes works in both directions", async ({ page }) => {
  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await modal.expectSignInMode();

  await modal.switchToSignUp.click();
  await modal.expectSignUpMode();

  await modal.switchToSignIn.click();
  await modal.expectSignInMode();
});
