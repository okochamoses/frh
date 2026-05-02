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

async function getUnremindedBookingsInWindow(windowStart, windowEnd) {
    const snapshot = await db()
        .collection("bookings")
        .where("startTime", ">=", windowStart)
        .where("startTime", "<=", windowEnd)
        .get();

    return snapshot.docs
        .map((d) => ({id: d.id, ...d.data()}))
        .filter((b) => b.reminderSent !== true && b.status !== "completed");
}

module.exports = {getBookingById, markBookingComplete, markReminderSent, getUnremindedBookingsInWindow};
