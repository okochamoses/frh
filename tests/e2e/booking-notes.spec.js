import { test, expect } from "@playwright/test";
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
 * The note a client leaves with a booking.
 *
 * `v2-booking.spec.js` proves a note reaches the booking document. What it
 * does not cover is the two things that make the note safe to put in an email:
 * the 500-character cap in `functions/lib/notes.js`, and the escaping in the
 * mail templates. The note is the only free text a client controls that lands
 * in the owner's inbox, so an unescaped `<` there is the whole risk.
 *
 * MailDev: `playwright.config.js` starts only the auth/firestore/functions
 * emulators, so this spec brings up its own instance if one is not listening.
 */

const CONFIRMATION_SUBJECT = "Your booking is confirmed";
const OWNER_SUBJECT = "New booking:";
const OWNER_ADDRESS = process.env.SMTP_USER || "owner@flourish.local";

const SERVICE = "Barrel Twist";

/** 10:00 WAT on the next open day at least two days out. */
function nextOpenSlot() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 2);
  d.setUTCHours(9, 0, 0, 0);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 1) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

let mailDev;

test.beforeAll(async () => {
  mailDev = await ensureMailDevReady();
});

test.beforeEach(async () => {
  await resetEmulators();
  await clearMailbox();
});

/** Books as a guest through the callable, which is where notes are parsed. */
async function bookWithNote(notes, { email, firstName = "Ada" } = {}) {
  const { idToken } = await anonymousSession();
  return callFunction(
    "createBooking",
    {
      serviceTitles: [SERVICE],
      startTime: nextOpenSlot(),
      notes,
      guest: {
        firstName,
        mobileNumber: "08031234567",
        ...(email ? { email } : {}),
      },
    },
    idToken
  );
}

test.describe("the note on a booking", () => {
  test("is kept, cleaned of the whitespace a paste drags in", async () => {
    const { status, result } = await bookWithNote(
      "  Transitioning hair.\n\n\n\nPlease   be gentle.  "
    );

    expect(status).toBe(200);
    // `createBooking` does not echo the note back, so the booking document is
    // where the cleaned value has to be read.
    const booking = await readBooking(result.bookingId);
    expect(booking.notes).toBe("Transitioning hair.\n\nPlease be gentle.");
  });

  test("is refused over 500 characters, and says the limit", async () => {
    const { status, error } = await bookWithNote("a".repeat(501));

    expect(status).not.toBe(200);
    expect(error?.message).toContain("500");
  });

  test("is accepted at exactly 500", async () => {
    const { status, result } = await bookWithNote("a".repeat(500));

    expect(status).toBe(200);
    const booking = await readBooking(result.bookingId);
    expect(booking.notes).toHaveLength(500);
  });

  test("reaches both emails as text, never as markup", async () => {
    const email = uniqueEmail("notes");
    const { status } = await bookWithNote(
      'Bringing my own <script>alert("x")</script> extensions & beads',
      { email, firstName: "Ada <b>Nwosu</b>" }
    );
    expect(status).toBe(200);

    const [confirmation] = await waitForMailTo(email, { subjectContains: CONFIRMATION_SUBJECT });
    const clientBody = confirmation.html ?? confirmation.text ?? "";
    expect(clientBody).toContain("&lt;script&gt;");
    expect(clientBody).not.toContain("<script>alert");
    expect(clientBody).toContain("&lt;b&gt;Nwosu");

    const owner = (await getMailboxMessages()).find(
      (m) =>
        m.subject?.includes(OWNER_SUBJECT) &&
        m.to?.some((t) => t.address === OWNER_ADDRESS) &&
        (m.html ?? m.text ?? "").includes("extensions")
    );
    expect(owner, "the owner's notification").toBeTruthy();
    const ownerBody = owner.html ?? owner.text ?? "";
    expect(ownerBody).toContain("&lt;script&gt;");
    expect(ownerBody).not.toContain("<script>alert");
  });
});
