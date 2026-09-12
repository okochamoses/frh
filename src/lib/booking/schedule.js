/**
 * Salon schedule, in Lagos wall-clock time.
 *
 * Mirrors functions/lib/bookingRules.js, which has the final say — this copy
 * decides what the v2 picker offers, the server decides what is allowed.
 *
 * Everything here works on "WAT date keys" (`YYYY-MM-DD` in Africa/Lagos) and
 * "HH:mm" strings rather than browser-local Date objects. The v1 picker built
 * slots in the browser's own time zone, so a client in London saw 09:00 and
 * booked 10:00. Lagos is UTC+1 all year with no daylight saving, which is what
 * makes the fixed offset below safe.
 */

export const WAT_OFFSET_MINUTES = 60;

export const OFF_DAYS = new Set([1]); // Monday (0 = Sun … 6 = Sat)
export const OPEN_HOUR = 9; // Tue–Sat
export const SUNDAY_OPEN_HOUR = 13;
export const CLOSE_MINUTES = 19 * 60; // nothing may finish after 7pm
export const SLOT_STEP_MINUTES = 30; // the server accepts quarter hours; half hours read better
export const BOOKING_HORIZON_DAYS = 90;

/** The longest appointment any single day can hold (a Tue–Sat day). */
export const MAX_APPOINTMENT_MINUTES = CLOSE_MINUTES - OPEN_HOUR * 60;

// Slots this close to "now" are hidden, so nobody books a time that will have
// passed by the time the request reaches the server.
const LEAD_MINUTES = 15;

const pad = (n) => String(n).padStart(2, "0");

/** Wall-clock parts of an instant in Lagos. */
export function watParts(date = new Date()) {
  const shifted = new Date(date.getTime() + WAT_OFFSET_MINUTES * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

export function dateKeyFromParts({ year, month, day }) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Today's date in Lagos, as a `YYYY-MM-DD` key. */
export function watToday(now = new Date()) {
  return dateKeyFromParts(watParts(now));
}

export function parseKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month, day };
}

/** Day of the week for a date key (0 = Sunday). */
export function weekdayOf(key) {
  const { year, month, day } = parseKey(key);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function addDays(key, n) {
  const { year, month, day } = parseKey(key);
  const d = new Date(Date.UTC(year, month - 1, day + n));
  return dateKeyFromParts({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() });
}

export function daysBetween(fromKey, toKey) {
  const a = parseKey(fromKey);
  const b = parseKey(toKey);
  return Math.round(
    (Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 86_400_000
  );
}

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const fromMinutes = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

/** The ISO instant for a Lagos wall-clock time. */
export function toInstant(key, hhmm) {
  const { year, month, day } = parseKey(key);
  const minutes = toMinutes(hhmm) - WAT_OFFSET_MINUTES;
  return new Date(Date.UTC(year, month - 1, day, 0, minutes)).toISOString();
}

/** `{ key, time }` in Lagos for an ISO instant. */
export function fromInstant(iso) {
  const parts = watParts(new Date(iso));
  return { key: dateKeyFromParts(parts), time: fromMinutes(parts.minutes), weekday: parts.weekday };
}

export function openingMinutes(weekday) {
  return (weekday === 0 ? SUNDAY_OPEN_HOUR : OPEN_HOUR) * 60;
}

/** Start times (HH:mm) offered on a day for an appointment of `duration` minutes. */
export function slotsFor(key, duration, now = new Date()) {
  const weekday = weekdayOf(key);
  if (OFF_DAYS.has(weekday)) return [];

  const today = watToday(now);
  if (key < today) return [];

  const open = openingMinutes(weekday);
  const lastStart = CLOSE_MINUTES - Math.max(duration, SLOT_STEP_MINUTES);
  const earliest = key === today ? watParts(now).minutes + LEAD_MINUTES : 0;

  const slots = [];
  for (let m = open; m <= lastStart; m += SLOT_STEP_MINUTES) {
    if (m > earliest) slots.push(fromMinutes(m));
  }
  return slots;
}

/**
 * Why a day can't take this appointment, or null when it can.
 *
 * Said out loud because a struck-through date alone reads as "fully booked",
 * when the real answer is usually that the chosen services don't fit.
 */
export function dayUnavailableReason(key, duration, now = new Date()) {
  const today = watToday(now);
  if (key < today) return "This day has passed";
  if (daysBetween(today, key) > BOOKING_HORIZON_DAYS) return "Bookings open 90 days ahead";

  const weekday = weekdayOf(key);
  if (OFF_DAYS.has(weekday)) return "The salon is closed on Mondays";
  if (duration > MAX_APPOINTMENT_MINUTES) return "Longer than the salon is open in a day";
  if (weekday === 0 && duration > CLOSE_MINUTES - openingMinutes(0)) {
    return "Sundays run 1–7pm, which isn't long enough for these services";
  }
  if (slotsFor(key, duration, now).length === 0) return "No times left on this day";
  return null;
}

/** The first bookable `{ key, time }` from today onwards, or null. */
export function firstAvailable(duration, now = new Date(), fromKey = watToday(now)) {
  for (let i = 0; i <= BOOKING_HORIZON_DAYS; i++) {
    const key = addDays(fromKey, i);
    if (dayUnavailableReason(key, duration, now)) continue;
    const slots = slotsFor(key, duration, now);
    if (slots.length) return { key, time: slots[0] };
  }
  return null;
}

/**
 * The next date on `weekday` (after today) where `time` is bookable — used to
 * offer a returning client their usual slot.
 */
export function nextOnWeekday(weekday, time, duration, now = new Date(), weeks = 4) {
  const today = watToday(now);
  for (let i = 1; i <= weeks * 7; i++) {
    const key = addDays(today, i);
    if (weekdayOf(key) !== weekday) continue;
    if (dayUnavailableReason(key, duration, now)) continue;
    if (slotsFor(key, duration, now).includes(time)) return { key, time };
  }
  return null;
}

/** Cells for a Monday-first month grid: `null` pads the first week. */
export function monthGrid(year, month) {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const lead = (first + 6) % 7;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) cells.push(dateKeyFromParts({ year, month, day: d }));
  return cells;
}

// ── Labels ────────────────────────────────────────────────────────────────────

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "Sat 12 Sep" */
export function shortDate(key) {
  const { month, day } = parseKey(key);
  return `${WEEKDAYS[weekdayOf(key)].slice(0, 3)} ${day} ${MONTHS[month - 1].slice(0, 3)}`;
}

/** "Saturday 12 September" */
export function longDate(key) {
  const { month, day } = parseKey(key);
  return `${WEEKDAYS[weekdayOf(key)]} ${day} ${MONTHS[month - 1]}`;
}

export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h > 0 && `${h}h`, m > 0 && `${m}m`].filter(Boolean).join(" ") || "0m";
}

export const naira = (n) => `₦${Number(n || 0).toLocaleString("en-US")}`;
