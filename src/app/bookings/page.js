"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { CiClock2 } from "react-icons/ci";
import { merriweather, Bagelan } from "@/app/layout";
import { useAuth } from "@/app/contexts/AuthContext";
import { subscribeUserBookings } from "@/lib/firebase/bookingService";
import { Button } from "@/components/ui/button";

const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h > 0 && `${h}h`, m > 0 && `${m}m`].filter(Boolean).join(" ");
};

const formatNgn = (n) => `₦${Number(n).toLocaleString("en-US")}`;

function bookingLines(booking) {
  if (Array.isArray(booking.services) && booking.services.length > 0) {
    return booking.services.map((s, i) => ({
      key: `${s.title}-${i}`,
      title: s.title || "Service",
      price: s.price,
      duration: s.duration,
      category: s.category,
    }));
  }
  if (booking.servicesText) {
    return booking.servicesText.split(" | ").map((title, i) => ({
      key: `text-${i}`,
      title: title.trim(),
      price: undefined,
      duration: undefined,
      category: undefined,
    }));
  }
  return [];
}

function BookingCard({ booking }) {
  const start = booking.startTime ? dayjs(booking.startTime) : null;
  const end = booking.endTime ? dayjs(booking.endTime) : null;
  const durationMins =
    start && end
      ? Math.max(0, end.diff(start, "minute"))
      : Array.isArray(booking.services)
        ? booking.services.reduce((acc, s) => acc + (s.duration || 0), 0)
        : 0;

  const createdLabel = booking.createdAt?.toDate
    ? dayjs(booking.createdAt.toDate()).format("D MMM YYYY, HH:mm")
    : null;

  const lines = bookingLines(booking);

  return (
    <article
      className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-sm"
      aria-labelledby={`booking-${booking.id}-heading`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id={`booking-${booking.id}-heading`}
            className={`${merriweather.className} text-lg font-bold text-stone-900`}
          >
            {start ? start.format("dddd, D MMMM YYYY") : "Appointment"}
          </h2>
          {(start || end) && (
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-600">
              <span className="inline-flex items-center gap-1.5">
                <CiClock2 className="h-[1.1em] w-[1.1em] flex-shrink-0 text-stone-500" aria-hidden />
                {start && end
                  ? `${start.format("HH:mm")} – ${end.format("HH:mm")}`
                  : start
                    ? start.format("HH:mm")
                    : end.format("HH:mm")}
              </span>
              {durationMins > 0 && (
                <span className="text-stone-400 tabular-nums">({formatDuration(durationMins)})</span>
              )}
            </p>
          )}
        </div>
        <p
          className={`${merriweather.className} text-lg font-bold tabular-nums text-[#120D07] sm:text-right`}
        >
          {formatNgn(booking.totalAmount)}
        </p>
      </div>

      {lines.length > 0 && (
        <ul className="mt-5 divide-y divide-stone-100 border-t border-stone-100 pt-4">
          {lines.map((line) => (
            <li key={line.key} className="flex gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className={`${merriweather.className} text-sm font-semibold text-stone-800`}>
                  {line.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-stone-500">
                  {line.category && <span className="text-stone-400">{line.category}</span>}
                  {line.category && line.duration > 0 && (
                    <span className="text-stone-300" aria-hidden>
                      ·
                    </span>
                  )}
                  {line.duration > 0 && <span>{formatDuration(line.duration)}</span>}
                </div>
              </div>
              {line.price != null && (
                <p className={`${merriweather.className} flex-shrink-0 text-sm font-semibold tabular-nums text-stone-700`}>
                  {formatNgn(line.price)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {createdLabel && (
        <p className="mt-4 text-xs text-stone-400">Booked on {createdLabel}</p>
      )}
    </article>
  );
}

export default function BookingsPage() {
  const { user, hydrated, isAuthenticated, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user?.uid) {
      setBookings(null);
      setLoadError(null);
      return;
    }

    setLoadError(null);
    const unsub = subscribeUserBookings(
      user.uid,
      (rows) => setBookings(rows),
      (err) => {
        console.error("Bookings subscription error:", err);
        setLoadError("We couldn't load your bookings. Please try again.");
        setBookings([]);
      }
    );

    return () => unsub();
  }, [hydrated, isAuthenticated, user?.uid]);

  const loading = hydrated && isAuthenticated && bookings === null && !loadError;

  return (
    <>
      <div className="bg-[#120D07] px-6 pb-16 pt-36 text-center">
        <p
          className={`${merriweather.className} mb-4 text-xs uppercase tracking-[0.3em] text-[#DDA15E]`}
        >
          Flourish Roots Hair Co.
        </p>
        <h1 className={`${Bagelan.className} text-[clamp(2.5rem,10vw,5rem)] leading-none text-white`}>
          MY APPOINTMENTS
        </h1>
      </div>

      <section className="min-h-[50vh] bg-[#faf9f7] px-4 py-12 md:px-8">
        <div className="mx-auto max-w-2xl">
          {!hydrated && (
            <p className={`${merriweather.className} text-center text-sm text-stone-500`}>Loading…</p>
          )}

          {hydrated && !isAuthenticated && (
            <div className="rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
              <p className={`${merriweather.className} text-stone-700`}>
                Sign in to see your salon bookings.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button type="button" onClick={openAuthModal}>
                  Sign in
                </Button>
                <Button variant="outline" type="button" asChild>
                  <Link href="/services">Browse services</Link>
                </Button>
              </div>
            </div>
          )}

          {hydrated && isAuthenticated && loadError && (
            <p className={`${merriweather.className} text-center text-red-600`}>{loadError}</p>
          )}

          {hydrated && isAuthenticated && loading && (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-xl border border-stone-200 bg-stone-100/80"
                  aria-hidden
                />
              ))}
            </div>
          )}

          {hydrated && isAuthenticated && !loading && !loadError && Array.isArray(bookings) && bookings.length === 0 && (
            <div className="rounded-xl border border-stone-200 bg-white p-10 text-center shadow-sm">
              <p className={`${merriweather.className} text-stone-600`}>No bookings yet.</p>
              <p className="mt-2 text-sm text-stone-500">
                When you book from Salon Services, your appointments will show up here.
              </p>
              <Button className="mt-8" asChild>
                <Link href="/services">Book a service</Link>
              </Button>
            </div>
          )}

          {hydrated && isAuthenticated && !loading && !loadError && Array.isArray(bookings) && bookings.length > 0 && (
            <div className="space-y-6">
              <p
                className={`${merriweather.className} text-[10px] uppercase tracking-[0.3em] text-stone-400`}
              >
                {bookings.length} appointment{bookings.length !== 1 ? "s" : ""}
              </p>
              <ul className="space-y-5">
                {bookings.map((b) => (
                  <li key={b.id}>
                    <BookingCard booking={b} />
                  </li>
                ))}
              </ul>
              <p className="text-center">
                <Link
                  href="/services"
                  className={`${merriweather.className} text-sm font-semibold text-[#BD2E2E] underline-offset-4 hover:underline`}
                >
                  Book again
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
