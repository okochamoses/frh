/**
 * Helpers for driving the Firebase Emulator Suite from tests.
 *
 * The emulators expose plain REST endpoints for administrative work, so we can
 * wipe state and seed users without pulling firebase-admin into the test run.
 */

import { spawn } from "node:child_process";
import path from "node:path";

export const EMULATOR_PROJECT_ID = "demo-flourish";
export const AUTH_EMULATOR = "http://127.0.0.1:9099";
export const FIRESTORE_EMULATOR = "http://127.0.0.1:8080";
export const FUNCTIONS_EMULATOR = "http://127.0.0.1:5001";
export const FUNCTIONS_REGION = "us-central1";

// The emulator accepts any bearer token for admin routes.
const ADMIN_HEADERS = { Authorization: "Bearer owner", "Content-Type": "application/json" };

/** Deletes every emulator Auth account. */
export async function clearAuth() {
  const res = await fetch(
    `${AUTH_EMULATOR}/emulator/v1/projects/${EMULATOR_PROJECT_ID}/accounts`,
    { method: "DELETE", headers: ADMIN_HEADERS }
  );
  if (!res.ok) throw new Error(`Failed to clear auth emulator: ${res.status} ${await res.text()}`);
}

/** Deletes every document in the emulator Firestore instance. */
export async function clearFirestore() {
  const res = await fetch(
    `${FIRESTORE_EMULATOR}/emulator/v1/projects/${EMULATOR_PROJECT_ID}/databases/(default)/documents`,
    { method: "DELETE", headers: ADMIN_HEADERS }
  );
  if (!res.ok) throw new Error(`Failed to clear firestore emulator: ${res.status} ${await res.text()}`);
}

/**
 * Makes the Auth emulator behave like production on failed sign-ins.
 *
 * By default the emulator still distinguishes `auth/user-not-found` from
 * `auth/wrong-password`. Live Firebase projects have email-enumeration
 * protection on by default and collapse both into `auth/invalid-credential`.
 * Without this call the emulator would mask every bug in how we map that code.
 */
export async function matchProductionAuthBehaviour() {
  const res = await fetch(
    `${AUTH_EMULATOR}/emulator/v1/projects/${EMULATOR_PROJECT_ID}/config?updateMask=emailPrivacyConfig`,
    {
      method: "PATCH",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ emailPrivacyConfig: { enableImprovedEmailPrivacy: true } }),
    }
  );
  if (!res.ok) throw new Error(`Failed to configure auth emulator: ${res.status} ${await res.text()}`);
}

/**
 * Blocks until both emulators answer, then pins the production auth behaviour.
 *
 * Playwright's webServer readiness check only covers one port, and its
 * globalSetup hook runs *before* webServer starts, so neither can do this. The
 * result is memoised, so only the first caller in a run actually waits.
 */
let readyPromise = null;
export function ensureEmulatorsReady() {
  readyPromise ??= (async () => {
    const deadline = Date.now() + 60_000;
    const targets = [
      ["Firestore", `${FIRESTORE_EMULATOR}/`],
      ["Auth", `${AUTH_EMULATOR}/`],
    ];

    for (const [name, url] of targets) {
      let lastError;
      for (;;) {
        try {
          const res = await fetch(url);
          if (res.ok || res.status === 404) break;
          lastError = new Error(`HTTP ${res.status}`);
        } catch (err) {
          lastError = err;
        }
        if (Date.now() > deadline) {
          throw new Error(
            `${name} emulator not ready at ${url} — ${lastError?.message ?? "unknown"}. ` +
              `Is \`npm run emulators\` running?`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    await waitForFunctions(deadline);
    await matchProductionAuthBehaviour();
  })();

  return readyPromise;
}

/**
 * Blocks until the Functions emulator has actually loaded the codebase.
 *
 * Firestore and Auth answering is not enough, and waiting on them was letting
 * a whole spec file fail for no reason. Functions comes up last, later still
 * when Hosting is in the set (the `export` target), and Playwright's own
 * `webServer` probe only watches the Auth port — so under `test:e2e:prod` the
 * first `callFunction` could land before the callables existed. It arrived as
 * twelve booking specs reporting `Cannot read properties of undefined`, because
 * the emulator's 404 is HTML and `callFunction` turned the parse failure into an
 * empty object. Nothing about it pointed at a startup race.
 *
 * Reusing a running emulator hid it locally; CI, which never reuses one, would
 * have hit it every time.
 *
 * The probe is a real callable: the emulator answers 404 for a function it has
 * not loaded, and 400/401 once it has, so "not a 404" is the ready signal.
 */
async function waitForFunctions(deadline) {
  const url = `${FUNCTIONS_EMULATOR}/${EMULATOR_PROJECT_ID}/${FUNCTIONS_REGION}/createBooking`;
  let last = "no response";
  for (;;) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: {} }),
      });
      if (res.status !== 404) return;
      last = "HTTP 404 — codebase not loaded yet";
    } catch (err) {
      last = err?.message ?? "unknown";
    }
    if (Date.now() > deadline) {
      throw new Error(`Functions emulator not ready at ${url} — ${last}.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

/** Wipes both emulators. Call this between tests so each one starts clean. */
export async function resetEmulators() {
  await ensureEmulatorsReady();
  await Promise.all([clearAuth(), clearFirestore()]);
  // Clearing accounts does not reset project config, but re-applying is cheap
  // and keeps a test run correct even against an emulator someone else started.
  await matchProductionAuthBehaviour();
}

/**
 * Creates an Auth account directly against the emulator.
 * Returns the new user's localId (the Firebase UID).
 */
export async function createAuthUser({ email, password }) {
  const res = await fetch(
    `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to create emulator user ${email}: ${JSON.stringify(body)}`);
  }
  return body.localId;
}

/**
 * Signs in against the emulator and returns the user's ID token.
 *
 * Firestore's REST API enforces security rules when called with a user token,
 * which is how the rules specs check that a write is actually refused rather
 * than merely unused by the UI.
 */
export async function getIdToken({ email, password }) {
  const res = await fetch(
    `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const body = await res.json();
  if (!res.ok) throw new Error(`Failed to sign in ${email}: ${JSON.stringify(body)}`);
  return body.idToken;
}

/**
 * Signs in anonymously against the emulator — what the v2 booking page does
 * for a guest — and returns `{ uid, idToken }`.
 */
export async function anonymousSession() {
  const res = await fetch(
    `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnSecureToken: true }),
    }
  );
  const body = await res.json();
  if (!res.ok) throw new Error(`Failed to sign in anonymously: ${JSON.stringify(body)}`);
  return { uid: body.localId, idToken: body.idToken };
}

/**
 * Performs a Firestore REST write as a signed-in user, so security rules apply.
 * Returns the HTTP status rather than throwing, so specs can assert on it.
 */
export async function writeAsUser(idToken, { path, fields, mask = null }) {
  const params = new URLSearchParams();
  for (const field of mask ?? Object.keys(fields)) {
    params.append("updateMask.fieldPaths", field);
  }
  const query = mask === null && !fields ? "" : `?${params.toString()}`;

  const res = await fetch(
    `${FIRESTORE_EMULATOR}/v1/projects/${EMULATOR_PROJECT_ID}` +
      `/databases/(default)/documents/${path}${query}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    }
  );
  return res.status;
}

/**
 * Creates a Firestore document as a signed-in user, so security rules apply.
 * Returns the HTTP status rather than throwing, so specs can assert on it.
 */
export async function createAsUser(idToken, { collection, fields }) {
  const res = await fetch(
    `${FIRESTORE_EMULATOR}/v1/projects/${EMULATOR_PROJECT_ID}` +
      `/databases/(default)/documents/${collection}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    }
  );
  return res.status;
}

/**
 * Invokes a callable Cloud Function on the emulator as a signed-in user.
 *
 * Callables are plain HTTPS endpoints underneath: `{data: ...}` in, `{result}`
 * or `{error}` out. Returns both so specs can assert on the error code the
 * function chose, not just that something failed.
 */
export async function callFunction(name, data, idToken) {
  const res = await fetch(
    `${FUNCTIONS_EMULATOR}/${EMULATOR_PROJECT_ID}/${FUNCTIONS_REGION}/${name}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({ data }),
    }
  );
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    // Not JSON at all — an emulator that has not loaded the callables answers
    // with an HTML 404. Swallowing that into `{}` is what made the startup race
    // above read as "the booking came back undefined".
    throw new Error(
      `callFunction(${name}) got a non-JSON response (HTTP ${res.status}): ${text.slice(0, 200)}`
    );
  }
  return {status: res.status, result: body.result, error: body.error};
}

/** Reads a booking document with admin access (rules bypassed). */
export async function readBooking(id) {
  const res = await fetch(
    `${FIRESTORE_EMULATOR}/v1/projects/${EMULATOR_PROJECT_ID}` +
      `/databases/(default)/documents/bookings/${encodeURIComponent(id)}`,
    { headers: ADMIN_HEADERS }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to read booking ${id}: ${res.status}`);
  const body = await res.json();
  return unwrapFields(body.fields ?? {});
}

/**
 * Writes a `users/{uid}` profile document straight into the emulator,
 * bypassing security rules (admin access via the owner bearer token).
 */
export async function writeUserProfile(uid, { firstName, lastName, email, mobileNumber = null, provider = "email" }) {
  const url =
    `${FIRESTORE_EMULATOR}/v1/projects/${EMULATOR_PROJECT_ID}` +
    `/databases/(default)/documents/users?documentId=${encodeURIComponent(uid)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: ADMIN_HEADERS,
    body: JSON.stringify({
      fields: {
        firstName: { stringValue: firstName },
        lastName: { stringValue: lastName },
        email: { stringValue: email },
        mobileNumber:
          mobileNumber === null ? { nullValue: null } : { stringValue: mobileNumber },
        provider: { stringValue: provider },
        createdAt: { timestampValue: new Date().toISOString() },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to seed profile for ${uid}: ${res.status} ${await res.text()}`);
  }
}

/** Reads back a `users/{uid}` document, or null when it does not exist. */
export async function readUserProfile(uid) {
  const url =
    `${FIRESTORE_EMULATOR}/v1/projects/${EMULATOR_PROJECT_ID}` +
    `/databases/(default)/documents/users/${encodeURIComponent(uid)}`;

  const res = await fetch(url, { headers: ADMIN_HEADERS });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to read profile ${uid}: ${res.status}`);

  const body = await res.json();
  return unwrapFields(body.fields ?? {});
}

/** Looks a user up by email. Returns the emulator account record, or null. */
export async function findAuthUserByEmail(email) {
  const res = await fetch(
    `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/projects/${EMULATOR_PROJECT_ID}/accounts:query`,
    { method: "POST", headers: ADMIN_HEADERS, body: JSON.stringify({}) }
  );
  if (!res.ok) throw new Error(`Failed to query accounts: ${res.status}`);

  const { userInfo = [] } = await res.json();
  return userInfo.find((u) => u.email === email) ?? null;
}

/** Returns the emulator's outbox of password-reset / verification links. */
export async function getOobCodes() {
  const res = await fetch(`${AUTH_EMULATOR}/emulator/v1/projects/${EMULATOR_PROJECT_ID}/oobCodes`, {
    headers: ADMIN_HEADERS,
  });
  if (!res.ok) throw new Error(`Failed to read oobCodes: ${res.status}`);
  const { oobCodes = [] } = await res.json();
  return oobCodes;
}

/**
 * Convenience: seed a complete, ready-to-sign-in user (auth account + profile).
 * Returns { uid, email, password, ...profile }.
 */
export async function seedUser({
  email = "existing@example.com",
  password = "Password123",
  firstName = "Ada",
  lastName = "Lovelace",
  mobileNumber = "+2348012345678",
} = {}) {
  const uid = await createAuthUser({ email, password });
  await writeUserProfile(uid, { firstName, lastName, email, mobileNumber });
  return { uid, email, password, firstName, lastName, mobileNumber };
}

/**
 * Marks an account's email as verified.
 *
 * Emulator sign-ups are unverified, and production's own sign-up is too:
 * `sendEmailVerification` is fire-and-forget at `authService.js:163`, so the
 * account exists before anyone proves the address. Three things in the server
 * refuse to act until that changes — `firestore.rules`' `isAdmin()`,
 * `requireAdminCaller`, and `claimWalkInBookings` — so a spec that forgets
 * this gets `permission-denied` from all three and reads as a broken callable
 * rather than an unverified user.
 *
 * Any token minted *before* this call still carries the old claim, so sign in
 * afterwards.
 */
export async function verifyEmail(uid) {
  const res = await fetch(
    `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/projects/${EMULATOR_PROJECT_ID}/accounts:update`,
    {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ localId: uid, emailVerified: true }),
    }
  );
  if (!res.ok) {
    throw new Error(`Failed to verify ${uid}: ${res.status} ${await res.text()}`);
  }
}

/**
 * Adds an email to the `admins` allowlist.
 *
 * `firestore.rules` says `allow list, write: if false` on that collection —
 * there is deliberately no self-service way in — so this goes through the
 * owner-token REST path, the same door `writeUserProfile` uses.
 */
export async function seedAdminDoc(email) {
  const id = encodeURIComponent(email.toLowerCase());
  const res = await fetch(
    `${FIRESTORE_EMULATOR}/v1/projects/${EMULATOR_PROJECT_ID}` +
      `/databases/(default)/documents/admins?documentId=${id}`,
    {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ fields: { addedAt: { timestampValue: new Date().toISOString() } } }),
    }
  );
  if (!res.ok) {
    throw new Error(`Failed to seed admin ${email}: ${res.status} ${await res.text()}`);
  }
}

/**
 * A ready-to-use admin: account, verified email, allowlist entry, fresh token.
 *
 * The order matters. `getIdToken` has to come last, because the token carries
 * `email_verified` as a claim baked in at sign-in — fetch it before
 * `verifyEmail` and every admin call fails with a token that says false.
 */
export async function seedAdmin({ email = uniqueEmail("admin"), password = "Password123" } = {}) {
  const uid = await createAuthUser({ email, password });
  await verifyEmail(uid);
  await seedAdminDoc(email);
  const idToken = await getIdToken({ email, password });
  return { uid, email, password, idToken };
}

/**
 * Writes a booking straight into the emulator (admin access, rules bypassed) —
 * for giving a client a history: a past visit to rebook, or an upcoming one.
 *
 * `services` is a list of `{title, price, duration, category}` as the
 * `createBooking` callable stores them. Returns the new document id.
 */
export async function seedBooking({ uid, email, services, startTime, status = "completed" }) {
  const totalAmount = services.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
  const endTime = new Date(new Date(startTime).getTime() + totalDuration * 60_000).toISOString();

  const res = await fetch(
    `${FIRESTORE_EMULATOR}/v1/projects/${EMULATOR_PROJECT_ID}/databases/(default)/documents/bookings`,
    {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({
        fields: {
          userId: { stringValue: uid },
          userEmail: { stringValue: email },
          services: {
            arrayValue: {
              values: services.map((s) => ({
                mapValue: {
                  fields: {
                    title: { stringValue: s.title },
                    price: { integerValue: String(s.price) },
                    duration: { integerValue: String(s.duration) },
                    category: { stringValue: s.category ?? "" },
                  },
                },
              })),
            },
          },
          servicesText: { stringValue: services.map((s) => s.title).join(" | ") },
          totalAmount: { integerValue: String(totalAmount) },
          totalDuration: { integerValue: String(totalDuration) },
          startTime: { stringValue: startTime },
          endTime: { stringValue: endTime },
          status: { stringValue: status },
          reminderSent: { booleanValue: true },
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Failed to seed booking: ${res.status} ${await res.text()}`);
  const body = await res.json();
  return body.name.split("/").pop();
}

/**
 * Writes a booking straight into the emulator for the appointment-reminder
 * scheduler tests (`schedulerMessages`).
 *
 * `seedBooking` above is built for a client's history — it defaults to an
 * already-completed, already-reminded visit. The scheduler tests need the
 * opposite default: a live appointment nobody has been reminded about yet, at
 * whatever `startTime` (and storage format — naive WAT or true UTC instant)
 * the test is pinning. Returns the new document id.
 */
export async function seedReminderBooking({
  email,
  firstName = "Ada",
  startTime,
  status = "pending",
  reminderSent = false,
}) {
  const res = await fetch(
    `${FIRESTORE_EMULATOR}/v1/projects/${EMULATOR_PROJECT_ID}/databases/(default)/documents/bookings`,
    {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({
        fields: {
          userId: { stringValue: "guest" },
          userEmail: { stringValue: email },
          userFirstName: { stringValue: firstName },
          servicesText: { stringValue: "Barrel Twist" },
          startTime: { stringValue: startTime },
          status: { stringValue: status },
          reminderSent: { booleanValue: reminderSent },
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Failed to seed reminder booking: ${res.status} ${await res.text()}`);
  const body = await res.json();
  return body.name.split("/").pop();
}

/**
 * Invokes the `schedulerMessages` HTTP endpoint — the same one the 15-minute
 * cron POSTs — with the `secure` header it checks. Returns the HTTP status and
 * parsed JSON body (`{sent, failed, digest}`) rather than throwing, so specs
 * can assert on a rejected/malformed response too.
 */
export async function callScheduler(secret) {
  const res = await fetch(
    `${FUNCTIONS_EMULATOR}/${EMULATOR_PROJECT_ID}/${FUNCTIONS_REGION}/schedulerMessages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", secure: secret },
      body: "{}",
    }
  );
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

// ── MailDev ───────────────────────────────────────────────────────────────
//
// `npm run dev:local` runs MailDev in its own terminal, but Playwright's e2e
// `webServer` config only starts the auth/firestore/functions emulators and
// the Next dev server — nothing catches SMTP. Without a real listener on
// 127.0.0.1:1025, `functions/lib/mail/MailService.js`'s `sendMail` call
// throws (connection refused), and `schedulerMessages` treats that exactly
// like any other send failure: it rolls `reminderSent` back to `false` before
// the assertions below ever run. So the scheduler spec needs a real MailDev
// instance up, not just its API queried optimistically.

const MAILDEV_WEB = "http://127.0.0.1:1080";
const MAILDEV_SMTP_PORT = 1025;

let maildevProcess = null;
let maildevReadyPromise = null;

async function maildevIsUp() {
  try {
    const res = await fetch(`${MAILDEV_WEB}/healthz`);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Ensures a MailDev instance is listening on 127.0.0.1:1025/1080, starting
 * one (the same binary `npm run maildev` uses) if nothing already answers.
 * Memoised like `ensureEmulatorsReady`, so only the first caller in a run
 * actually starts it.
 */
export function ensureMailDevReady() {
  maildevReadyPromise ??= (async () => {
    if (await maildevIsUp()) return; // something is already serving MailDev's API

    const bin = path.join(process.cwd(), "node_modules", ".bin", "maildev");
    maildevProcess = spawn(
      bin,
      ["--ip", "127.0.0.1", "--smtp", String(MAILDEV_SMTP_PORT), "--web", "1080", "--silent"],
      { stdio: "ignore" }
    );
    maildevProcess.on("error", (err) => {
      throw new Error(`Failed to start MailDev: ${err.message}`);
    });

    const deadline = Date.now() + 20_000;
    while (!(await maildevIsUp())) {
      if (Date.now() > deadline) {
        throw new Error(
          "MailDev did not become ready on 127.0.0.1:1080 within 20s. " +
            "Is port 1025 or 1080 already held by something that isn't MailDev?"
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  })();

  return maildevReadyPromise;
}

/** Stops the MailDev instance this process started, if any (a no-op if we only found one already running). */
export function stopMailDevIfStarted() {
  if (maildevProcess) {
    maildevProcess.kill();
    maildevProcess = null;
  }
}

/** Deletes every message in the MailDev inbox. */
export async function clearMailbox() {
  const res = await fetch(`${MAILDEV_WEB}/email/all`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to clear MailDev inbox: ${res.status}`);
}

/** Every message MailDev has caught, newest emulator-friendly shape. */
export async function getMailboxMessages() {
  const res = await fetch(`${MAILDEV_WEB}/email`);
  if (!res.ok) throw new Error(`Failed to read MailDev inbox: ${res.status}`);
  return res.json();
}

/**
 * Polls the MailDev inbox until at least `count` messages matching `toAddress`
 * (and, if given, `subjectContains`) have arrived, or times out. Sending
 * happens after `schedulerMessages` returns but the SMTP round-trip to
 * MailDev is not part of that response, so callers need a short poll rather
 * than an immediate read.
 *
 * `subjectContains` matters here: creating a booking document — even by
 * seeding it directly, as the scheduler specs do — fires `onBookingCreated`,
 * which mails the same address a booking *confirmation*. Filtering only by
 * recipient would conflate that with the reminder under test.
 */
export async function waitForMailTo(toAddress, { count = 1, timeoutMs = 5000, subjectContains = null } = {}) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const messages = await getMailboxMessages();
    const matches = messages.filter(
      (m) =>
        (m.envelope?.to ?? []).some((t) => t.address === toAddress) &&
        (subjectContains === null || (m.subject ?? "").includes(subjectContains))
    );
    if (matches.length >= count) return matches;
    if (Date.now() > deadline) return matches;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
}

/** Every booking belonging to a user, read with admin access. */
export async function listBookingsFor(uid) {
  return listBookingsWhere("userId", uid);
}

/** Every booking whose `field` equals `value`, read with admin access. */
export async function listBookingsWhere(field, value) {
  const res = await fetch(
    `${FIRESTORE_EMULATOR}/v1/projects/${EMULATOR_PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "bookings" }],
          where: {
            fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: { stringValue: value } },
          },
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Failed to list bookings: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return rows
    .filter((r) => r.document)
    .map((r) => ({
      id: r.document.name.split("/").pop(),
      ...unwrapFields(r.document.fields ?? {}),
      services: (r.document.fields?.services?.arrayValue?.values ?? []).map((v) =>
        unwrapFields(v.mapValue?.fields ?? {})
      ),
    }));
}

/** Turns Firestore REST `fields` into a plain object (only the types we use). */
function unwrapFields(fields) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => {
      if ("stringValue" in value) return [key, value.stringValue];
      if ("nullValue" in value) return [key, null];
      if ("booleanValue" in value) return [key, value.booleanValue];
      if ("integerValue" in value) return [key, Number(value.integerValue)];
      if ("timestampValue" in value) return [key, value.timestampValue];
      return [key, value];
    })
  );
}

/** Generates a unique address so parallel tests never collide. */
export function uniqueEmail(prefix = "user") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}
