/**
 * userService.js
 *
 * All Firestore operations for the `users` collection.
 * Documents are keyed by the Firebase Auth UID so lookups are O(1).
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns a Firestore document reference for the given user UID. */
const userRef = (uid) => doc(db, "users", uid);

// ── Reads ─────────────────────────────────────────────────────────────────────

/**
 * Fetches a user's profile from Firestore.
 * Returns the profile object, or null if no document exists yet.
 */
export async function getUserProfile(uid) {
  const snapshot = await getDoc(userRef(uid));
  return snapshot.exists() ? { uid, ...snapshot.data() } : null;
}

// ── Writes ────────────────────────────────────────────────────────────────────

/**
 * Creates a new user profile document in Firestore.
 * Called once — right after Firebase Auth creates the account.
 *
 * Returns the newly created profile (including the uid).
 */
export async function createUserProfile(uid, { firstName, lastName, email, mobileNumber, provider }) {
  const profile = {
    firstName,
    lastName,
    email,
    mobileNumber: mobileNumber ?? null,
    provider,
    createdAt: serverTimestamp(),
  };

  // setDoc (not addDoc) so the document ID matches the Firebase Auth UID
  await setDoc(userRef(uid), profile);

  return { uid, ...profile };
}

/**
 * Updates profile fields on the user's document. Only keys that are passed
 * (not undefined) are written. Empty or whitespace-only mobile becomes null.
 *
 * @param {string} uid
 * @param {{ firstName?: string, lastName?: string, mobileNumber?: string | null }} updates
 */
export async function updateUserProfile(uid, updates = {}) {
  const { firstName, lastName, mobileNumber } = updates;
  const payload = {};

  if (firstName !== undefined) {
    payload.firstName = typeof firstName === "string" ? firstName.trim() : firstName;
  }
  if (lastName !== undefined) {
    payload.lastName = typeof lastName === "string" ? lastName.trim() : lastName;
  }
  if (mobileNumber !== undefined) {
    if (mobileNumber === null || mobileNumber === "") {
      payload.mobileNumber = null;
    } else {
      const m = typeof mobileNumber === "string" ? mobileNumber.trim() : mobileNumber;
      payload.mobileNumber = m === "" ? null : m;
    }
  }

  if (Object.keys(payload).length === 0) return;

  await updateDoc(userRef(uid), payload);
}

/**
 * Updates the user's mobile number.
 * Called from the phone collection dialog during the booking flow.
 */
export async function updateMobileNumber(uid, mobileNumber) {
  await updateUserProfile(uid, { mobileNumber });
}
