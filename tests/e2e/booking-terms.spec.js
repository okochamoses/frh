import { test, expect } from "@playwright/test";
import { resetEmulators } from "../support/emulator.js";

/**
 * The salon charges no penalties, and this is the spec that keeps it that way.
 *
 * There used to be three: a late charge of ₦3,000 (₦5,000 on the long styles),
 * 50% of anything paid forfeited on a cancellation or a move, and twenty
 * minutes of grace with a consequence attached. All of it is gone from the
 * business — not softened, removed — so the only money a client is ever asked
 * for is the price of the service and, on the long styles, a deposit that
 * holds the slot and follows them if they move it.
 *
 * Copy drifts back. The service catalogue is the likeliest route: it is an
 * export from the salon's own booking system, and the penalty sentences lived
 * inside twenty-one of its descriptions. `catalogue.js` strips them on the way
 * in, the data has been cleaned behind that, and this spec is the third line —
 * it walks a real booking and fails if any of those words reach a client.
 */

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Deposit-bearing (70%) and settled-on-the-day, so both paths are walked.
const MICRO_TWISTS = { title: "Micro Twists", price: 30000, depositPct: 70 };
const BARREL = { title: "Barrel Twist", price: 10000 };

/** Anything that would mean a client owes money for being late or changing plans. */
const PENALTY_WORDS = [
  /late fee/i,
  /late charge/i,
  /caution fee/i,
  /forfeit/i,
  /minutes of grace/i,
  /grace period/i,
  /extra charges/i,
  /cancellation fee/i,
  /non-refundable/i,
];

const naira = (n) => `₦${n.toLocaleString("en-US")}`;

const lagosNow = () => new Date(Date.now() + 3_600_000);

function openWeekday(daysAhead = 2) {
  const d = lagosNow();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + daysAhead);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 1) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

const dayLabel = (d) => `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
const slip = (page) => page.getByRole("complementary", { name: "Your appointment" });

test.beforeEach(async () => {
  await resetEmulators();
});

async function openBooking(page, path = "/booking") {
  const emulatorBanner = page.waitForEvent("console", {
    predicate: (m) => m.text().includes("[firebase] Using emulators — project demo-flourish"),
    timeout: 20_000,
  });
  await page.goto(path);
  await emulatorBanner;
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

/** Fails naming the phrase, so a regression reads as a sentence rather than a diff. */
async function expectNoPenaltyLanguage(page, where) {
  const text = await page.locator("body").innerText();
  for (const pattern of PENALTY_WORDS) {
    expect(pattern.test(text), `${where} must not mention ${pattern.source}`).toBe(false);
  }
}

/** Adds one service by name and walks to the Review step as a guest. */
async function reviewAsGuest(page, title) {
  await openBooking(page);
  await page.getByRole("button", { name: `Add ${title}`, exact: true }).click();
  await slip(page).getByRole("button", { name: "Choose a time" }).click();

  const d = openWeekday();
  const strip = page.getByRole("group", { name: "Choose a day" }).getByRole("button", { name: dayLabel(d), exact: true });
  if (await strip.isVisible()) {
    await strip.click();
  } else {
    await page.getByRole("button", { name: "More dates" }).click();
    const day = page.getByRole("group", { name: "Calendar" }).getByRole("button", { name: dayLabel(d), exact: true });
    for (let i = 0; i < 3 && !(await day.isVisible()); i++) {
      await page.getByRole("button", { name: "Next month" }).click();
    }
    await day.click();
  }
  await page
    .getByRole("group", { name: `Times on ${dayLabel(d)}` })
    .getByRole("button")
    .first()
    .click();
  await slip(page).getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Your name").fill("Chioma");
  await page.getByLabel("Phone number").fill("0803 123 4567");
  await slip(page).getByRole("button", { name: "Review booking" }).click();
  await expect(page.getByRole("heading", { name: "Check and confirm" })).toBeVisible();
}

test.describe("nothing in the flow charges a penalty", () => {
  test("the step a client confirms from names no fee of any kind", async ({ page }) => {
    await reviewAsGuest(page, MICRO_TWISTS.title);
    await expectNoPenaltyLanguage(page, "the confirm step");
  });

  test("moving or cancelling is stated as free", async ({ page }) => {
    await reviewAsGuest(page, BARREL.title);

    await expect(
      page.getByText(/move or cancel/i),
      "the client is told changing plans is free"
    ).toContainText(/costs you anything|no charge|free/i);
  });

  test("a service sheet carries the salon's words, not its old small print", async ({ page }) => {
    await openBooking(page);
    // Micro Twists is one of the rows whose export description carried the
    // lateness penalty and the forfeiture rule.
    await page.getByRole("button", { name: `See photo and details: ${MICRO_TWISTS.title}` }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();

    const text = await sheet.innerText();
    for (const pattern of PENALTY_WORDS) {
      expect(pattern.test(text), `the service sheet must not mention ${pattern.source}`).toBe(false);
    }
    // The bank details that sat in the same descriptions stay out too.
    expect(/moniepoint|6924798521/i.test(text), "no account number on a service card").toBe(false);
  });

  test("the terms a client reads before booking name only the deposit and the extras", async ({ page }) => {
    await openBooking(page, "/services");
    await expectNoPenaltyLanguage(page, "the services page");

    await expect(page.getByRole("heading", { name: /changing a booking costs nothing/i })).toBeVisible();
  });
});

test.describe("what a client is still asked for", () => {
  test("the deposit on a long style is shown before they confirm", async ({ page }) => {
    await reviewAsGuest(page, MICRO_TWISTS.title);

    const owed = (MICRO_TWISTS.price * MICRO_TWISTS.depositPct) / 100;
    await expect(page.getByText("This style needs a deposit")).toBeVisible();
    await expect(page.getByText(`(${MICRO_TWISTS.depositPct}%)`, { exact: false })).toBeVisible();
    // The figure appears twice on Review — the summary row and the sentence
    // under it — which is the point, so the first is enough.
    await expect(page.getByText(naira(owed)).locator("visible=true").first()).toBeVisible();
  });

  test("a style settled on the day asks for nothing up front", async ({ page }) => {
    await reviewAsGuest(page, BARREL.title);

    await expect(page.getByText(/needs a deposit/i)).toHaveCount(0);
    await expect(page.getByText(naira(BARREL.price)).locator("visible=true").first()).toBeVisible();
  });
});

test.describe("availability the model cannot express yet", () => {
  // `bookingRules.js` allows unlimited overlap on purpose — several stylists
  // work in parallel — but nothing caps it at the number of stylists, so any
  // number of clients can take Saturday 09:00. Testing it needs a chair or
  // stylist count to exist first, and how many chairs there are is the salon's
  // answer, not a guess this suite should encode.
  test.fixme("a slot stops being offered once every chair is taken");

  // Only Mondays are modelled. Holidays, staff leave and one-off shutdowns
  // have nowhere to live, so Christmas Day is bookable 90 days out. Needs a
  // `closures` collection read by both `validateSlot` and the picker.
  test.fixme("a day the salon has closed cannot be booked");
});
