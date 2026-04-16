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
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "./config";
import { createUserProfile, getUserProfile } from "./userService";

const googleProvider = new GoogleAuthProvider();

// ── Email / password ──────────────────────────────────────────────────────────

/**
 * Signs the user in with email and password.
 * Returns the Firebase user object on success.
 * Throws a Firebase AuthError on failure (caller handles the message).
 */
export async function signInWithEmail(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

/**
 * Creates a new Firebase Auth account, then writes the user's profile
 * to Firestore so we can store extra fields (name, phone, etc.).
 *
 * Returns the new Firestore profile document.
 */
export async function signUpWithEmail({ firstName, lastName, email, phone, password }) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  const profile = await createUserProfile(user.uid, {
    firstName,
    lastName,
    email,
    mobileNumber: phone || null,
    provider: "email",
  });

  return profile;
}

// ── Google OAuth ──────────────────────────────────────────────────────────────

/**
 * Opens the Google sign-in popup.
 *
 * If the user is signing in for the first time, a Firestore profile is
 * created automatically. Returning users already have a profile.
 *
 * Returns the Firestore profile document.
 */
export async function signInWithGoogle() {
  const { user } = await signInWithPopup(auth, googleProvider);

  // Check whether this Google account has signed in before
  const existingProfile = await getUserProfile(user.uid);
  if (existingProfile) return existingProfile;

  // First-time Google sign-in — create the Firestore profile
  const [firstName, ...rest] = (user.displayName ?? "").split(" ");
  return createUserProfile(user.uid, {
    firstName: firstName ?? "",
    lastName:  rest.join(" "),
    email:     user.email,
    mobileNumber: null,
    provider: "google",
  });
}

// ── Sign out ──────────────────────────────────────────────────────────────────

export async function logOut() {
  await signOut(auth);
}
