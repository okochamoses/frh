const {setGlobalOptions} = require("firebase-functions");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const mailService = require("./lib/mail/MailService");

setGlobalOptions({maxInstances: 10});

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
    {document: "bookings/{bookingId}", secrets: ["SMTP_USER", "SMTP_PASS"]},
    async (event) => {
        const booking = event.data.data();
        const bookingId = event.params.bookingId;

        if (!booking.userEmail) {
            logger.warn("onBookingCreated: no userEmail on booking", {bookingId});
            return;
        }

        const [clientResult, ownerResult] = await Promise.allSettled([
            mailService.sendBookingConfirmation({to: booking.userEmail, booking}),
            mailService.sendOwnerNotification(booking),
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