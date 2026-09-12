/**
 * Carrying a guest's bookings into the account they just signed into.
 *
 * Booking needs no account, so a client can visit three times as a guest before
 * ever making one. Those bookings belong to the anonymous session on their
 * device. Signing up links that session to the new credential, so the id never
 * changes and nothing has to move; signing in to an account that already exists
 * cannot link, and the bookings would be left on a uid nobody can reach.
 *
 * So: hold the anonymous ID token from just before the sign-in, and hand it to
 * the server afterwards as proof of what the device was. This lives on its own
 * rather than in bookingService so authService can use it without depending on
 * the booking layer.
 */

import { httpsCallable } from "firebase/functions";
import { auth, functions } from "./config";

/**
 * The current anonymous session's ID token, or null when there isn't one.
 *
 * Call this *before* signing in — afterwards the session has been replaced and
 * the guest's id is gone.
 */
export async function captureGuestToken() {
  const current = auth.currentUser;
  if (!current?.isAnonymous) return null;
  try {
    return await current.getIdToken();
  } catch {
    return null;
  }
}

// Google sign-in falls back to a full-page redirect when the popup is blocked —
// routine on mobile Safari and in in-app browsers. The page unloads, so the
// token has to wait somewhere for the trip back.
const STASH_KEY = "frh:guest-claim";

/** Keeps the guest token across a sign-in redirect. */
export function stashGuestToken(token) {
  if (!token) return;
  try {
    window.sessionStorage.setItem(STASH_KEY, token);
  } catch {
    // A blocked storage costs the client their guest history, not their sign-in.
  }
}

/** Reads back a stashed token and clears it, so a later sign-in can't reuse it. */
export function takeStashedGuestToken() {
  try {
    const token = window.sessionStorage.getItem(STASH_KEY);
    window.sessionStorage.removeItem(STASH_KEY);
    return token;
  } catch {
    return null;
  }
}

/**
 * Moves the bookings made under `guestToken`'s session to the signed-in user.
 *
 * Deliberately quiet: a client who has just signed in should not be shown an
 * error about a background tidy-up they never asked for. Returns how many
 * bookings moved, or 0 when there was nothing to move or the claim failed.
 */
export async function claimGuestBookings(guestToken) {
  if (!guestToken) return 0;
  try {
    const { data } = await httpsCallable(functions, "claimGuestBookings")({ guestToken });
    return data?.claimed ?? 0;
  } catch (err) {
    console.warn("Could not claim guest bookings:", err);
    return 0;
  }
}
