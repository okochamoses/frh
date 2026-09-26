/**
 * `/settings` — the account page in v2's chrome.
 *
 * What is worth testing here is not "a form saves a field". It is the two
 * things that were actually wrong before: reaching your account from v2 threw
 * you into v1's header, footer and typography; and the number this page
 * accepted was not the number `createBooking` accepts, so a profile could hold
 * one that would be refused at the point of booking.
 */

import { test, expect } from "@playwright/test";
import { resetEmulators, seedUser, uniqueEmail, readUserProfile } from "../support/emulator.js";
import { gotoReady, retryInteraction } from "../support/hydration.js";
import { V2AuthModal } from "../support/v2-auth-modal.js";

const card = (page) => page.getByRole("main");

test.beforeEach(async () => {
  await resetEmulators();
});

/** Signs in through the modal, from wherever the page already is. */
async function logInHere(page, user) {
  const modal = new V2AuthModal(page);
  await retryInteraction(async () => {
    await card(page).getByRole("button", { name: "Log in", exact: true }).click();
    await expect(modal.dialog).toBeVisible({ timeout: 1_000 });
  });
  await modal.signIn(user);
  await modal.expectClosed();
}

test("wears v2's chrome, not v1's", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("v2-settings"), firstName: "Ada" });
  await gotoReady(page, "/settings");
  await logInHere(page, user);

  // The v2 tree, which is what carries the faces and the colour system. V1's
  // shell would put its own header here instead.
  await expect(page.locator(".v2-root")).toBeVisible();
  await expect(page.getByRole("banner").getByRole("button", { name: "Ada", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Book an appointment" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your details" })).toBeVisible();
});

test("the account menu goes here, not to v1's /settings", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("v2-menu"), firstName: "Ada" });
  await gotoReady(page, "/");

  await retryInteraction(async () => {
    await page.getByRole("banner").getByRole("button", { name: "Log in" }).click();
    await expect(new V2AuthModal(page).dialog).toBeVisible({ timeout: 1_000 });
  });
  const modal = new V2AuthModal(page);
  await modal.signIn(user);
  await modal.expectClosed();

  await page.getByRole("banner").getByRole("button", { name: "Ada", exact: true }).click();
  await page.getByRole("menuitem", { name: "Account settings" }).click();

  await expect(page).toHaveURL(/\/settings/);
});

test("a signed-out visitor is told they can still book", async ({ page }) => {
  await gotoReady(page, "/settings");

  // Not a redirect and not a wall: an account is optional everywhere else on
  // this site, and the page should not imply otherwise.
  await expect(card(page).getByRole("heading", { name: "Log in to see your details" })).toBeVisible();
  await expect(card(page).getByRole("link", { name: "Book a visit" })).toBeVisible();
  await expect(page).toHaveURL(/\/settings$/);
});

test("logging in fills the form in place, without leaving the page", async ({ page }) => {
  const user = await seedUser({
    email: uniqueEmail("v2-fill"),
    firstName: "Ada",
    lastName: "Lovelace",
    mobileNumber: "+2348012345678",
  });
  await gotoReady(page, "/settings");
  await logInHere(page, user);

  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByLabel("First name")).toHaveValue("Ada");
  await expect(page.getByLabel("Surname")).toHaveValue("Lovelace");
  await expect(page.getByLabel("Mobile number")).toHaveValue("+2348012345678");
  // The address is how you log in, so it is shown but not editable.
  await expect(page.getByLabel("Email")).toBeDisabled();
});

test("saving writes the profile and updates the header", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("v2-save"), firstName: "Ada" });
  await gotoReady(page, "/settings");
  await logInHere(page, user);

  await page.getByLabel("First name").fill("Adaeze");
  await page.getByLabel("Surname").fill("Nwosu");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByText("Saved.")).toBeVisible();
  await expect(
    page.getByRole("banner").getByRole("button", { name: "Adaeze", exact: true })
  ).toBeVisible();

  await expect
    .poll(async () => (await readUserProfile(user.uid))?.firstName, { timeout: 10_000 })
    .toBe("Adaeze");
});

test("a number the booking flow would refuse is refused here too", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("v2-badphone") });
  await gotoReady(page, "/settings");
  await logInHere(page, user);

  // V1 accepted this: it starts with 0, which was the whole of its rule. The
  // booking callable would then reject the same number at confirm.
  await page.getByLabel("Mobile number").fill("0123");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByText(/enter a full mobile number/i)).toBeVisible();
  await expect(page.getByLabel("Mobile number")).toBeFocused();
  await expect(page.getByText("Saved.")).toBeHidden();
});

test("a local number is stored the way everything downstream expects", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("v2-normalise"), mobileNumber: null });
  await gotoReady(page, "/settings");
  await logInHere(page, user);

  await page.getByLabel("Mobile number").fill("0803 123 4567");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();

  await expect
    .poll(async () => (await readUserProfile(user.uid))?.mobileNumber, { timeout: 10_000 })
    .toBe("+2348031234567");
});

test("the number can be cleared — a Google sign-up may never have had one", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("v2-clear"), mobileNumber: "+2348012345678" });
  await gotoReady(page, "/settings");
  await logInHere(page, user);

  await page.getByLabel("Mobile number").fill("");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();

  await expect
    .poll(async () => (await readUserProfile(user.uid))?.mobileNumber ?? "cleared", { timeout: 10_000 })
    .toBe("cleared");
});
