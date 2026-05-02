const crypto = require("crypto");
const {initializeApp} = require("firebase-admin/app");
const {setGlobalOptions} = require("firebase-functions");

initializeApp();
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const mailService = require("./lib/mail/MailService");
const {validateEmail} = require("./lib/validators");
const {
    getBookingById,
    markBookingComplete,
    markReminderSent,
    getUnremindedBookingsInWindow,
} = require("./lib/adminBookingService");

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

// ── Mark booking complete (from owner email link) ─────────────────────────────

exports.completeBooking = onRequest(
    {cors: true, secrets: ["SMTP_USER", "SMTP_PASS", "BOOKING_SECRET"]},
    async (req, res) => {
        const id = req.query.id || "";
        const token = req.query.token || "";
        const review = req.query.review === "true";
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

const SCHEDULER_SECRET = "59153cff-3ce5-4762-83d8-f0cd568b199e";
const WAT_OFFSET_MS = 60 * 60 * 1000;

function toWATIso(ms) {
    return new Date(ms).toISOString().slice(0, 19);
}

exports.schedulerMessages = onRequest(
    {cors: false, secrets: ["SMTP_USER", "SMTP_PASS"]},
    async (req, res) => {
        if (req.method !== "POST") {
            return res.status(405).json({error: "Method not allowed"});
        }

        if (req.headers["secure"] !== SCHEDULER_SECRET) {
            return res.status(401).json({error: "Unauthorized"});
        }

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
            return res.json({sent: 0});
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

        return res.json({sent, failed: failed.length});
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