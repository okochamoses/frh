/**
 * "It's been three weeks — book the same again?"
 *
 * Works out, from a client's own bookings, whether they are due for another
 * visit and what that visit would be. Cadences come from the catalogue
 * (`rebookAfterDays` per service, with category defaults in catalogue.js).
 */

import { SERVICE_BY_TITLE } from "./catalogue";
import { daysBetween, fromInstant, watToday } from "./schedule";

const SNOOZE_KEY = "frh:v2:rebook-snooze";
export const SNOOZE_DAYS = 7;

const isLive = (b) => b?.status !== "cancelled" && typeof b?.startTime === "string";

/** Bookings split around "now": the most recent first for past, soonest first for upcoming. */
export function splitBookings(bookings = [], now = new Date()) {
  const live = bookings.filter(isLive);
  const t = now.getTime();
  const past = live
    .filter((b) => new Date(b.startTime).getTime() < t)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  const upcoming = live
    .filter((b) => new Date(b.startTime).getTime() >= t)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  return { past, upcoming };
}

/** Catalogue options for a booking's services, skipping any the salon has since removed. */
export function optionsForBooking(booking) {
  return (booking?.services ?? [])
    .map((s) => SERVICE_BY_TITLE.get(s.title))
    .filter(Boolean);
}

/**
 * The rebook suggestion for a client, or null.
 *
 * Only suggested when the client has nothing upcoming: someone who already
 * has a visit in the diary does not need to be asked to book one.
 *
 * @returns {null | {
 *   booking: object,          the visit being repeated
 *   options: object[],        catalogue options to book again
 *   daysSince: number,
 *   cadence: number,          the shortest cadence among those services
 *   usual: { weekday: number, time: string },
 * }}
 */
export function rebookSuggestion(bookings, now = new Date()) {
  const { past, upcoming } = splitBookings(bookings, now);
  if (upcoming.length > 0 || past.length === 0) return null;

  const last = past[0];
  const options = optionsForBooking(last).filter((o) => Number.isFinite(o.rebookAfterDays));
  if (options.length === 0) return null;

  const when = fromInstant(last.startTime);
  const daysSince = daysBetween(when.key, watToday(now));
  const cadence = Math.min(...options.map((o) => o.rebookAfterDays));
  if (daysSince < cadence) return null;

  return { booking: last, options, daysSince, cadence, usual: { weekday: when.weekday, time: when.time } };
}

/**
 * Titles the client has booked before, with when they last had each one —
 * drives the "Booked before" row and the "Due" tag on cards.
 */
export function bookingHistory(bookings, now = new Date()) {
  const { past } = splitBookings(bookings, now);
  const today = watToday(now);
  const byTitle = new Map();
  for (const b of past) {
    const key = fromInstant(b.startTime).key;
    for (const option of optionsForBooking(b)) {
      if (byTitle.has(option.title)) continue; // `past` is newest first
      const daysSince = daysBetween(key, today);
      byTitle.set(option.title, {
        daysSince,
        due: Number.isFinite(option.rebookAfterDays) && daysSince >= option.rebookAfterDays,
      });
    }
  }
  return byTitle;
}

/** "3 weeks", "10 days", "2 months" — how long ago, the way people say it. */
export function sinceLabel(days) {
  if (days < 14) return `${days} day${days === 1 ? "" : "s"}`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  return `${Math.round(days / 30)} months`;
}

// ── Snooze ("Not yet") ────────────────────────────────────────────────────────

export function isSnoozed(bookingId, now = new Date()) {
  try {
    const raw = window.localStorage.getItem(SNOOZE_KEY);
    const entry = raw ? JSON.parse(raw) : null;
    return entry?.bookingId === bookingId && new Date(entry.until) > now;
  } catch {
    return false;
  }
}

export function snooze(bookingId, now = new Date()) {
  const until = new Date(now.getTime() + SNOOZE_DAYS * 86_400_000);
  try {
    window.localStorage.setItem(SNOOZE_KEY, JSON.stringify({ bookingId, until: until.toISOString() }));
  } catch {
    // Snoozing is a courtesy; a blocked storage just means we ask again.
  }
  return until;
}

export function clearSnooze() {
  try {
    window.localStorage.removeItem(SNOOZE_KEY);
  } catch {
    // ignore
  }
}
