/**
 * adminService.js
 *
 * Auth and data access for the admin dashboard (/admin). `bookings` and
 * `users` are otherwise locked to their own owner in firestore.rules — an
 * account only sees everyone's data once its email exists as a document in
 * the `admins` collection, added by hand in the Firebase console. There is no
 * self-service way to grant admin access, on purpose.
 */

import {
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./config";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

async function isAdminEmail(email) {
  if (!email) return false;
  try {
    const snap = await getDoc(doc(db, "admins", email.toLowerCase()));
    return snap.exists();
  } catch {
    // firestore.rules only lets a user read their own admins doc, so a
    // permission-denied here just means they aren't one.
    return false;
  }
}

/**
 * Subscribes to the admin session. `onChange` is called with
 * `{ status: "signed-out" | "checking" | "not-admin" | "admin", user }`,
 * once immediately and again on every sign-in / sign-out.
 */
export function subscribeAdminSession(onChange) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user || user.isAnonymous) {
      onChange({ status: "signed-out", user: null });
      return;
    }
    onChange({ status: "checking", user });
    const admin = await isAdminEmail(user.email);
    onChange({ status: admin ? "admin" : "not-admin", user });
  });
}

export async function signInAdminWithGoogle() {
  await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
}

export async function signOutAdmin() {
  await signOut(auth);
}

/** Every booking, newest appointment first — sorted client-side, no index needed. */
export function subscribeAllBookings(onNext, onError) {
  return onSnapshot(
    collection(db, "bookings"),
    (snapshot) => {
      const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => new Date(b.startTime || 0) - new Date(a.startTime || 0));
      onNext(rows);
    },
    onError
  );
}

/** Every customer profile, newest sign-up first. */
export function subscribeAllCustomers(onNext, onError) {
  return onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      const rows = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
      rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      onNext(rows);
    },
    onError
  );
}
