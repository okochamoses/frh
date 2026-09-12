const {getFirestore, FieldValue} = require("firebase-admin/firestore");

function db() {
    return getFirestore();
}

async function getBookingById(id) {
    const doc = await db().collection("bookings").doc(id).get();
    if (!doc.exists) return null;
    return {id: doc.id, ...doc.data()};
}

async function markBookingComplete(id) {
    await db().collection("bookings").doc(id).update({
        status: "completed",
        completedAt: FieldValue.serverTimestamp(),
    });
}

async function markReminderSent(id) {
    await db().collection("bookings").doc(id).update({reminderSent: true});
}

/**
 * Bookings starting in [windowStart, windowEnd] that still need a reminder.
 * Cancelled and completed appointments are excluded — reminding someone about
 * an appointment they called off is worse than sending nothing.
 */
async function getUnremindedBookingsInWindow(windowStart, windowEnd) {
    const snapshot = await db()
        .collection("bookings")
        .where("startTime", ">=", windowStart)
        .where("startTime", "<=", windowEnd)
        .get();

    return snapshot.docs
        .map((d) => ({id: d.id, ...d.data()}))
        .filter((b) =>
            b.reminderSent !== true &&
            b.status !== "completed" &&
            b.status !== "cancelled");
}

async function getBookingsInWindow(windowStart, windowEnd) {
    const snapshot = await db()
        .collection("bookings")
        .where("startTime", ">=", windowStart)
        .where("startTime", "<=", windowEnd)
        .orderBy("startTime")
        .get();

    return snapshot.docs
        .map((d) => ({id: d.id, ...d.data()}))
        .filter((b) => b.status !== "cancelled" && b.status !== "completed");
}

async function cancelBooking(id) {
    await db().collection("bookings").doc(id).update({
        status: "cancelled",
        cancelledAt: FieldValue.serverTimestamp(),
    });
}

/**
 * Moves a booking. `reminderSent` resets because the old reminder window no
 * longer applies — otherwise a booking moved later would never be reminded.
 */
async function rescheduleBooking(id, {startTime, endTime}) {
    await db().collection("bookings").doc(id).update({
        startTime,
        endTime,
        reminderSent: false,
        rescheduledAt: FieldValue.serverTimestamp(),
    });
}

/**
 * Moves every booking owned by `fromUid` to `toUid`.
 *
 * This is what a guest's history is made of. Bookings made without an account
 * belong to an anonymous uid, so a client who books twice as a guest and then
 * finally signs up would otherwise arrive at an account that has never seen
 * them — no "booked before", no rebook card, nothing on `/bookings`. The
 * contact fields move to the account's, because that is where the salon should
 * write from now on.
 *
 * Returns how many bookings moved.
 */
async function reassignBookings(fromUid, toUid, contact = {}) {
    const snapshot = await db().collection("bookings").where("userId", "==", fromUid).get();
    if (snapshot.empty) return 0;

    // One batch: 500 writes is far beyond what one guest can hold, and a
    // half-moved history is worse than none.
    const batch = db().batch();
    for (const doc of snapshot.docs) {
        batch.update(doc.ref, {
            userId: toUid,
            guest: false,
            claimedAt: FieldValue.serverTimestamp(),
            ...(contact.userEmail ? {userEmail: contact.userEmail} : {}),
            ...(contact.userFirstName ? {userFirstName: contact.userFirstName} : {}),
            ...(contact.userMobileNumber ? {userMobileNumber: contact.userMobileNumber} : {}),
        });
    }
    await batch.commit();
    return snapshot.size;
}

async function createBooking(data) {
    const ref = await db().collection("bookings").add({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
    });
    return ref.id;
}

/**
 * How many live, still-to-come bookings have `field == value`.
 *
 * A single equality filter (no range, no order) so it runs on Firestore's
 * automatic single-field index — the date and status are filtered here.
 */
async function countUpcomingBookings(field, value, nowIso) {
    const snapshot = await db().collection("bookings").where(field, "==", value).get();
    return snapshot.docs
        .map((d) => d.data())
        .filter((b) => b.status !== "cancelled" && b.status !== "completed" && b.startTime > nowIso)
        .length;
}

async function getUserProfile(uid) {
    const doc = await db().collection("users").doc(uid).get();
    return doc.exists ? doc.data() : null;
}

/**
 * Reserves the admin digest for `dateKey` (YYYY-MM-DD of the day being previewed).
 * Returns true only for the first caller, so the 15-minute cron can't send twice.
 */
async function claimAdminDigest(dateKey) {
    const ref = db().collection("admin_digests").doc(dateKey);
    return db().runTransaction(async (tx) => {
        const doc = await tx.get(ref);
        if (doc.exists) return false;
        tx.set(ref, {sentAt: FieldValue.serverTimestamp()});
        return true;
    });
}

module.exports = {
    createBooking,
    reassignBookings,
    countUpcomingBookings,
    getUserProfile,
    getBookingById,
    cancelBooking,
    rescheduleBooking,
    markBookingComplete,
    markReminderSent,
    getUnremindedBookingsInWindow,
    getBookingsInWindow,
    claimAdminDigest,
};
