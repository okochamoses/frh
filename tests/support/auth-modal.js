import { expect } from "@playwright/test";

/**
 * Page object for the sign-in / sign-up modal.
 *
 * Selectors deliberately go through placeholders, roles and accessible names
 * rather than CSS classes, so restyling the modal does not break the suite.
 */
export class AuthModal {
  constructor(page) {
    this.page = page;
    // Scoped to the auth dialog specifically: the booking flow's phone dialog
    // is also role="dialog", and after a successful sign-in it is what opens.
    this.dialog = page.getByTestId("auth-modal");

    // Shared fields
    this.email = this.dialog.getByPlaceholder("Email", { exact: true });
    this.password = this.dialog.getByPlaceholder("Password", { exact: true });

    // Sign-up only
    this.firstName = this.dialog.getByPlaceholder("First Name");
    this.lastName = this.dialog.getByPlaceholder("Last Name");
    this.phone = this.dialog.getByPlaceholder("Mobile Number");
    this.confirmPassword = this.dialog.getByPlaceholder("Confirm Password");

    // Actions
    this.signInButton = this.dialog.getByRole("button", { name: "Sign in", exact: true });
    this.createAccountButton = this.dialog.getByRole("button", { name: "Create account", exact: true });
    this.googleButton = this.dialog.getByRole("button", { name: /with Google/i });
    this.switchToSignUp = this.dialog.getByText("Sign up", { exact: true });
    this.switchToSignIn = this.dialog.getByText("Sign in", { exact: true }).last();

    this.error = this.dialog.locator("[role='alert'], .text-red-600, .text-red-500");
  }

  /** Opens the modal from the header's "Sign in" button (desktop viewport only). */
  async openFromHeader() {
    await this.page.getByRole("button", { name: "Sign in" }).first().click();
    await expect(this.dialog).toBeVisible();
  }

  async expectSignInMode() {
    await expect(this.dialog.getByRole("heading", { name: "Log in" })).toBeVisible();
  }

  async expectSignUpMode() {
    await expect(this.dialog.getByRole("heading", { name: "Create account" })).toBeVisible();
  }

  /** Fills and submits the sign-in form. */
  async signIn({ email, password }) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.signInButton.click();
  }

  /** Fills and submits the sign-up form. */
  async signUp({
    firstName = "Grace",
    lastName = "Hopper",
    email,
    phone = "+2348012345678",
    password = "Password123",
    confirmPassword,
  }) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.email.fill(email);
    await this.phone.fill(phone);
    await this.password.fill(password);
    await this.confirmPassword.fill(confirmPassword ?? password);
    await this.createAccountButton.click();
  }

  /** Asserts the visible error message matches. */
  async expectError(pattern) {
    await expect(this.error.first()).toHaveText(pattern);
  }

  async expectClosed() {
    await expect(this.dialog).toBeHidden();
  }
}

/** Signs a user in through the UI and waits for the header avatar to appear. */
export async function signInViaUi(page, { email, password }) {
  const modal = new AuthModal(page);
  await modal.openFromHeader();
  await modal.signIn({ email, password });
  await modal.expectClosed();
  await expect(page.getByRole("button", { name: "Account menu" })).toBeVisible();
}
