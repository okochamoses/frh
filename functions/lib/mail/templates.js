const {watDate} = require("../time");

const DARK = "#120D07";
const GOLD = "#DDA15E";

/**
 * Formats a stored booking time in Lagos wall-clock.
 *
 * Goes through `watDate` rather than `new Date` so bookings written before the
 * UTC migration (naive "2026-08-21T10:00:00") render at the time the client
 * actually picked instead of an hour late.
 */
function formatWat(iso, options) {
    const d = watDate(iso);
    if (!d) return "\u2014";
    return d.toLocaleString("en-NG", {timeZone: "Africa/Lagos", ...options});
}

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
        <tr><td style="height:4px;background:${GOLD};"></td></tr>
        <tr><td style="background:${DARK};padding:28px 36px;text-align:center;">
          <p style="margin:0;color:${GOLD};font-size:22px;letter-spacing:0.04em;">Flourish Roots Hair</p>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.45);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-family:Arial,sans-serif;">Promoting Healthier Hair</p>
        </td></tr>
        <tr><td style="padding:36px 36px 28px;">
          ${content}
        </td></tr>
        <tr><td style="background:#fafaf8;padding:20px 36px;border-top:1px solid rgba(18,13,7,0.07);text-align:center;">
          <p style="margin:0;font-size:11px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;line-height:1.8;">
            Shop 303, Destiny Plaza, Ago Palace Way, Isolo Lagos<br/>
            <a href="mailto:flourishnaturalsinfo@gmail.com" style="color:rgba(18,13,7,0.4);text-decoration:none;">flourishnaturalsinfo@gmail.com</a>
            &nbsp;·&nbsp;
            <a href="https://instagram.com/frh_naturals" style="color:rgba(18,13,7,0.4);text-decoration:none;">@frh_naturals</a>
          </p>
        </td></tr>
        <tr><td style="height:3px;background:${GOLD};"></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const templates = {
    welcome({firstName}) {
        return {
            subject: `Welcome to Flourish Roots Hair${firstName ? `, ${firstName}` : ""}!`,
            html: emailShell(`
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
      `),
        };
    },

    bookingConfirmation({userFirstName, services = [], servicesText, startTime, totalAmount}) {
        const fmt = (iso) => formatWat(iso, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        const serviceRows = services.length
            ? services.map((s) => `
          <tr>
            <td style="padding:8px 0;font-size:14px;color:${DARK};font-family:Arial,sans-serif;border-bottom:1px solid rgba(18,13,7,0.07);">${s.title || "—"}</td>
            <td style="padding:8px 0;font-size:14px;color:${DARK};font-family:Arial,sans-serif;border-bottom:1px solid rgba(18,13,7,0.07);text-align:right;">₦${Number(s.price || 0).toLocaleString("en-NG")}</td>
          </tr>`).join("")
            : `<tr><td colspan="2" style="padding:8px 0;font-size:14px;color:rgba(18,13,7,0.6);font-family:Arial,sans-serif;">${servicesText || "—"}</td></tr>`;

        return {
            subject: "Your booking is confirmed",
            html: emailShell(`
        <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Booking Confirmed</p>
        <h1 style="margin:0 0 20px;font-size:24px;color:${DARK};line-height:1.2;">
          You're all booked, ${userFirstName || "Queen"}!
        </h1>
        <p style="margin:0 0 24px;font-size:15px;color:rgba(18,13,7,0.7);line-height:1.7;">
          We've received your appointment and we can't wait to see you. Here's a summary of your booking:
        </p>
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
      `),
        };
    },

    ownerNotification({userFirstName, userEmail, userMobileNumber, servicesText, startTime, totalAmount, completeUrl, completeReviewUrl}) {
        const fmt = (iso) => formatWat(iso, {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        const rows = [
            ["Client", userFirstName || "—"],
            ["Email", userEmail || "—"],
            ["Phone", userMobileNumber || "—"],
            ["Services", servicesText || "—"],
            ["Date", fmt(startTime)],
            ["Total", `₦${Number(totalAmount || 0).toLocaleString("en-NG")}`],
        ];

        const actionButtons = completeUrl ? `
      <p style="margin:24px 0 10px;font-size:11px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;letter-spacing:0.15em;text-transform:uppercase;">When service is done</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:8px;">
            <a href="${completeUrl}"
              style="display:block;background:${DARK};color:#ffffff;text-align:center;padding:13px 20px;border-radius:8px;font-size:13px;font-family:Arial,sans-serif;text-decoration:none;font-weight:600;letter-spacing:0.03em;">
              Mark as Complete
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="${completeReviewUrl}"
              style="display:block;background:${GOLD};color:${DARK};text-align:center;padding:13px 20px;border-radius:8px;font-size:13px;font-family:Arial,sans-serif;text-decoration:none;font-weight:600;letter-spacing:0.03em;">
              Mark Complete &amp; Ask for Review
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:10px 0 0;font-size:11px;color:rgba(18,13,7,0.35);font-family:Arial,sans-serif;text-align:center;">
        Each link can only be used once.
      </p>
    ` : "";

        return {
            subject: `New booking: ${userFirstName || userEmail} — ${servicesText || ""}`,
            html: emailShell(`
        <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">New Booking</p>
        <h1 style="margin:0 0 24px;font-size:22px;color:${DARK};line-height:1.2;">
          New appointment from ${userFirstName || "a client"}
        </h1>
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#fafaf8;border:1px solid rgba(18,13,7,0.08);border-radius:10px;margin-bottom:20px;">
          ${rows.map(([label, value], i) => `
            <tr><td style="padding:${i === 0 ? "16px" : "10px"} 20px ${i === rows.length - 1 ? "16px" : "4px"};">
              <p style="margin:0 0 2px;font-size:10px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;letter-spacing:0.15em;text-transform:uppercase;">${label}</p>
              <p style="margin:0;font-size:14px;color:${DARK};font-family:Arial,sans-serif;">${value}</p>
            </td></tr>
            ${i < rows.length - 1 ? `<tr><td style="height:1px;background:rgba(18,13,7,0.06);"></td></tr>` : ""}
          `).join("")}
        </table>
        ${actionButtons}
      `),
        };
    },

    adminDailyDigest({dateLabel, bookings = []}) {
        const time = (iso) => formatWat(iso, {hour: "2-digit", minute: "2-digit"});

        const total = bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

        const bookingCards = bookings.map((b) => `
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#fafaf8;border:1px solid rgba(18,13,7,0.08);border-radius:10px;margin-bottom:12px;">
        <tr><td style="padding:16px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:16px;color:${DARK};font-family:Arial,sans-serif;font-weight:700;">${time(b.startTime)}</td>
              <td style="font-size:14px;color:${DARK};font-family:Arial,sans-serif;text-align:right;">₦${Number(b.totalAmount || 0).toLocaleString("en-NG")}</td>
            </tr>
          </table>
          <p style="margin:8px 0 0;font-size:14px;color:${DARK};font-family:Arial,sans-serif;font-weight:600;">${b.userFirstName || b.userEmail || "Client"}</p>
          <p style="margin:2px 0 0;font-size:13px;color:rgba(18,13,7,0.6);font-family:Arial,sans-serif;">${b.servicesText || (b.services || []).map((s) => s.title).filter(Boolean).join(", ") || "—"}</p>
          <p style="margin:6px 0 0;font-size:12px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;">
            ${b.userMobileNumber || "no phone"} &nbsp;·&nbsp; ${b.userEmail || "no email"}
          </p>
        </td></tr>
      </table>`).join("");

        const emptyState = `
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#fafaf8;border:1px solid rgba(18,13,7,0.08);border-radius:10px;margin-bottom:12px;">
        <tr><td style="padding:20px;text-align:center;">
          <p style="margin:0;font-size:14px;color:rgba(18,13,7,0.55);font-family:Arial,sans-serif;">
            No appointments booked for tomorrow.
          </p>
        </td></tr>
      </table>`;

        const summary = bookings.length
            ? `${bookings.length} appointment${bookings.length === 1 ? "" : "s"} · ₦${total.toLocaleString("en-NG")} expected`
            : "Nothing on the books yet";

        return {
            subject: `Tomorrow (${dateLabel}): ${bookings.length} booking${bookings.length === 1 ? "" : "s"}`,
            html: emailShell(`
        <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Tomorrow's Schedule</p>
        <h1 style="margin:0 0 8px;font-size:22px;color:${DARK};line-height:1.2;">${dateLabel}</h1>
        <p style="margin:0 0 24px;font-size:14px;color:rgba(18,13,7,0.6);font-family:Arial,sans-serif;">${summary}</p>
        ${bookings.length ? bookingCards : emptyState}
        <p style="margin:20px 0 0;font-size:13px;color:rgba(18,13,7,0.45);line-height:1.7;font-family:Arial,sans-serif;">
          Times are West Africa Time. Each booking's "Mark as Complete" links are in its original booking email.
        </p>
      `),
        };
    },

    appointmentReminder({userFirstName, services = [], servicesText, startTime}) {
        const fmt = (iso) => formatWat(iso, {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
        });

        const serviceRows = services.length
            ? services.map((s) => `
          <tr>
            <td style="padding:7px 0;font-size:14px;color:${DARK};font-family:Arial,sans-serif;border-bottom:1px solid rgba(18,13,7,0.06);">${s.title || "—"}</td>
            <td style="padding:7px 0;font-size:13px;color:rgba(18,13,7,0.5);font-family:Arial,sans-serif;border-bottom:1px solid rgba(18,13,7,0.06);text-align:right;">${s.duration ? `${Math.floor(s.duration / 60) > 0 ? Math.floor(s.duration / 60) + "h " : ""}${s.duration % 60 > 0 ? s.duration % 60 + "m" : ""}`.trim() : ""}</td>
          </tr>`).join("")
            : `<tr><td colspan="2" style="padding:7px 0;font-size:14px;color:rgba(18,13,7,0.6);font-family:Arial,sans-serif;">${servicesText || "—"}</td></tr>`;

        return {
            subject: "Your appointment is in 1 hour 🌿",
            html: emailShell(`
        <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Reminder</p>
        <h1 style="margin:0 0 20px;font-size:24px;color:${DARK};line-height:1.2;">
          See you soon, ${userFirstName || "Queen"}!
        </h1>
        <p style="margin:0 0 24px;font-size:15px;color:rgba(18,13,7,0.7);line-height:1.7;">
          Just a reminder that your appointment at Flourish Roots Hair is coming up in about an hour.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#fafaf8;border:1px solid rgba(18,13,7,0.08);border-radius:10px;margin-bottom:24px;">
          <tr><td style="padding:16px 20px 12px;">
            <p style="margin:0 0 4px;font-size:10px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;letter-spacing:0.15em;text-transform:uppercase;">When</p>
            <p style="margin:0;font-size:15px;color:${DARK};font-family:Arial,sans-serif;font-weight:600;">${fmt(startTime)}</p>
          </td></tr>
          <tr><td style="height:1px;background:rgba(18,13,7,0.06);"></td></tr>
          <tr><td style="padding:12px 20px 16px;">
            <p style="margin:0 0 4px;font-size:10px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;letter-spacing:0.15em;text-transform:uppercase;">Where</p>
            <p style="margin:0;font-size:14px;color:${DARK};font-family:Arial,sans-serif;">Shop 303, Destiny Plaza, Ago Palace Way, Isolo Lagos</p>
          </td></tr>
          <tr><td style="height:1px;background:rgba(18,13,7,0.06);"></td></tr>
          <tr><td style="padding:12px 20px 16px;">
            <p style="margin:0 0 10px;font-size:10px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;letter-spacing:0.15em;text-transform:uppercase;">Services</p>
            <table width="100%" cellpadding="0" cellspacing="0">${serviceRows}</table>
          </td></tr>
        </table>
        <p style="margin:0;font-size:14px;color:rgba(18,13,7,0.55);line-height:1.7;font-family:Arial,sans-serif;">
          If you need to reschedule, please reply to this email as soon as possible.<br/>
          We look forward to seeing you 🌿<br/>
          <strong style="color:${DARK};">The FRH Team</strong>
        </p>
      `),
        };
    },

    serviceComplete({userFirstName}) {
        return {
            subject: "Thank you for visiting Flourish Roots Hair 🌿",
            html: emailShell(`
      <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Thank You</p>
      <h1 style="margin:0 0 20px;font-size:24px;color:${DARK};line-height:1.2;">
        It was wonderful having you, ${userFirstName || "Queen"}!
      </h1>
      <p style="margin:0 0 16px;font-size:15px;color:rgba(18,13,7,0.72);line-height:1.7;">
        We hope you're loving your hair. Thank you for trusting us with your natural hair journey — it means everything to us.
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:rgba(18,13,7,0.72);line-height:1.7;">
        Remember to keep up with your hair care routine and don't hesitate to reach out if you have any questions.
      </p>
      <p style="margin:0;font-size:14px;color:rgba(18,13,7,0.55);line-height:1.7;font-family:Arial,sans-serif;">
        See you next time 🌿<br/>
        <strong style="color:${DARK};">The FRH Team</strong>
      </p>
    `),
        };
    },

    serviceCompleteWithReview({userFirstName}) {
        return {
            subject: "Thank you for visiting — we'd love your feedback 🌿",
            html: emailShell(`
      <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Thank You</p>
      <h1 style="margin:0 0 20px;font-size:24px;color:${DARK};line-height:1.2;">
        It was wonderful having you, ${userFirstName || "Queen"}!
      </h1>
      <p style="margin:0 0 16px;font-size:15px;color:rgba(18,13,7,0.72);line-height:1.7;">
        We hope you're loving your hair. Thank you for trusting us with your natural hair journey.
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:rgba(18,13,7,0.72);line-height:1.7;">
        If you enjoyed your visit, we'd be so grateful if you took a moment to leave us a review — it helps other women find us and supports everything we do here at FRH.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="https://g.page/r/CUqz4MoAvNK0EAI/review"
          style="display:inline-block;background:${GOLD};color:${DARK};padding:14px 32px;border-radius:8px;font-size:14px;font-family:Arial,sans-serif;text-decoration:none;font-weight:700;letter-spacing:0.03em;">
          Leave a Review
        </a>
      </div>
      <p style="margin:0;font-size:14px;color:rgba(18,13,7,0.55);line-height:1.7;font-family:Arial,sans-serif;">
        See you next time 🌿<br/>
        <strong style="color:${DARK};">The FRH Team</strong>
      </p>
    `),
        };
    },

    passwordReset({firstName, resetLink, expiresIn = "1 hour"}) {
        return {
            subject: "Reset Your Password — Flourish Roots Hair",
            html: emailShell(`
        <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Password Reset</p>
        <h1 style="margin:0 0 20px;font-size:24px;color:${DARK};line-height:1.2;">Reset your password</h1>
        <p style="margin:0 0 20px;font-size:15px;color:rgba(18,13,7,0.72);line-height:1.7;">
          Hi ${firstName || "there"},<br/><br/>
          We received a request to reset your password. Click below to create a new one:
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${resetLink}"
            style="display:inline-block;background:${DARK};color:#ffffff;padding:14px 28px;border-radius:8px;font-size:14px;font-family:Arial,sans-serif;text-decoration:none;font-weight:600;letter-spacing:0.03em;">
            Reset Password
          </a>
        </div>
        <p style="margin:0;font-size:13px;color:rgba(18,13,7,0.45);line-height:1.7;font-family:Arial,sans-serif;">
          This link expires in ${expiresIn}. If you didn't request this, you can safely ignore it.
        </p>
      `),
        };
    },

    newsletterWelcome({firstName}) {
        return {
            subject: "You're in! Welcome to the Flourish Roots family 🌿",
            html: emailShell(`
        <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Newsletter</p>
        <h1 style="margin:0 0 20px;font-size:26px;color:${DARK};line-height:1.2;">
          Hi ${firstName || "Queen"}, you're officially in!
        </h1>

        <p style="margin:0 0 16px;font-size:15px;color:rgba(18,13,7,0.72);line-height:1.7;">
          Welcome to the Flourish Roots community. Every month we'll share what's flourishing at the studio —
          expert hair care tips, first access to new bookings, exclusive perks, and the latest in braids,
          twists, and natural styling.
        </p>

        <p style="margin:0 0 28px;font-size:15px;color:rgba(18,13,7,0.72);line-height:1.7;">
          Your inbox is about to get a little more beautiful.
        </p>

        <!-- What to expect -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td style="padding:16px;background:#fafaf8;border:1px solid rgba(18,13,7,0.07);border-radius:8px;vertical-align:top;width:50%;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${DARK};font-family:Arial,sans-serif;">Expert hair care tips</p>
              <p style="margin:0;font-size:13px;color:rgba(18,13,7,0.6);font-family:Arial,sans-serif;line-height:1.6;">Professional advice on moisture retention, growth, and maintenance.</p>
            </td>
            <td style="width:12px;"></td>
            <td style="padding:16px;background:#fafaf8;border:1px solid rgba(18,13,7,0.07);border-radius:8px;vertical-align:top;width:50%;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${DARK};font-family:Arial,sans-serif;">First access to bookings</p>
              <p style="margin:0;font-size:13px;color:rgba(18,13,7,0.6);font-family:Arial,sans-serif;line-height:1.6;">Be the first to know about new service openings and booking slots.</p>
            </td>
          </tr>
          <tr><td colspan="3" style="height:12px;"></td></tr>
          <tr>
            <td style="padding:16px;background:#fafaf8;border:1px solid rgba(18,13,7,0.07);border-radius:8px;vertical-align:top;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${DARK};font-family:Arial,sans-serif;">Exclusive perks</p>
              <p style="margin:0;font-size:13px;color:rgba(18,13,7,0.6);font-family:Arial,sans-serif;line-height:1.6;">Subscribers-only discounts and special offers on our favourite treatments.</p>
            </td>
            <td style="width:12px;"></td>
            <td style="padding:16px;background:#fafaf8;border:1px solid rgba(18,13,7,0.07);border-radius:8px;vertical-align:top;">
              <p style="margin:0;font-size:13px;font-style:italic;color:rgba(18,13,7,0.55);font-family:Arial,sans-serif;line-height:1.6;">"Literally one of the best natural hair salons I've visited. They handled my hair with such care."</p>
              <p style="margin:8px 0 0;font-size:12px;color:rgba(18,13,7,0.35);font-family:Arial,sans-serif;">— Happy client</p>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
          <tr>
            <td style="padding-bottom:12px;">
              <a href="https://flourishrootshair.com/bookings"
                style="display:block;background:${DARK};color:#ffffff;text-align:center;padding:14px 20px;border-radius:8px;font-size:14px;font-family:Arial,sans-serif;text-decoration:none;font-weight:600;letter-spacing:0.03em;">
                Book your next appointment
              </a>
            </td>
          </tr>
          <tr>
            <td>
              <a href="https://instagram.com/frh_naturals"
                style="display:block;background:${GOLD};color:${DARK};text-align:center;padding:14px 20px;border-radius:8px;font-size:14px;font-family:Arial,sans-serif;text-decoration:none;font-weight:600;letter-spacing:0.03em;">
                Follow us on Instagram
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:0;font-size:13px;color:rgba(18,13,7,0.45);line-height:1.7;font-family:Arial,sans-serif;">
          Thank you for letting us be a part of your hair journey. We can't wait to help your hair thrive.<br/><br/>
          Stay beautiful,<br/>
          <strong style="color:${DARK};">The Flourish Roots Team</strong>
        </p>
      `),
        };
    },

    bookingCancelled({userFirstName, servicesText, startTime}) {
        const fmt = (iso) => formatWat(iso, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        return {
            subject: "Your appointment has been cancelled",
            html: emailShell(`
        <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Cancelled</p>
        <h1 style="margin:0 0 20px;font-size:24px;color:${DARK};line-height:1.2;">
          Your appointment is cancelled, ${userFirstName || "Queen"}
        </h1>
        <p style="margin:0 0 24px;font-size:15px;color:rgba(18,13,7,0.7);line-height:1.7;">
          We've cancelled the appointment below. Nothing further is needed from you.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#fafaf8;border:1px solid rgba(18,13,7,0.08);border-radius:10px;margin-bottom:24px;">
          <tr><td style="padding:20px;">
            <p style="margin:0 0 4px;font-size:11px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;letter-spacing:0.15em;text-transform:uppercase;">Was booked for</p>
            <p style="margin:0 0 14px;font-size:15px;color:${DARK};font-family:Arial,sans-serif;font-weight:600;text-decoration:line-through;">${fmt(startTime)}</p>
            <p style="margin:0 0 4px;font-size:11px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;letter-spacing:0.15em;text-transform:uppercase;">Services</p>
            <p style="margin:0;font-size:14px;color:rgba(18,13,7,0.7);font-family:Arial,sans-serif;">${servicesText || "—"}</p>
          </td></tr>
        </table>
        <p style="margin:0 0 24px;font-size:14px;color:rgba(18,13,7,0.6);line-height:1.7;font-family:Arial,sans-serif;">
          Changed your mind? You can book again any time from our website, or just reply to this email and we'll find you a slot.
        </p>
        <p style="margin:0;font-size:14px;color:rgba(18,13,7,0.55);line-height:1.7;font-family:Arial,sans-serif;">
          Hope to see you soon 🌿<br/>
          <strong style="color:${DARK};">The FRH Team</strong>
        </p>
      `),
        };
    },

    bookingRescheduled({userFirstName, servicesText, previousStartTime, startTime}) {
        const fmt = (iso) => formatWat(iso, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        return {
            subject: "Your appointment has been moved",
            html: emailShell(`
        <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Rescheduled</p>
        <h1 style="margin:0 0 20px;font-size:24px;color:${DARK};line-height:1.2;">
          All set, ${userFirstName || "Queen"} — your new time is confirmed
        </h1>
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#fafaf8;border:1px solid rgba(18,13,7,0.08);border-radius:10px;margin-bottom:24px;">
          <tr><td style="padding:20px 20px 4px;">
            <p style="margin:0 0 4px;font-size:11px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;letter-spacing:0.15em;text-transform:uppercase;">Previously</p>
            <p style="margin:0;font-size:14px;color:rgba(18,13,7,0.5);font-family:Arial,sans-serif;text-decoration:line-through;">${fmt(previousStartTime)}</p>
          </td></tr>
          <tr><td style="padding:12px 20px 20px;border-top:1px solid rgba(18,13,7,0.06);">
            <p style="margin:0 0 4px;font-size:11px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;letter-spacing:0.15em;text-transform:uppercase;">New date &amp; time</p>
            <p style="margin:0 0 14px;font-size:16px;color:${DARK};font-family:Arial,sans-serif;font-weight:700;">${fmt(startTime)}</p>
            <p style="margin:0 0 4px;font-size:11px;color:rgba(18,13,7,0.4);font-family:Arial,sans-serif;letter-spacing:0.15em;text-transform:uppercase;">Services</p>
            <p style="margin:0;font-size:14px;color:rgba(18,13,7,0.7);font-family:Arial,sans-serif;">${servicesText || "—"}</p>
          </td></tr>
        </table>
        <p style="margin:0 0 24px;font-size:14px;color:rgba(18,13,7,0.6);line-height:1.7;font-family:Arial,sans-serif;">
          Shop 303, Destiny Plaza, Ago Palace Way, Isolo Lagos. Need to change it again? You can do that from your appointments page.
        </p>
        <p style="margin:0;font-size:14px;color:rgba(18,13,7,0.55);line-height:1.7;font-family:Arial,sans-serif;">
          See you then 🌿<br/>
          <strong style="color:${DARK};">The FRH Team</strong>
        </p>
      `),
        };
    },

    ownerBookingChanged({change, userFirstName, userEmail, userMobileNumber, servicesText, previousStartTime, startTime, totalAmount}) {
        const fmt = (iso) => formatWat(iso, {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        const cancelled = change === "cancelled";

        const rows = [
            ["Client", userFirstName || "—"],
            ["Email", userEmail || "—"],
            ["Phone", userMobileNumber || "—"],
            ["Services", servicesText || "—"],
            cancelled ?
                ["Was booked for", fmt(previousStartTime || startTime)] :
                ["Was booked for", fmt(previousStartTime)],
            ...(cancelled ? [] : [["Now booked for", fmt(startTime)]]),
            ["Total", `₦${Number(totalAmount || 0).toLocaleString("en-NG")}`],
        ];

        const rowHtml = rows.map(([label, value]) => `
          <tr>
            <td style="padding:9px 0;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;border-bottom:1px solid rgba(18,13,7,0.06);white-space:nowrap;">${label}</td>
            <td style="padding:9px 0 9px 16px;font-size:14px;color:${DARK};font-family:Arial,sans-serif;border-bottom:1px solid rgba(18,13,7,0.06);text-align:right;">${value}</td>
          </tr>`).join("");

        return {
            subject: cancelled ?
                `Cancelled: ${userFirstName || userEmail} — ${servicesText || ""}` :
                `Moved: ${userFirstName || userEmail} — ${servicesText || ""}`,
            html: emailShell(`
        <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">${cancelled ? "Cancellation" : "Reschedule"}</p>
        <h1 style="margin:0 0 20px;font-size:24px;color:${DARK};line-height:1.2;">
          ${userFirstName || "A client"} ${cancelled ? "cancelled an appointment" : "moved an appointment"}
        </h1>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          ${rowHtml}
        </table>
        <p style="margin:0;font-size:13px;color:rgba(18,13,7,0.45);line-height:1.7;font-family:Arial,sans-serif;">
          ${cancelled ? "The slot is free again — no action needed." : "Your daily digest will reflect the new time."}
        </p>
      `),
        };
    }
};

module.exports = {templates};