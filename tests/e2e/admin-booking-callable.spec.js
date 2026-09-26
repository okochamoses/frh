import { test, expect } from "@playwright/test";
import {
  anonymousSession,
  callFunction,
  createAuthUser,
  getIdToken,
  listBookingsWhere,
  readBooking,
  resetEmulators,
  seedAdmin,
  seedAdminDoc,
  seedUser,
  uniqueEmail,
  verifyEmail,
} from "../support/emulator.js";

/**
 * `adminCreateBooking` — the front desk's write path.
 *
 * Two things these specs exist to pin down. The first is that it is genuinely
 * admin-only: the dashboard's own check is UI, and the callable is the only
 * thing standing between a signed-in stranger and the salon's diary. The
 * second is that relaxing the schedule rules for a walk-in did not relax them
 * for anyone else — a visit that already happened skips the calendar, and a
 * future booking taken at the desk does not.
 *
 * No browser; these drive the emulator's callable endpoints directly.
 */

// Priced at ₦10,000 for 120 minutes in src/app/salon/services.json.
const SERVICE = "Barrel Twist";
const SERVICE_PRICE = 10_000;
const SERVICE_DURATION = 120;

const CUSTOMER = { firstName: "Ngozi", mobileNumber: "08031234567" };

/** 10:00 WAT on the next open day at least two days out. */
function nextOpenSlot(daysAhead = 2) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  d.setUTCHours(9, 0, 0, 0);
  while (d.getUTCDay() === 1 || d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

/** The next Monday at 10:00 WAT — the salon's day off. */
function nextMonday() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(9, 0, 0, 0);
  while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

const walkIn = (overrides = {}) => ({
  serviceTitles: [SERVICE],
  customer: { ...CUSTOMER, ...(overrides.customer ?? {}) },
  served: true,
  ...overrides,
});

test.describe("adminCreateBooking", () => {
  test.beforeEach(async () => {
    await resetEmulators();
  });

  // ── Who may call it ────────────────────────────────────────────────────────

  test("a signed-in customer is refused, and writes nothing", async () => {
    const user = await seedUser({ email: uniqueEmail("not-admin") });
    const idToken = await getIdToken(user);

    const { error } = await callFunction("adminCreateBooking", walkIn(), idToken);

    expect(error?.status).toBe("PERMISSION_DENIED");
    expect(await listBookingsWhere("channel", "walk-in")).toHaveLength(0);
  });

  test("an anonymous guest is refused", async () => {
    const { idToken } = await anonymousSession();

    const { error } = await callFunction("adminCreateBooking", walkIn(), idToken);

    expect(error?.status).toBeTruthy();
    expect(await listBookingsWhere("channel", "walk-in")).toHaveLength(0);
  });

  /*
   * The allowlist is only half the check. `firestore.rules` also requires a
   * verified email, for the reason its own comment gives: an allowlisted
   * address could otherwise be claimed by whoever registers it first. The
   * callable has to hold the same line, or it becomes the way around the rule.
   */
  test("an allowlisted email that has not been verified is refused", async () => {
    const email = uniqueEmail("unverified-admin");
    await createAuthUser({ email, password: "Password123" });
    await seedAdminDoc(email);
    const idToken = await getIdToken({ email, password: "Password123" });

    const { error } = await callFunction("adminCreateBooking", walkIn(), idToken);

    expect(error?.status).toBe("PERMISSION_DENIED");
  });

  // ── What it writes ─────────────────────────────────────────────────────────

  test("records a served walk-in as a completed, unowned booking", async () => {
    const admin = await seedAdmin();

    const { result } = await callFunction("adminCreateBooking", walkIn(), admin.idToken);

    expect(result.status).toBe("completed");
    expect(result.manageUrl).toBeNull();

    const booking = await readBooking(result.bookingId);
    expect(booking.channel).toBe("walk-in");
    expect(booking.createdBy).toBe(admin.email.toLowerCase());
    expect(booking.status).toBe("completed");
    expect(booking.reminderSent).toBe(true);
    expect(booking.completedAt).toBeTruthy();
    // Nobody owns it yet, which is exactly what claimWalkInBookings looks for.
    expect(booking.userId ?? null).toBeNull();
    expect(booking.guest).toBe(true);
    expect(booking.userMobileNumber).toBe("+2348031234567");

    // Start on a quarter hour, end exactly one service later.
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    expect(start.getUTCMinutes() % 15).toBe(0);
    expect(end.getTime() - start.getTime()).toBe(SERVICE_DURATION * 60_000);
  });

  test("prices from the catalogue and ignores anything the caller sends", async () => {
    const admin = await seedAdmin();

    const { result } = await callFunction(
      "adminCreateBooking",
      { ...walkIn(), price: 1, totalAmount: 1 },
      admin.idToken
    );

    expect(result.totalAmount).toBe(SERVICE_PRICE);
    const booking = await readBooking(result.bookingId);
    expect(booking.totalAmount).toBe(SERVICE_PRICE);
    expect(booking.servicesText).toBe(SERVICE);

    // `unwrapFields` leaves arrays in Firestore's own encoding, so the line
    // item is read raw — it is worth reading, because the stored price is what
    // a receipt would later be built from.
    const [line] = booking.services.arrayValue.values;
    expect(Number(line.mapValue.fields.price.integerValue)).toBe(SERVICE_PRICE);
    expect(Number(line.mapValue.fields.duration.integerValue)).toBe(SERVICE_DURATION);
  });

  test("an unknown service is refused", async () => {
    const admin = await seedAdmin();

    const { error } = await callFunction(
      "adminCreateBooking",
      walkIn({ serviceTitles: ["Not A Real Service"] }),
      admin.idToken
    );

    expect(error?.status).toBe("INVALID_ARGUMENT");
  });

  // ── The schedule rules, and where they stop applying ───────────────────────

  /*
   * This is the whole point of the feature, and it is stable precisely because
   * `validateWalkInSlot` has no time rule at all. Written against
   * `validateSlot` it would pass or fail depending on what day the suite runs
   * — flaky by construction rather than by accident.
   */
  test("a served walk-in is accepted whatever the clock says", async () => {
    const admin = await seedAdmin();

    const { result, error } = await callFunction("adminCreateBooking", walkIn(), admin.idToken);

    expect(error).toBeFalsy();
    expect(result.bookingId).toBeTruthy();
  });

  test("a booking taken for later still meets the salon's hours", async () => {
    const admin = await seedAdmin();

    const { error } = await callFunction(
      "adminCreateBooking",
      walkIn({ served: false, startTime: nextMonday() }),
      admin.idToken
    );

    expect(error?.status).toBe("OUT_OF_RANGE");
  });

  test("a booking taken for later is pending, and keeps its manage link", async () => {
    const admin = await seedAdmin();

    const { result } = await callFunction(
      "adminCreateBooking",
      walkIn({ served: false, startTime: nextOpenSlot() }),
      admin.idToken
    );

    expect(result.status).toBe("pending");
    const booking = await readBooking(result.bookingId);
    expect(booking.status).toBe("pending");
    expect(booking.reminderSent).toBe(false);
  });

  /*
   * `MAX_UPCOMING_PER_GUEST` exists because anonymous sign-in is free and a
   * stranger could otherwise fill the diary. None of that is true of a member
   * of staff typing at the desk, and a regular who visits weekly is not an
   * abuse signal — so the cap must not be on this path at all.
   */
  test("the guest cap does not apply to the front desk", async () => {
    const admin = await seedAdmin();

    for (let i = 0; i < 4; i += 1) {
      const { error } = await callFunction(
        "adminCreateBooking",
        walkIn({ served: false, startTime: nextOpenSlot(2 + i) }),
        admin.idToken
      );
      expect(error).toBeFalsy();
    }

    expect(await listBookingsWhere("userMobileNumber", "+2348031234567")).toHaveLength(4);
  });

  // ── Attaching to an account ────────────────────────────────────────────────

  test("attaches to a verified account with that email", async () => {
    const admin = await seedAdmin();
    const customer = await seedUser({ email: uniqueEmail("verified-client") });
    await verifyEmail(customer.uid);

    const { result } = await callFunction(
      "adminCreateBooking",
      walkIn({ customer: { ...CUSTOMER, email: customer.email } }),
      admin.idToken
    );

    expect(result.matchedUserId).toBe(customer.uid);
    const booking = await readBooking(result.bookingId);
    expect(booking.userId).toBe(customer.uid);
    expect(booking.guest ?? false).toBe(false);
  });

  /*
   * One rule across both halves of reconciliation: a walk-in attaches to an
   * account only once that account has *proved* the address. Anything looser
   * would put a stranger's visit history in front of whoever typed their
   * email first.
   */
  test("does not attach to an account that has not verified its email", async () => {
    const admin = await seedAdmin();
    const customer = await seedUser({ email: uniqueEmail("unverified-client") });

    const { result } = await callFunction(
      "adminCreateBooking",
      walkIn({ customer: { ...CUSTOMER, email: customer.email } }),
      admin.idToken
    );

    expect(result.matchedUserId ?? null).toBeNull();
    const booking = await readBooking(result.bookingId);
    expect(booking.userId ?? null).toBeNull();
    expect(booking.guest).toBe(true);
  });

  test("an address typed in capitals still finds the account", async () => {
    const admin = await seedAdmin();
    const customer = await seedUser({ email: uniqueEmail("mixed-case") });
    await verifyEmail(customer.uid);

    const { result } = await callFunction(
      "adminCreateBooking",
      walkIn({ customer: { ...CUSTOMER, email: customer.email.toUpperCase() } }),
      admin.idToken
    );

    expect(result.matchedUserId).toBe(customer.uid);
  });
});
