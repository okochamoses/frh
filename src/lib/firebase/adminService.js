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
import { watInstant } from "@/lib/booking/schedule";

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

/**
 * The labels shown for a booking's `status` on the admin dashboard. Kept in
 * lock-step with the customer-facing `STATUS_BADGES` in
 * `src/app/bookings/page.js` (a `pending` booking reads "Confirmed" there) so
 * staff are never shown a word that contradicts what the customer was told.
 * Colours stay with the admin page's own `STATUS_STYLES` — only the text
 * lives here.
 */
export const BOOKING_STATUS_LABELS = {
  pending: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

function toRows(snapshot, idField) {
  return snapshot.docs.map((d) => ({ [idField]: d.id, ...d.data() }));
}

/*
 * Both lists read their whole collection and sort in the browser, which is
 * slow and will not stay acceptable forever. It is deliberate for now, for a
 * reason that has to be fixed first: `startTime` holds two encodings — older
 * naive-WAT strings ("2026-09-20T10:00:00") and true UTC instants ("…Z") —
 * and Firestore can only order a string field lexicographically. Those two
 * shapes sort against each other as if the naive rows were an hour later than
 * they are, so `orderBy("startTime")` does not return the newest bookings; it
 * returns the newest-looking text. Paired with a `limit`, that does not just
 * misorder the page, it picks the wrong rows for it.
 *
 * `watInstant` resolves both encodings to the real moment, so sorting here is
 * correct where sorting in the query is not. `createdAt` on `users` has its
 * own version of the problem: the Firestore rule admits a subset of the
 * allowed fields, so a profile written without it is legal — and `orderBy`
 * drops documents that lack the field, silently, which is a worse failure
 * than a slow page.
 *
 * The precondition for paginating is normalising `startTime` to one encoding
 * and backfilling `createdAt`; until then, slow and complete beats fast and
 * quietly wrong.
 */

/** Every booking, newest appointment first. */
export function subscribeAllBookings(onNext, onError) {
  return onSnapshot(
    collection(db, "bookings"),
    (snapshot) => {
      const rows = toRows(snapshot, "id");
      rows.sort((a, b) => (watInstant(b.startTime)?.getTime() ?? 0) - (watInstant(a.startTime)?.getTime() ?? 0));
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
      const rows = toRows(snapshot, "uid");
      rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      onNext(rows);
    },
    onError
  );
}
