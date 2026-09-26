import { test, expect } from "@playwright/test";
import { resetEmulators } from "../support/emulator.js";

/**
 * The edges of the salon's opening rules, as the picker draws them.
 *
 * `v2-booking.spec.js` covers a closed Monday and a day the services cannot
 * fit. What it does not pin is where each open day *starts* and *stops*, which
 * is the half of `schedule.js` that decides whether a client is offered a time
 * the salon cannot actually work:
 *
 *   - Sunday opens at 13:00 and every other open day at 09:00
 *   - nothing may start so late that it would finish after 19:00
 *   - bookings open 90 days ahead and the calendar stops there
 *   - a time about to arrive is not offered (a 15-minute lead)
 *
 * All four are client-side arithmetic, so they are asserted against the
 * rendered grid rather than through a booking.
 */

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Barrel Twist is 120 minutes, which fits both a 09:00 day and a Sunday.
const BARREL_MINUTES = 120;

/** A Date whose UTC fields read as Lagos wall-clock time. WAT is UTC+1 all year. */
const lagosNow = () => new Date(Date.now() + 3_600_000);

function lagosDay(daysAhead) {
  const d = lagosNow();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d;
}

/** The first day on `weekday` at least `daysAhead` out. */
function nextWeekday(weekday, daysAhead = 2) {
  const d = lagosDay(daysAhead);
  while (d.getUTCDay() !== weekday) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

/** The first Tuesday–Saturday at least `daysAhead` out. */
function openWeekday(daysAhead = 2) {
  const d = lagosDay(daysAhead);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 1) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

const dayLabel = (d) => `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;

let pageErrors = [];

test.beforeEach(async ({ page }) => {
  await resetEmulators();
  pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));
});

test.afterEach(() => {
  expect(pageErrors, "uncaught errors on the page").toEqual([]);
});

async function openBooking(page) {
  const emulatorBanner = page.waitForEvent("console", {
    predicate: (m) => m.text().includes("[firebase] Using emulators — project demo-flourish"),
    timeout: 20_000,
  });
  await page.goto("/booking");
  await emulatorBanner;
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

const slip = (page) => page.getByRole("complementary", { name: "Your appointment" });

/** Adds Barrel Twist and lands on the time step. */
async function reachTimeStep(page) {
  await page.getByRole("button", { name: "Add Barrel Twist" }).click();
  await slip(page).getByRole("button", { name: "Choose a time" }).click();
  await expect(page.getByRole("heading", { name: "When suits you?" })).toBeVisible();
}

/** Clicks a calendar day, paging forward until it is showing. */
async function pickDay(page, d, { months = 3 } = {}) {
  // The next open days sit in a strip; anything further out is in the calendar.
  const strip = page.getByRole("group", { name: "Choose a day" }).getByRole("button", { name: dayLabel(d), exact: true });
  if (await strip.isVisible()) {
    await strip.click();
    await expect(strip).toHaveAttribute("aria-pressed", "true");
    return;
  }
  await page.getByRole("button", { name: "More dates" }).click();
  const day = page.getByRole("group", { name: "Calendar" }).getByRole("button", { name: dayLabel(d), exact: true });
  for (let i = 0; i < months && !(await day.isVisible()); i++) {
    await page.getByRole("button", { name: "Next month" }).click();
  }
  await day.click();
  await expect(day).toHaveAttribute("aria-pressed", "true");
}

const timesFor = (page, d) => page.getByRole("group", { name: `Times on ${dayLabel(d)}` });

/** Every start time offered on the open day, in order. */
async function offeredTimes(page, d) {
  return timesFor(page, d).getByRole("button").allInnerTexts();
}

test.describe("when the salon can actually take you", () => {
  test("Sunday opens at 1pm, every other open day at 9am", async ({ page }) => {
    await openBooking(page);
    await reachTimeStep(page);

    const sunday = nextWeekday(0);
    const weekday = openWeekday();
    const checks = [
      [sunday, (times) => {
        expect(times[0]).toBe("13:00");
        expect(times).not.toContain("09:00");
        expect(times).not.toContain("12:30");
      }],
      [weekday, (times) => expect(times[0]).toBe("09:00")],
    ];
    // Earliest day first: pickDay only pages forward, and the two days can
    // straddle a month boundary.
    checks.sort(([a], [b]) => a - b);
    for (const [day, check] of checks) {
      await pickDay(page, day);
      check(await offeredTimes(page, day));
    }
  });

  test("the last time offered still finishes by 7pm", async ({ page }) => {
    await openBooking(page);
    await reachTimeStep(page);

    const d = openWeekday();
    await pickDay(page, d);
    const times = await offeredTimes(page, d);

    // 19:00 less the two hours Barrel Twist takes.
    expect(times.at(-1)).toBe("17:00");
    expect(times).not.toContain("17:30");

    // And the page says so once a time is picked, rather than leaving the
    // client to work out when they will be done.
    await timesFor(page, d).getByRole("button", { name: "17:00", exact: true }).click();
    await expect(page.getByText(/Please arrive 5 minutes early/)).toContainText("19:00");
  });

  test("bookings stop 90 days out", async ({ page }) => {
    await openBooking(page);
    await reachTimeStep(page);

    await page.getByRole("button", { name: "More dates" }).click();
    const next = page.getByRole("button", { name: "Next month" });
    // Three months of paging always reaches the horizon month: 90 days spans
    // at most four calendar months, and the first is already showing.
    for (let i = 0; i < 4 && (await next.isEnabled()); i++) await next.click();
    await expect(next).toBeDisabled();

    const beyond = lagosDay(95);
    await expect(page.getByRole("button", { name: dayLabel(beyond), exact: true })).toHaveCount(0);

    // The last month's own out-of-range days say why rather than going quiet.
    const horizon = lagosDay(91);
    const tooFar = page.getByRole("button", {
      name: `${dayLabel(horizon)}, unavailable: Bookings open 90 days ahead`,
      exact: true,
    });
    if (await tooFar.count()) await expect(tooFar).toBeDisabled();
  });

  test("a time that is all but here is not offered", async ({ page }) => {
    // 09:40 Lagos on a Wednesday, so 09:30 has gone and 10:00 has not. Fixed
    // before the page loads, because the flow reads the clock on mount.
    await page.clock.install({ time: new Date("2026-09-16T08:40:00.000Z") });
    await openBooking(page);
    await reachTimeStep(page);

    const today = new Date("2026-09-16T12:00:00.000Z");
    await pickDay(page, today);
    const times = await offeredTimes(page, today);

    expect(times).not.toContain("09:00");
    expect(times).not.toContain("09:30");
    expect(times[0]).toBe("10:00");
  });
});
