"use client";

/**
 * Every visit a client has booked with their account.
 *
 * V1's `/bookings` carried its own reschedule machinery — `BookingContext`,
 * `beginReschedule`, the V1 `BookingDrawer`, a cancel dialog — which is why it
 * was the heaviest page on the site. None of that is rebuilt here. V2 already
 * has one place where an appointment is moved or called off, `/booking/manage`,
 * and it is where the confirmation email lands; the callables behind it take a
 * signed-in owner in place of the email's token, so this page links straight
 * there with only the booking's id. One screen for changing a visit, whether
 * the client arrived from their inbox or from their account.
 *
 * Rebooking is likewise `/booking?again=<id>`, which the flow already
 * understands — it is what the rebook nudge on the booking page uses.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";
import { AUTH_MODES } from "@/lib/auth/constants";
import { subscribeUserBookings } from "@/lib/firebase/bookingService";
import { optionsForBooking } from "@/lib/booking/rebook";
import {
  formatDuration,
  formatWat,
  fromInstant,
  longDate,
  naira,
  parseKey,
  watInstant,
} from "@/lib/booking/schedule";
import Button from "@/components/v2/ui/Button";
import PageHero from "@/components/v2/sections/PageHero";

const CLOCK_TICK_MS = 60_000;

const STATUS = {
  pending: { label: "Confirmed", className: "bg-gold text-ink" },
  completed: { label: "Completed", className: "bg-cream-100 text-ink-soft" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-700" },
};

/**
 * The Lagos wall-clock reading of a stored time, whichever way it was stored.
 *
 * Bookings written before the UTC migration hold a naive WAT string; newer ones
 * hold a true instant. `watInstant` is what tells them apart — reading either
 * one directly is the arithmetic that once sent reminder emails an hour out.
 */
function watReading(iso) {
  const at = watInstant(iso);
  if (!at) return null;
  return { at, ...fromInstant(at.toISOString()) };
}

/** "Saturday 12 September", with the year once it is no longer this one. */
function dateLabel(key, now) {
  const label = longDate(key);
  const { year } = parseKey(key);
  return year === now.getFullYear() ? label : `${label} ${year}`;
}

function serviceLines(booking) {
  if (Array.isArray(booking.services) && booking.services.length > 0) {
    return booking.services.map((s, i) => ({
      key: `${s.title}-${i}`,
      title: s.title || "Service",
      price: s.price,
      duration: s.duration,
    }));
  }
  // Older bookings stored one pipe-joined string rather than a list.
  if (booking.servicesText) {
    return booking.servicesText
      .split(" | ")
      .map((title, i) => ({ key: `text-${i}`, title: title.trim() }));
  }
  return [];
}

function AppointmentCard({ booking, now }) {
  const start = watReading(booking.startTime);
  const end = watReading(booking.endTime);
  const status = STATUS[booking.status] ?? STATUS.pending;
  const cancelled = booking.status === "cancelled";
  const upcoming = Boolean(start && start.at.getTime() > now.getTime());
  // Only what the salon still offers can be booked again — a look that has come
  // off the menu would land the client on an empty step 1.
  const repeatable = !upcoming && !cancelled && optionsForBooking(booking).length > 0;

  const minutes = Number.isFinite(booking.totalDuration)
    ? booking.totalDuration
    : start && end
      ? Math.round((end.at.getTime() - start.at.getTime()) / 60_000)
      : null;

  const lines = serviceLines(booking);
  const bookedOn = formatWat(booking.createdAt, { withTime: false });

  return (
    <article
      className="flex flex-col gap-5 rounded-v2-3xl bg-white p-5 sm:p-7"
      aria-labelledby={`booking-${booking.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <span
            className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-bold tracking-[0.02em] ${status.className}`}
          >
            {status.label}
          </span>
          <h3
            id={`booking-${booking.id}`}
            className={`mt-3 font-display text-v2-h3 uppercase leading-[1.1] text-ink ${
              cancelled ? "line-through decoration-ash decoration-1" : ""
            }`}
          >
            {start ? dateLabel(start.key, now) : "Appointment"}
          </h3>
          {start && (
            <p className="mt-1.5 text-v2-body-sm tabular-nums text-ink-soft">
              {end ? `${start.time} – ${end.time}` : start.time}
              {minutes > 0 && ` · ${formatDuration(minutes)}`}
            </p>
          )}
        </div>
        <p className="text-v2-h3 font-bold tabular-nums text-ink">{naira(booking.totalAmount)}</p>
      </div>

      {lines.length > 0 && (
        <ul className="flex flex-col border-t border-latte">
          {lines.map((line) => (
            <li
              key={line.key}
              className="flex items-baseline justify-between gap-4 border-b border-latte py-2.5 text-v2-body-sm"
            >
              <span className="min-w-0 font-semibold text-ink">{line.title}</span>
              <span className="shrink-0 tabular-nums text-ink-soft">
                {line.duration > 0 && formatDuration(line.duration)}
                {line.duration > 0 && line.price != null && " · "}
                {line.price != null && naira(line.price)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {upcoming && booking.status === "pending" && (
          // No token in the link: the callables behind that page accept the
          // signed-in owner instead, which is the whole point of linking here
          // rather than building a second date picker.
          <Link
            href={`/booking/manage?ref=${encodeURIComponent(booking.id)}`}
            className="text-v2-body-sm font-semibold text-ink underline underline-offset-4 hover:text-ink/70"
          >
            Move or cancel
          </Link>
        )}
        {repeatable && (
          <Link
            href={`/booking?again=${encodeURIComponent(booking.id)}`}
            className="text-v2-body-sm font-semibold text-ink underline underline-offset-4 hover:text-ink/70"
          >
            Book this again
          </Link>
        )}
        {bookedOn && <p className="text-v2-body-sm text-ash">Booked {bookedOn}</p>}
      </div>
    </article>
  );
}

function Group({ title, children }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="type-eyebrow">{title}</h2>
      <ul className="flex flex-col gap-4">{children}</ul>
    </section>
  );
}

export default function Appointments() {
  const { user, hydrated, isAuthenticated, openAuthModal } = useAuth();

  const [rows, setRows] = useState(null); // null until the first snapshot lands
  const [loadError, setLoadError] = useState(null);
  const [now, setNow] = useState(null);

  // Read in the browser: a static export has no request-time clock, and
  // "upcoming" has to be judged against the viewer's real one.
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user?.uid) {
      setRows(null);
      setLoadError(null);
      return undefined;
    }
    setLoadError(null);
    return subscribeUserBookings(
      user.uid,
      setRows,
      () => setLoadError("We couldn't load your appointments. Please try again in a moment.")
    );
  }, [hydrated, isAuthenticated, user?.uid]);

  // Upcoming reads forwards, the next visit first; history reads backwards.
  // Cancelled visits stay in the history — a client looking for "did I cancel
  // that?" needs to find it, and a silent disappearance answers nothing.
  const { upcoming, past } = useMemo(() => {
    if (!Array.isArray(rows) || !now) return { upcoming: [], past: [] };
    const t = now.getTime();
    const startOf = (b) => watInstant(b.startTime)?.getTime() ?? 0;
    const isUpcoming = (b) => b.status !== "cancelled" && startOf(b) > t;

    return {
      upcoming: rows.filter(isUpcoming).sort((a, b) => startOf(a) - startOf(b)),
      past: rows.filter((b) => !isUpcoming(b)).sort((a, b) => startOf(b) - startOf(a)),
    };
  }, [rows, now]);

  const loading = hydrated && isAuthenticated && rows === null && !loadError;

  return (
    <main className="mx-auto flex max-w-[var(--v2-container)] flex-col gap-14 px-4 pb-20 md:gap-20 md:px-8 md:pb-28">
      <PageHero
        eyebrow="Your account"
        title="Your appointments"
        lede="Everything you have booked with us, and everything you have had done. Move a visit, call one off, or have the same again."
      />

      <div className="flex w-full max-w-[680px] flex-col gap-12">
        {(!hydrated || !now) && (
          <div aria-hidden="true" className="h-64 rounded-v2-3xl bg-white" />
        )}

        {hydrated && now && !isAuthenticated && (
          <div className="flex flex-col gap-6 rounded-v2-3xl bg-white p-6 sm:p-10">
            <div className="flex flex-col gap-3">
              <p className="type-eyebrow">Not logged in</p>
              <h2 className="font-display text-[clamp(1.5rem,1.3rem+1vw,2rem)] uppercase leading-[0.98] text-ink">
                Log in to see your visits
              </h2>
              <p className="max-w-[46ch] text-v2-body-sm text-ink-soft">
                Booked as a guest? Your confirmation email has a link straight to
                that appointment — no account needed.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => openAuthModal({ mode: AUTH_MODES.SIGN_IN })}>
                Log in
              </Button>
              <Button variant="secondary" href="/booking">
                Book a visit
              </Button>
            </div>
          </div>
        )}

        {hydrated && now && isAuthenticated && loadError && (
          <p
            role="alert"
            className="rounded-v2-lg bg-red-50 px-4 py-3 text-v2-body-sm text-red-700"
          >
            {loadError}
          </p>
        )}

        {loading && (
          <div className="flex flex-col gap-4" aria-hidden="true">
            {[0, 1].map((i) => (
              <div key={i} className="h-56 rounded-v2-3xl bg-white" />
            ))}
          </div>
        )}

        {hydrated && now && isAuthenticated && !loading && !loadError && rows?.length === 0 && (
          <div className="flex flex-col gap-6 rounded-v2-3xl bg-white p-6 sm:p-10">
            <div className="flex flex-col gap-3">
              <p className="type-eyebrow">Nothing yet</p>
              <h2 className="font-display text-[clamp(1.5rem,1.3rem+1vw,2rem)] uppercase leading-[0.98] text-ink">
                No visits booked
              </h2>
              <p className="max-w-[46ch] text-v2-body-sm text-ink-soft">
                Once you book, your appointment shows up here with everything you
                need to change it.
              </p>
            </div>
            <div>
              <Button variant="book" withArrow href="/booking">
                Book a visit
              </Button>
            </div>
          </div>
        )}

        {hydrated && now && isAuthenticated && !loading && !loadError && rows?.length > 0 && (
          <>
            {upcoming.length > 0 ? (
              <Group title={`${upcoming.length} coming up`}>
                {upcoming.map((b) => (
                  <li key={b.id}>
                    <AppointmentCard booking={b} now={now} />
                  </li>
                ))}
              </Group>
            ) : (
              <section className="flex flex-col gap-4">
                <h2 className="type-eyebrow">Coming up</h2>
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-v2-3xl border border-dashed border-latte p-6">
                  <p className="text-v2-body-sm text-ink-soft">Nothing in the diary.</p>
                  <Button variant="book" withArrow href="/booking">
                    Book a visit
                  </Button>
                </div>
              </section>
            )}

            {past.length > 0 && (
              <Group title="Been and gone">
                {past.map((b) => (
                  <li key={b.id}>
                    <AppointmentCard booking={b} now={now} />
                  </li>
                ))}
              </Group>
            )}
          </>
        )}

        <p className="text-v2-body-sm text-ink-soft">
          <Link
            href="/settings"
            className="font-semibold text-ink underline underline-offset-4 hover:text-ink/70"
          >
            Your details
          </Link>
        </p>
      </div>
    </main>
  );
}
