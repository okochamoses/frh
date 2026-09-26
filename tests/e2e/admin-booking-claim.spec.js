import { test, expect } from "@playwright/test";
import {
  anonymousSession,
  callFunction,
  getIdToken,
  readBooking,
  resetEmulators,
  seedAdmin,
  seedBooking,
  seedUser,
  uniqueEmail,
  verifyEmail,
} from "../support/emulator.js";

/**
 * `claimWalkInBookings` — giving someone their visit history when they sign up.
 *
 * A walk-in is recorded before the salon knows whether the person has an
 * account, so it is written owned by nobody. This is the other half: when they
 * do sign up, the visits they already made should be waiting for them.
 *
 * It is a callable rather than a `users/{uid}` trigger for two reasons these
 * specs pin. The address on a profile document is a claim — `firestore.rules`
 * never requires it to match the real credential — so only a token may be
 * trusted with it. And an account is *unverified* at the moment its profile is
 * written, because `sendEmailVerification` is fire-and-forget at sign-up; a
 * trigger would fire exactly once, too early, and never again.
 */

const SERVICE = { title: "Barrel Twist", price: 10_000, duration: 120, category: "Twists and Coils" };
const CUSTOMER = { firstName: "Ngozi", mobileNumber: "08031234567" };

async function recordWalkIn(adminToken, email) {
  const { result, error } = await callFunction(
    "adminCreateBooking",
    { serviceTitles: [SERVICE.title], customer: { ...CUSTOMER, email }, served: true },
    adminToken
  );
  expect(error).toBeFalsy();
  return result.bookingId;
}

test.describe("claimWalkInBookings", () => {
  test.beforeEach(async () => {
    await resetEmulators();
  });

  test("hands every unclaimed walk-in on that address to the account", async () => {
    const admin = await seedAdmin();
    const email = uniqueEmail("walks-in");

    const first = await recordWalkIn(admin.idToken, email);
    const second = await recordWalkIn(admin.idToken, email);

    // They sign up afterwards and confirm the address.
    const customer = await seedUser({ email, firstName: "Ngozi" });
    await verifyEmail(customer.uid);
    const idToken = await getIdToken(customer);

    const { result } = await callFunction("claimWalkInBookings", {}, idToken);

    expect(result.claimed).toBe(2);
    for (const id of [first, second]) {
      const booking = await readBooking(id);
      expect(booking.userId).toBe(customer.uid);
      expect(booking.guest).toBe(false);
      expect(booking.claimedAt).toBeTruthy();
    }
  });

  /*
   * The reason this is a callable at all. A document trigger would have fired
   * at sign-up, when the answer was still "nothing to give you", and nothing
   * writes to Firestore when the verification link is finally clicked.
   */
  test("waits for the address to be verified, then works on the next call", async () => {
    const admin = await seedAdmin();
    const email = uniqueEmail("verifies-later");
    const bookingId = await recordWalkIn(admin.idToken, email);

    const customer = await seedUser({ email });
    const unverifiedToken = await getIdToken(customer);

    const before = await callFunction("claimWalkInBookings", {}, unverifiedToken);
    expect(before.result.claimed).toBe(0);
    expect((await readBooking(bookingId)).userId ?? null).toBeNull();

    await verifyEmail(customer.uid);
    // A token minted before verification still carries the old claim, so the
    // claim only lands on the session that follows — which is the sign-in the
    // client wires this call into.
    const verifiedToken = await getIdToken(customer);
    const after = await callFunction("claimWalkInBookings", {}, verifiedToken);

    expect(after.result.claimed).toBe(1);
    expect((await readBooking(bookingId)).userId).toBe(customer.uid);
  });

  test("an anonymous guest cannot claim anything", async () => {
    const admin = await seedAdmin();
    const bookingId = await recordWalkIn(admin.idToken, uniqueEmail("someone"));
    const { idToken } = await anonymousSession();

    const { error, result } = await callFunction("claimWalkInBookings", {}, idToken);

    expect(result?.claimed ?? 0).toBe(0);
    if (!error) expect((await readBooking(bookingId)).userId ?? null).toBeNull();
  });

  test("running twice claims nothing the second time", async () => {
    const admin = await seedAdmin();
    const email = uniqueEmail("runs-twice");
    await recordWalkIn(admin.idToken, email);

    const customer = await seedUser({ email });
    await verifyEmail(customer.uid);
    const idToken = await getIdToken(customer);

    expect((await callFunction("claimWalkInBookings", {}, idToken)).result.claimed).toBe(1);
    expect((await callFunction("claimWalkInBookings", {}, idToken)).result.claimed).toBe(0);
  });

  test("leaves a walk-in on somebody else's address alone", async () => {
    const admin = await seedAdmin();
    const theirs = await recordWalkIn(admin.idToken, uniqueEmail("not-them"));

    const customer = await seedUser({ email: uniqueEmail("claimant") });
    await verifyEmail(customer.uid);
    const idToken = await getIdToken(customer);

    const { result } = await callFunction("claimWalkInBookings", {}, idToken);

    expect(result.claimed).toBe(0);
    expect((await readBooking(theirs)).userId ?? null).toBeNull();
  });

  /*
   * A guest who booked online already has an owner — their anonymous session —
   * and `claimGuestBookings` is what moves those. Sweeping them up here on a
   * matching address would take a booking off a uid that still has a claim to
   * it, so the `userId == null` filter has to be exact.
   */
  test("never re-homes a booking that already has an owner", async () => {
    const admin = await seedAdmin();
    const email = uniqueEmail("also-booked-online");

    const walkInId = await recordWalkIn(admin.idToken, email);
    const guest = await anonymousSession();
    const onlineId = await seedBooking({
      uid: guest.uid,
      email,
      services: [SERVICE],
      startTime: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      status: "pending",
    });

    const customer = await seedUser({ email });
    await verifyEmail(customer.uid);
    const idToken = await getIdToken(customer);

    const { result } = await callFunction("claimWalkInBookings", {}, idToken);

    expect(result.claimed).toBe(1);
    expect((await readBooking(walkInId)).userId).toBe(customer.uid);
    expect((await readBooking(onlineId)).userId).toBe(guest.uid);
  });
});
