import { AuthModal } from "./auth-modal.js";

/**
 * Page object for V2's auth modal.
 *
 * V2 renders its own dialog — `src/components/v2/auth/AuthDialog` — over the
 * same session and the same Firebase calls as V1's, so everything the base
 * class knows still holds. What differs is the copy: V1 heads the view "Log in"
 * and labels the button "Sign in"; V2 says "Log in" in both places, matching the
 * header, the footer link and `/v2/login`.
 *
 * Only the affordances whose accessible name changed are overridden here. When
 * V1 goes, this class and its parent collapse into one.
 */
export class V2AuthModal extends AuthModal {
  constructor(page) {
    super(page);
    this.signInButton = this.dialog.getByRole("button", { name: "Log in", exact: true });
    // The "Already have an account? Log in" line at the foot of sign-up. `.last()`
    // because the submit button above it carries the same name on the other view.
    this.switchToSignIn = this.dialog.getByText("Log in", { exact: true }).last();
  }
}

