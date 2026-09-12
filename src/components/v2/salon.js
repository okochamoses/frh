/* The salon's own facts, in one place.
 *
 * Address, hours, phone and email were being retyped on every page that showed
 * them, and they had already drifted: the homepage said "Monday to Saturday,
 * closed on Sundays" while the booking engine — `src/lib/booking/schedule.js`,
 * mirroring `functions/lib/bookingRules.js`, which has the final say — refuses
 * Mondays and opens on Sunday afternoons. A client reading the marketing copy
 * was being told the opposite of when a chair can actually be booked.
 *
 * So the opening hours below are derived from those same constants rather than
 * written out by hand. Change the schedule and this text follows.
 */

import {
  OFF_DAYS,
  OPEN_HOUR,
  SUNDAY_OPEN_HOUR,
  CLOSE_MINUTES,
} from "@/lib/booking/schedule";

export const PHONE_DISPLAY = "0811 021 5014";
export const PHONE_TEL = "+2348110215014";
export const EMAIL = "flourishnaturalsinfo@gmail.com";
export const WHATSAPP_NUMBER = "2348110215014";

export const ADDRESS_LINES = [
  "Shop 303, Destiny Plaza",
  "Ago Palace Way, Isolo",
  "Lagos, Nigeria",
];

export const ADDRESS_ONE_LINE =
  "Shop 303, Destiny Plaza, Ago Palace Way, Isolo, Lagos";

/** WhatsApp deep link with the first message already written. */
export function whatsapp(message) {
  return message
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${WHATSAPP_NUMBER}`;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "9am", "1pm", "7pm" — no ":00" to read, because there never is one. */
function hour(h) {
  const suffix = h < 12 ? "am" : "pm";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve}${suffix}`;
}

const CLOSE_HOUR = CLOSE_MINUTES / 60;

/** One row per day, in reading order from Monday. */
export const OPENING_HOURS = [1, 2, 3, 4, 5, 6, 0].map((weekday) => {
  const closed = OFF_DAYS.has(weekday);
  const opens = weekday === 0 ? SUNDAY_OPEN_HOUR : OPEN_HOUR;
  return {
    weekday,
    day: DAYS[weekday],
    closed,
    hours: closed ? "Closed" : `${hour(opens)} – ${hour(CLOSE_HOUR)}`,
  };
});

/** The one-line version for a nav strip or a meta line. */
export const HOURS_SUMMARY = `Tuesday to Sunday · Closed Mondays`;

/** The longest a booking can run, in words, for pages that explain the day. */
export const LAST_FINISH = `${hour(CLOSE_HOUR)}`;
