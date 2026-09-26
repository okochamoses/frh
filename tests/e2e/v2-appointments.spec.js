/**
 * `/bookings` — a client's own appointments, in v2's chrome.
 *
 * The interesting claim is not that a list renders. It is that this page owns
 * no reschedule machinery: changing a visit hands off to `/booking/manage`,
 * the same screen the confirmation email opens, and booking the same again
 * hands off to `/booking?again=`. Both of those already work and are tested
 * elsewhere — what is tested here is that the handoff is real, which for the
 * manage screen meant teaching it to accept a signed-in owner with no token.
 */

import { test, expect } from "@playwright/test";
import {
  resetEmulators,
  seedUser,
  seedBooking,
  uniqueEmail,
  listBookingsFor,
} from "../support/emulator.js";
import { gotoReady, retryInteraction } from "../support/hydration.js";
import { V2AuthModal } from "../support/v2-auth-modal.js";

const main = (page) => page.getByRole("main");

const BARREL_TWIST = {
  title: "Barrel Twist",
  price: 10_000,
  duration: 120,
  category: "twists",
};

/** An ISO instant `days` from now, at 11:00 Lagos — always inside opening hours. */
function at(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(10, 0, 0, 0); // 10:00 UTC === 11:00 WAT
  return d.toISOString();
}

test.beforeEach(async () => {
  await resetEmulators();
});

async function logInHere(page, user) {
  const modal = new V2AuthModal(page);
  await retryInteraction(async () => {
    await main(page).getByRole("button", { name: "Log in", exact: true }).click();
    await expect(modal.dialog).toBeVisible({ timeout: 1_000 });
  });
  await modal.signIn(user);
  await modal.expectClosed();
}

test("wears v2's chrome and splits the diary in two", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("v2-appts"), firstName: "Ada" });
  await seedBooking({
    uid: user.uid, email: user.email, services: [BARREL_TWIST],
    startTime: at(6), status: "pending",
  });
  await seedBooking({
    uid: user.uid, email: user.email, services: [BARREL_TWIST],
    startTime: at(-30), status: "completed",
  });

  await gotoReady(page, "/bookings");
  await logInHere(page, user);

  await expect(page.locator(".v2-root")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your appointments" })).toBeVisible();
  await expect(main(page).getByRole("heading", { name: "1 coming up" })).toBeVisible();
  await expect(main(page).getByRole("heading", { name: "Been and gone" })).toBeVisible();
  await expect(main(page).getByText("Barrel Twist")).toHaveCount(2);
  await expect(main(page).getByText("₦10,000").first()).toBeVisible();
});

test("a signed-out visitor is pointed at their email, not at signing up", async ({ page }) => {
  await gotoReady(page, "/bookings");

  // Most clients here booked as guests and have no account to log into. The
  // page has to say so rather than looking like a locked door.
  await expect(main(page).getByRole("heading", { name: "Log in to see your visits" })).toBeVisible();
  await expect(main(page).getByText(/confirmation email has a link/i)).toBeVisible();
});

test("a client with no history is asked to book, not shown an empty list", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("v2-empty") });
  await gotoReady(page, "/bookings");
  await logInHere(page, user);

  await expect(main(page).getByRole("heading", { name: "No visits booked" })).toBeVisible();
  await expect(main(page).getByRole("link", { name: "Book a visit" })).toBeVisible();
});

test("moving a visit hands off to the manage screen — no token needed", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("v2-move"), firstName: "Ada" });
  const id = await seedBooking({
    uid: user.uid, email: user.email, services: [BARREL_TWIST],
    startTime: at(6), status: "pending",
  });

  await gotoReady(page, "/bookings");
  await logInHere(page, user);

  await main(page).getByRole("link", { name: "Move or cancel" }).click();

  // The email's link carries a signed `t`; an owner needs only the id, because
  // `getBooking` takes the caller's uid in its place.
  await expect(page).toHaveURL(new RegExp(`/booking/manage\\?ref=${id}$`));
  await expect(page.getByRole("heading", { name: /Your (booking|appointment)/i }).first()).toBeVisible();
  await expect(page.getByText("Finding your appointment…")).toBeHidden();
});

test("cancelling from that screen really cancels the booking", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("v2-cancel"), firstName: "Ada" });
  const id = await seedBooking({
    uid: user.uid, email: user.email, services: [BARREL_TWIST],
    startTime: at(6), status: "pending",
  });

  await gotoReady(page, "/bookings");
  await logInHere(page, user);
  await main(page).getByRole("link", { name: "Move or cancel" }).click();

  await page.getByRole("button", { name: /Cancel/ }).first().click();
  await page.getByRole("button", { name: /Yes|Cancel (it|the|this)/i }).last().click();

  await expect
    .poll(async () => (await listBookingsFor(user.uid)).find((b) => b.id === id)?.status, {
      timeout: 15_000,
    })
    .toBe("cancelled");
});

test("a past visit offers the same again, through the flow that already does it", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("v2-again"), firstName: "Ada" });
  const id = await seedBooking({
    uid: user.uid, email: user.email, services: [BARREL_TWIST],
    startTime: at(-30), status: "completed",
  });

  await gotoReady(page, "/bookings");
  await logInHere(page, user);

  const again = main(page).getByRole("link", { name: "Book this again" });
  await expect(again).toHaveAttribute("href", `/booking?again=${id}`);
  await again.click();

  // Not asserted on the URL: the flow consumes `?again=` and strips it with
  // `history.replaceState` the moment it has applied it, so the query is gone
  // by the time anything can look. What it leaves behind is the point — the
  // Time step, with that visit's services already in the slip.
  await expect(page).toHaveURL(/\/booking$/);
  await expect(page.getByRole("heading", { name: "When suits you?" })).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Your appointment" }).getByText("Barrel Twist")
  ).toBeVisible();
});

test("a cancelled visit stays in the history rather than vanishing", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("v2-cancelled"), firstName: "Ada" });
  await seedBooking({
    uid: user.uid, email: user.email, services: [BARREL_TWIST],
    startTime: at(6), status: "cancelled",
  });

  await gotoReady(page, "/bookings");
  await logInHere(page, user);

  // Future-dated but cancelled: it belongs to history, not to "coming up".
  await expect(main(page).getByText("Cancelled")).toBeVisible();
  await expect(main(page).getByRole("heading", { name: "Been and gone" })).toBeVisible();
  await expect(main(page).getByRole("link", { name: "Move or cancel" })).toHaveCount(0);
  await expect(main(page).getByText("Nothing in the diary.")).toBeVisible();
});

test("the manage screen still refuses a stranger with no token", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("v2-stranger") });
  const id = await seedBooking({
    uid: user.uid, email: user.email, services: [BARREL_TWIST],
    startTime: at(6), status: "pending",
  });

  // Signed out, id guessed: the token is what stands in for an account, and
  // without either there is nothing to open.
  await gotoReady(page, `/booking/manage?ref=${id}`);
  await expect(page.getByRole("heading", { name: "We couldn't open that booking" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Log in" }).last()).toBeVisible();
});
