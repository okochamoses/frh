import { test, expect } from "@playwright/test";
import {
  callFunction,
  clearMailbox,
  ensureMailDevReady,
  getMailboxMessages,
  resetEmulators,
  seedAdmin,

  uniqueEmail,
  waitForMailTo,
} from "../support/emulator.js";

/**
 * What the salon actually sends when staff record a booking at the desk.
 *
 * `onBookingCreated` fires on any new `bookings/` document, so before this
 * feature there was exactly one thing it could say: "your booking is
 * confirmed", in the future tense, plus a notification to the owner. Both are
 * wrong for a visit that has already happened — the client has left the chair,
 * and the owner is the person who just typed it in.
 *
 * The negative assertions below are the ones that matter. A regression in the
 * `status === "completed"` branch does not stop mail going out; it sends the
 * *wrong* mail, which a "did something arrive?" test would happily pass.
 *
 * MailDev: `playwright.config.js` starts only the auth/firestore/functions
 * emulators, so this spec brings up its own instance on 127.0.0.1:1025/1080 if
 * one is not already listening.
 */

const CONFIRMATION_SUBJECT = "Your booking is confirmed";
const THANK_YOU_SUBJECT = "Thank you for visiting";
const OWNER_SUBJECT = "New booking:";
// `functions/lib/mail/config.js` LOCAL_MAIL — where owner notifications land
// when the functions emulator points nodemailer at MailDev.
const OWNER_ADDRESS = process.env.SMTP_USER || "owner@flourish.local";

const SERVICE = "Barrel Twist";

/*
 * A first name unique to each test, because the owner's subject line is
 * `New booking: <first name> · <services>` and MailDev is shared. Bookings
 * made by earlier specs send their own owner mail, and a trigger that fired
 * before `clearMailbox` can still deliver after it — so "the owner got
 * nothing at all" is an assertion about the whole suite's timing, not about
 * this booking. Naming the client makes it about this booking.
 */
let customerName = "Ngozi";
const customer = (email) => ({
  firstName: customerName,
  mobileNumber: "08031234567",
  ...(email ? { email } : {}),
});

/** 10:00 WAT on the next open day at least two days out. */
function nextOpenSlot() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 2);
  d.setUTCHours(9, 0, 0, 0);
  while (d.getUTCDay() === 1 || d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

/** Everything MailDev holds for one address, whatever the subject. */
async function mailFor(address) {
  const messages = await getMailboxMessages();
  return messages.filter((m) => (m.envelope?.to ?? []).some((t) => t.address === address));
}

test.describe("front-desk booking mail", () => {
  test.beforeAll(async () => {
    await ensureMailDevReady();
  });

  /*
   * No `stopMailDevIfStarted` here on purpose. `ensureMailDevReady` memoises
   * its promise, so stopping the process leaves the memo saying "ready" — and
   * every later spec that mails, `scheduler-reminders` included, then talks to
   * a MailDev that is no longer listening. Teardown belongs to the last spec
   * that needs it, not to each one.
   */

  test.beforeEach(async () => {
    await resetEmulators();
    await clearMailbox();
    customerName = `Ngozi${Date.now().toString().slice(-6)}`;
  });

  test("a served walk-in is thanked, not confirmed, and the owner is left alone", async () => {
    const admin = await seedAdmin();
    const email = uniqueEmail("served");

    const { error } = await callFunction(
      "adminCreateBooking",
      { serviceTitles: [SERVICE], customer: customer(email), served: true },
      admin.idToken
    );
    expect(error).toBeFalsy();

    const thanks = await waitForMailTo(email, { subjectContains: THANK_YOU_SUBJECT });
    expect(thanks).toHaveLength(1);

    // The two ways this can regress: the wrong tense to the client, and noise
    // to the owner about something they typed themselves.
    const toClient = await mailFor(email);
    expect(toClient.some((m) => (m.subject ?? "").includes(CONFIRMATION_SUBJECT))).toBe(false);

    const toOwner = await mailFor(OWNER_ADDRESS);
    expect(
      toOwner.some(
        (m) => (m.subject ?? "").includes(OWNER_SUBJECT) && (m.subject ?? "").includes(customerName)
      )
    ).toBe(false);
  });

  test("a booking taken for later still gets the ordinary confirmation", async () => {
    const admin = await seedAdmin();
    const email = uniqueEmail("later");

    const { error } = await callFunction(
      "adminCreateBooking",
      {
        serviceTitles: [SERVICE],
        customer: customer(email),
        served: false,
        startTime: nextOpenSlot(),
      },
      admin.idToken
    );
    expect(error).toBeFalsy();

    const confirmation = await waitForMailTo(email, { subjectContains: CONFIRMATION_SUBJECT });
    expect(confirmation).toHaveLength(1);

    const toClient = await mailFor(email);
    expect(toClient.some((m) => (m.subject ?? "").includes(THANK_YOU_SUBJECT))).toBe(false);
  });

  test("no email given means nothing is sent", async () => {
    const admin = await seedAdmin();

    const { result, error } = await callFunction(
      "adminCreateBooking",
      { serviceTitles: [SERVICE], customer: customer(null), served: true },
      admin.idToken
    );
    expect(error).toBeFalsy();
    expect(result.bookingId).toBeTruthy();

    // Give the trigger room to have sent something it should not have.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const everything = await getMailboxMessages();
    expect(everything.filter((m) => (m.subject ?? "").includes(customerName))).toHaveLength(0);
  });
});
