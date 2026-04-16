const { setGlobalOptions }    = require("firebase-functions");
const { onDocumentCreated }   = require("firebase-functions/v2/firestore");
const logger                  = require("firebase-functions/logger");
const mailchimp               = require("@mailchimp/mailchimp_marketing");
const nodemailer              = require("nodemailer");

// Cap concurrent containers to control costs on the free tier
setGlobalOptions({ maxInstances: 10 });

// ── Mailchimp setup ───────────────────────────────────────────────────────────

const MAILCHIMP_API_KEY     = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER      = process.env.MAILCHIMP_SERVER_PREFIX;
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

if (MAILCHIMP_API_KEY && MAILCHIMP_SERVER) {
  mailchimp.setConfig({ apiKey: MAILCHIMP_API_KEY, server: MAILCHIMP_SERVER });
}

// ── SMTP transporter (Hostinger) ──────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM_ADDRESS = () => `"Flourish Roots Hair" <${process.env.SMTP_USER}>`;
const OWNER_EMAIL  = () => process.env.SMTP_USER;

// ── Email templates ───────────────────────────────────────────────────────────

const DARK = "#120D07";
const GOLD = "#DDA15E";

/**
 * Wraps any content block in the shared FRH email shell.
 */
function emailShell(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Flourish Roots Hair</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">

        <!-- Gold top bar -->
        <tr><td style="height:4px;background:${GOLD};"></td></tr>

        <!-- Header -->
        <tr><td style="background:${DARK};padding:28px 36px;text-align:center;">
          <p style="margin:0;color:${GOLD};font-size:22px;letter-spacing:0.04em;">Flourish Roots Hair</p>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.45);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-family:Arial,sans-serif;">Promoting Healthier Hair</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 36px 28px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#fafaf8;padding:20px 36px;border-top:1px solid rgba(18,13,7,0.07);text-align:center;">
          <p style="margin:0;font-size:11px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;line-height:1.8;">
            Shop 303, Destiny Plaza, Ago Palace Way, Isolo Lagos<br/>
            <a href="mailto:flourishnaturalsinfo@gmail.com" style="color:rgba(18,13,7,0.4);text-decoration:none;">flourishnaturalsinfo@gmail.com</a>
            &nbsp;·&nbsp;
            <a href="https://instagram.com/frh_naturals" style="color:rgba(18,13,7,0.4);text-decoration:none;">@frh_naturals</a>
          </p>
        </td></tr>

        <!-- Gold bottom bar -->
        <tr><td style="height:3px;background:${GOLD};"></td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Welcome email sent when a new user profile is created.
 */
function welcomeEmailHtml(firstName) {
  return emailShell(`
    <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Welcome</p>
    <h1 style="margin:0 0 20px;font-size:24px;color:${DARK};line-height:1.2;">
      Hey ${firstName || "Queen"}, welcome to the FRH family 🌿
    </h1>

    <p style="margin:0 0 16px;font-size:15px;color:rgba(18,13,7,0.72);line-height:1.7;">
      We're so glad you're here. Flourish Roots Hair is your home for healthy, thriving natural hair —
      from expert salon services to 1-on-1 coaching built around your unique texture and goals.
    </p>

    <p style="margin:0 0 24px;font-size:15px;color:rgba(18,13,7,0.72);line-height:1.7;">
      Here's what you can do next:
    </p>

    <!-- CTAs -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
      <tr>
        <td style="padding-bottom:12px;">
          <a href="https://flourishrootshair.com/bookings"
            style="display:block;background:${DARK};color:#ffffff;text-align:center;padding:14px 20px;border-radius:8px;font-size:14px;font-family:Arial,sans-serif;text-decoration:none;font-weight:600;letter-spacing:0.03em;">
            Book a Salon Appointment
          </a>
        </td>
      </tr>
      <tr>
        <td>
          <a href="https://flourishrootshair.com/consultation"
            style="display:block;background:${GOLD};color:${DARK};text-align:center;padding:14px 20px;border-radius:8px;font-size:14px;font-family:Arial,sans-serif;text-decoration:none;font-weight:600;letter-spacing:0.03em;">
            Book a Hair Coaching Session
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:rgba(18,13,7,0.45);line-height:1.7;font-family:Arial,sans-serif;">
      Have questions? Just reply to this email — we're always happy to help.
    </p>
  `);
}

/**
 * Booking confirmation email sent to the client.
 */
function bookingConfirmationHtml(booking) {
  const {
    userFirstName,
    servicesText,
    services = [],
    startTime,
    endTime,
    totalAmount,
  } = booking;

  const fmt = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-NG", {
      timeZone: "Africa/Lagos",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const serviceRows = services.length
    ? services.map((s) => `
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${DARK};font-family:Arial,sans-serif;border-bottom:1px solid rgba(18,13,7,0.07);">${s.title || "—"}</td>
          <td style="padding:8px 0;font-size:14px;color:${DARK};font-family:Arial,sans-serif;border-bottom:1px solid rgba(18,13,7,0.07);text-align:right;">₦${Number(s.price || 0).toLocaleString("en-NG")}</td>
        </tr>`).join("")
    : `<tr><td colspan="2" style="padding:8px 0;font-size:14px;color:rgba(18,13,7,0.6);font-family:Arial,sans-serif;">${servicesText || "—"}</td></tr>`;

  return emailShell(`
    <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Booking Confirmed</p>
    <h1 style="margin:0 0 20px;font-size:24px;color:${DARK};line-height:1.2;">
      You're all booked, ${userFirstName || "Queen"}!
    </h1>

    <p style="margin:0 0 24px;font-size:15px;color:rgba(18,13,7,0.7);line-height:1.7;">
      We've received your appointment and we can't wait to see you. Here's a summary of your booking:
    </p>

    <!-- Booking details box -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#fafaf8;border:1px solid rgba(18,13,7,0.08);border-radius:10px;margin-bottom:24px;padding:0;">
      <tr><td style="padding:20px 20px 4px;">
        <p style="margin:0 0 4px;font-size:11px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;letter-spacing:0.15em;text-transform:uppercase;">Date &amp; Time</p>
        <p style="margin:0;font-size:15px;color:${DARK};font-family:Arial,sans-serif;font-weight:600;">${fmt(startTime)}</p>
      </td></tr>
      <tr><td style="padding:12px 20px 4px;border-top:1px solid rgba(18,13,7,0.06);">
        <p style="margin:0 0 4px;font-size:11px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;letter-spacing:0.15em;text-transform:uppercase;">Location</p>
        <p style="margin:0;font-size:15px;color:${DARK};font-family:Arial,sans-serif;">Shop 303, Destiny Plaza, Ago Palace Way, Isolo Lagos</p>
      </td></tr>
      <tr><td style="padding:12px 20px 16px;border-top:1px solid rgba(18,13,7,0.06);">
        <p style="margin:0 0 10px;font-size:11px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;letter-spacing:0.15em;text-transform:uppercase;">Services</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${serviceRows}
          <tr>
            <td style="padding-top:10px;font-size:14px;color:${DARK};font-family:Arial,sans-serif;font-weight:700;">Total</td>
            <td style="padding-top:10px;font-size:14px;color:${DARK};font-family:Arial,sans-serif;font-weight:700;text-align:right;">₦${Number(totalAmount || 0).toLocaleString("en-NG")}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <p style="margin:0 0 24px;font-size:14px;color:rgba(18,13,7,0.6);line-height:1.7;font-family:Arial,sans-serif;">
      Need to reschedule or have a question? Just reply to this email and we'll sort it out.
    </p>

    <p style="margin:0;font-size:14px;color:rgba(18,13,7,0.55);line-height:1.7;font-family:Arial,sans-serif;">
      See you soon 🌿<br/>
      <strong style="color:${DARK};">The FRH Team</strong>
    </p>
  `);
}

/**
 * Internal notification email sent to the salon owner on every new booking.
 */
function ownerNotificationHtml(booking) {
  const {
    userFirstName,
    userEmail,
    userMobileNumber,
    servicesText,
    startTime,
    totalAmount,
  } = booking;

  const fmt = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-NG", {
      timeZone: "Africa/Lagos",
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return emailShell(`
    <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">New Booking</p>
    <h1 style="margin:0 0 24px;font-size:22px;color:${DARK};line-height:1.2;">
      New appointment from ${userFirstName || "a client"}
    </h1>

    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#fafaf8;border:1px solid rgba(18,13,7,0.08);border-radius:10px;margin-bottom:20px;">
      ${[
        ["Client",   userFirstName || "—"],
        ["Email",    userEmail || "—"],
        ["Phone",    userMobileNumber || "—"],
        ["Services", servicesText || "—"],
        ["Date",     fmt(startTime)],
        ["Total",    `₦${Number(totalAmount || 0).toLocaleString("en-NG")}`],
      ].map(([label, value], i) => `
        <tr><td style="padding:${i === 0 ? "16px" : "10px"} 20px ${i === 5 ? "16px" : "4px"};">
          <p style="margin:0 0 2px;font-size:10px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;letter-spacing:0.15em;text-transform:uppercase;">${label}</p>
          <p style="margin:0;font-size:14px;color:${DARK};font-family:Arial,sans-serif;">${value}</p>
        </td></tr>
        ${i < 5 ? `<tr><td style="height:1px;background:rgba(18,13,7,0.06);"></td></tr>` : ""}
      `).join("")}
    </table>
  `);
}

// ── Newsletter → Mailchimp sync ───────────────────────────────────────────────

exports.syncNewsletterToMailchimp = onDocumentCreated(
  "newsletter_subscribers/{email}",
  async (event) => {
    const email          = event.params.email;
    const subscriberData = event.data.data();

    logger.info("New newsletter subscriber", { email });

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
      logger.warn("Mailchimp not configured — skipping sync");
      return;
    }

    const fullName   = (subscriberData.name ?? "").trim().split(" ");
    const firstName  = fullName[0] ?? "";
    const lastName   = fullName.slice(1).join(" ");

    try {
      await mailchimp.lists.setListMember(MAILCHIMP_AUDIENCE_ID, email, {
        email_address: email,
        status:        "subscribed",
        merge_fields:  { FNAME: firstName, LNAME: lastName },
        tags:          ["website-signup"],
      });
      logger.info("Synced subscriber to Mailchimp", { email });
    } catch (error) {
      logger.error("Failed to sync subscriber to Mailchimp", { email, error });
      if (error.status === 404) {
        try {
          await mailchimp.lists.addListMember(MAILCHIMP_AUDIENCE_ID, {
            email_address: email,
            status:        "subscribed",
            merge_fields:  { FNAME: firstName, LNAME: lastName },
            tags:          ["website-signup"],
          });
          logger.info("Added subscriber to Mailchimp (fallback)", { email });
        } catch (fallbackError) {
          logger.error("Fallback add also failed", { email, error: fallbackError });
        }
      }
    }
  }
);

// ── Welcome email on new user ─────────────────────────────────────────────────

exports.sendWelcomeEmail = onDocumentCreated(
  { document: "users/{uid}", secrets: ["SMTP_USER", "SMTP_PASS"] },
  async (event) => {
    const user = event.data.data();
    const { email, firstName } = user;

    if (!email) {
      logger.warn("sendWelcomeEmail: no email on user doc", { uid: event.params.uid });
      return;
    }

    logger.info("Sending welcome email", { email });

    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from:    FROM_ADDRESS(),
        to:      email,
        subject: `Welcome to Flourish Roots Hair${firstName ? `, ${firstName}` : ""}!`,
        html:    welcomeEmailHtml(firstName),
      });
      logger.info("Welcome email sent", { email });
    } catch (err) {
      logger.error("Failed to send welcome email", { email, err });
    }
  }
);

// ── Booking confirmation + owner notification ─────────────────────────────────

exports.onBookingCreated = onDocumentCreated(
  { document: "bookings/{bookingId}", secrets: ["SMTP_USER", "SMTP_PASS"] },
  async (event) => {
    const booking   = event.data.data();
    const bookingId = event.params.bookingId;

    logger.info("New booking received", {
      bookingId,
      userId:      booking.userId,
      userEmail:   booking.userEmail,
      services:    booking.servicesText,
      startTime:   booking.startTime,
      totalAmount: booking.totalAmount,
    });

    if (!booking.userEmail) {
      logger.warn("onBookingCreated: no userEmail on booking", { bookingId });
      return;
    }

    const transporter = createTransporter();

    // Send both emails concurrently
    const [clientResult, ownerResult] = await Promise.allSettled([
      transporter.sendMail({
        from:    FROM_ADDRESS(),
        to:      booking.userEmail,
        subject: "Your booking is confirmed — Flourish Roots Hair",
        html:    bookingConfirmationHtml(booking),
      }),
      transporter.sendMail({
        from:    FROM_ADDRESS(),
        to:      OWNER_EMAIL(),
        subject: `New booking: ${booking.userFirstName || booking.userEmail} — ${booking.servicesText || ""}`,
        html:    ownerNotificationHtml(booking),
      }),
    ]);

    if (clientResult.status === "fulfilled") {
      logger.info("Confirmation email sent to client", { to: booking.userEmail });
    } else {
      logger.error("Failed to send confirmation to client", { error: clientResult.reason });
    }

    if (ownerResult.status === "fulfilled") {
      logger.info("Notification email sent to owner");
    } else {
      logger.error("Failed to send owner notification", { error: ownerResult.reason });
    }
  }
);