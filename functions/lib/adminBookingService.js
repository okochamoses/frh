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

async function createBooking(data) {
    const ref = await db().collection("bookings").add({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
    });
    return ref.id;
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
