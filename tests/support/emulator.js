/**
 * Helpers for driving the Firebase Emulator Suite from tests.
 *
 * The emulators expose plain REST endpoints for administrative work, so we can
 * wipe state and seed users without pulling firebase-admin into the test run.
 */

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

    await matchProductionAuthBehaviour();
  })();

  return readyPromise;
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
  const body = await res.json().catch(() => ({}));
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
