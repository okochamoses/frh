/**
 * authService.js
 *
 * Thin wrappers around Firebase Auth so the rest of the app never
 * imports Firebase Auth directly. Each function does one thing and
 * returns a plain result — no context, no side-effects.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  deleteUser,
  linkWithCredential,
  linkWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider,
  browserPopupRedirectResolver,
} from "firebase/auth";
import { auth } from "./config";
import { createUserProfile, getUserProfile } from "./userService";
import {
  captureGuestToken,
  claimGuestBookings,
  stashGuestToken,
  takeStashedGuestToken,
} from "./guestClaim";

/**
 * `auth` is deliberately created without a popup/redirect resolver so that no
 * page pays for the gapi iframe before anyone tries to sign in (see
 * `config.js`). Every popup/redirect call therefore has to hand the resolver
 * in itself — that first call is what loads the chain.
 */
const resolver = browserPopupRedirectResolver;

const googleProvider = new GoogleAuthProvider();
// Always let the user pick an account rather than silently reusing the last one.
googleProvider.setCustomParameters({ prompt: "select_account" });

// ── Email / password ──────────────────────────────────────────────────────────

/** True when the account this credential belongs to already exists. */
const ALREADY_EXISTS = new Set([
  "auth/credential-already-in-use",
  "auth/email-already-in-use",
  "auth/provider-already-linked",
  "auth/account-exists-with-different-credential",
]);

/**
 * Signs the user in with email and password.
 * Returns the Firebase user object on success.
 * Throws a Firebase AuthError on failure (caller handles the message).
 *
 * A guest signing in to an account they already have cannot have their
 * anonymous session linked to it — the account exists — so the bookings they
 * made as a guest are carried across afterwards instead.
 */
export async function signInWithEmail(email, password) {
  const guestToken = await captureGuestToken();
  const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
  await claimGuestBookings(guestToken);
  return user;
}

/**
 * Creates the account this credential belongs to.
 *
 * A guest who is signing up already has an anonymous session holding the
 * bookings they made, so the credential is *linked* to it rather than starting
 * a fresh account: the uid survives, and with it every booking, the "booked
 * before" tags and the rebook card. `linkWithCredential` also returns a
 * `deleteUser`-able user, so the rollback in the caller still holds.
 *
 * If that account turns out to exist already the link is refused, and the
 * caller gets the same `auth/email-already-in-use` it would have got anyway.
 */
async function createAccount(email, password) {
  const current = auth.currentUser;
  if (current?.isAnonymous) {
    try {
      const { user } = await linkWithCredential(current, EmailAuthProvider.credential(email, password));
      return user;
    } catch (error) {
      if (!ALREADY_EXISTS.has(error.code)) throw error;
      // Fall through: this email has an account, so sign-up is the wrong door.
      throw Object.assign(new Error(error.message), { code: "auth/email-already-in-use" });
    }
  }
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return user;
}

/**
 * Creates a new Firebase Auth account, then writes the user's profile
 * to Firestore so we can store extra fields (name, phone, etc.).
 *
 * If the profile write fails we delete the just-created auth account. Leaving
 * it behind would strand the user: they are signed in with no profile, cannot
 * sign up again ("email already in use"), and every profile update afterwards
 * fails because there is no document to update.
 *
 * Returns the new Firestore profile document.
 */
export async function signUpWithEmail({ firstName, lastName, email, phone, password }) {
  const normalisedEmail = email.trim();
  const user = await createAccount(normalisedEmail, password);

  try {
    const profile = await createUserProfile(user.uid, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalisedEmail,
      mobileNumber: phone?.trim() || null,
      provider: "email",
    });

    // Fire-and-forget: a failure here must not fail the sign-up.
    sendEmailVerification(user).catch(() => {});

    return profile;
  } catch (profileError) {
    // Roll the account back so the user can simply try again.
    await deleteUser(user).catch(() => {});
    throw profileError;
  }
}

/**
 * Sends a password-reset email. Resolves silently when the address is unknown:
 * with email enumeration protection enabled Firebase does not reveal whether an
 * account exists, and neither should we.
 */
export async function requestPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-email") return;
    throw error;
  }
}

// ── Google OAuth ──────────────────────────────────────────────────────────────

/** Creates (or returns) the Firestore profile for a signed-in Google user. */
async function profileForGoogleUser(user) {
  const existingProfile = await getUserProfile(user.uid);
  if (existingProfile) return existingProfile;

  // First-time Google sign-in — create the Firestore profile
  const [firstName, ...rest] = (user.displayName ?? "").split(" ");
  return createUserProfile(user.uid, {
    firstName: firstName ?? "",
    lastName: rest.join(" "),
    email: user.email,
    mobileNumber: null,
    provider: "google",
  });
}

/**
 * Opens the Google sign-in popup.
 *
 * If the user is signing in for the first time, a Firestore profile is
 * created automatically. Returning users already have a profile.
 *
 * When the browser blocks the popup — routine on mobile Safari and inside
 * in-app browsers — we fall back to a full-page redirect. In that case this
 * function never returns: the page navigates away and the result is picked up
 * by `completeGoogleRedirect()` on the way back.
 *
 * Returns the Firestore profile document.
 */
export async function signInWithGoogle() {
  const current = auth.currentUser;
  const guestToken = await captureGuestToken();

  try {
    // A guest's anonymous session is upgraded in place where Google allows it,
    // so their bookings keep the same owner. When the Google account already
    // exists the link is refused and this falls back to a plain sign-in, where
    // the bookings are carried across instead.
    if (current?.isAnonymous) {
      try {
        const { user } = await linkWithPopup(current, googleProvider, resolver);
        return await profileForGoogleUser(user);
      } catch (error) {
        if (!ALREADY_EXISTS.has(error.code)) throw error;
      }
    }

    const { user } = await signInWithPopup(auth, googleProvider, resolver);
    const profile = await profileForGoogleUser(user);
    await claimGuestBookings(guestToken);
    return profile;
  } catch (error) {
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/operation-not-supported-in-this-environment"
    ) {
      // The page is about to unload, so the guest token has to survive the trip.
      stashGuestToken(guestToken);
      await signInWithRedirect(auth, googleProvider, resolver);
      return null; // navigating away
    }
    throw error;
  }
}

/**
 * Completes a redirect-based Google sign-in. Call once on app start.
 * Returns the profile when the page was reached via a redirect, else null.
 */
export async function completeGoogleRedirect() {
  const result = await getRedirectResult(auth, resolver);
  if (!result?.user) {
    // No redirect happened, but a stale stash would otherwise outlive the tab.
    takeStashedGuestToken();
    return null;
  }
  const profile = await profileForGoogleUser(result.user);
  await claimGuestBookings(takeStashedGuestToken());
  return profile;
}

// ── Guests ────────────────────────────────────────────────────────────────────

/**
 * Makes sure there is *a* Firebase session before a guest books.
 *
 * The v2 booking page lets people book with just a name and phone number. The
 * booking callable still needs a caller, so a guest gets a silent anonymous
 * session: no account, no password, but a stable id that owns the booking and
 * lets this device show it again. A signed-in user is returned unchanged.
 *
 * Anonymous sign-in must be enabled for the project (Authentication → Sign-in
 * method → Anonymous). The emulator allows it by default.
 */
export async function ensureGuestSession() {
  if (auth.currentUser) return auth.currentUser;
  const { user } = await signInAnonymously(auth);
  return user;
}

// ── Sign out ──────────────────────────────────────────────────────────────────

export async function logOut() {
  await signOut(auth);
}
