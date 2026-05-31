const DARK = "#120D07";
const GOLD = "#DDA15E";
const RED  = "#BD2E2E";

const MAPS_URL = "https://maps.google.com/?q=FRH+-+Flourish+Roots+Hair.Co";
const STUDIO   = "Shop 303, Destiny Plaza, Ago Palace Way, Isolo, Lagos";


function gcalUrl({ startIso, durationMins = 120, servicesText }) {
  const start = new Date(startIso);
  const end   = new Date(start.getTime() + durationMins * 60000);
  const fmt   = (d) => d.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  return (
    "https://calendar.google.com/calendar/r/eventedit" +
    "?text=FRH+Appointment" +
    `&dates=${fmt(start)}/${fmt(end)}` +
    `&location=${encodeURIComponent(STUDIO)}` +
    `&details=${encodeURIComponent(servicesText || "Hair appointment at Flourish Roots Hair")}`
  );
}

function bookingShell({ preheader, heroLabel, heroHeading, heroSubtitle, body }) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
    img{-ms-interpolation-mode:bicubic;border:0;line-height:100%;outline:none;text-decoration:none}
    body{margin:0!important;padding:0!important;width:100%!important}
    a{text-decoration:none}
    @media screen and (max-width:480px){
      .container{width:100%!important}
      .px{padding-left:26px!important;padding-right:26px!important}
      .hero-h1{font-size:26px!important}
    }
    :root{color-scheme:light;supported-color-schemes:light}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#e7e4dc;">

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#e7e4dc;opacity:0;">
  ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e7e4dc;">
<tr><td align="center" style="padding:26px 12px;">

  <table role="presentation" class="container" width="480" cellpadding="0" cellspacing="0" border="0"
    style="width:480px;max-width:480px;background-color:#f5f5f0;border-radius:14px;overflow:hidden;border:1px solid #e3e0d6;">

    <!-- HERO -->
    <tr><td class="px" align="center" style="padding:52px 38px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a07d4e;">${heroLabel}</td></tr>
        <tr><td height="18" style="font-size:0;line-height:18px;">&nbsp;</td></tr>
        <tr><td align="center" class="hero-h1" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:29px;font-weight:bold;line-height:1.25;color:${DARK};">${heroHeading}</td></tr>
        <tr><td height="16" style="font-size:0;line-height:16px;">&nbsp;</td></tr>
        <tr><td align="center" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#6a6052;">${heroSubtitle}</td></tr>
        <tr><td height="34" style="font-size:0;line-height:34px;">&nbsp;</td></tr>
        <tr><td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="font-size:0;line-height:0;width:44px;height:3px;background-color:${GOLD};">&nbsp;</td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>

    <!-- BODY -->
    <tr><td class="px" style="padding:40px 38px 0;">
      ${body}
    </td></tr>

    <!-- FOOTER -->
    <tr><td class="px" align="center" style="background-color:${DARK};padding:32px 38px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;font-weight:bold;letter-spacing:8px;color:${GOLD};">FRH</td></tr>
        <tr><td height="14" style="font-size:0;line-height:14px;">&nbsp;</td></tr>
        <tr><td align="center" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:${GOLD};">
          <a href="https://instagram.com/frh_naturals" style="color:${GOLD};text-decoration:none;">Instagram</a>&nbsp;&middot;&nbsp;<a href="#" style="color:${GOLD};text-decoration:none;">TikTok</a>&nbsp;&middot;&nbsp;<a href="#" style="color:${GOLD};text-decoration:none;">WhatsApp</a>
        </td></tr>
        <tr><td height="16" style="font-size:0;line-height:16px;">&nbsp;</td></tr>
        <tr><td align="center" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;line-height:1.8;color:#8a7657;">
          Shop 303, Destiny Plaza, Ago Palace Way, Isolo, Lagos<br>
          You booked with FRH &middot; <a href="#" style="color:#8a7657;text-decoration:underline;">Unsubscribe</a>
        </td></tr>
      </table>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
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

export const templates = {
  welcome: ({ firstName }) => ({
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
              Book a Salon Visit
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://flourishrootshair.com/consultation"
              style="display:block;background:${GOLD};color:${DARK};text-align:center;padding:14px 20px;border-radius:8px;font-size:14px;font-family:Arial,sans-serif;text-decoration:none;font-weight:600;letter-spacing:0.03em;">
              Book a Hair Consultation
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:rgba(18,13,7,0.45);line-height:1.7;font-family:Arial,sans-serif;">
        Have questions? Just reply to this email — we're always happy to help.
      </p>
    `),
  }),

  bookingConfirmation: ({ userFirstName, services = [], servicesText, startTime, totalAmount }) => {
    const fmt = (iso) => {
      if (!iso) return "—";
      return new Date(iso).toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const totalDuration = services.reduce((sum, s) => sum + (s.duration || 0), 0);
    const calUrl = startTime
      ? gcalUrl({
          startIso: startTime,
          durationMins: totalDuration || 120,
          servicesText: services.map((s) => s.title).join(", ") || servicesText,
        })
      : "#";

    const serviceRows = services.length
      ? services.map((s) => `
          <tr>
            <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:${DARK};padding:8px 0;">${s.title || "—"}</td>
            <td align="right" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:${DARK};padding:8px 0;">&#8358;${Number(s.price || 0).toLocaleString("en-NG")}</td>
          </tr>`).join("")
      : `<tr><td colspan="2" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:#6a6052;padding:8px 0;">${servicesText || "—"}</td></tr>`;

    return {
      subject: "Your booking is confirmed",
      html: bookingShell({
        preheader: `Your appointment is confirmed — ${fmt(startTime)}.`,
        heroLabel: "Booking confirmed",
        heroHeading: `You&rsquo;re all set, ${userFirstName || "Queen"}`,
        heroSubtitle: "We&rsquo;ve reserved your place and we can&rsquo;t wait to have you in the chair.",
        body: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7d68;">Date &amp; time</td></tr>
            <tr><td height="7" style="font-size:0;line-height:7px;">&nbsp;</td></tr>
            <tr><td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:${DARK};">${fmt(startTime)}</td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="30" style="font-size:0;line-height:30px;">&nbsp;</td></tr></table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7d68;">The studio</td></tr>
            <tr><td height="7" style="font-size:0;line-height:7px;">&nbsp;</td></tr>
            <tr><td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:${DARK};">Shop 303, Destiny Plaza, Ago Palace Way, Isolo, Lagos</td></tr>
            <tr><td height="8" style="font-size:0;line-height:8px;">&nbsp;</td></tr>
            <tr><td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;"><a href="${MAPS_URL}" style="color:${RED};text-decoration:none;">View on map &rarr;</a></td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="36" style="font-size:0;line-height:36px;">&nbsp;</td></tr></table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e3e0d6;">
            <tr><td height="28" style="font-size:0;line-height:28px;">&nbsp;</td></tr>
            ${serviceRows}
            <tr><td colspan="2" style="border-top:1px solid #e3e0d6;font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr>
              <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;color:${DARK};padding:14px 0 0;">Total</td>
              <td align="right" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;color:${DARK};padding:14px 0 0;">&#8358;${Number(totalAmount || 0).toLocaleString("en-NG")}</td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td height="12" style="font-size:0;line-height:12px;">&nbsp;</td></tr>
            <tr><td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;color:#8a7d68;">Approximately two hours &middot; please arrive a few minutes early.</td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="38" style="font-size:0;line-height:38px;">&nbsp;</td></tr></table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center">
              <a href="${calUrl}" style="display:inline-block;background-color:${RED};color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1px;text-decoration:none;padding:15px 46px;border-radius:30px;">ADD TO CALENDAR</a>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="34" style="font-size:0;line-height:34px;">&nbsp;</td></tr></table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.65;color:#6a6052;">Need to reschedule? Reply to this email or WhatsApp <span style="color:${DARK};">+234&nbsp;800&nbsp;000&nbsp;0000</span>.<br>We ask for 24&nbsp;hours&rsquo; notice where possible.</td></tr>
            <tr><td height="48" style="font-size:0;line-height:48px;">&nbsp;</td></tr>
          </table>
        `,
      }),
    };
  },

  ownerNotification: ({ userFirstName, userEmail, userMobileNumber, servicesText, startTime, totalAmount, completeUrl, completeReviewUrl }) => {
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

    const rows = [
      ["Client",   userFirstName || "—"],
      ["Email",    userEmail || "—"],
      ["Phone",    userMobileNumber || "—"],
      ["Services", servicesText || "—"],
      ["Date",     fmt(startTime)],
      ["Total",    `₦${Number(totalAmount || 0).toLocaleString("en-NG")}`],
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

  appointmentReminder: ({ userFirstName, services = [], servicesText, startTime }) => {
    const fmt = (iso) => {
      if (!iso) return "—";
      return new Date(iso).toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const durStr = (mins) => {
      if (!mins) return "";
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m" : ""}`.trim();
    };

    const serviceRows = services.length
      ? services.map((s) => `
          <tr>
            <td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:${DARK};padding:8px 0;">${s.title || "—"}</td>
            <td align="right" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:#8a7d68;padding:8px 0;white-space:nowrap;">${durStr(s.duration)}</td>
          </tr>`).join("")
      : `<tr><td colspan="2" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:#6a6052;padding:8px 0;">${servicesText || "—"}</td></tr>`;

    return {
      subject: "Your appointment is in 1 hour",
      html: bookingShell({
        preheader: `Heads up — your FRH appointment is in one hour. ${fmt(startTime)}.`,
        heroLabel: "Reminder",
        heroHeading: `See you in an hour, ${userFirstName || "Queen"}`,
        heroSubtitle: "Your appointment is coming up &mdash; we&rsquo;re ready and looking forward to it.",
        body: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7d68;">Date &amp; time</td></tr>
            <tr><td height="7" style="font-size:0;line-height:7px;">&nbsp;</td></tr>
            <tr><td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:${DARK};">${fmt(startTime)}</td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="30" style="font-size:0;line-height:30px;">&nbsp;</td></tr></table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7d68;">The studio</td></tr>
            <tr><td height="7" style="font-size:0;line-height:7px;">&nbsp;</td></tr>
            <tr><td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:${DARK};">Shop 303, Destiny Plaza, Ago Palace Way, Isolo, Lagos</td></tr>
            <tr><td height="8" style="font-size:0;line-height:8px;">&nbsp;</td></tr>
            <tr><td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;"><a href="${MAPS_URL}" style="color:${RED};text-decoration:none;">View on map &rarr;</a></td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="36" style="font-size:0;line-height:36px;">&nbsp;</td></tr></table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e3e0d6;">
            <tr><td height="28" style="font-size:0;line-height:28px;">&nbsp;</td></tr>
            ${serviceRows}
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td height="12" style="font-size:0;line-height:12px;">&nbsp;</td></tr>
            <tr><td style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;color:#8a7d68;">Approximately two hours &middot; please arrive a few minutes early.</td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="38" style="font-size:0;line-height:38px;">&nbsp;</td></tr></table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center">
              <a href="${MAPS_URL}" style="display:inline-block;background-color:${RED};color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1px;text-decoration:none;padding:15px 46px;border-radius:30px;">GET DIRECTIONS</a>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="34" style="font-size:0;line-height:34px;">&nbsp;</td></tr></table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.65;color:#6a6052;">Need to reschedule? Reply to this email or WhatsApp <span style="color:${DARK};">+234&nbsp;800&nbsp;000&nbsp;0000</span>.<br>We ask for as much notice as possible.</td></tr>
            <tr><td height="48" style="font-size:0;line-height:48px;">&nbsp;</td></tr>
          </table>
        `,
      }),
    };
  },

  serviceComplete: ({ userFirstName }) => ({
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
  }),

  serviceCompleteWithReview: ({ userFirstName }) => ({
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
  }),

  passwordReset: ({ firstName, resetLink, expiresIn = "1 hour" }) => ({
    subject: "Reset Your Password",
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
  }),

  notification: ({ firstName, title, message, actionLink, actionText }) => ({
    subject: title,
    html: emailShell(`
      <p style="margin:0 0 6px;font-size:13px;color:rgba(18,13,7,0.45);font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Notification</p>
      <h1 style="margin:0 0 20px;font-size:24px;color:${DARK};line-height:1.2;">${title}</h1>
      <p style="margin:0 0 20px;font-size:15px;color:rgba(18,13,7,0.72);line-height:1.7;">
        Hi ${firstName || "there"},<br/><br/>
        ${message}
      </p>
      ${actionLink ? `
        <div style="text-align:center;margin:28px 0;">
          <a href="${actionLink}"
            style="display:inline-block;background:${DARK};color:#ffffff;padding:14px 28px;border-radius:8px;font-size:14px;font-family:Arial,sans-serif;text-decoration:none;font-weight:600;letter-spacing:0.03em;">
            ${actionText || "View Details"}
          </a>
        </div>
      ` : ""}
    `),
  }),
};