import { test, expect } from "@playwright/test";
import crypto from "node:crypto";
import {
  anonymousSession,
  callFunction,
  clearMailbox,
  ensureMailDevReady,
  getMailboxMessages,
  readBooking,
  resetEmulators,
  uniqueEmail,
  waitForMailTo,
} from "../support/emulator.js";

/**
 * The two signed links a booking mints, and the wall between them.
 *
 * One HMAC used to authorise both powers: the client's manage link and the
 * owner's "mark complete" link were the same value, so a client's own link
 * would complete their appointment (firing the review request before the
 * visit) and a forwarded owner link could cancel or move someone's booking.
 * The purpose now goes into the HMAC input, and these tests are the wall.
 *
 * `v2-booking.spec.js` covers the happy manage path and a tampered token.
 * What is pinned here is the crossover: each token refused everywhere except
 * its own door. The dev key below is the one `resolveBookingSecret` falls back
 * to under the emulator — it is published in `functions/index.js` on purpose
 * and is never reachable in production.
 */

const DEV_BOOKING_SECRET = "dev-only-booking-secret-do-not-use-in-prod";
const FUNCTIONS_BASE = "http://127.0.0.1:5001/demo-flourish/us-central1";
// The review request's own subject: "Thank you for visiting, we'd love your feedback".
const REVIEW_SUBJECT_HINT = "feedback";

const SERVICE = "Barrel Twist";

const tokenFor = (bookingId, purpose) =>
  crypto.createHmac("sha256", DEV_BOOKING_SECRET).update(`${bookingId}:${purpose}`).digest("hex");

/** 10:00 WAT on the next open day at least two days out. */
function nextOpenSlot() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 2);
  d.setUTCHours(9, 0, 0, 0);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 1) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

test.beforeAll(async () => {
  await ensureMailDevReady();
});

test.beforeEach(async () => {
  await resetEmulators();
  await clearMailbox();
});

/** A live guest booking, with the email that gets the "how was it?" note. */
async function bookAsGuest({ email } = {}) {
  const { idToken } = await anonymousSession();
  const { status, result } = await callFunction(
    "createBooking",
    {
      serviceTitles: [SERVICE],
      startTime: nextOpenSlot(),
      guest: {
        firstName: "Ada",
        mobileNumber: "08031234567",
        ...(email ? { email } : {}),
      },
    },
    idToken
  );
  expect(status, "the booking under test was created").toBe(200);
  return { bookingId: result.bookingId, manageUrl: result.manageUrl, idToken };
}

const completeUrl = (id, token, review = false) =>
  `${FUNCTIONS_BASE}/completeBooking?id=${id}&token=${token}&review=${review}`;

test.describe("the client's link and the salon's link are not the same key", () => {
  test("a client's manage token cannot complete their appointment", async ({ request }) => {
    const { bookingId } = await bookAsGuest();

    // Exactly what a client holds: the token out of their own manage URL.
    const manageToken = tokenFor(bookingId, "manage");
    const res = await request.get(completeUrl(bookingId, manageToken));

    expect(await res.text()).toContain("Invalid Link");
    expect((await readBooking(bookingId)).status).toBe("pending");
  });

  test("the salon's complete token cannot open, move or cancel the booking", async () => {
    const { bookingId } = await bookAsGuest();
    const completeToken = tokenFor(bookingId, "complete");

    const opened = await callFunction("getBooking", { bookingId, token: completeToken });
    expect(opened.status).not.toBe(200);

    const cancelled = await callFunction("cancelBooking", { bookingId, token: completeToken });
    expect(cancelled.status).not.toBe(200);
    expect((await readBooking(bookingId)).status).toBe("pending");
  });

  test("the salon's own link asks first, then completes and asks for a review", async ({ request }) => {
    const email = uniqueEmail("client");
    const { bookingId } = await bookAsGuest({ email });
    await clearMailbox();

    const completeToken = tokenFor(bookingId, "complete");

    // A GET only ever asks — mail scanners fetch every link in an email, and
    // a mutating GET would complete the appointment days early.
    const asked = await request.get(completeUrl(bookingId, completeToken, true));
    expect(await asked.text()).toContain("Mark this appointment complete?");
    expect((await readBooking(bookingId)).status).toBe("pending");
    // The "how was your visit?" note must not have gone out. Scoped to that
    // one subject: the booking's own confirmation mail is legitimately in
    // flight to the same address while this runs.
    const early = (await getMailboxMessages()).filter((m) =>
      m.subject?.toLowerCase().includes(REVIEW_SUBJECT_HINT)
    );
    expect(early, "no review request before the visit").toHaveLength(0);

    const done = await request.post(`${FUNCTIONS_BASE}/completeBooking`, {
      form: { id: bookingId, token: completeToken, review: "true" },
    });
    expect(await done.text()).toContain("Done!");
    expect((await readBooking(bookingId)).status).toBe("completed");

    const [mail] = await waitForMailTo(email, { subjectContains: "feedback" });
    expect(mail.subject.toLowerCase()).toContain(REVIEW_SUBJECT_HINT);
  });

  test("a manage token belonging to another booking opens nothing", async () => {
    const mine = await bookAsGuest();
    const theirs = await bookAsGuest();

    const { status } = await callFunction("getBooking", {
      bookingId: mine.bookingId,
      token: tokenFor(theirs.bookingId, "manage"),
    });

    expect(status).not.toBe(200);
  });
});
