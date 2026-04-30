import { adminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";

export async function getBookingById(id) {
  const doc = await adminDb.collection("bookings").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

export async function markBookingComplete(id) {
  await adminDb.collection("bookings").doc(id).update({
    status:      "completed",
    completedAt: FieldValue.serverTimestamp(),
  });
}

export async function markReminderSent(id) {
  await adminDb.collection("bookings").doc(id).update({ reminderSent: true });
}

/**
 * Returns bookings whose startTime falls in [windowStart, windowEnd] (ISO strings, WAT)
 * that haven't been reminded yet and aren't completed.
 */
export async function getUnremindedBookingsInWindow(windowStart, windowEnd) {
  const snapshot = await adminDb
    .collection("bookings")
    .where("startTime", ">=", windowStart)
    .where("startTime", "<=", windowEnd)
    .get();

  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((b) => b.reminderSent !== true && b.status !== "completed");
}
