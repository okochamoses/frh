/**
 * V2's auth screens: the modal and the three standalone routes.
 *
 * The split is deliberate and the tests are written around it. The modal is the
 * surface a client actually meets — booking needs no account, so auth is always
 * an interruption of something else, and the page behind it has to survive.
 * `/v2/login` and friends exist for the cases a modal cannot serve: a link in an
 * email, a bookmark, the return leg of a Google redirect. Both render the same
 * forms, so what is worth testing on each is what differs — the chrome, and
 * where the client ends up afterwards.
 */

import { test, expect } from "@playwright/test";
import { resetEmulators, seedUser, uniqueEmail, getOobCodes } from "../support/emulator.js";
import { gotoReady, retryInteraction } from "../support/hydration.js";

const dialog = (page) => page.getByTestId("auth-modal");
// Scoped deliberately: the header's button and the form's submit are both
// named "Log in" now that the copy is unified, so an unscoped lookup is
// ambiguous the moment the dialog is open.
const header = (page) => page.getByRole("banner");

test.beforeEach(async () => {
  await resetEmulators();
});

/**
 * Fills and submits the log-in form, wherever it is rendered.
 *
 * `scope` matters: the submit button is named "Log in", and so is the header's
 * button that opens the modal. Pass the dialog or the page's `<main>`, never
 * the page.
 */
async function signIn(scope, { email, password }) {
  await scope.getByLabel("Email").fill(email);
  await scope.getByLabel("Password", { exact: true }).fill(password);
  await scope.getByRole("button", { name: "Log in", exact: true }).click();
}

test.describe("the modal", () => {
  test("opens over the page a client was already on, and leaves it there", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-modal"), firstName: "Ada" });
    await gotoReady(page, "/v2/services");

    await retryInteraction(async () => {
      await header(page).getByRole("button", { name: "Log in" }).click();
      await expect(dialog(page)).toBeVisible({ timeout: 1_000 });
    });

    await signIn(dialog(page), { email: user.email, password: user.password });

    await expect(dialog(page)).toBeHidden();
    // The whole point of the modal: no navigation happened.
    await expect(page).toHaveURL(/\/v2\/services$/);
    // The header's account button, which carries the client's first name.
    await expect(page.getByRole("button", { name: "Ada", exact: true })).toBeVisible();
  });

  test("is v2's own, not v1's — and is named for a screen reader", async ({ page }) => {
    await gotoReady(page, "/v2");

    await retryInteraction(async () => {
      await header(page).getByRole("button", { name: "Log in" }).click();
      await expect(dialog(page)).toBeVisible({ timeout: 1_000 });
    });

    // Mounted inside `.v2-root`, which is what gives it v2's faces and colours;
    // Radix would otherwise portal it to <body>, outside them.
    await expect(
      page.locator(".v2-root [data-testid='auth-modal']")
    ).toBeVisible();

    // `aria-labelledby` has to resolve to the heading. It silently would not if
    // anything passed its own `id` to Radix's Title.
    const labelledBy = await dialog(page).getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const named = await page.evaluate(
      (id) => document.getElementById(id)?.textContent,
      labelledBy
    );
    expect(named).toBe("Log in");
  });

  test("switches to sign-up in place, keeping the email already typed", async ({ page }) => {
    await gotoReady(page, "/v2");

    await retryInteraction(async () => {
      await header(page).getByRole("button", { name: "Log in" }).click();
      await expect(dialog(page)).toBeVisible({ timeout: 1_000 });
    });

    await dialog(page).getByLabel("Email").fill("kemi@example.com");
    await dialog(page).getByRole("button", { name: "Sign up", exact: true }).click();

    await expect(dialog(page).getByRole("heading", { name: "Create account" })).toBeVisible();
    await expect(dialog(page).getByLabel("Email")).toHaveValue("kemi@example.com");
    // Still a modal, still no navigation.
    await expect(page).toHaveURL(/\/v2$/);
  });
});

test.describe("the standalone routes", () => {
  test("signing in on /v2/login lands on the v2 home", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-page") });
    await gotoReady(page, "/v2/login");

    await retryInteraction(async () => {
      await signIn(page.getByRole("main"), user);
      await expect(page).toHaveURL(/\/v2$/, { timeout: 2_000 });
    });
  });

  test("?next= sends the client where they were going", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-next") });
    await gotoReady(page, "/v2/login?next=%2Fv2%2Fbooking");

    await retryInteraction(async () => {
      await signIn(page.getByRole("main"), user);
      await expect(page).toHaveURL(/\/v2\/booking/, { timeout: 2_000 });
    });
  });

  test("an off-site ?next= is refused", async ({ page }) => {
    // A sign-in page that forwards anywhere it is told to is a phishing hop,
    // and this one is meant to be linked from emails. "//evil.example" is the
    // interesting case: it starts with a slash but is another origin.
    const user = await seedUser({ email: uniqueEmail("v2-evil") });
    await gotoReady(page, "/v2/login?next=%2F%2Fevil.example%2Fpwned");

    await retryInteraction(async () => {
      await signIn(page.getByRole("main"), user);
      await expect(page).toHaveURL(/\/v2$/, { timeout: 2_000 });
    });
  });

  test("switching to sign-up navigates, and carries ?next= with it", async ({ page }) => {
    await gotoReady(page, "/v2/login?next=%2Fv2%2Fbooking");

    await retryInteraction(async () => {
      await page.getByRole("button", { name: "Sign up", exact: true }).click();
      await expect(page).toHaveURL(/\/v2\/signup\?next=%2Fv2%2Fbooking/, { timeout: 2_000 });
    });

    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
  });

  test("a client who is already signed in is sent on rather than asked again", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-already") });
    await gotoReady(page, "/v2/login");
    await retryInteraction(async () => {
      await signIn(page.getByRole("main"), user);
      await expect(page).toHaveURL(/\/v2$/, { timeout: 2_000 });
    });

    await page.goto("/v2/login?next=%2Fv2%2Fgallery");
    await expect(page).toHaveURL(/\/v2\/gallery/);
  });

  test("the reset page sends a link without revealing whether the account exists", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-reset") });
    await gotoReady(page, "/v2/reset-password");

    await retryInteraction(async () => {
      await page.getByLabel("Email").fill(user.email);
      await page.getByRole("button", { name: "Send reset link" }).click();
      await expect(page.getByRole("heading", { name: "On its way" })).toBeVisible({ timeout: 2_000 });
    });

    await expect(page.getByText(/if an account exists for/i)).toBeVisible();

    const codes = await getOobCodes();
    expect(codes.some((c) => c.email === user.email)).toBe(true);
  });

  test("an unknown address gets the same answer", async ({ page }) => {
    await gotoReady(page, "/v2/reset-password");

    await retryInteraction(async () => {
      await page.getByLabel("Email").fill("nobody@example.com");
      await page.getByRole("button", { name: "Send reset link" }).click();
      await expect(page.getByRole("heading", { name: "On its way" })).toBeVisible({ timeout: 2_000 });
    });
  });
});

test.describe("validation", () => {
  test("every problem is reported at once, under the field it belongs to", async ({ page }) => {
    await gotoReady(page, "/v2/signup");

    await retryInteraction(async () => {
      await page.getByRole("button", { name: "Create account", exact: true }).click();
      await expect(page.getByText("Please tell us your name.")).toBeVisible({ timeout: 2_000 });
    });

    // V1 stops at the first failure and prints one message for the whole form;
    // a client fixing six things one submit at a time is the behaviour this
    // replaces.
    await expect(page.getByText("Please add your surname.")).toBeVisible();
    await expect(page.getByText("Please enter your email.")).toBeVisible();
    await expect(page.getByText("We need a number to reach you about your appointment.")).toBeVisible();
    await expect(page.getByText("Please choose a password.")).toBeVisible();
    await expect(page.getByText("Please type your password again.")).toBeVisible();

    // Focus moves to the first field at fault. Without it the only feedback for
    // a rejected submit is visual, and the messages may be off screen.
    await expect(page.getByLabel("First name")).toBeFocused();
  });

  test("a wrong password says so without saying whether the account exists", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-wrong") });
    await gotoReady(page, "/v2/login");

    await retryInteraction(async () => {
      await signIn(page.getByRole("main"), { email: user.email, password: "WrongPassword1" });
      await expect(page.getByTestId("auth-error")).toBeVisible({ timeout: 3_000 });
    });

    await expect(page.getByTestId("auth-error")).toHaveText(/email or password is incorrect/i);
  });
});
