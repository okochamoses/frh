const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {getAuth} = require("firebase-admin/auth");
const {watDate} = require("./time");

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

async function clearReminderSent(id) {
    await db().collection("bookings").doc(id).update({reminderSent: false});
}

/**
 * Claims the reminder for `id` — sets `reminderSent` only if it is not
 * already set, returning whether this caller won the claim. Mirrors
 * `claimAdminDigest`: claim before sending so a crash or a failed write
 * between "mail sent" and "flag written" can't leave the flag false and
 * cause the next 15-minute tick to send the same reminder again.
 */
async function claimReminder(id) {
    const ref = db().collection("bookings").doc(id);
    return db().runTransaction(async (tx) => {
        const doc = await tx.get(ref);
        if (!doc.exists || doc.data().reminderSent === true) return false;
        tx.update(ref, {reminderSent: true});
        return true;
    });
}

/**
 * Bookings whose `startTime` falls in [coarseStart, coarseEnd) and still
 * need a reminder. Cancelled and completed appointments are excluded —
 * reminding someone about an appointment they called off is worse than
 * sending nothing.
 *
 * `coarseStart`/`coarseEnd` are intentionally COARSE: `startTime` is stored
 * as either a naive WAT string or a true UTC instant, and Firestore can only
 * range-filter it as raw text, so no single tight bound is correct for both
 * formats at once. Callers should pass a superset wide enough to catch
 * either encoding and then narrow precisely in application code with
 * `watDate`, which knows how to read both.
 */
async function getUnremindedBookingsInWindow(coarseStart, coarseEnd) {
    const snapshot = await db()
        .collection("bookings")
        .where("startTime", ">=", coarseStart)
        .where("startTime", "<=", coarseEnd)
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
 * Whether `email` is on the admin allowlist.
 *
 * Mirrors `firestore.rules`'s `isAdmin()` predicate for predicate — a single
 * `admins/{email.toLowerCase()}` existence check through the admin SDK, which
 * bypasses the rules that block a browser from doing the same read. Callers
 * are responsible for the `email_verified` half of that predicate first (see
 * `requireAdminCaller` in `index.js`): this function only answers "is this
 * address allowlisted", not "has anyone proven they own it".
 */
/**
 * The admin-edited prices for one site's price list — `{title: naira}`, empty
 * when the salon has never changed anything. v1 and v2 are priced separately.
 */
async function getPriceList(list) {
    const doc = await db().collection("price_lists").doc(list).get();
    const prices = doc.exists ? doc.data().prices : null;
    return prices && typeof prices === "object" ? prices : {};
}

async function isAdminEmail(email) {
    const doc = await db().collection("admins").doc(email.toLowerCase()).get();
    return doc.exists;
}

/**
 * The verified account that owns this address, or null.
 *
 * Deliberately not a `users` query. `firestore.rules` requires only that a
 * profile's `email` field be a string — never that it match the account's
 * actual credential — so the collection is a claim, not a fact. Auth owns the
 * address, and `emailVerified` is the only thing that says someone proved it.
 * Without this check, a walk-in typed with a stranger's email would attach
 * that stranger's history to whoever's `users` profile happens to carry it.
 */
async function findVerifiedAccount(email) {
    let user;
    try {
        user = await getAuth().getUserByEmail(email);
    } catch (err) {
        if (err?.code === "auth/user-not-found") return null;
        throw err;
    }
    if (user.emailVerified !== true) return null;
    return {uid: user.uid, email: user.email};
}

/**
 * Hands every unclaimed walk-in on this address to the account that proved it.
 *
 * Queries on the address alone and filters `userId == null` in memory: one
 * person's history is a handful of rows, a single-field equality needs no
 * composite index, and `userId == null` is the only state a walk-in can be in
 * before it is claimed — an online guest booking always has an anonymous uid,
 * so it can never be swept up by mistake.
 *
 * Returns how many bookings were linked.
 */
async function linkWalkInBookings(uid, email, profile) {
    const snapshot = await db().collection("bookings").where("userEmail", "==", email).get();
    const unclaimed = snapshot.docs.filter((doc) => doc.data().userId == null);
    if (unclaimed.length === 0) return 0;

    const batch = db().batch();
    for (const doc of unclaimed) {
        batch.update(doc.ref, {
            userId: uid,
            guest: false,
            claimedAt: FieldValue.serverTimestamp(),
            userFirstName: profile?.firstName ?? doc.data().userFirstName,
        });
    }
    await batch.commit();
    return unclaimed.length;
}

/** `index.js` has no `FieldValue` import; exported so callers don't need one. */
function serverTimestamp() {
    return FieldValue.serverTimestamp();
}

/**
 * How many live, still-to-come bookings have `field == value`.
 *
 * A single equality filter (no range, no order) so it runs on Firestore's
 * automatic single-field index — the date and status are filtered here.
 */
async function countUpcomingBookings(field, value, nowIso) {
    const now = watDate(nowIso);
    const snapshot = await db().collection("bookings").where(field, "==", value).get();
    return snapshot.docs
        .map((d) => d.data())
        .filter((b) => {
            const start = watDate(b.startTime);
            return b.status !== "cancelled" && b.status !== "completed" && !!start && !!now && start > now;
        })
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
    clearReminderSent,
    claimReminder,
    getUnremindedBookingsInWindow,
    getBookingsInWindow,
    claimAdminDigest,
    isAdminEmail,
    getPriceList,
    findVerifiedAccount,
    linkWalkInBookings,
    serverTimestamp,
};
