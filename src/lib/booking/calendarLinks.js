/**
 * "Add to calendar" for a confirmed appointment: a Google Calendar link and an
 * .ics file for Apple Calendar, Outlook and everything else.
 */

export const SALON_NAME = "Flourish Roots Hair Co.";
export const SALON_ADDRESS = "Shop 303, Destiny Plaza, Ago Palace Way, Isolo, Lagos";
export const SALON_WHATSAPP = "2348110215014";
export const SALON_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${SALON_NAME}, ${SALON_ADDRESS}`
)}`;

/** 20260912T090000Z */
const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function googleCalendarUrl({ title, details, startTime, endTime }) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${stamp(startTime)}/${stamp(endTime)}`,
    details,
    location: `${SALON_NAME}, ${SALON_ADDRESS}`,
    ctz: "Africa/Lagos",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const icsEscape = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function icsContent({ id, title, details, startTime, endTime }) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Flourish Roots Hair//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${id || stamp(startTime)}@flourishroots`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(startTime)}`,
    `DTEND:${stamp(endTime)}`,
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(details)}`,
    `LOCATION:${icsEscape(`${SALON_NAME}, ${SALON_ADDRESS}`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function icsDataUrl(event) {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent(event))}`;
}

/** A WhatsApp chat with the salon, pre-filled. */
export function whatsappUrl(text) {
  return `https://wa.me/${SALON_WHATSAPP}?text=${encodeURIComponent(text)}`;
}
