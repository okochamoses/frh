const {watDate} = require("../time");

/* ═══ FRH transactional mail ═══════════════════════════════════════════════
   Built to the V2 direction (`src/app/v2`, `docs/design-v2/DESIGN.md`), not to
   the conventions of a transactional email.

   The homepage is a stack of full-bleed bands — a Glow opening, a white middle,
   the single Mustard call to action, an Obsidian footer with the wordmark set
   large at its foot. These messages are built the same way: bands edge to edge,
   a 600px column inside them, the same voice at each end. There is no rounded
   white card floating on a grey ground, because no such object exists anywhere
   on the site.

   The rules carried over from the design system:
     · Fixture (#1a1a1a) is the only black — never #000000.
     · Mustard is the one saturated hue, spent on booking actions only. A
       message gets at most one Mustard band, and it is always the last thing
       before the footer.
     · Slat marks and rules; it never carries text on a light ground. Slat Ink
       does, and Slat is text-safe on Obsidian (4.91:1).
     · No shadows, and almost no fills. Structure here is hairlines and space,
       which is what the site uses. */

const INK = "#1a1a1a"; // Fixture
const OBSIDIAN = "#2b211a"; // Espresso — the footer band
const GLOW = "#f3e3cc"; // the opening band
const MUSTARD = "#fbb91c"; // booking actions only
const MUSTARD_RULE = "#d9a016"; // ink-over-mustard, flattened for old clients
const SLAT = "#c08250";
const SLAT_INK = "#8b5e34";
const WALL = "#f8f5ef";
const LINEN = "#f1ece4";
const LINE = "#e6ddd1";
const MUTED = "#6b665f";
const ASH = "#736a5e";

/* ── Faces ────────────────────────────────────────────────────────────────────
   Icarus Nocturne, the brand display face, is a local .ttf with no hosted
   counterpart — and a display webfont that fails to arrive takes the whole
   headline's character with it. The site's second display voice is the one that
   travels: Barlow Condensed, bold, uppercase, tracked — the footer's "Roots.
   Ritual. Radiance." and every eyebrow on the page. That voice carries the
   headlines here, and it degrades honestly, because Helvetica Condensed and
   Arial Narrow are the same kind of letter.

   Manrope, Barlow and Barlow Condensed are linked from Google Fonts as a
   progressive enhancement — Apple Mail and the iOS clients take them, Gmail
   drops the link. Every inline style names the whole stack, so nothing depends
   on the link arriving. */
const DISPLAY = "'Barlow Condensed', 'Helvetica Neue Condensed', 'Arial Narrow', Helvetica, Arial, sans-serif";
const BODY = "'Manrope', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const PARAGRAPH = "'Barlow', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const SALON_ADDRESS = "Shop 303, Destiny Plaza, Ago Palace Way, Isolo Lagos";
const HOURS = "Tue to Sun, by appointment";
const PHONE = "0811 021 5014";
const PHONE_TEL = "+2348110215014";
const MAIL = "flourishnaturalsinfo@gmail.com";
const SITE = "https://flourishrootshair.com";

/**
 * Formats a stored booking time in Lagos wall-clock.
 *
 * Goes through `watDate` rather than `new Date` so bookings written before the
 * UTC migration (naive "2026-08-21T10:00:00") render at the time the client
 * actually picked instead of an hour late.
 */
function formatWat(iso, options) {
    const d = watDate(iso);
    if (!d) return "–";
    return d.toLocaleString("en-NG", {timeZone: "Africa/Lagos", ...options});
}

/** The day, spelled out: "Saturday, 19 September 2026". */
function watDay(iso) {
    return formatWat(iso, {weekday: "long", day: "numeric", month: "long", year: "numeric"});
}

/** The clock alone, 24h so it sets evenly in display type: "11:00". */
function watTime(iso) {
    return formatWat(iso, {hour: "2-digit", minute: "2-digit", hour12: false});
}

/** Short form for the salon's own inbox: "Sat, 19 Sept, 11:00". */
function watShort(iso) {
    return formatWat(iso, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

/**
 * Escapes a value for interpolation into an email's HTML.
 *
 * Some of what these templates print is typed by the person booking — their
 * name, and the note they leave with the booking — and lands in the salon's
 * inbox. Without this, a note containing markup would be rendered as markup
 * there rather than read as the sentence the client wrote.
 */
function esc(value) {
    if (value === undefined || value === null) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/** The same, with the client's line breaks kept. */
function escMultiline(value) {
    return esc(value).replace(/\n/g, "<br/>");
}

/** Naira, grouped, from whatever the caller happens to hold. */
function naira(amount) {
    return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

/** "2h 30m" from a service's stored minutes. */
function duration(minutes) {
    const m = Number(minutes || 0);
    if (!m) return "";
    const h = Math.floor(m / 60);
    const rest = m % 60;
    return [h ? `${h}h` : "", rest ? `${rest}m` : ""].filter(Boolean).join(" ");
}

/* ── Bands ────────────────────────────────────────────────────────────────────
   Each band is a full-width table painting one colour, with the 600px column
   centred inside it. Stacking bands is the only layout move in this file. */

function band(content, {bg = "#ffffff", padding = "44px 40px"} = {}) {
    return `
    <tr>
      <td align="center" bgcolor="${bg}" style="background:${bg};">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:600px;">
          <tr><td class="frh-pad" style="padding:${padding};">${content}</td></tr>
        </table>
      </td>
    </tr>`;
}

/* ── Type ─────────────────────────────────────────────────────────────────── */

/** Uppercase kicker. Condensed caps knit together, so the tracking goes back. */
function eyebrow(text, {color = SLAT_INK, margin = "0 0 16px"} = {}) {
    return `<p style="margin:${margin};font-family:${DISPLAY};font-size:13px;font-weight:600;line-height:1.2;letter-spacing:0.22em;text-transform:uppercase;color:${color};">${esc(text)}</p>`;
}

/**
 * The message's headline: condensed, bold, uppercase, set tight and large —
 * the site's display voice at the scale the hero uses it.
 */
function headline(text, {size = 42, color = INK, margin = "0"} = {}) {
    return `<h1 class="frh-h1" style="margin:${margin};font-family:${DISPLAY};font-size:${size}px;font-weight:700;line-height:0.98;letter-spacing:0.005em;text-transform:uppercase;color:${color};">${text}</h1>`;
}

/** Body copy. Barlow, generously leaded, left-aligned per the type rules. */
function para(html, {size = 16, color = MUTED, margin = "0 0 18px"} = {}) {
    return `<p style="margin:${margin};font-family:${PARAGRAPH};font-size:${size}px;line-height:1.65;color:${color};">${html}</p>`;
}

/** Small print — expiry notices, "times are WAT", one-use link warnings. */
function fine(html, {align = "left", margin = "0", color = ASH} = {}) {
    return `<p style="margin:${margin};font-family:${BODY};font-size:13px;line-height:1.6;color:${color};text-align:${align};">${html}</p>`;
}

/** A hairline. The main structural device in the whole system. */
function rule({color = LINE, margin = "26px 0"} = {}) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:${margin};"><tr><td style="height:1px;background:${color};line-height:1px;font-size:0;">&nbsp;</td></tr></table>`;
}

/* ── Components ───────────────────────────────────────────────────────────── */

/**
 * The letterhead: wordmark left, where the salon is right. It sits on the
 * opening band's own colour, the way the site's nav sits on the hero rather
 * than in a bar of its own.
 */
function letterhead() {
    return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 40px;">
      <tr>
        <td style="font-family:${DISPLAY};font-size:15px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${INK};">Flourish Roots Hair</td>
        <td align="right" class="frh-hide" style="font-family:${DISPLAY};font-size:13px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${SLAT_INK};">Isolo, Lagos</td>
      </tr>
    </table>`;
}

/**
 * The opening band: letterhead, kicker, headline, one line of lede.
 *
 * Glow by default — the colour the site opens on. The salon's own copies open
 * on Linen instead: they are working documents, and spending the warm band on
 * them would make every internal notice look like an announcement.
 */
function hero({kicker, title, lede, bg = GLOW}) {
    return band(`
      ${letterhead()}
      ${eyebrow(kicker, {color: bg === GLOW ? SLAT_INK : ASH})}
      ${headline(title)}
      ${lede ? para(lede, {size: 17, color: INK, margin: "22px 0 0"}) : ""}
    `, {bg, padding: "36px 40px 44px"});
}

/**
 * The one fact the message exists to deliver, set at headline scale between two
 * hairlines. It replaces the tinted box a transactional email would reach for:
 * on a page with no cards, weight and space do that job better than a fill.
 */
function moment({label, value, sub, strike = false}) {
    return `
      ${rule({margin: "0 0 22px"})}
      ${eyebrow(label, {color: ASH, margin: "0 0 12px"})}
      <p style="margin:0;font-family:${DISPLAY};font-size:34px;font-weight:700;line-height:1.02;letter-spacing:0.005em;text-transform:uppercase;color:${INK};${strike ? "text-decoration:line-through;" : ""}">${esc(value)}</p>
      ${sub ? `<p style="margin:12px 0 0;font-family:${BODY};font-size:15px;line-height:1.55;color:${MUTED};">${sub}</p>` : ""}
      ${rule({margin: "22px 0 0"})}`;
}

/**
 * Facts as ruled rows: label in the left third, value in the right two thirds,
 * a hairline under each. Reads as a specimen sheet rather than a receipt, and
 * on a phone the two columns stack instead of colliding.
 */
function rows(entries, {margin = "0"} = {}) {
    const body = entries.filter(Boolean).map(([label, value, opts = {}]) => `
      <tr>
        <td class="frh-cell frh-cell-label" width="34%" valign="top" style="padding:14px 16px 14px 0;border-bottom:1px solid ${LINE};font-family:${DISPLAY};font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${ASH};">${esc(label)}</td>
        <td class="frh-cell" valign="top" style="padding:14px 0;border-bottom:1px solid ${LINE};font-family:${BODY};font-size:15px;line-height:1.55;color:${INK};${opts.strike ? `text-decoration:line-through;color:${MUTED};` : ""}">${value}</td>
      </tr>`).join("");

    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:${margin};border-top:1px solid ${LINE};">${body}</table>`;
}

/**
 * The services, priced or timed, with the total set in display type — it is the
 * one number the reader checks, so it is the one number that is large.
 */
function items(entries, {total} = {}) {
    const body = entries.map(([left, right]) => `
      <tr>
        <td valign="top" style="padding:14px 16px 14px 0;border-bottom:1px solid ${LINE};font-family:${BODY};font-size:15px;line-height:1.5;color:${INK};">${left}</td>
        <td valign="top" align="right" style="padding:14px 0;border-bottom:1px solid ${LINE};font-family:${BODY};font-size:14px;line-height:1.5;color:${MUTED};white-space:nowrap;">${right}</td>
      </tr>`).join("");

    const sum = total === undefined ? "" : `
      <tr>
        <td style="padding:18px 16px 0 0;font-family:${DISPLAY};font-size:13px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:${ASH};">Total</td>
        <td align="right" style="padding:18px 0 0;font-family:${DISPLAY};font-size:26px;font-weight:700;line-height:1;color:${INK};white-space:nowrap;">${esc(total)}</td>
      </tr>`;

    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${LINE};">${body}${sum}</table>`;
}

const PILL_SKINS = {
    book: {bg: MUSTARD, fg: INK, border: MUSTARD},
    ink: {bg: INK, fg: "#ffffff", border: INK},
    quiet: {bg: "transparent", fg: INK, border: "#c9bfb1"},
};

/**
 * A pill button, the site's own control.
 *
 * `book` is Mustard and belongs to booking actions only — on the Mustard band
 * it would vanish, so that band's own button is `ink`. `quiet` is the outlined
 * tertiary. The anchor carries the padding so the whole pill is clickable, and
 * the arrow is the site's, drawn as a character rather than an image.
 */
function pill({href, label, variant = "ink", arrow = false, align = "left", margin = "0"}) {
    const skin = PILL_SKINS[variant];
    /* The pill shrink-wraps its label, so it sits in an inner table — a bare
       `align` on that table would float it, and the next paragraph would ride
       up alongside the button instead of sitting under it. */
    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:${margin};">
        <tr>
          <td align="${align}">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:${skin.bg};border:1px solid ${skin.border};border-radius:999px;">
                  <a href="${href}" style="display:inline-block;padding:15px 30px;font-family:${BODY};font-size:15px;font-weight:700;line-height:1.2;letter-spacing:0.01em;color:${skin.fg};text-decoration:none;">${esc(label)}${arrow ? " &rarr;" : ""}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;
}

/** Stacked full-width buttons, for the places that offer two actions. */
function pillStack(buttons) {
    return buttons.map(({href, label, variant = "ink", arrow = false}, i) => {
        const skin = PILL_SKINS[variant];
        return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:${i ? "10px" : "0"} 0 0;">
        <tr>
          <td align="center" style="background:${skin.bg};border:1px solid ${skin.border};border-radius:999px;">
            <a href="${href}" style="display:block;padding:15px 24px;font-family:${BODY};font-size:15px;font-weight:700;line-height:1.2;color:${skin.fg};text-decoration:none;">${esc(label)}${arrow ? " &rarr;" : ""}</a>
          </td>
        </tr>
      </table>`;
    }).join("");
}

/** The client's own words, marked by a Slat rule rather than a fill. */
function quoted(text) {
    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:2px 0 2px 18px;border-left:2px solid ${SLAT};font-family:${PARAGRAPH};font-size:16px;line-height:1.6;color:${INK};">${text}</td>
        </tr>
      </table>`;
}

/**
 * The Mustard band: the page's closing call, and the message's.
 *
 * Full width, flush to the footer, carrying the rule strip the homepage runs
 * along its foot. Only on messages where booking is genuinely the next step —
 * a reminder for an appointment in an hour does not need one, and a password
 * reset must not have one.
 */
function closing({kicker, title, body, cta, ctaLabel}) {
    return `
    <tr>
      <td align="center" bgcolor="${MUSTARD}" style="background:${MUSTARD};">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:600px;">
          <tr>
            <td class="frh-pad" style="padding:48px 40px 40px;">
              ${eyebrow(kicker, {color: INK, margin: "0 0 18px"})}
              ${headline(title, {size: 38})}
              ${body ? para(body, {size: 17, color: INK, margin: "20px 0 0"}) : ""}
              ${pill({href: cta, label: ctaLabel, variant: "ink", arrow: true, margin: "28px 0 0"})}
              <p style="margin:24px 0 0;font-family:${BODY};font-size:15px;line-height:1.6;color:${INK};">
                Or call <a href="tel:${PHONE_TEL}" style="color:${INK};font-weight:700;text-decoration:underline;">${PHONE}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td class="frh-pad" style="padding:16px 40px;border-top:1px solid ${MUSTARD_RULE};font-family:${DISPLAY};font-size:13px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:${INK};text-align:center;">
              Isolo, Lagos &nbsp;·&nbsp; Tue to Sun &nbsp;·&nbsp; By appointment
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

/**
 * The Obsidian footer, ending on the wordmark the way the site does — the
 * message opens and closes on the same word. Social links are text: an icon row
 * is four blocked images in half the clients that will open this.
 */
function footer() {
    const link = (href, label) => `<a href="${href}" style="color:rgba(255,255,255,0.72);text-decoration:none;">${label}</a>`;

    return `
    <tr>
      <td align="center" bgcolor="${OBSIDIAN}" style="background:${OBSIDIAN};">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:600px;">
          <tr>
            <td class="frh-pad" style="padding:44px 40px 20px;">
              <p style="margin:0 0 28px;font-family:${DISPLAY};font-size:30px;font-weight:700;line-height:0.98;letter-spacing:0.01em;text-transform:uppercase;color:#ffffff;">Roots. Ritual.<br/>Radiance.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="frh-col" width="55%" valign="top" style="padding:0 20px 20px 0;">
                    <p style="margin:0 0 8px;font-family:${DISPLAY};font-size:12px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:${SLAT};">The salon</p>
                    <p style="margin:0;font-family:${BODY};font-size:14px;line-height:1.7;color:rgba(255,255,255,0.72);">
                      ${SALON_ADDRESS}<br/>${HOURS}
                    </p>
                  </td>
                  <td class="frh-col" valign="top" style="padding:0 0 20px;">
                    <p style="margin:0 0 8px;font-family:${DISPLAY};font-size:12px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:${SLAT};">Reach us</p>
                    <p style="margin:0;font-family:${BODY};font-size:14px;line-height:1.7;color:rgba(255,255,255,0.72);">
                      ${link(`tel:${PHONE_TEL}`, PHONE)}<br/>
                      ${link(`mailto:${MAIL}`, "Email the salon")}<br/>
                      ${link("https://wa.me/2348110215014", "WhatsApp")}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0;font-family:${BODY};font-size:14px;line-height:1.9;color:rgba(255,255,255,0.72);">
                ${link("https://www.instagram.com/frh_naturals/", "Instagram")}
                &nbsp;·&nbsp; ${link("https://www.tiktok.com/@frhnaturals", "TikTok")}
                &nbsp;·&nbsp; ${link("https://www.facebook.com/people/FRH-Flourish-Roots-Hair-Co/61570171119138/", "Facebook")}
                &nbsp;·&nbsp; ${link(SITE, "flourishrootshair.com")}
              </p>
            </td>
          </tr>
          <tr>
            <td class="frh-pad" style="padding:22px 40px 34px;">
              <p style="margin:0;font-family:${DISPLAY};font-size:40px;font-weight:700;line-height:0.9;letter-spacing:0.01em;text-transform:uppercase;color:${SLAT};">Flourish<br/>Roots Hair</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

/**
 * The document the bands stack into.
 *
 * `preheader` is the line the inbox prints beside the subject. Without one,
 * clients scrape the first words of the letterhead and every message previews
 * as "Flourish Roots Hair Isolo, Lagos".
 */
function shell(bands, {preheader = ""} = {}) {
    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Flourish Roots Hair</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap" rel="stylesheet" />
  <style>
    /* Clients that honour embedded styles get the phone layout; the rest fall
       back to the inline values, which are already fluid. */
    @media only screen and (max-width: 600px) {
      .frh-pad { padding-left: 22px !important; padding-right: 22px !important; }
      .frh-h1 { font-size: 32px !important; }
      /* The footer's two columns and the label/value rows both stack, so
         nothing has to survive a 120px column. */
      .frh-col { display: block !important; width: 100% !important; box-sizing: border-box !important; padding-right: 0 !important; }
      .frh-cell { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .frh-cell-label { padding-bottom: 2px !important; border-bottom: 0 !important; }
      .frh-hide { display: none !important; }
    }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
  </style>
</head>
<body style="margin:0;padding:0;background:${WALL};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WALL};">
    ${bands}
  </table>
</body>
</html>`;
}

const templates = {
    welcome({firstName}) {
        return {
            subject: `Welcome to Flourish Roots Hair${firstName ? `, ${firstName}` : ""}!`,
            html: shell(`
        ${hero({
        kicker: "Welcome",
        title: `Welcome to<br/>the family, ${esc(firstName) || "Queen"}`,
        lede: "Care for today, growth for tomorrow. You're in good hands.",
    })}
        ${band(`
          ${para("Flourish Roots Hair is a 4C natural hair salon in Isolo. Everything starts at the scalp, from salon services built around your texture to coaching for the weeks between visits.")}
          ${para("Two ways to start:", {margin: "0 0 6px", color: INK})}
          ${rows([
        ["In the salon", "A full visit in Isolo: wash, treatment, style, and a plan for keeping it."],
        ["With Mariam", "A 1-on-1 session on your routine, your products and your goals."],
    ], {margin: "18px 0 30px"})}
          ${pillStack([
        {href: `${SITE}/consultation`, label: "Book a hair coaching session", variant: "quiet"},
    ])}
        `)}
        ${closing({
        kicker: "Isolo, Lagos · By appointment",
        title: "Your hair has been through enough",
        body: "Book a slot in Isolo and let us get it back.",
        cta: `${SITE}/bookings`,
        ctaLabel: "Book a salon visit",
    })}
        ${footer()}
      `, {preheader: "A 4C natural hair salon in Isolo. Here's how to start."}),
        };
    },

    bookingConfirmation({userFirstName, services = [], servicesText, startTime, totalAmount, notes, manageUrl}) {
        const entries = services.length ?
            services.map((s) => [esc(s.title) || "–", naira(s.price)]) :
            [[esc(servicesText) || "–", ""]];

        return {
            subject: "Your booking is confirmed",
            html: shell(`
        ${hero({
        kicker: "Booking confirmed",
        title: `You're booked,<br/>${esc(userFirstName) || "Queen"}`,
        lede: "Your chair is held. Everything is in one place below.",
    })}
        ${band(`
          ${moment({
        label: "When",
        value: watDay(startTime),
        sub: `<strong style="font-weight:700;">${watTime(startTime)}</strong> &nbsp;·&nbsp; ${SALON_ADDRESS}`,
    })}
          ${eyebrow("Services", {color: ASH, margin: "34px 0 14px"})}
          ${items(entries, {total: naira(totalAmount)})}
          ${notes ? `
            ${eyebrow("What you told us", {color: ASH, margin: "34px 0 14px"})}
            ${quoted(escMultiline(notes))}
          ` : ""}
          ${rule({margin: "32px 0 26px"})}
          ${manageUrl ? `
            ${pillStack([{href: manageUrl, label: "Move or cancel this booking", variant: "quiet"}])}
            ${fine("That link is yours. It opens this booking without a password.", {margin: "14px 0 0"})}
          ` : fine("Need to move it? Reply to this email and we'll sort it out.")}
        `)}
        ${footer()}
      `, {preheader: `${watDay(startTime)} at ${watTime(startTime)} · ${servicesText || "your appointment"}`}),
        };
    },

    appointmentReminder({userFirstName, services = [], servicesText, startTime}) {
        const entries = services.length ?
            services.map((s) => [esc(s.title) || "–", duration(s.duration)]) :
            [[esc(servicesText) || "–", ""]];

        return {
            subject: "Your appointment is in 1 hour 🌿",
            html: shell(`
        ${hero({
        kicker: "In one hour",
        title: `See you soon,<br/>${esc(userFirstName) || "Queen"}`,
        lede: "Your chair is ready in about an hour.",
    })}
        ${band(`
          ${moment({label: "Today at", value: watTime(startTime), sub: SALON_ADDRESS})}
          ${eyebrow("What we're doing", {color: ASH, margin: "34px 0 14px"})}
          ${items(entries)}
          ${rule({margin: "32px 0 26px"})}
          ${fine(`Running late? Call <a href="tel:${PHONE_TEL}" style="color:${SLAT_INK};font-weight:600;text-decoration:none;">${PHONE}</a> and we'll hold the slot where we can.`)}
        `)}
        ${footer()}
      `, {preheader: `${watTime(startTime)} today · ${SALON_ADDRESS}`}),
        };
    },

    bookingRescheduled({userFirstName, servicesText, previousStartTime, startTime}) {
        return {
            subject: "Your appointment has been moved",
            html: shell(`
        ${hero({
        kicker: "Rescheduled",
        title: "Your new time<br/>is confirmed",
        lede: `All set, ${esc(userFirstName) || "Queen"}. There's nothing else to do.`,
    })}
        ${band(`
          ${moment({
        label: "Now booked for",
        value: watDay(startTime),
        sub: `<strong style="font-weight:700;">${watTime(startTime)}</strong> &nbsp;·&nbsp; ${SALON_ADDRESS}`,
    })}
          ${rows([
        ["Previously", `${watDay(previousStartTime)}, ${watTime(previousStartTime)}`, {strike: true}],
        ["Services", esc(servicesText) || "–"],
    ], {margin: "34px 0 26px"})}
          ${fine("Need to change it again? You can do that from your appointments page, or just reply here.")}
        `)}
        ${footer()}
      `, {preheader: `Now ${watDay(startTime)} at ${watTime(startTime)}.`}),
        };
    },

    bookingCancelled({userFirstName, servicesText, startTime}) {
        return {
            subject: "Your appointment has been cancelled",
            html: shell(`
        ${hero({
        kicker: "Cancelled",
        title: "Your appointment<br/>is cancelled",
        lede: `That's all done, ${esc(userFirstName) || "Queen"}. Nothing further is needed from you.`,
    })}
        ${band(`
          ${rows([
        ["Was booked for", `${watDay(startTime)}, ${watTime(startTime)}`, {strike: true}],
        ["Services", esc(servicesText) || "–"],
    ])}
        `, {padding: "44px 40px 40px"})}
        ${closing({
        kicker: "Whenever you're ready",
        title: "The chair is still here",
        body: "Pick a new slot when it suits you, or tell us what happened and we'll find one for you.",
        cta: `${SITE}/bookings`,
        ctaLabel: "Book a salon visit",
    })}
        ${footer()}
      `, {preheader: `Cancelled: ${watDay(startTime)} at ${watTime(startTime)}.`}),
        };
    },

    serviceComplete({userFirstName}) {
        return {
            subject: "Thank you for visiting Flourish Roots Hair 🌿",
            html: shell(`
        ${hero({
        kicker: "Thank you",
        title: "It was wonderful<br/>having you",
        lede: `We hope you're loving it, ${esc(userFirstName) || "Queen"}.`,
    })}
        ${band(`
          ${para("Thank you for trusting us with your hair. Keep the routine going between visits: moisture, gentle handling, and rest for your edges.")}
          ${para("Any question at all, reply to this email. Mariam reads them.", {margin: "0"})}
        `)}
        ${closing({
        kicker: "Keep it flourishing",
        title: "Come back before it needs rescuing",
        body: "Most textures want us every six to eight weeks.",
        cta: `${SITE}/bookings`,
        ctaLabel: "Book your next visit",
    })}
        ${footer()}
      `, {preheader: "Thank you for trusting us with your hair."}),
        };
    },

    serviceCompleteWithReview({userFirstName}) {
        return {
            subject: "Thank you for visiting, we'd love your feedback 🌿",
            html: shell(`
        ${hero({
        kicker: "Thank you",
        title: "It was wonderful<br/>having you",
        lede: `We hope you're loving it, ${esc(userFirstName) || "Queen"}.`,
    })}
        ${band(`
          ${para("Thank you for trusting us with your hair. If the visit was everything you hoped for, a few words in a review would mean a great deal. It's how other women with 4C hair find a salon they can trust.")}
          ${pillStack([
        {href: "https://g.page/r/CUqz4MoAvNK0EAI/review", label: "Leave a review", variant: "quiet"},
    ])}
          ${fine("It takes about a minute.", {margin: "14px 0 0"})}
        `)}
        ${closing({
        kicker: "Keep it flourishing",
        title: "Come back before it needs rescuing",
        body: "Most textures want us every six to eight weeks.",
        cta: `${SITE}/bookings`,
        ctaLabel: "Book your next visit",
    })}
        ${footer()}
      `, {preheader: "A few words in a review would mean a great deal."}),
        };
    },

    newsletterWelcome({firstName}) {
        return {
            subject: "You're in! Welcome to the Flourish Roots family 🌿",
            html: shell(`
        ${hero({
        kicker: "Subscribed",
        title: `You're in,<br/>${esc(firstName) || "Queen"}`,
        lede: "One letter a month, from the chair in Isolo.",
    })}
        ${band(`
          ${para("No noise, no daily mail. Once a month we send what we've learned on the floor, and what's opening up at the salon.")}
          ${rows([
        ["Hair care", "What's working on 4C hair this season: moisture, growth, and the mistakes we keep undoing."],
        ["First access", "New slots and services, before they reach the site."],
        ["Perks", "Subscriber-only offers on the treatments we believe in."],
    ], {margin: "0 0 32px"})}
          ${quoted("One of the best natural hair salons I've visited. They handled my hair with such care.")}
          ${fine("A client, Isolo", {margin: "12px 0 0 20px"})}
        `)}
        ${closing({
        kicker: "Isolo, Lagos · By appointment",
        title: "Your hair has been through enough",
        body: "Book a slot in Isolo and let us get it back.",
        cta: `${SITE}/bookings`,
        ctaLabel: "Book a salon visit",
    })}
        ${footer()}
      `, {preheader: "One letter a month, from the chair in Isolo."}),
        };
    },

    passwordReset({firstName, resetLink, expiresIn = "1 hour"}) {
        return {
            subject: "Reset your password",
            html: shell(`
        ${hero({
        kicker: "Account",
        title: "Reset your<br/>password",
        lede: `Hi ${esc(firstName) || "there"}, here's the link you asked for.`,
        bg: LINEN,
    })}
        ${band(`
          ${pillStack([{href: resetLink, label: "Choose a new password", variant: "ink"}])}
          ${rule({margin: "26px 0"})}
          ${fine(`The link expires in ${esc(expiresIn)}. If you didn't ask for it, ignore this email. Nothing changes until the link is used.`)}
        `)}
        ${footer()}
      `, {preheader: `Your reset link expires in ${expiresIn}.`}),
        };
    },

    /* ── The salon's own copies ──────────────────────────────────────────────
       Working documents: Linen instead of Glow, no Mustard band, facts ahead of
       prose. Mariam reads these standing up, between clients. */

    ownerNotification({userFirstName, userEmail, userMobileNumber, servicesText, startTime, totalAmount, notes, completeUrl, completeReviewUrl}) {
        return {
            subject: `New booking: ${userFirstName || userEmail} · ${servicesText || ""}`,
            html: shell(`
        ${hero({
        kicker: "New booking",
        title: `${esc(userFirstName) || "A client"}<br/>booked in`,
        bg: LINEN,
    })}
        ${band(`
          ${moment({label: "Booked for", value: watShort(startTime)})}
          ${rows([
        ["Client", esc(userFirstName) || "–"],
        ["Phone", userMobileNumber ? `<a href="tel:${esc(userMobileNumber)}" style="color:${SLAT_INK};text-decoration:none;">${esc(userMobileNumber)}</a>` : "–"],
        ["Email", userEmail ? `<a href="mailto:${esc(userEmail)}" style="color:${SLAT_INK};text-decoration:none;">${esc(userEmail)}</a>` : "–"],
        ["Services", esc(servicesText) || "–"],
        ["Total", naira(totalAmount)],
    ], {margin: "34px 0 0"})}
          ${notes ? `
            ${eyebrow("Client's note", {color: ASH, margin: "32px 0 14px"})}
            ${quoted(escMultiline(notes))}
          ` : ""}
          ${completeUrl ? `
            ${eyebrow("When service is done", {color: ASH, margin: "32px 0 14px"})}
            ${pillStack([
        {href: completeUrl, label: "Mark as complete", variant: "ink"},
        {href: completeReviewUrl, label: "Mark complete & ask for a review", variant: "quiet"},
    ])}
            ${fine("Each link works once.", {margin: "14px 0 0", align: "center"})}
          ` : ""}
        `)}
        ${footer()}
      `, {preheader: `${watShort(startTime)} · ${servicesText || ""} · ${naira(totalAmount)}`}),
        };
    },

    adminDailyDigest({dateLabel, bookings = []}) {
        const total = bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

        /* One ruled entry per appointment: the time in display type on the left,
           the money opposite it, the client underneath — so the day can be read
           down the left edge alone. */
        const entries = bookings.map((b) => `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${LINE};">
        <tr>
          <td valign="top" style="padding:20px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:${DISPLAY};font-size:30px;font-weight:700;line-height:1;color:${INK};">${watTime(b.startTime)}</td>
                <td align="right" style="font-family:${BODY};font-size:15px;font-weight:700;color:${INK};white-space:nowrap;">${naira(b.totalAmount)}</td>
              </tr>
            </table>
            <p style="margin:12px 0 0;font-family:${BODY};font-size:15px;font-weight:600;line-height:1.4;color:${INK};">${esc(b.userFirstName || b.userEmail) || "Client"}</p>
            <p style="margin:3px 0 0;font-family:${PARAGRAPH};font-size:15px;line-height:1.5;color:${MUTED};">${esc(b.servicesText || (b.services || []).map((s) => s.title).filter(Boolean).join(", ")) || "–"}</p>
            <p style="margin:8px 0 0;font-family:${BODY};font-size:13px;line-height:1.5;color:${ASH};">
              ${esc(b.userMobileNumber) || "no phone"} &nbsp;·&nbsp; ${esc(b.userEmail) || "no email"}
            </p>
            ${b.notes ? `<div style="margin:14px 0 0;">${quoted(escMultiline(b.notes))}</div>` : ""}
          </td>
        </tr>
      </table>`).join("");

        const summary = bookings.length ?
            `${bookings.length} appointment${bookings.length === 1 ? "" : "s"} · ${naira(total)} expected` :
            "Nothing on the books yet";

        return {
            subject: `Tomorrow (${dateLabel}): ${bookings.length} booking${bookings.length === 1 ? "" : "s"}`,
            html: shell(`
        ${hero({
        kicker: "Tomorrow",
        title: esc(dateLabel),
        lede: summary,
        bg: LINEN,
    })}
        ${band(`
          ${bookings.length ? entries : `${rule({margin: "0 0 22px"})}${para("No appointments booked for tomorrow.", {margin: "0"})}`}
          ${rule({margin: "0 0 22px"})}
          ${fine("Times are West Africa Time. The \"mark as complete\" links live in each booking's own email.")}
        `)}
        ${footer()}
      `, {preheader: summary}),
        };
    },

    ownerBookingChanged({change, userFirstName, userEmail, userMobileNumber, servicesText, previousStartTime, startTime, totalAmount}) {
        const cancelled = change === "cancelled";
        const was = cancelled ? (previousStartTime || startTime) : previousStartTime;

        return {
            subject: cancelled ?
                `Cancelled: ${userFirstName || userEmail} · ${servicesText || ""}` :
                `Moved: ${userFirstName || userEmail} · ${servicesText || ""}`,
            html: shell(`
        ${hero({
        kicker: cancelled ? "Cancellation" : "Reschedule",
        title: `${esc(userFirstName) || "A client"}<br/>${cancelled ? "cancelled" : "moved a slot"}`,
        bg: LINEN,
    })}
        ${band(`
          ${cancelled ? "" : moment({label: "Now booked for", value: watShort(startTime)})}
          ${rows([
        ["Was booked for", watShort(was), {strike: true}],
        ["Client", esc(userFirstName) || "–"],
        ["Phone", userMobileNumber ? `<a href="tel:${esc(userMobileNumber)}" style="color:${SLAT_INK};text-decoration:none;">${esc(userMobileNumber)}</a>` : "–"],
        ["Email", userEmail ? `<a href="mailto:${esc(userEmail)}" style="color:${SLAT_INK};text-decoration:none;">${esc(userEmail)}</a>` : "–"],
        ["Services", esc(servicesText) || "–"],
        ["Total", naira(totalAmount)],
    ], {margin: cancelled ? "0 0 22px" : "34px 0 22px"})}
          ${fine(cancelled ? "The slot is free again. No action needed." : "Tomorrow's digest will show the new time.")}
        `)}
        ${footer()}
      `, {preheader: cancelled ?
        `Slot free again: ${watShort(was)}` :
        `Now ${watShort(startTime)} (was ${watShort(previousStartTime)})`}),
        };
    },
};

module.exports = {templates};
