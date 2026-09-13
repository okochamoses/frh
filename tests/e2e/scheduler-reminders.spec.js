import { test, expect } from "@playwright/test";
import {
  resetEmulators,
  uniqueEmail,
  seedReminderBooking,
  callScheduler,
  readBooking,
  ensureMailDevReady,
  stopMailDevIfStarted,
  clearMailbox,
  waitForMailTo,
} from "../support/emulator.js";

/**
 * The appointment-reminder cron (`functions/index.js`'s `schedulerMessages`).
 *
 * A 15-minute cron POSTs this endpoint. It queries a deliberately COARSE
 * Firestore window (`now .. now+3h`) and then narrows in JS to bookings
 * starting 45-75 minutes out, reading each `startTime` through `watDate` —
 * the helper that correctly parses both storage formats: a naive WAT
 * wall-clock string ("...T10:00:00", no zone — pre-migration) and a true UTC
 * instant ("...Z" — every booking since).
 *
 * The bug this suite exists to catch: the reminder window used to be built
 * from WAT digits and compared against `startTime` as raw text. That
 * happened to be correct for naive-WAT rows, but every true-UTC row was then
 * off by exactly the WAT offset (+1h), so a booking due in one hour looked
 * two hours away and got skipped — or a booking got its "in one hour" email
 * when it was really about two hours out. The first test below pins the fix
 * by requiring BOTH formats to be reminded at the same real 60-minutes-out
 * moment; it fails if that regression returns.
 *
 * `SCHEDULER_SECRET` is a `defineSecret` with no development fallback (unlike
 * `BOOKING_SECRET`, which has `DEV_BOOKING_SECRET` for the emulator), and the
 * Functions emulator only resolves it from the environment that launched
 * `firebase emulators:start`. Without it `hasSchedulerSecret` has nothing to
 * compare against and every call here gets a 401. `playwright.config.js`
 * therefore passes the same default into the emulator's `webServer`, so this
 * spec runs under a plain `npm run test:e2e` with no special invocation; a
 * real `SCHEDULER_SECRET` exported in the shell still takes precedence.
 *
 * Mail delivery: Playwright's e2e `webServer` config starts only the
 * auth/firestore/functions emulators (`npm run dev:local` is what also runs
 * MailDev), so this spec starts its own MailDev instance if one isn't
 * already listening on 127.0.0.1:1025/1080. That is not just for asserting
 * on the outbox — `sendAppointmentReminder`'s SMTP send has to actually
 * succeed, because `schedulerMessages` rolls `reminderSent` back to `false`
 * whenever the send throws, and a bare connection-refused would silently
 * turn "the fix works" into "mail is unreachable" for every test here.
 */

const SCHEDULER_SECRET = process.env.SCHEDULER_SECRET || "e2e-test-scheduler-secret";
const MINUTE = 60_000;
const WAT_OFFSET_MS = 60 * MINUTE;
// `templates.appointmentReminder`'s fixed subject line. Every `bookings/`
// document create also fires `onBookingCreated`, which mails the same
// address a booking *confirmation* — so mailbox assertions below filter on
// this to avoid mistaking that unrelated mail for (or against) a reminder.
const REMINDER_SUBJECT = "in 1 hour";

/** A true UTC-instant `startTime` — the format every booking gets since the migration. */
function utcInstant(msFromNow) {
  return new Date(Date.now() + msFromNow).toISOString();
}

/**
 * A naive WAT wall-clock `startTime` with no zone suffix — the pre-migration
 * format still sitting on older bookings. `watDate` reads a naive string by
 * appending "+01:00", so shifting the instant forward by WAT's offset before
 * formatting (and dropping millis + "Z") lands both helpers on the same real
 * moment for the same `msFromNow`.
 */
function naiveWat(msFromNow) {
  return new Date(Date.now() + msFromNow + WAT_OFFSET_MS).toISOString().slice(0, 19);
}

test.describe("schedulerMessages — appointment reminders", () => {
  test.beforeAll(async () => {
    await ensureMailDevReady();
  });

  test.afterAll(() => {
    stopMailDevIfStarted();
  });

  test.beforeEach(async () => {
    await resetEmulators();
    await clearMailbox();
  });

  test("rejects a request without the scheduler secret, accepts one with it", async () => {
    const wrong = await callScheduler("definitely-not-the-secret");
    expect(wrong.status).toBe(401);

    const right = await callScheduler(SCHEDULER_SECRET);
    // A 401 here almost always means the emulator process never saw
    // SCHEDULER_SECRET in its environment — see the file banner above.
    expect(right.status).toBe(200);
  });

  test("reminds a booking 60 minutes out in BOTH storage formats — the regression this pins", async () => {
    const utcEmail = uniqueEmail("utc-60min");
    const watEmail = uniqueEmail("wat-60min");

    const utcId = await seedReminderBooking({ email: utcEmail, startTime: utcInstant(60 * MINUTE) });
    const watId = await seedReminderBooking({ email: watEmail, startTime: naiveWat(60 * MINUTE) });

    const { status, body } = await callScheduler(SCHEDULER_SECRET);

    expect(status).toBe(200);
    // Under the old WAT-digit window, the true-UTC-instant booking was
    // skipped (it looked ~2h away instead of ~1h). If that arithmetic comes
    // back, this drops to 1 and the failed/sent split below flips too.
    expect(body.sent).toBe(2);
    expect(body.failed).toBe(0);

    expect((await readBooking(utcId)).reminderSent).toBe(true);
    expect((await readBooking(watId)).reminderSent).toBe(true);

    const utcMail = await waitForMailTo(utcEmail, { subjectContains: REMINDER_SUBJECT });
    const watMail = await waitForMailTo(watEmail, { subjectContains: REMINDER_SUBJECT });
    expect(utcMail).toHaveLength(1);
    expect(watMail).toHaveLength(1);
  });

  test("does not remind bookings outside the 45-75 minute window", async () => {
    const near = { utc: uniqueEmail("utc-20min"), wat: uniqueEmail("wat-20min") };
    const far = { utc: uniqueEmail("utc-180min"), wat: uniqueEmail("wat-180min") };

    const ids = await Promise.all([
      seedReminderBooking({ email: near.utc, startTime: utcInstant(20 * MINUTE) }),
      seedReminderBooking({ email: near.wat, startTime: naiveWat(20 * MINUTE) }),
      seedReminderBooking({ email: far.utc, startTime: utcInstant(180 * MINUTE) }),
      seedReminderBooking({ email: far.wat, startTime: naiveWat(180 * MINUTE) }),
    ]);

    const { status, body } = await callScheduler(SCHEDULER_SECRET);

    expect(status).toBe(200);
    expect(body.sent).toBe(0);

    for (const id of ids) {
      expect((await readBooking(id)).reminderSent).toBe(false);
    }
    for (const email of [near.utc, near.wat, far.utc, far.wat]) {
      // Each booking still gets its ordinary confirmation mail from
      // `onBookingCreated` — only the reminder is under test here.
      expect(
        await waitForMailTo(email, { timeoutMs: 500, subjectContains: REMINDER_SUBJECT })
      ).toHaveLength(0);
    }
  });

  test("does not send a reminder twice for the same booking", async () => {
    const email = uniqueEmail("no-dup");
    const id = await seedReminderBooking({ email, startTime: utcInstant(60 * MINUTE) });

    const first = await callScheduler(SCHEDULER_SECRET);
    expect(first.status).toBe(200);
    expect(first.body.sent).toBe(1);
    expect((await readBooking(id)).reminderSent).toBe(true);
    expect(await waitForMailTo(email, { subjectContains: REMINDER_SUBJECT })).toHaveLength(1);

    await clearMailbox();

    const second = await callScheduler(SCHEDULER_SECRET);
    expect(second.status).toBe(200);
    // Already claimed — `claimReminder`'s transaction refuses a second win.
    expect(second.body.sent).toBe(0);
    expect((await readBooking(id)).reminderSent).toBe(true);
    expect(
      await waitForMailTo(email, { timeoutMs: 500, subjectContains: REMINDER_SUBJECT })
    ).toHaveLength(0);
  });

  test("skips cancelled and completed bookings even inside the window", async () => {
    const cancelledEmail = uniqueEmail("cancelled-60min");
    const completedEmail = uniqueEmail("completed-60min");

    const cancelledId = await seedReminderBooking({
      email: cancelledEmail,
      startTime: utcInstant(60 * MINUTE),
      status: "cancelled",
    });
    const completedId = await seedReminderBooking({
      email: completedEmail,
      startTime: utcInstant(60 * MINUTE),
      status: "completed",
    });

    const { status, body } = await callScheduler(SCHEDULER_SECRET);

    expect(status).toBe(200);
    expect(body.sent).toBe(0);
    expect((await readBooking(cancelledId)).reminderSent).toBe(false);
    expect((await readBooking(completedId)).reminderSent).toBe(false);
    // The completed booking still gets `onBookingCreated`'s confirmation
    // mail (only a "cancelled" status short-circuits that trigger) — the
    // reminder subject specifically is what must never arrive here.
    expect(
      await waitForMailTo(cancelledEmail, { timeoutMs: 500, subjectContains: REMINDER_SUBJECT })
    ).toHaveLength(0);
    expect(
      await waitForMailTo(completedEmail, { timeoutMs: 500, subjectContains: REMINDER_SUBJECT })
    ).toHaveLength(0);
  });
});
