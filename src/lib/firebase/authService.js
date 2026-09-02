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
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  deleteUser,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "./config";
import { createUserProfile, getUserProfile } from "./userService";

const googleProvider = new GoogleAuthProvider();
// Always let the user pick an account rather than silently reusing the last one.
googleProvider.setCustomParameters({ prompt: "select_account" });

// ── Email / password ──────────────────────────────────────────────────────────

/**
 * Signs the user in with email and password.
 * Returns the Firebase user object on success.
 * Throws a Firebase AuthError on failure (caller handles the message).
 */
export async function signInWithEmail(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
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
  const { user } = await createUserWithEmailAndPassword(auth, normalisedEmail, password);

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
  try {
    const { user } = await signInWithPopup(auth, googleProvider);
    return await profileForGoogleUser(user);
  } catch (error) {
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(auth, googleProvider);
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
  const result = await getRedirectResult(auth);
  if (!result?.user) return null;
  return profileForGoogleUser(result.user);
}

// ── Sign out ──────────────────────────────────────────────────────────────────

export async function logOut() {
  await signOut(auth);
}
