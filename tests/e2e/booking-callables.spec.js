import { test, expect } from "@playwright/test";
import {
  resetEmulators,
  seedUser,
  uniqueEmail,
  getIdToken,
  createAsUser,
  callFunction,
  readBooking,
} from "../support/emulator.js";

/**
 * The booking write path.
 *
 * Bookings used to be written straight from the browser with rules that only
 * checked `userId`, which left the email address, price and time to the client
 * — and `onBookingCreated` mails whatever address is on the document. These
 * specs pin the replacement: the collection is read-only, and the callables
 * price and validate everything server-side.
 *
 * No browser is involved; these drive the emulator's REST and callable
 * endpoints directly.
 */

/** 10:00 WAT (09:00 UTC) on the next open day at least two days out. */
function nextOpenSlot(daysAhead = 2) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  d.setUTCHours(9, 0, 0, 0);
  // Monday is the salon's day off. WAT is UTC+1 year round, so 09:00Z is
  // always the same calendar day in Lagos.
  while (d.getUTCDay() === 1) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

// Priced at ₦10,000 for 120 minutes in src/app/salon/services.json.
const SERVICE = "Barrel Twist";

async function signedInUser(label, overrides = {}) {
  const user = await seedUser({ email: uniqueEmail(label), ...overrides });
  return { user, idToken: await getIdToken(user) };
}

test.describe("bookings collection rules", () => {
  test.beforeEach(async () => {
    await resetEmulators();
  });

  test("a client cannot write a booking document directly", async () => {
    const { user, idToken } = await signedInUser("rules-booking");

    const status = await createAsUser(idToken, {
      collection: "bookings",
      fields: {
        userId: { stringValue: user.uid },
        userEmail: { stringValue: user.email },
        totalAmount: { integerValue: "10000" },
        startTime: { stringValue: nextOpenSlot() },
      },
    });

    expect(status).toBe(403);
  });

  test("a booking naming someone else's email is refused too", async () => {
    // The abuse this closes: `onBookingCreated` sends confirmation mail to
    // whatever `userEmail` says, so a writable collection is a mail relay.
    const { user, idToken } = await signedInUser("rules-relay");

    const status = await createAsUser(idToken, {
      collection: "bookings",
      fields: {
        userId: { stringValue: user.uid },
        userEmail: { stringValue: "victim@example.com" },
        totalAmount: { integerValue: "0" },
        startTime: { stringValue: nextOpenSlot() },
      },
    });

    expect(status).toBe(403);
  });
});

test.describe("createBooking callable", () => {
  test.beforeEach(async () => {
    await resetEmulators();
  });

  test("prices the booking from the server's own catalogue", async () => {
    const { user, idToken } = await signedInUser("call-create");
    const startTime = nextOpenSlot();

    const { result, error } = await callFunction(
      "createBooking",
      { serviceTitles: [SERVICE], startTime },
      idToken
    );

    expect(error).toBeUndefined();
    expect(result.totalAmount).toBe(10000);

    const booking = await readBooking(result.bookingId);
    expect(booking.userId).toBe(user.uid);
    // Derived from the auth token, never from the request body.
    expect(booking.userEmail).toBe(user.email);
    expect(booking.status).toBe("pending");
    expect(booking.totalAmount).toBe(10000);
    // 120-minute service, so the server-computed end is two hours later.
    expect(new Date(booking.endTime) - new Date(booking.startTime)).toBe(120 * 60 * 1000);
  });

  test("rejects a start time the salon is closed for", async () => {
    const { idToken } = await signedInUser("call-monday");

    // Walk forward to a Monday.
    const monday = new Date();
    monday.setUTCDate(monday.getUTCDate() + 1);
    monday.setUTCHours(9, 0, 0, 0);
    while (monday.getUTCDay() !== 1) monday.setUTCDate(monday.getUTCDate() + 1);

    const { error } = await callFunction(
      "createBooking",
      { serviceTitles: [SERVICE], startTime: monday.toISOString() },
      idToken
    );

    expect(error?.message).toContain("closed on Mondays");
  });

  test("rejects a start time in the past", async () => {
    const { idToken } = await signedInUser("call-past");

    const { error } = await callFunction(
      "createBooking",
      { serviceTitles: [SERVICE], startTime: "2020-06-03T09:00:00.000Z" },
      idToken
    );

    expect(error?.message).toContain("already passed");
  });

  test("rejects a service that is not in the catalogue", async () => {
    const { idToken } = await signedInUser("call-fake");

    const { error } = await callFunction(
      "createBooking",
      { serviceTitles: ["Free Haircut"], startTime: nextOpenSlot() },
      idToken
    );

    expect(error?.message).toContain("Unknown service");
  });

  test("refuses an unauthenticated caller", async () => {
    const { error } = await callFunction("createBooking", {
      serviceTitles: [SERVICE],
      startTime: nextOpenSlot(),
    });

    expect(error?.status).toBe("UNAUTHENTICATED");
  });

  test("requires a phone number on the profile", async () => {
    const { idToken } = await signedInUser("call-nophone", { mobileNumber: null });

    const { error } = await callFunction(
      "createBooking",
      { serviceTitles: [SERVICE], startTime: nextOpenSlot() },
      idToken
    );

    expect(error?.message).toContain("mobile number");
  });
});

test.describe("cancel and reschedule", () => {
  test.beforeEach(async () => {
    await resetEmulators();
  });

  async function bookOne(label) {
    const { user, idToken } = await signedInUser(label);
    const { result } = await callFunction(
      "createBooking",
      { serviceTitles: [SERVICE], startTime: nextOpenSlot() },
      idToken
    );
    return { user, idToken, bookingId: result.bookingId };
  }

  test("a client can cancel their own booking", async () => {
    const { idToken, bookingId } = await bookOne("call-cancel");

    const { error } = await callFunction("cancelBooking", { bookingId }, idToken);
    expect(error).toBeUndefined();

    const booking = await readBooking(bookingId);
    expect(booking.status).toBe("cancelled");
  });

  test("a client cannot cancel someone else's booking", async () => {
    const { bookingId } = await bookOne("call-victim");
    const { idToken: attackerToken } = await signedInUser("call-attacker");

    const { error } = await callFunction("cancelBooking", { bookingId }, attackerToken);

    // Deliberately indistinguishable from a missing booking, so the callable
    // can't be used to enumerate ids.
    expect(error?.status).toBe("NOT_FOUND");
    expect((await readBooking(bookingId)).status).toBe("pending");
  });

  test("rescheduling moves the booking and clears the reminder flag", async () => {
    const { idToken, bookingId } = await bookOne("call-move");
    const newStart = nextOpenSlot(4);

    const { error } = await callFunction(
      "rescheduleBooking",
      { bookingId, startTime: newStart },
      idToken
    );
    expect(error).toBeUndefined();

    const booking = await readBooking(bookingId);
    expect(booking.startTime).toBe(newStart);
    expect(booking.reminderSent).toBe(false);
    // Services and price are not up for renegotiation during a move.
    expect(booking.totalAmount).toBe(10000);
  });

  test("rescheduling into a closed day is refused", async () => {
    const { idToken, bookingId } = await bookOne("call-move-closed");

    const monday = new Date();
    monday.setUTCDate(monday.getUTCDate() + 1);
    monday.setUTCHours(9, 0, 0, 0);
    while (monday.getUTCDay() !== 1) monday.setUTCDate(monday.getUTCDate() + 1);

    const { error } = await callFunction(
      "rescheduleBooking",
      { bookingId, startTime: monday.toISOString() },
      idToken
    );

    expect(error?.message).toContain("closed on Mondays");
  });

  test("a cancelled booking cannot be cancelled twice", async () => {
    const { idToken, bookingId } = await bookOne("call-double-cancel");
    await callFunction("cancelBooking", { bookingId }, idToken);

    const { error } = await callFunction("cancelBooking", { bookingId }, idToken);
    expect(error?.message).toContain("already cancelled");
  });
});
