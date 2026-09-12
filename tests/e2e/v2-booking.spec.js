import { test, expect } from "@playwright/test";
import {
  resetEmulators,
  seedUser,
  seedBooking,
  listBookingsFor,
  listBookingsWhere,
  readUserProfile,
  uniqueEmail,
} from "../support/emulator.js";
import { AuthModal } from "../support/auth-modal.js";

/**
 * The v2 booking page (/v2/booking), end to end against the emulators.
 *
 * Every test opens the page through `openBooking`, which fails unless the app
 * announces it is talking to the `demo-flourish` emulator project — so a run
 * can never quietly land on the live Firebase project.
 */

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Catalogue rows used below (src/app/salon/services.json).
const WASH = {
  title: "Washing, Moisturizing, Detangling with Intense Deep Conditioning (Moisturizing Treatment)",
  price: 8000,
  duration: 60,
  category: "Treatments, Hair Care & Washing",
};
const BARREL = { title: "Barrel Twist", price: 10000, duration: 120, category: "Twists and Coils" };

// ── Lagos-time date helpers (independent of the app's own) ──────────────────
// A Date whose UTC fields read as Lagos wall-clock time. WAT is UTC+1 all year.
const lagosNow = () => new Date(Date.now() + 3_600_000);

function lagosDay(daysAhead) {
  const d = lagosNow();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d;
}

/** The first Tuesday–Saturday at least `daysAhead` out. */
function openWeekday(daysAhead = 2) {
  const d = lagosDay(daysAhead);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 1) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

const dayLabel = (d) => `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
const shortLabel = (d) => `${WEEKDAYS[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)}`;

/** The instant for `hh:mm` Lagos time on day `d`. */
const lagosInstant = (d, hh, mm = 0) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hh - 1, mm)).toISOString();

// ── Page helpers ─────────────────────────────────────────────────────────────

let pageErrors = [];

test.beforeEach(async ({ page }) => {
  await resetEmulators();
  pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));
});

test.afterEach(() => {
  expect(pageErrors, "uncaught errors on the page").toEqual([]);
});

/** Opens the booking page and proves it is wired to the emulator project. */
async function openBooking(page, path = "/v2/booking") {
  const emulatorBanner = page.waitForEvent("console", {
    predicate: (m) => m.text().includes("[firebase] Using emulators — project demo-flourish"),
    timeout: 20_000,
  });
  await page.goto(path);
  await emulatorBanner;
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

const slip = (page) => page.getByRole("complementary", { name: "Your appointment" });
const main = (page) => page.getByRole("main");
// By test id: the Next dev overlay also renders a role="status" element.
const toast = (page) => page.getByTestId("booking-toast");

async function signInFromHeader(page, user) {
  await page.getByRole("button", { name: "Log in" }).first().click();
  const modal = new AuthModal(page);
  await expect(modal.dialog).toBeVisible();
  await modal.signIn(user);
  await modal.expectClosed();
}

/** Clicks a calendar day, paging forward a month if it isn't showing yet. */
async function pickDay(page, d) {
  const day = page.getByRole("button", { name: dayLabel(d), exact: true });
  for (let i = 0; i < 3 && !(await day.isVisible()); i++) {
    await page.getByRole("button", { name: "Next month" }).click();
  }
  await day.click();
  await expect(day).toHaveAttribute("aria-pressed", "true");
}

async function pickTime(page, d, time) {
  const slot = page.getByRole("group", { name: `Times on ${dayLabel(d)}` }).getByRole("button", { name: time, exact: true });
  await slot.click();
  await expect(slot).toHaveAttribute("aria-pressed", "true");
}

async function addBarrelTwistAndPickTime(page, d) {
  await page.getByRole("button", { name: "Add Barrel Twist" }).click();
  await slip(page).getByRole("button", { name: "Choose a time" }).click();
  await expect(page.getByRole("heading", { name: "When suits you?" })).toBeVisible();
  await pickDay(page, d);
  await pickTime(page, d, "10:00");
  await slip(page).getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Your details" })).toBeVisible();
}

async function acceptPolicyAndConfirm(page) {
  await page.getByRole("checkbox", { name: /I'll arrive by/ }).check();
  await slip(page).getByRole("button", { name: "Confirm booking" }).click();
  await expect(page.getByRole("heading", { name: /^See you/ })).toBeVisible({ timeout: 15_000 });
}

// ── Browsing ─────────────────────────────────────────────────────────────────

test.describe("browsing services", () => {
  test("the page is wired to the emulators and opens on the photo grid", async ({ page }) => {
    await openBooking(page);
    await expect(page.getByRole("heading", { name: "Book a visit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Looks" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "See photo and details: Barrel Twist" })).toBeVisible();
    await expect(slip(page).getByRole("button", { name: "Choose a time" })).toBeDisabled();
  });

  test("search, categories and the list view find services", async ({ page }) => {
    await openBooking(page);

    await page.getByRole("searchbox", { name: "Search services" }).fill("updo");
    const results = page.getByRole("region", { name: "Search results" });
    await expect(results.getByRole("heading", { level: 3 }).first()).toHaveText("Natural hair Updos (Roll & Tuck)");

    await page.getByRole("searchbox", { name: "Search services" }).fill("zzzz");
    await expect(page.getByText(/Nothing called .zzzz. yet/)).toBeVisible();

    await page.getByRole("searchbox", { name: "Search services" }).fill("");
    await page.getByRole("button", { name: "Nails", exact: true }).click();
    const nails = page.getByRole("region", { name: "Nails" });
    await expect(nails.getByRole("heading", { name: "Acrylic Set" })).toBeVisible();
    // Nail services have no catalogue photo yet, so they fall back to a tile.
    await expect(nails.getByText("No photo yet").first()).toBeVisible();

    await page.getByRole("button", { name: "List", exact: true }).click();
    await expect(nails.getByRole("checkbox", { name: "Gels on Nails" })).toBeVisible();

    // The chosen view is remembered on this device.
    await page.reload();
    await expect(page.getByRole("button", { name: "List", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("the list view toggles services from the whole row", async ({ page }) => {
    await openBooking(page);
    await page.getByRole("button", { name: "List", exact: true }).click();

    const row = page.getByRole("checkbox", { name: "Barrel Twist" });
    await row.click();
    await expect(row).toHaveAttribute("aria-checked", "true");
    await expect(slip(page).getByText("Barrel Twist")).toBeVisible();

    await row.press(" ");
    await expect(row).toHaveAttribute("aria-checked", "false");
    await expect(slip(page).getByText("Services you pick appear here.")).toBeVisible();
  });

  test("the photo sheet shows details, similar looks and adds the service", async ({ page }) => {
    await openBooking(page);
    await page.getByRole("button", { name: "See photo and details: Mini twists", exact: true }).click();

    const sheet = page.getByRole("dialog", { name: "Mini twists" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText("Take-down later")).toBeVisible();
    await expect(sheet.getByText("5h", { exact: true })).toBeVisible();

    // Similar looks swap the sheet to another look.
    await sheet.getByRole("button", { name: "See Barrel Twist" }).click();
    await expect(page.getByRole("dialog", { name: "Barrel Twist" })).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Add to booking · ₦10,000" }).click();

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(toast(page)).toContainText("Added barrel twist");
    await expect(slip(page).getByText("Barrel Twist")).toBeVisible();
    await expect(slip(page).getByText("₦10,000").last()).toBeVisible();
  });

  test("a look that comes in sizes is chosen inside the sheet", async ({ page }) => {
    await openBooking(page);
    await page.getByRole("button", { name: "Choose an option for Shuku" }).click();

    const sheet = page.getByRole("dialog", { name: "Shuku" });
    await expect(sheet.getByRole("button", { name: "Choose an option first" })).toBeDisabled();

    await sheet.getByRole("radio", { name: /Medium sized/ }).click();
    await sheet.getByRole("button", { name: "Add medium sized · ₦5,000" }).click();
    await expect(slip(page).getByText("Shuku · Medium sized")).toBeVisible();

    // Switching size replaces the option rather than adding a second one.
    await page.getByRole("button", { name: "Choose an option for Shuku" }).click();
    await page.getByRole("dialog", { name: "Shuku" }).getByRole("radio", { name: /Jumbo sized/ }).click();
    await page.getByRole("dialog", { name: "Shuku" }).getByRole("button", { name: "Switch to jumbo sized · ₦3,000" }).click();

    await expect(slip(page).getByText("Shuku · Jumbo sized")).toBeVisible();
    await expect(slip(page).getByText("Shuku · Medium sized")).toHaveCount(0);
    await expect(slip(page).getByText("1 item")).toBeVisible();
  });

  test("a take-down nudge adds the right service, and Undo takes it back", async ({ page }) => {
    await openBooking(page);
    await page.getByRole("button", { name: "Add Mini twists", exact: true }).click();

    await expect(page.getByText("Coming in with an old style?")).toBeVisible();
    await page.getByRole("button", { name: "Add Mini twists loosening" }).first().click();

    await expect(slip(page).getByText("Mini twists loosening")).toBeVisible();
    await expect(slip(page).getByText("₦20,000")).toBeVisible();

    await toast(page).getByRole("button", { name: "Undo" }).click();
    await expect(slip(page).getByText("Mini twists loosening")).toHaveCount(0);
    await expect(slip(page).getByText("₦15,000").last()).toBeVisible();
  });

  test("services can be removed from the slip", async ({ page }) => {
    await openBooking(page);
    await page.getByRole("button", { name: "Add Barrel Twist" }).click();
    await slip(page).getByRole("button", { name: "Remove Barrel Twist" }).click();
    await expect(slip(page).getByText("Services you pick appear here.")).toBeVisible();
    await expect(slip(page).getByRole("button", { name: "Choose a time" })).toBeDisabled();
  });

  test("the WhatsApp photo banner opens a chat with the salon", async ({ page }) => {
    await openBooking(page);
    const link = page.getByRole("link", { name: /Know the look, not the name\?/ });
    await expect(link).toHaveAttribute("href", /^https:\/\/wa\.me\/2348110215014\?text=/);
    await expect(link).toHaveAttribute("target", "_blank");
  });
});

// ── Scheduling rules ─────────────────────────────────────────────────────────

test.describe("choosing a time", () => {
  test("closed and too-short days are struck out with a reason", async ({ page }) => {
    await openBooking(page);
    // Sister Locs, long hair: 9h. Sunday only opens 1–7pm.
    await page.getByRole("button", { name: "Choose an option for Sister Locs" }).click();
    await page.getByRole("dialog").getByRole("radio", { name: /Long Hair/ }).click();
    await page.getByRole("dialog").getByRole("button", { name: /^Add long hair/ }).click();
    await slip(page).getByRole("button", { name: "Choose a time" }).click();

    const days = page.getByRole("group", { name: "Choose a day" });
    await expect(days.getByRole("button", { name: /Sunday .*unavailable: Sundays run 1–7pm/ }).first()).toBeDisabled();
    await expect(days.getByRole("button", { name: /Monday .*unavailable: The salon is closed on Mondays/ }).first()).toBeDisabled();

    // A 9h visit on a Tue–Sat day has to start by 10:00 to finish by 7pm.
    const d = openWeekday(2);
    await pickDay(page, d);
    await expect(page.getByRole("group", { name: `Times on ${dayLabel(d)}` }).getByRole("button")).toHaveText([
      "09:00",
      "09:30",
      "10:00",
    ]);
  });

  test("more than a day of services cannot move on", async ({ page }) => {
    await openBooking(page);
    await page.getByRole("button", { name: "Add Micro Twists", exact: true }).click();
    await page.getByRole("button", { name: "Choose an option for Sister Locs" }).click();
    await page.getByRole("dialog").getByRole("radio", { name: /Long Hair/ }).click();
    await page.getByRole("dialog").getByRole("button", { name: /^Add long hair/ }).click();

    await expect(slip(page).getByRole("button", { name: "Choose a time" })).toBeDisabled();
    await expect(slip(page).getByText("That's more than one day. Remove a service.")).toBeVisible();
  });

  test("the picked services and time survive a reload", async ({ page }) => {
    await openBooking(page);
    const d = openWeekday(3);
    await page.getByRole("button", { name: "Add Barrel Twist" }).click();
    await slip(page).getByRole("button", { name: "Choose a time" }).click();
    await pickDay(page, d);
    await pickTime(page, d, "11:00");

    await page.reload();
    await expect(page.getByRole("heading", { name: "When suits you?" })).toBeVisible();
    await expect(slip(page).getByText("Barrel Twist")).toBeVisible();
    await expect(slip(page).getByText(/11:00 – 13:00 WAT/)).toBeVisible();
  });
});

// ── Booking ──────────────────────────────────────────────────────────────────

test.describe("booking", () => {
  test("a guest books with just a name and phone number — no account", async ({ page }) => {
    await openBooking(page);

    // Nothing asks them to sign in, at any step.
    const d = openWeekday(2);
    await addBarrelTwistAndPickTime(page, d);
    await expect(new AuthModal(page).dialog).toBeHidden();
    await expect(main(page).getByText("No account needed.", { exact: false })).toBeVisible();

    await page.getByLabel("Your name").fill("Chioma");
    await page.getByLabel("Phone number").fill("0803 123 4567");
    await page.getByLabel("Anything we should know?").fill("Transitioning hair, please be gentle.");
    await slip(page).getByRole("button", { name: "Review booking" }).click();

    await expect(page.getByRole("heading", { name: "Check and confirm" })).toBeVisible();
    await expect(main(page).getByText("Chioma · +2348031234567")).toBeVisible();
    await expect(main(page).getByText("Transitioning hair, please be gentle.")).toBeVisible();
    await acceptPolicyAndConfirm(page);
    await expect(main(page).getByText("The salon will confirm with you on")).toBeVisible();

    // A guest has no account to come back to, so the success screen hands them
    // the signed link to their own booking — WhatsApp is the fallback, not the
    // only way back.
    const manageLink = page.getByRole("link", { name: "Open my booking" });
    await expect(manageLink).toBeVisible();
    await expect(manageLink).toHaveAttribute("href", /\/v2\/booking\/manage\?ref=[^&]+&t=[0-9a-f]{64}/);
    await expect(page.getByRole("link", { name: "Ask the salon on WhatsApp" })).toBeVisible();

    const [booking] = await listBookingsWhere("userMobileNumber", "+2348031234567");
    expect(booking.guest).toBe(true);
    expect(booking.userFirstName).toBe("Chioma");
    expect(booking.userEmail).toBeNull();
    expect(booking.notes).toBe("Transitioning hair, please be gentle.");
    expect(booking.startTime).toBe(lagosInstant(d, 10));
    expect(booking.totalAmount).toBe(10000);

    // The guest session is invisible: the header still offers "Log in".
    await expect(page.getByRole("button", { name: "Log in" }).first()).toBeVisible();
  });

  test("a guest who adds an email gets the confirmation there", async ({ page }) => {
    await openBooking(page);
    await addBarrelTwistAndPickTime(page, openWeekday(2));

    await page.getByLabel("Your name").fill("Tolu");
    await page.getByLabel("Phone number").fill("+2348091112222");
    await page.getByLabel("Email (optional)").fill("Tolu@Example.com");
    await slip(page).getByRole("button", { name: "Review booking" }).click();
    await acceptPolicyAndConfirm(page);

    await expect(main(page).getByText("We've sent your confirmation to")).toBeVisible();
    const [booking] = await listBookingsWhere("userMobileNumber", "+2348091112222");
    expect(booking.userEmail).toBe("tolu@example.com");
  });

  test("guest details are checked before review", async ({ page }) => {
    await openBooking(page);
    await addBarrelTwistAndPickTime(page, openWeekday(2));

    const review = slip(page).getByRole("button", { name: "Review booking" });
    await expect(review).toBeDisabled();

    await page.getByLabel("Your name").fill("Ada");
    await page.getByLabel("Phone number").fill("0803");
    await page.getByLabel("Email (optional)").fill("not-an-email");
    await review.click();

    await expect(main(page).getByRole("alert").filter({ hasText: "Enter a full mobile number" })).toBeVisible();
    await expect(main(page).getByRole("alert").filter({ hasText: "doesn't look right" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your details" })).toBeVisible();

    // Fixing a field clears its error.
    await page.getByLabel("Phone number").fill("08031234567");
    await expect(main(page).getByRole("alert").filter({ hasText: "Enter a full mobile number" })).toHaveCount(0);
  });

  test("a returning guest is remembered on this device", async ({ page }) => {
    await openBooking(page);
    const d = openWeekday(3);
    await addBarrelTwistAndPickTime(page, d);
    await page.getByLabel("Your name").fill("Kemi");
    await page.getByLabel("Phone number").fill("08055556666");
    await slip(page).getByRole("button", { name: "Review booking" }).click();
    await acceptPolicyAndConfirm(page);

    await page.getByRole("button", { name: "Book something else" }).click();
    await page.reload();

    // Their upcoming visit shows, and their details are already filled in.
    await expect(main(page).getByText(`Your next visit: ${shortLabel(d)} at 10:00`, { exact: false })).toBeVisible();
    await addBarrelTwistAndPickTime(page, openWeekday(5));
    await expect(page.getByLabel("Your name")).toHaveValue("Kemi");
    await expect(page.getByLabel("Phone number")).toHaveValue("08055556666");
  });

  test("an account holder can sign in at the Details step instead", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-book"), mobileNumber: "+2348012345678" });
    await openBooking(page);

    const d = openWeekday(2);
    await addBarrelTwistAndPickTime(page, d);
    await main(page).getByRole("button", { name: "Sign in", exact: true }).click();
    const modal = new AuthModal(page);
    await modal.signIn(user);
    await modal.expectClosed();

    // Signing in resumes the booking at the Confirm step.
    await expect(page.getByRole("heading", { name: "Check and confirm" })).toBeVisible();
    await expect(slip(page).getByRole("button", { name: "Confirm booking" })).toBeDisabled();
    await acceptPolicyAndConfirm(page);

    const [booking] = await listBookingsFor(user.uid);
    expect(booking.startTime).toBe(lagosInstant(d, 10));
    expect(booking.totalAmount).toBe(10000);
    expect(booking.status).toBe("pending");
    expect(booking.guest).toBeUndefined();
    expect(booking.userEmail).toBe(user.email);
    expect(booking.services.map((s) => s.title)).toEqual(["Barrel Twist"]);
  });

  test("Back and the step bar return to earlier steps without losing choices", async ({ page }) => {
    await openBooking(page);
    const d = openWeekday(2);
    await addBarrelTwistAndPickTime(page, d);

    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.getByRole("heading", { name: "When suits you?" })).toBeVisible();
    await expect(page.getByRole("button", { name: dayLabel(d), exact: true })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("navigation", { name: "Booking steps" }).getByRole("button", { name: /Services/ }).click();
    await expect(page.getByRole("heading", { name: "Book a visit" })).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Twists & coils" }).getByRole("button", { name: "Remove Barrel Twist" })
    ).toHaveAttribute("aria-pressed", "true");
    await expect(slip(page).getByText(/10:00 – 12:00 WAT/)).toBeVisible();
  });

  test("Escape closes the photo sheet without changing the booking", async ({ page }) => {
    await openBooking(page);
    await page.getByRole("button", { name: "See photo and details: Barrel Twist" }).click();
    await expect(page.getByRole("dialog", { name: "Barrel Twist" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(slip(page).getByText("Services you pick appear here.")).toBeVisible();
  });

  test("a client with no phone number adds one inline", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-phone"), mobileNumber: null });
    await openBooking(page);
    await signInFromHeader(page, user);

    const d = openWeekday(2);
    await addBarrelTwistAndPickTime(page, d);

    const phone = page.getByLabel("Mobile number");
    await phone.fill("0803");
    await slip(page).getByRole("button", { name: "Review booking" }).click();
    await expect(main(page).getByRole("alert")).toContainText("Enter a full mobile number");

    await phone.fill("08031234567");
    await slip(page).getByRole("button", { name: "Review booking" }).click();
    await expect(page.getByRole("heading", { name: "Check and confirm" })).toBeVisible();
    expect((await readUserProfile(user.uid)).mobileNumber).toBe("+2348031234567");

    await acceptPolicyAndConfirm(page);
    expect(await listBookingsFor(user.uid)).toHaveLength(1);
  });

  test("the success screen offers calendar links for the booked time", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-cal"), mobileNumber: "+2348012345678" });
    await openBooking(page);
    await signInFromHeader(page, user);

    const d = openWeekday(2);
    await addBarrelTwistAndPickTime(page, d);
    await slip(page).getByRole("button", { name: "Review booking" }).click();
    await acceptPolicyAndConfirm(page);

    const start = lagosInstant(d, 10).replace(/[-:]/g, "").replace(".000", "");
    await expect(page.getByRole("link", { name: "Add to Google Calendar" })).toHaveAttribute("href", new RegExp(`dates=${start}`));
    await expect(page.getByRole("link", { name: "Apple / Outlook (.ics)" })).toHaveAttribute("download", /\.ics$/);
    await expect(page.getByText(/You'll usually be due again around/)).toBeVisible();

    // Starting over clears the booked cart.
    await page.getByRole("button", { name: "Book something else" }).click();
    await expect(page.getByRole("heading", { name: "Book a visit" })).toBeVisible();
    await expect(slip(page).getByText("Services you pick appear here.")).toBeVisible();
  });

  test("a server rejection is explained and the client can pick again", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-reject"), mobileNumber: "+2348012345678" });
    await openBooking(page);
    await signInFromHeader(page, user);

    const d = openWeekday(2);
    await addBarrelTwistAndPickTime(page, d);
    await slip(page).getByRole("button", { name: "Review booking" }).click();

    // Stand in for a slot that passed while the page sat open: rewrite the
    // request so the real server sees a start time in the past.
    await page.route("**/createBooking", async (route) => {
      const body = route.request().postDataJSON();
      body.data.startTime = new Date(Date.now() - 3_600_000).toISOString();
      await route.continue({ postData: JSON.stringify(body) });
    });

    await page.getByRole("checkbox", { name: /I'll arrive by/ }).check();
    await slip(page).getByRole("button", { name: "Confirm booking" }).click();
    await expect(main(page).getByRole("alert")).toContainText("That time has already passed");
    expect(await listBookingsFor(user.uid)).toHaveLength(0);

    await page.unroute("**/createBooking");
    await page.getByRole("button", { name: "Pick another time" }).click();
    await expect(page.getByRole("heading", { name: "When suits you?" })).toBeVisible();
  });
});

test.describe("booking from another time zone", () => {
  test.use({ timezoneId: "America/New_York" });

  test("times are Lagos time wherever the browser is", async ({ page }) => {
    // The v1 picker used the browser's clock, so a client abroad booked the
    // wrong hour. 10:00 on the page must be 10:00 in Lagos.
    const user = await seedUser({ email: uniqueEmail("v2-tz"), mobileNumber: "+2348012345678" });
    await openBooking(page);
    await signInFromHeader(page, user);

    const d = openWeekday(2);
    await addBarrelTwistAndPickTime(page, d);
    await slip(page).getByRole("button", { name: "Review booking" }).click();
    await expect(page.getByText(`${dayLabel(d)}, 10:00–12:00`)).toBeVisible();
    await acceptPolicyAndConfirm(page);

    const [booking] = await listBookingsFor(user.uid);
    expect(booking.startTime).toBe(lagosInstant(d, 10));
  });
});

// ── Coming back ──────────────────────────────────────────────────────────────

/** A Tue–Sat day at least `daysAgo` in the past. */
function pastOpenWeekday(daysAgo) {
  const d = lagosDay(-daysAgo);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 1) d.setUTCDate(d.getUTCDate() - 1);
  return d;
}

/** The next date after today on the same weekday as `d`. */
function nextSameWeekday(d) {
  for (let i = 1; i <= 7; i++) {
    const c = lagosDay(i);
    if (c.getUTCDay() === d.getUTCDay()) return c;
  }
  throw new Error("unreachable");
}

test.describe("rebooking", () => {
  test("a returning client books the same again in two taps", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-rebook"), mobileNumber: "+2348012345678" });
    const last = pastOpenWeekday(20);
    await seedBooking({ uid: user.uid, email: user.email, services: [WASH], startTime: lagosInstant(last, 10) });

    await openBooking(page);
    await signInFromHeader(page, user);

    const card = page.getByRole("region", { name: /since your last visit/ });
    await expect(card).toBeVisible();
    await expect(card).toContainText(`Last time: ${shortLabel(last)}, 10:00`);

    // The service they had is flagged in the grid too.
    const before = page.getByRole("region", { name: "Booked before" });
    await expect(before.getByText(/^Due · /)).toBeVisible();

    const next = nextSameWeekday(last);
    await card.getByRole("button", { name: `Book ${shortLabel(next)}, 10:00` }).click();
    await expect(page.getByRole("heading", { name: "Check and confirm" })).toBeVisible();
    await acceptPolicyAndConfirm(page);

    const bookings = await listBookingsFor(user.uid);
    const created = bookings.find((b) => b.status === "pending");
    expect(created.startTime).toBe(lagosInstant(next, 10));
    expect(created.services.map((s) => s.title)).toEqual([WASH.title]);
  });

  test("'Not yet' hides the suggestion, and Undo brings it back", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-snooze"), mobileNumber: "+2348012345678" });
    await seedBooking({ uid: user.uid, email: user.email, services: [WASH], startTime: lagosInstant(pastOpenWeekday(20), 10) });

    await openBooking(page);
    await signInFromHeader(page, user);

    const card = page.getByRole("region", { name: /since your last visit/ });
    await card.getByRole("button", { name: "Not yet" }).click();
    await expect(card).toBeHidden();

    await toast(page).getByRole("button", { name: "Undo" }).click();
    await expect(card).toBeVisible();
  });

  test("a snoozed suggestion stays away after a reload", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-snooze2"), mobileNumber: "+2348012345678" });
    await seedBooking({ uid: user.uid, email: user.email, services: [WASH], startTime: lagosInstant(pastOpenWeekday(20), 10) });

    await openBooking(page);
    await signInFromHeader(page, user);
    await page.getByRole("region", { name: /since your last visit/ }).getByRole("button", { name: "Not yet" }).click();

    await page.reload();
    await expect(page.getByRole("region", { name: "Booked before" })).toBeVisible();
    await expect(page.getByRole("region", { name: /since your last visit/ })).toHaveCount(0);
  });

  test("nobody is nudged before they are due", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-notdue"), mobileNumber: "+2348012345678" });
    // Barrel Twist rebooks after 35 days; five days ago is too soon.
    await seedBooking({ uid: user.uid, email: user.email, services: [BARREL], startTime: lagosInstant(pastOpenWeekday(5), 10) });

    await openBooking(page);
    await signInFromHeader(page, user);

    await expect(page.getByRole("region", { name: "Booked before" })).toBeVisible();
    await expect(page.getByRole("region", { name: /since your last visit/ })).toHaveCount(0);
  });

  test("a client with a visit already booked sees it instead of a nudge", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-upcoming"), mobileNumber: "+2348012345678" });
    await seedBooking({ uid: user.uid, email: user.email, services: [WASH], startTime: lagosInstant(pastOpenWeekday(20), 10) });
    const upcoming = openWeekday(4);
    await seedBooking({
      uid: user.uid,
      email: user.email,
      services: [BARREL],
      startTime: lagosInstant(upcoming, 12),
      status: "pending",
    });

    await openBooking(page);
    await signInFromHeader(page, user);

    await expect(page.getByText(`Your next visit: ${shortLabel(upcoming)} at 12:00`, { exact: false })).toBeVisible();
    await expect(page.getByRole("region", { name: /since your last visit/ })).toHaveCount(0);
  });

  test("an ?again= link opens the time step with that visit's services", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("v2-again"), mobileNumber: "+2348012345678" });
    const id = await seedBooking({
      uid: user.uid,
      email: user.email,
      services: [BARREL, WASH],
      startTime: lagosInstant(pastOpenWeekday(40), 10),
    });

    await openBooking(page);
    await signInFromHeader(page, user);
    await openBooking(page, `/v2/booking?again=${id}`);

    await expect(page.getByRole("heading", { name: "When suits you?" })).toBeVisible();
    await expect(slip(page).getByText("Barrel Twist")).toBeVisible();
    await expect(slip(page).getByText("₦18,000")).toBeVisible();
    // The link is consumed so a refresh doesn't reset the cart.
    await expect(page).toHaveURL(/\/v2\/booking$/);
  });
});

// ── Phones ───────────────────────────────────────────────────────────────────

test.describe("on a phone @mobile", () => {
  test("the bottom bar carries the flow and the sheet opens from the bottom", async ({ page }) => {
    await openBooking(page);

    await page.getByRole("button", { name: "See photo and details: Barrel Twist" }).click();
    const sheet = page.getByRole("dialog", { name: "Barrel Twist" });
    await expect(sheet).toBeVisible();
    const box = await sheet.boundingBox();
    const viewport = page.viewportSize();
    expect(Math.round(box.y + box.height)).toBeGreaterThanOrEqual(viewport.height - 2);

    await sheet.getByRole("button", { name: "Add to booking · ₦10,000" }).click();
    await expect(page.getByText("1 service · 2h")).toBeVisible();

    await page.getByRole("button", { name: "Choose a time" }).click();
    await expect(page.getByRole("heading", { name: "When suits you?" })).toBeVisible();

    const d = openWeekday(2);
    await pickDay(page, d);
    await pickTime(page, d, "10:00");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByLabel("Phone number")).toBeVisible();
  });

  test("tapping the total shows every picked service, which can be removed there", async ({ page }) => {
    await openBooking(page);
    await page.getByRole("button", { name: "Add Barrel Twist" }).click();
    await page.getByRole("button", { name: "Add Finger Coils" }).click();

    await page.getByRole("button", { name: "View your appointment: 2 services" }).click();
    const sheet = page.getByRole("dialog", { name: "Your appointment" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText("Barrel Twist")).toBeVisible();
    await expect(sheet.getByText("Finger Coils")).toBeVisible();
    await expect(sheet.getByText("₦18,000")).toBeVisible();

    await sheet.getByRole("button", { name: "Remove Finger Coils" }).click();
    await expect(sheet.getByText("Finger Coils")).toHaveCount(0);
    await expect(sheet.getByText("1 item")).toBeVisible();

    // Its main button moves on and closes the sheet.
    await sheet.getByRole("button", { name: "Choose a time" }).click();
    await expect(sheet).toBeHidden();
    await expect(page.getByRole("heading", { name: "When suits you?" })).toBeVisible();
  });
});

// ── The guest's way back ─────────────────────────────────────────────────────

/** Turns the emailed manage URL into a path this test run can open. */
function managePath(href) {
  const url = new URL(href);
  return `${url.pathname}${url.search}`;
}

async function bookAsGuest(page, d, { name = "Chioma", phone = "0803 123 4567", notes = "" } = {}) {
  await openBooking(page);
  await addBarrelTwistAndPickTime(page, d);
  await page.getByLabel("Your name").fill(name);
  await page.getByLabel("Phone number").fill(phone);
  if (notes) await page.getByLabel("Anything we should know?").fill(notes);
  await slip(page).getByRole("button", { name: "Review booking" }).click();
  await acceptPolicyAndConfirm(page);
  return page.getByRole("link", { name: "Open my booking" }).getAttribute("href");
}

test.describe("managing a booking without an account", () => {
  test("a guest opens their booking from the signed link and moves it", async ({ page }) => {
    const d = openWeekday(2);
    const href = await bookAsGuest(page, d, { notes: "Bringing my own extensions." });

    await openBooking(page, managePath(href));
    await expect(page.getByRole("heading", { name: "Hello Chioma" })).toBeVisible();
    await expect(main(page).getByText("Bringing my own extensions.")).toBeVisible();

    const later = openWeekday(9);
    await page.getByRole("button", { name: "Move this booking" }).click();
    await expect(page.getByRole("heading", { name: "Pick a new time" })).toBeVisible();
    await pickDay(page, later);
    await pickTime(page, later, "11:00");
    await page.getByRole("button", { name: "Move my booking" }).click();

    await expect(main(page).getByText("Moved.")).toBeVisible({ timeout: 15_000 });
    const [booking] = await listBookingsWhere("userMobileNumber", "+2348031234567");
    expect(booking.startTime).toBe(lagosInstant(later, 11));
    // Moving changes nothing else about the booking.
    expect(booking.totalAmount).toBe(10000);
    expect(booking.notes).toBe("Bringing my own extensions.");
  });

  test("a guest cancels from the signed link", async ({ page }) => {
    const d = openWeekday(2);
    const href = await bookAsGuest(page, d);

    await openBooking(page, managePath(href));
    await page.getByRole("button", { name: "Cancel it" }).click();
    await page.getByRole("button", { name: "Yes, cancel it" }).click();

    await expect(page.getByRole("heading", { name: "That's taken care of" })).toBeVisible({ timeout: 15_000 });
    const [booking] = await listBookingsWhere("userMobileNumber", "+2348031234567");
    expect(booking.status).toBe("cancelled");
  });

  test("a tampered token opens nothing", async ({ page }) => {
    const d = openWeekday(2);
    const href = await bookAsGuest(page, d);
    const forged = managePath(href).replace(/t=[0-9a-f]+/, `t=${"0".repeat(64)}`);

    await openBooking(page, forged);
    await expect(page.getByRole("heading", { name: "We couldn't open that booking" })).toBeVisible({ timeout: 15_000 });

    const [booking] = await listBookingsWhere("userMobileNumber", "+2348031234567");
    expect(booking.status).toBe("pending");
  });
});

// ── Guest history following the client into an account ───────────────────────

test.describe("a guest who makes an account", () => {
  test("signing up keeps the bookings made as a guest", async ({ page }) => {
    const d = openWeekday(2);
    await bookAsGuest(page, d);
    const [before] = await listBookingsWhere("userMobileNumber", "+2348031234567");

    const email = uniqueEmail("guest-signup");
    const modal = new AuthModal(page);
    await page.getByRole("button", { name: "Log in" }).first().click();
    await expect(modal.dialog).toBeVisible();
    await page.getByRole("button", { name: "Sign up" }).click();
    await modal.signUp({ firstName: "Chioma", email });
    await modal.expectClosed();

    // The anonymous session was upgraded in place, so the owner never changed.
    const mine = await listBookingsFor(before.userId);
    expect(mine).toHaveLength(1);
    expect(mine[0].id).toBe(before.id);
  });

  test("signing in to an existing account claims the guest's bookings", async ({ page }) => {
    const user = await seedUser({ email: uniqueEmail("returning"), firstName: "Chioma" });
    const d = openWeekday(2);
    await bookAsGuest(page, d);

    const [before] = await listBookingsWhere("userMobileNumber", "+2348031234567");
    expect(before.userId).not.toBe(user.uid);
    expect(before.guest).toBe(true);

    await signInFromHeader(page, user);

    // The claim runs as part of signing in, so give it a moment to land.
    await expect
      .poll(async () => (await listBookingsFor(user.uid)).length, { timeout: 15_000 })
      .toBe(1);

    const [claimed] = await listBookingsFor(user.uid);
    expect(claimed.id).toBe(before.id);
    expect(claimed.guest).toBe(false);
    expect(claimed.userEmail).toBe(user.email);
    expect(await listBookingsFor(before.userId)).toHaveLength(0);
  });
});
