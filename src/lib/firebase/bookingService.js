/**
 * bookingService.js
 *
 * The `bookings` collection is read-only from the browser (see firestore.rules).
 * Creating, cancelling and rescheduling all go through Cloud Functions, which
 * price the services and validate the slot server-side — the client only ever
 * sends service titles and a start time.
 */

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "./config";

/**
 * @typedef {object} BookingRecord
 * @property {string} id                    Firestore document id
 * @property {string} userId
 * @property {Array<{ title?: string, price?: number, duration?: number, category?: string }>} [services]
 * @property {string} [servicesText]
 * @property {number} totalAmount
 * @property {number} [totalDuration]        Minutes
 * @property {string} startTime              ISO datetime string
 * @property {string} endTime                ISO datetime string
 * @property {"pending"|"completed"|"cancelled"} [status]
 * @property {import("firebase/firestore").Timestamp} [createdAt]
 */

/**
 * Turns a callable rejection into something worth showing a user.
 *
 * The functions SDK gives HttpsError messages verbatim, and ours are written
 * for the customer ("Sunday appointments start from 1pm"). Anything unexpected
 * — a network drop, an `internal` — gets the generic line instead of a stack.
 */
function toUserMessage(err, fallback) {
  const code = err?.code ?? "";
  if (code === "functions/internal" || code === "functions/unknown" || !err?.message) {
    return fallback;
  }
  if (code === "functions/unavailable" || code === "functions/deadline-exceeded") {
    return "We couldn't reach the salon's booking service. Please check your connection and try again.";
  }
  return err.message;
}

async function call(name, payload, fallback) {
  try {
    const { data } = await httpsCallable(functions, name)(payload);
    return data;
  } catch (err) {
    const friendly = new Error(toUserMessage(err, fallback));
    friendly.cause = err;
    friendly.code = err?.code;
    throw friendly;
  }
}

/**
 * Creates a booking.
 *
 * Only the titles and the start time are sent: the server looks up prices and
 * durations from its own copy of the catalogue, derives the customer's email
 * and name from the auth token, and computes `endTime` itself.
 *
 * A guest (anonymous session, no profile) sends `guest` instead, and the server
 * validates it: `{ firstName, mobileNumber, email? }`.
 *
 * `notes` is the client's own free text — relaxed or transitioning hair, a
 * child coming in, extensions they're bringing. The server trims and caps it.
 *
 * @param {object} params
 * @param {Array<{title: string}>} params.services  Selected service objects
 * @param {string} params.startTime                 ISO datetime string
 * @param {{firstName: string, mobileNumber: string, email?: string|null}} [params.guest]
 * @param {string} [params.notes]
 * @returns {Promise<{bookingId: string, startTime: string, endTime: string, totalAmount: number}>}
 */
export async function createBooking({ services, startTime, guest, notes }) {
  return call(
    "createBooking",
    {
      serviceTitles: services.map((s) => s.title),
      startTime,
      ...(guest ? { guest } : {}),
      ...(notes?.trim() ? { notes: notes.trim() } : {}),
    },
    "Booking failed. Please try again."
  );
}

/**
 * Reads one booking through its signed link.
 *
 * This is the guest's way in: they have no account, so the confirmation email
 * carries a `token` that stands in for one. A signed-in owner can call it with
 * no token at all.
 */
export async function getBooking(bookingId, token) {
  return call(
    "getBooking",
    { bookingId, ...(token ? { token } : {}) },
    "We couldn't find that booking. Please check the link, or ask the salon."
  );
}

/** Cancels a booking, as its signed-in owner or through a signed link. */
export async function cancelBooking(bookingId, token) {
  return call(
    "cancelBooking",
    { bookingId, ...(token ? { token } : {}) },
    "We couldn't cancel that booking. Please try again."
  );
}

/** Moves a booking to a new start time, as its owner or through a signed link. */
export async function rescheduleBooking(bookingId, startTime, token) {
  return call(
    "rescheduleBooking",
    { bookingId, startTime, ...(token ? { token } : {}) },
    "We couldn't move that booking. Please try again."
  );
}

/**
 * Subscribe to the signed-in user's bookings (newest appointment first).
 * Sorting is done client-side to avoid a composite index on `userId` + `startTime`.
 *
 * @param {string} userId
 * @param {(bookings: BookingRecord[]) => void} onNext
 * @param {(error: Error) => void} [onError]
 * @returns {() => void} Unsubscribe function
 */
export function subscribeUserBookings(userId, onNext, onError) {
  const q = query(collection(db, "bookings"), where("userId", "==", userId));

  return onSnapshot(
    q,
    (snapshot) => {
      /** @type {BookingRecord[]} */
      const rows = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      rows.sort((a, b) => {
        const ta = new Date(a.startTime || 0).getTime();
        const tb = new Date(b.startTime || 0).getTime();
        return tb - ta;
      });
      onNext(rows);
    },
    onError
  );
}
