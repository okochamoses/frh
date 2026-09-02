import { test, expect } from "@playwright/test";
import {
  resetEmulators,
  seedUser,
  uniqueEmail,
  getIdToken,
  writeAsUser,
} from "../support/emulator.js";

/**
 * Security-rules specs.
 *
 * These drive the Firestore REST API with a real user ID token, which makes the
 * emulator apply `firestore.rules` exactly as production would. They exist
 * because the UI never attempts a forbidden write, so nothing else in the suite
 * would notice if the rules stopped denying one.
 *
 * No browser is involved — these run in the Playwright process.
 */

test.describe("users collection rules", () => {
  test.beforeEach(async () => {
    await resetEmulators();
  });

  test("a user can update their own allowed profile fields", async () => {
    const user = await seedUser({ email: uniqueEmail("rules-ok") });
    const idToken = await getIdToken(user);

    const status = await writeAsUser(idToken, {
      path: `users/${user.uid}`,
      fields: { firstName: { stringValue: "Updated" } },
    });

    expect(status).toBe(200);
  });

  test("a user cannot add an unexpected field to their own profile", async () => {
    // The point of restricting the key set: a signed-in user must not be able
    // to invent fields on their own document — a role or staff flag especially.
    const user = await seedUser({ email: uniqueEmail("rules-role") });
    const idToken = await getIdToken(user);

    const status = await writeAsUser(idToken, {
      path: `users/${user.uid}`,
      fields: { role: { stringValue: "admin" } },
    });

    expect(status).toBe(403);
  });

  test("a user cannot change the email on their profile", async () => {
    const user = await seedUser({ email: uniqueEmail("rules-email") });
    const idToken = await getIdToken(user);

    const status = await writeAsUser(idToken, {
      path: `users/${user.uid}`,
      fields: { email: { stringValue: "someone-else@example.com" } },
    });

    expect(status).toBe(403);
  });

  test("a user cannot write to another user's profile", async () => {
    const victim = await seedUser({ email: uniqueEmail("rules-victim") });
    const attacker = await seedUser({ email: uniqueEmail("rules-attacker") });
    const idToken = await getIdToken(attacker);

    const status = await writeAsUser(idToken, {
      path: `users/${victim.uid}`,
      fields: { firstName: { stringValue: "Hacked" } },
    });

    expect(status).toBe(403);
  });

  test("an unauthenticated write is refused", async () => {
    const user = await seedUser({ email: uniqueEmail("rules-anon") });

    const status = await writeAsUser("", {
      path: `users/${user.uid}`,
      fields: { firstName: { stringValue: "Anonymous" } },
    });

    expect(status).not.toBe(200);
  });
});
