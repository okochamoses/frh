import { test, expect } from "@playwright/test";
import { resetEmulators, seedUser, uniqueEmail } from "../support/emulator.js";
import { AuthModal } from "../support/auth-modal.js";

/**
 * The whole booking round trip through the UI: book → see it under Upcoming →
 * reschedule it → cancel it.
 *
 * booking-callables.spec.js covers the server rules; this covers the wiring —
 * that the drawer, /bookings and the callables actually talk to each other.
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * The label of a bookable day button, `daysAhead` out, skipping Mondays and
 * Sundays — Sunday only opens at 1pm and holds less work, which makes it a
 * poor fixture for "any service fits here".
 */
function openDayLabel(daysAhead = 2) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  while (d.getDay() === 1 || d.getDay() === 0) d.setDate(d.getDate() + 1);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/**
 * Opens /services and waits until the page is actually interactive.
 *
 * `page.goto` resolves on the HTML, but this page is server-rendered and only
 * responds once React has hydrated — before that a click or a `fill` reaches
 * the DOM and nothing handles it. The search box is a controlled input, so a
 * `fill` that lands early is silently discarded and the list stays unfiltered,
 * which is what made "a day the services cannot fit says why" fail about two
 * runs in three: it clicked the first Book button on an unfiltered page, which
 * is the featured service, not the one the test is about.
 *
 * The Firebase client logs this line as soon as the client bundle runs, which
 * is the earliest reliable "the JavaScript is live" signal available — the v2
 * suite waits on the same one.
 */
async function openServices(page) {
  const hydrated = page.waitForEvent("console", {
    predicate: (m) => m.text().includes("[firebase] Using emulators — project demo-flourish"),
    timeout: 20_000,
  });
  await page.goto("/services");
  await hydrated;
}

async function signInAndOpenDrawer(page, user) {
  await openServices(page);
  await page.getByRole("button", { name: "Book", exact: true }).first().click();
  await page.getByRole("button", { name: "Book Now" }).click();

  const modal = new AuthModal(page);
  await modal.signIn(user);
  await modal.expectClosed();

  await expect(page.getByText("Select Date & Time")).toBeVisible();
}

/** Picks a day in the carousel and the first time offered for it. */
async function pickSlot(page, daysAhead = 2) {
  await page.getByRole("button", { name: openDayLabel(daysAhead), exact: false }).click();
  await page.locator("button[aria-pressed]").filter({ hasText: /^\d{2}:\d{2}$/ }).first().click();
}

test.beforeEach(async () => {
  await resetEmulators();
});

test("a signed-in client can book, reschedule and cancel", async ({ page }) => {
  const user = await seedUser({ email: uniqueEmail("flow"), mobileNumber: "+2348012345678" });

  await signInAndOpenDrawer(page, user);
  await pickSlot(page, 2);
  await page.getByRole("button", { name: "Confirm Booking" }).click();

  await expect(page.getByText("Booking confirmed")).toBeVisible();
  await page.getByRole("button", { name: "Done" }).click();

  // ── The appointment shows up under Upcoming, not mixed into history ──
  await page.goto("/bookings");
  await expect(page.getByText(/1 upcoming appointment/i)).toBeVisible();
  await expect(page.getByText("Confirmed").first()).toBeVisible();

  // ── Reschedule reuses the same picker ──
  await page.getByRole("button", { name: "Reschedule" }).click();
  await expect(page.getByText("Pick a new time")).toBeVisible();
  await pickSlot(page, 4);
  await page.getByRole("button", { name: "Move Appointment" }).click();
  await expect(page.getByText("Appointment moved")).toBeVisible();
  await page.getByRole("button", { name: "Done" }).click();

  // ── Cancelling asks first, then marks the card cancelled ──
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByText(/cancel this appointment\?/i)).toBeVisible();
  await page.getByRole("button", { name: "Cancel appointment" }).click();

  await expect(page.getByText("Cancelled").first()).toBeVisible();
  // A cancelled booking offers no further actions.
  await expect(page.getByRole("button", { name: "Reschedule" })).toHaveCount(0);
});

test("dismissing the confirmation does not strand the success screen", async ({ page }) => {
  // Closing the receipt with Escape used to leave `bookingSuccess` set, so the
  // next Book Now reopened onto the receipt of a booking already made.
  const user = await seedUser({ email: uniqueEmail("escape"), mobileNumber: "+2348012345678" });

  await signInAndOpenDrawer(page, user);
  await pickSlot(page, 2);
  await page.getByRole("button", { name: "Confirm Booking" }).click();
  await expect(page.getByText("Booking confirmed")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByText("Booking confirmed")).toBeHidden();

  // The cart was cleared with the receipt, so there is nothing left to book.
  await expect(page.getByRole("button", { name: "Book Now" })).toHaveCount(0);
});

test("a day the services cannot fit says why", async ({ page }) => {
  // Sister Locs - Long Hair runs 9h; Sunday only opens 1–7pm, so every Sunday
  // greys out. Struck-through days alone read as "fully booked forever".
  const user = await seedUser({ email: uniqueEmail("longservice"), mobileNumber: "+2348012345678" });

  await openServices(page);

  // The search box is a controlled input, so a `fill` that lands before React
  // hydrates is discarded when hydration re-renders it empty — the list stays
  // unfiltered and the first Book button is the featured service, not this
  // one. Waiting on the Firebase console line is not enough: that fires when
  // the client bundle loads, which is earlier than hydration finishing, and
  // under a full-suite run the gap is wide enough to lose the keystrokes. So
  // retry the fill until the list has actually narrowed to the one match.
  const bookButtons = page.getByRole("button", { name: "Book", exact: true });
  await expect(async () => {
    await page.getByPlaceholder("Search services…").fill("Sister Locs - Long");
    await expect(bookButtons).toHaveCount(1, { timeout: 1_000 });
  }).toPass({ timeout: 15_000 });

  await bookButtons.click();
  await page.getByRole("button", { name: "Book Now" }).click();

  const modal = new AuthModal(page);
  await modal.signIn(user);
  await modal.expectClosed();

  await expect(page.getByText(/Sundays run 1.7pm/i)).toBeVisible();
});
