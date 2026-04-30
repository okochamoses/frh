/**
 * bookingService.js
 *
 * All Firestore operations for the `bookings` collection.
 */

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./config";

/**
 * @typedef {object} BookingRecord
 * @property {string} id                    Firestore document id
 * @property {string} userId
 * @property {Array<{ title?: string, price?: number, duration?: number, category?: string }>} [services]
 * @property {string} [servicesText]
 * @property {number} totalAmount
 * @property {string} startTime              ISO datetime string
 * @property {string} endTime                ISO datetime string
 * @property {import("firebase/firestore").Timestamp} [createdAt]
 */

/**
 * Saves a new booking to Firestore.
 *
 * @param {object} params
 * @param {object} params.user           - The authenticated user profile
 * @param {Array}  params.services       - Selected service objects
 * @param {string} params.startTime      - ISO datetime string (WAT)
 * @param {string} params.endTime        - ISO datetime string (WAT)
 * @param {number} params.totalAmount    - Total price in NGN
 *
 * @returns {string} The new Firestore document ID
 */
export async function createBooking({ user, services, startTime, endTime, totalAmount }) {
  const docRef = await addDoc(collection(db, "bookings"), {
    // Who is booking
    userId:          user.uid,
    userEmail:       user.email,
    userFirstName:   user.firstName,
    userMobileNumber: user.mobileNumber,

    // What they're booking
    services,
    servicesText:  services.map((s) => s.title).join(" | "),
    totalAmount,

    // When
    startTime,
    endTime,

    // Scheduler tracking
    status:        "pending",
    reminderSent:  false,

    createdAt: serverTimestamp(),
  });

  return docRef.id;
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
