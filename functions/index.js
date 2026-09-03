const crypto = require("crypto");
const {initializeApp} = require("firebase-admin/app");
const {setGlobalOptions} = require("firebase-functions");

initializeApp();
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onRequest, onCall, HttpsError} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const mailService = require("./lib/mail/MailService");
const {validateEmail} = require("./lib/validators");
const {
    createBooking: writeBooking,
    getUserProfile,
    getBookingById,
    cancelBooking: writeCancellation,
    rescheduleBooking: writeReschedule,
    markBookingComplete,
    markReminderSent,
    getUnremindedBookingsInWindow,
    getBookingsInWindow,
    claimAdminDigest,
} = require("./lib/adminBookingService");
const {watDate, watDateKey} = require("./lib/time");
const {validateSlot} = require("./lib/bookingRules");
const {lookup} = require("./lib/serviceCatalogue");

const MAIL_SECRETS = ["SMTP_USER", "SMTP_PASS"];

setGlobalOptions({maxInstances: 10});

const DARK = "#120D07";
const GOLD = "#DDA15E";
const FUNCTION_BASE = "https://us-central1-flourish-roots.cloudfunctions.net";

function makeCompleteUrl(bookingId, review, secret) {
    const token = crypto.createHmac("sha256", secret).update(bookingId).digest("hex");
    return `${FUNCTION_BASE}/completeBooking?id=${bookingId}&token=${token}&review=${review}`;
}

function verifyToken(bookingId, token, secret) {
    const expected = crypto.createHmac("sha256", secret).update(bookingId).digest("hex");
    try {
        return crypto.timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
    } catch {
        return false;
    }
}

function htmlPage(res, title, message, isError = false) {
    res.set("Content-Type", "text/html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — FRH</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f5f5f0; font-family: Georgia, serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #fff; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.07); max-width: 460px; width: 100%; overflow: hidden; }
    .bar { height: 4px; background: ${isError ? "#BD2E2E" : GOLD}; }
    .header { background: ${DARK}; padding: 24px 32px; text-align: center; }
    .header p { color: ${GOLD}; font-size: 18px; letter-spacing: 0.04em; }
    .body { padding: 32px; text-align: center; }
    h1 { font-size: 22px; color: ${DARK}; margin-bottom: 12px; }
    p { font-size: 15px; color: rgba(18,13,7,0.65); line-height: 1.7; font-family: Arial, sans-serif; }
  </style>
</head>
<body>
  <div class="card">
    <div class="bar"></div>
    <div class="header"><p>Flourish Roots Hair</p></div>
    <div class="body">
      <h1>${title}</h1>
      <p>${message}</p>
    </div>
  </div>
</body>
</html>`);
}

// ── Newsletter welcome email ──────────────────────────────────────────────────

exports.onNewsletterSubscribed = onDocumentCreated(
    {document: "newsletter_subscribers/{email}", secrets: ["SMTP_USER", "SMTP_PASS"]},
    async (event) => {
        const email = event.params.email;
        const subscriberData = event.data.data();
        const firstName = (subscriberData.name ?? "").trim().split(" ")[0] || undefined;

        try {
            await mailService.sendNewsletterWelcome({to: email, firstName});
            logger.info("Newsletter welcome email sent", {email});
        } catch (err) {
            logger.error("Failed to send newsletter welcome email", {email, err});
        }
    }
);

// ── Welcome email on new user ─────────────────────────────────────────────────

exports.sendWelcomeEmail = onDocumentCreated(
    {document: "users/{uid}", secrets: ["SMTP_USER", "SMTP_PASS"]},
    async (event) => {
        const {email, firstName} = event.data.data();

        if (!email) {
            logger.warn("sendWelcomeEmail: no email on user doc", {uid: event.params.uid});
            return;
        }

        try {
            await mailService.sendWelcomeEmail({to: email, firstName});
            logger.info("Welcome email sent", {email});
        } catch (err) {
            logger.error("Failed to send welcome email", {email, err});
        }
    }
);

// ── Booking confirmation + owner notification ─────────────────────────────────

exports.onBookingCreated = onDocumentCreated(
    {document: "bookings/{bookingId}", secrets: ["SMTP_USER", "SMTP_PASS", "BOOKING_SECRET"]},
    async (event) => {
        const booking = event.data.data();
        const bookingId = event.params.bookingId;
        const secret = process.env.BOOKING_SECRET || "";

        if (!booking.userEmail) {
            logger.warn("onBookingCreated: no userEmail on booking", {bookingId});
            return;
        }

        if (booking.status === "cancelled") {
            logger.info("onBookingCreated: booking created cancelled, no mail", {bookingId});
            return;
        }

        const completeUrl = makeCompleteUrl(bookingId, false, secret);
        const completeReviewUrl = makeCompleteUrl(bookingId, true, secret);
        const bookingWithUrls = {...booking, completeUrl, completeReviewUrl};

        const [clientResult, ownerResult] = await Promise.allSettled([
            mailService.sendBookingConfirmation({to: booking.userEmail, booking: bookingWithUrls}),
            mailService.sendOwnerNotification(bookingWithUrls),
        ]);

        if (clientResult.status === "fulfilled") {
            logger.info("Confirmation email sent to client", {to: booking.userEmail});
        } else {
            logger.error("Failed to send confirmation to client", {error: clientResult.reason});
        }

        if (ownerResult.status === "fulfilled") {
            logger.info("Owner notification sent");
        } else {
            logger.error("Failed to send owner notification", {error: ownerResult.reason});
        }
    }
);

// ── Booking write path (callable) ─────────────────────────────────────────────
//
// Bookings used to be written straight from the browser, with Firestore rules
// checking only that `userId` matched the caller. Everything else — the email
// we then send to, the price, the time, the status — was whatever the client
// typed. That made `onBookingCreated` an authenticated mail relay through the
// salon's SMTP account. These callables are the only write path now; the
// client sends service titles and a start time, and nothing else is trusted.
//
// Overlapping appointments are deliberately allowed: several stylists work in
// parallel, so two clients booking the same slot is normal.

/** The signed-in caller's identity, or a typed error. */
function requireCaller(request) {
    const auth = request.auth;
    if (!auth) {
        throw new HttpsError("unauthenticated", "Please sign in to manage a booking.");
    }
    const email = auth.token?.email;
    if (!email) {
        throw new HttpsError("failed-precondition", "Your account has no email address.");
    }
    return {uid: auth.uid, email};
}

function requireOwnedBooking(booking, uid) {
    // Same error for "not found" and "not yours" so the callable can't be used
    // to probe which booking ids exist.
    if (!booking || booking.userId !== uid) {
        throw new HttpsError("not-found", "That booking could not be found.");
    }
    if (booking.status === "cancelled") {
        throw new HttpsError("failed-precondition", "That booking is already cancelled.");
    }
    if (booking.status === "completed") {
        throw new HttpsError("failed-precondition", "That appointment has already happened.");
    }
    const start = watDate(booking.startTime);
    if (!start || start.getTime() <= Date.now()) {
        throw new HttpsError(
            "failed-precondition",
            "That appointment has already started. Please call the salon."
        );
    }
    return booking;
}

exports.createBooking = onCall(
    {cors: true},
    async (request) => {
        const {uid, email} = requireCaller(request);
        const {serviceTitles, startTime} = request.data ?? {};

        let priced;
        try {
            priced = lookup(serviceTitles);
        } catch (err) {
            throw new HttpsError("invalid-argument", err.message);
        }

        const slot = validateSlot(startTime, priced.totalDuration);
        if (!slot.ok) {
            throw new HttpsError("out-of-range", slot.reason);
        }

        const profile = await getUserProfile(uid);
        if (!profile?.mobileNumber) {
            throw new HttpsError(
                "failed-precondition",
                "Please add a mobile number to your profile before booking."
            );
        }

        const bookingId = await writeBooking({
            userId: uid,
            userEmail: email,
            userFirstName: profile.firstName ?? null,
            userMobileNumber: profile.mobileNumber,

            services: priced.services,
            servicesText: priced.servicesText,
            totalAmount: priced.totalPrice,
            totalDuration: priced.totalDuration,

            startTime: slot.start.toISOString(),
            endTime: slot.end.toISOString(),

            status: "pending",
            reminderSent: false,
        });

        logger.info("Booking created", {bookingId, uid});

        return {
            bookingId,
            startTime: slot.start.toISOString(),
            endTime: slot.end.toISOString(),
            totalAmount: priced.totalPrice,
        };
    }
);

exports.cancelBooking = onCall(
    {cors: true, secrets: MAIL_SECRETS},
    async (request) => {
        const {uid} = requireCaller(request);
        const {bookingId} = request.data ?? {};

        if (typeof bookingId !== "string" || !bookingId) {
            throw new HttpsError("invalid-argument", "No booking specified.");
        }

        const booking = requireOwnedBooking(await getBookingById(bookingId), uid);

        await writeCancellation(bookingId);
        logger.info("Booking cancelled", {bookingId, uid});

        // Email failures must not fail the cancellation — it already happened.
        const results = await Promise.allSettled([
            mailService.sendBookingCancelled({
                to: booking.userEmail,
                booking: {
                    userFirstName: booking.userFirstName,
                    servicesText: booking.servicesText,
                    startTime: booking.startTime,
                },
            }),
            mailService.sendOwnerBookingChanged({change: "cancelled", ...booking}),
        ]);

        results
            .filter((r) => r.status === "rejected")
            .forEach((r) => logger.error("[cancelBooking] email failed:", r.reason));

        return {bookingId, status: "cancelled"};
    }
);

exports.rescheduleBooking = onCall(
    {cors: true, secrets: MAIL_SECRETS},
    async (request) => {
        const {uid} = requireCaller(request);
        const {bookingId, startTime} = request.data ?? {};

        if (typeof bookingId !== "string" || !bookingId) {
            throw new HttpsError("invalid-argument", "No booking specified.");
        }

        const booking = requireOwnedBooking(await getBookingById(bookingId), uid);

        // Services and price are untouched by a reschedule, so the duration
        // comes from the booking rather than the request. Older bookings
        // predate `totalDuration`, so fall back to the stored span.
        const totalDuration = Number.isFinite(booking.totalDuration) ?
            booking.totalDuration :
            Math.round(
                (watDate(booking.endTime)?.getTime() - watDate(booking.startTime)?.getTime()) / 60000
            );

        const slot = validateSlot(startTime, totalDuration);
        if (!slot.ok) {
            throw new HttpsError("out-of-range", slot.reason);
        }

        const previousStartTime = booking.startTime;

        await writeReschedule(bookingId, {
            startTime: slot.start.toISOString(),
            endTime: slot.end.toISOString(),
        });
        logger.info("Booking rescheduled", {bookingId, uid});

        const results = await Promise.allSettled([
            mailService.sendBookingRescheduled({
                to: booking.userEmail,
                booking: {
                    userFirstName: booking.userFirstName,
                    servicesText: booking.servicesText,
                    previousStartTime,
                    startTime: slot.start.toISOString(),
                },
            }),
            mailService.sendOwnerBookingChanged({
                change: "rescheduled",
                ...booking,
                previousStartTime,
                startTime: slot.start.toISOString(),
            }),
        ]);

        results
            .filter((r) => r.status === "rejected")
            .forEach((r) => logger.error("[rescheduleBooking] email failed:", r.reason));

        return {
            bookingId,
            startTime: slot.start.toISOString(),
            endTime: slot.end.toISOString(),
        };
    }
);

// ── Mark booking complete (from owner email link) ─────────────────────────────

/**
 * Renders the "are you sure?" page that a GET lands on.
 *
 * The owner's link must not complete the booking on its own: Gmail, Outlook
 * Safe Links and most corporate mail scanners fetch every URL in an email
 * before a human ever sees it. A GET that mutated would mark the appointment
 * complete — and fire the client's "how was your visit?" email — days early.
 * So the GET only asks, and the form below POSTs the actual change.
 */
function confirmPage(res, {id, token, review, booking}) {
    const when = watDate(booking.startTime);
    const whenLabel = when ?
        when.toLocaleString("en-NG", {
            timeZone: "Africa/Lagos",
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
        }) :
        "an unknown time";

    const escape = (v) => String(v).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
    }[c]));

    return htmlPage(
        res,
        "Mark this appointment complete?",
        `<strong>${escape(booking.userFirstName || booking.userEmail || "A client")}</strong> —
     ${escape(booking.servicesText || "appointment")}<br/>${escape(whenLabel)}
     ${review ? "<br/><br/>They will also be asked for a Google review." : ""}
     <form method="POST" style="margin-top:24px;">
       <input type="hidden" name="id" value="${escape(id)}" />
       <input type="hidden" name="token" value="${escape(token)}" />
       <input type="hidden" name="review" value="${review}" />
       <button type="submit"
         style="background:${GOLD};color:${DARK};border:0;border-radius:8px;padding:14px 28px;font-size:15px;font-family:Arial,sans-serif;font-weight:700;cursor:pointer;">
         ${review ? "Complete &amp; ask for a review" : "Yes, mark it complete"}
       </button>
     </form>`
    );
}

exports.completeBooking = onRequest(
    {cors: true, secrets: ["SMTP_USER", "SMTP_PASS", "BOOKING_SECRET"]},
    async (req, res) => {
        // The confirmation form POSTs the same three values back as a body.
        const source = req.method === "POST" ? {...req.query, ...(req.body ?? {})} : req.query;
        const id = source.id || "";
        const token = source.token || "";
        const review = String(source.review) === "true";
        const secret = process.env.BOOKING_SECRET || "";

        if (!verifyToken(id, token, secret)) {
            return htmlPage(res, "Invalid Link", "This link is invalid or has expired.", true);
        }

        let booking;
        try {
            booking = await getBookingById(id);
        } catch (err) {
            logger.error("[completeBooking] Firestore read error:", err);
            return htmlPage(res, "Something went wrong", "We couldn't retrieve this booking. Please try again.", true);
        }

        if (!booking) {
            return htmlPage(res, "Not Found", "This booking could not be found.", true);
        }

        if (booking.status === "completed") {
            return htmlPage(
                res,
                "Already marked complete",
                `${booking.userFirstName || "The client"} was already notified. No further action needed.`
            );
        }

        if (booking.status === "cancelled") {
            return htmlPage(
                res,
                "This booking was cancelled",
                `${booking.userFirstName || "The client"} cancelled this appointment, so there is nothing to complete.`,
                true
            );
        }

        // A GET only ever asks. Nothing below this line runs for a link
        // fetched by a mail scanner.
        if (req.method !== "POST") {
            return confirmPage(res, {id, token, review, booking});
        }

        try {
            await markBookingComplete(id);
        } catch (err) {
            logger.error("[completeBooking] Firestore update error:", err);
            return htmlPage(res, "Something went wrong", "We couldn't update this booking. Please try again.", true);
        }

        try {
            if (review) {
                await mailService.sendServiceCompleteWithReview({
                    to: booking.userEmail,
                    booking: {userFirstName: booking.userFirstName},
                });
            } else {
                await mailService.sendServiceComplete({
                    to: booking.userEmail,
                    booking: {userFirstName: booking.userFirstName},
                });
            }
        } catch (err) {
            logger.error("[completeBooking] email send error:", err);
        }

        return htmlPage(
            res,
            "Done!",
            `${booking.userFirstName || "The client"} has been notified${review ? " and asked for a review" : ""}. All done.`
        );
    }
);

// ── Appointment reminder scheduler ───────────────────────────────────────────

// Set with `firebase functions:secrets:set SCHEDULER_SECRET`, and sent by the
// cron job as the `secure` header. This used to be a literal in this file —
// that value is in git history and must be treated as compromised.
const SCHEDULER_SECRET = defineSecret("SCHEDULER_SECRET");

/**
 * Constant-time header check. Hashing first keeps both sides the same length,
 * so `timingSafeEqual` compares instead of throwing on a short header.
 */
function hasSchedulerSecret(req) {
    const provided = req.headers["secure"];
    if (typeof provided !== "string" || provided.length === 0) return false;

    const expected = SCHEDULER_SECRET.value();
    if (!expected) {
        logger.error("SCHEDULER_SECRET is not configured — rejecting request.");
        return false;
    }

    return crypto.timingSafeEqual(
        crypto.createHash("sha256").update(provided).digest(),
        crypto.createHash("sha256").update(expected).digest()
    );
}
const WAT_OFFSET_MS = 60 * 60 * 1000;

function toWATIso(ms) {
    return new Date(ms).toISOString().slice(0, 19);
}

// The nightly admin digest rides on the same 15-minute cron: it only fires
// during this WAT hour, and the Firestore claim keeps it to one send per day.
const DIGEST_HOUR_WAT = 20;

function addDays(dateKey, days) {
    const d = new Date(`${dateKey}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}

/**
 * Emails the owner every booking scheduled for the next day.
 * `force` skips the hour check and the once-a-day claim (manual trigger).
 */
async function runAdminDailyDigest({force = false} = {}) {
    const now = new Date();
    const hourWAT = Number(
        now.toLocaleString("en-GB", {timeZone: "Africa/Lagos", hour: "2-digit", hour12: false})
    );

    if (!force && hourWAT !== DIGEST_HOUR_WAT) {
        return {skipped: "outside digest hour", hourWAT};
    }

    const tomorrowKey = addDays(watDateKey(now), 1);

    if (!force && !(await claimAdminDigest(tomorrowKey))) {
        return {skipped: "already sent", date: tomorrowKey};
    }

    // Query a padded window so both storage formats (naive WAT and UTC "…Z")
    // are covered, then narrow to the real WAT calendar day.
    const candidates = await getBookingsInWindow(
        `${addDays(tomorrowKey, -1)}T00:00:00`,
        `${addDays(tomorrowKey, 1)}T23:59:59Z`
    );

    const bookings = candidates
        .filter((b) => {
            const d = watDate(b.startTime);
            return d && watDateKey(d) === tomorrowKey;
        })
        .sort((a, b) => watDate(a.startTime) - watDate(b.startTime));

    const dateLabel = new Date(`${tomorrowKey}T12:00:00Z`).toLocaleDateString("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    await mailService.sendAdminDailyDigest({dateLabel, bookings});
    logger.info("[adminDailyDigest] sent", {date: tomorrowKey, count: bookings.length});

    return {sent: true, date: tomorrowKey, count: bookings.length};
}

exports.adminDailyDigest = onRequest(
    // `invoker: public` only opens the door; the `secure` header below is the lock.
    {cors: false, invoker: "public", secrets: [...MAIL_SECRETS, SCHEDULER_SECRET]},
    async (req, res) => {
        if (req.method !== "POST") {
            return res.status(405).json({error: "Method not allowed"});
        }
        if (!hasSchedulerSecret(req)) {
            return res.status(401).json({error: "Unauthorized"});
        }

        try {
            return res.json(await runAdminDailyDigest({force: req.query.force === "true"}));
        } catch (err) {
            logger.error("[adminDailyDigest] failed:", err);
            return res.status(500).json({error: "Failed to send digest"});
        }
    }
);

exports.schedulerMessages = onRequest(
    {cors: false, secrets: [...MAIL_SECRETS, SCHEDULER_SECRET]},
    async (req, res) => {
        if (req.method !== "POST") {
            return res.status(405).json({error: "Method not allowed"});
        }

        if (!hasSchedulerSecret(req)) {
            return res.status(401).json({error: "Unauthorized"});
        }

        const digest = await runAdminDailyDigest().catch((err) => {
            logger.error("[schedulerMessages] admin digest failed:", err);
            return {error: "digest failed"};
        });

        const nowWAT = Date.now() + WAT_OFFSET_MS;
        const windowStart = toWATIso(nowWAT + 45 * 60 * 1000);
        const windowEnd = toWATIso(nowWAT + 75 * 60 * 1000);

        logger.info("[schedulerMessages] window", {windowStart, windowEnd});

        let bookings;
        try {
            bookings = await getUnremindedBookingsInWindow(windowStart, windowEnd);
        } catch (err) {
            logger.error("[schedulerMessages] Firestore query error:", err);
            return res.status(500).json({error: "Failed to query bookings"});
        }

        logger.info("[schedulerMessages] bookings found", {
            count: bookings.length,
            bookings: bookings.map((b) => ({id: b.id, email: b.userEmail, startTime: b.startTime})),
        });

        if (bookings.length === 0) {
            return res.json({sent: 0, digest});
        }

        const results = await Promise.allSettled(
            bookings.map(async (booking) => {
                await mailService.sendAppointmentReminder({
                    to: booking.userEmail,
                    booking: {
                        userFirstName: booking.userFirstName,
                        services: booking.services ?? [],
                        servicesText: booking.servicesText,
                        startTime: booking.startTime,
                    },
                });
                await markReminderSent(booking.id);
                return booking.id;
            })
        );

        const sent = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected");

        failed.forEach((r, i) =>
            logger.error(`[schedulerMessages] reminder failed for booking index ${i}:`, r.reason)
        );

        return res.json({sent, failed: failed.length, digest});
    }
);

// ── Lead magnet / newsletter signup ──────────────────────────────────────────

const SYSTEME_API_BASE = "https://api.systeme.io";
const LEAD_GEN_TAG_ID = 1957649;
const FIRST_NAME_SLUG = "first_name";

exports.leadMagnet = onRequest(
    {cors: true, secrets: ["SYSTEME_IO_API_KEY"]},
    async (req, res) => {
        if (req.method !== "POST") {
            return res.status(405).json({error: "Method not allowed"});
        }

        const body = req.body;

        const emailValidation = validateEmail(body.email);
        if (!emailValidation.valid) {
            return res.status(400).json({error: emailValidation.error});
        }
        const email = body.email.trim();
        const firstName = typeof body.firstName === "string" ? body.firstName.trim() : undefined;

        const apiKey = process.env.SYSTEME_IO_API_KEY;
        if (!apiKey) {
            logger.error("leadMagnet: SYSTEME_IO_API_KEY is not set.");
            return res.status(503).json({error: "Newsletter signup is not configured."});
        }

        const headers = {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
        };

        const fields = firstName ? [{slug: FIRST_NAME_SLUG, value: firstName}] : [];

        let apiRes;
        try {
            apiRes = await fetch(`${SYSTEME_API_BASE}/api/contacts`, {
                method: "POST",
                headers,
                body: JSON.stringify({email, fields}),
            });
        } catch (err) {
            logger.error("leadMagnet API error:", err);
            return res.status(500).json({error: "Something went wrong. Please try again."});
        }

        const data = await apiRes.json().catch((err) => {
            logger.error("leadMagnet: failed to parse contact response:", err);
            return {};
        });

        if (!apiRes.ok) {
            const alreadyExists = data.violations?.some((v) =>
                v.message?.toLowerCase().includes("already used")
            );
            if (alreadyExists) return res.json({success: true});
            const message = data.detail || data.message || data.error || "Failed to subscribe.";
            return res.status(apiRes.status).json({error: message});
        }

        if (data.id) {
            fetch(`${SYSTEME_API_BASE}/api/contacts/${data.id}/tags`, {
                method: "POST",
                headers,
                body: JSON.stringify({tagId: LEAD_GEN_TAG_ID}),
            })
                .then((tagRes) => {
                    if (!tagRes.ok) {
                        logger.error(`Failed to add Lead Gen tag to contact ${data.id} (${email})`);
                    }
                })
                .catch((err) => {
                    logger.error(`Tag request failed for contact ${data.id} (${email}):`, err);
                });
        }

        return res.json({success: true});
    }
);