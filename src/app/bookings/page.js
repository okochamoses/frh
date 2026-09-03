"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { CiClock2 } from "react-icons/ci";
import { merriweather, Bagelan } from "@/app/layout";
import { useAuth } from "@/app/contexts/AuthContext";
import { useBooking } from "@/app/contexts/BookingContext";
import { subscribeUserBookings, cancelBooking } from "@/lib/firebase/bookingService";
import { BookingDrawer } from "@/components/booking/BookingDrawer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h > 0 && `${h}h`, m > 0 && `${m}m`].filter(Boolean).join(" ");
};

const formatNgn = (n) => `₦${Number(n).toLocaleString("en-US")}`;

/** Cancelled and completed appointments are history; pending ones are still on. */
const STATUS_BADGES = {
  pending:   { label: "Confirmed", className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  completed: { label: "Completed", className: "bg-stone-100 text-stone-500 border-stone-200" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-600 border-red-100" },
};

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

function StatusBadge({ status }) {
  const badge = STATUS_BADGES[status] ?? STATUS_BADGES.pending;
  return (
    <span
      className={`${merriweather.className} inline-flex flex-shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

function BookingCard({ booking, onCancel, onReschedule, isBusy }) {
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

  const status = booking.status ?? "pending";
  const cancelled = status === "cancelled";
  const isUpcoming = !!start && start.isAfter(dayjs());
  const canChange = isUpcoming && status === "pending";

  const lines = bookingLines(booking);

  return (
    <article
      className={`rounded-xl border p-5 shadow-sm transition-opacity ${
        cancelled ? "border-stone-200/70 bg-stone-50/60 opacity-75" : "border-stone-200/90 bg-white"
      }`}
      aria-labelledby={`booking-${booking.id}-heading`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
          </div>
          <h2
            id={`booking-${booking.id}-heading`}
            className={`${merriweather.className} text-lg font-bold text-stone-900 ${
              cancelled ? "line-through decoration-stone-300" : ""
            }`}
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

      {canChange && (
        <div className="mt-5 flex flex-wrap gap-3 border-t border-stone-100 pt-4">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => onReschedule(booking)}
            disabled={isBusy}
          >
            Reschedule
          </Button>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="text-[#BD2E2E] hover:bg-red-50 hover:text-[#BD2E2E]"
            onClick={() => onCancel(booking)}
            isLoading={isBusy}
          >
            Cancel
          </Button>
        </div>
      )}

      {createdLabel && (
        <p className="mt-4 text-xs text-stone-400">Booked on {createdLabel}</p>
      )}
    </article>
  );
}

function SectionHeading({ children }) {
  return (
    <p className={`${merriweather.className} text-[10px] uppercase tracking-[0.3em] text-stone-400`}>
      {children}
    </p>
  );
}

export default function BookingsPage() {
  const { user, hydrated, isAuthenticated, openAuthModal } = useAuth();
  const { beginReschedule, step, backToServices } = useBooking();

  const [bookings, setBookings] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [pendingCancel, setPendingCancel] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionError, setActionError] = useState(null);

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

  // Upcoming reads forwards (the next visit first); history reads backwards.
  // One combined list sorted newest-first put past visits above future ones.
  const { upcoming, past } = useMemo(() => {
    if (!Array.isArray(bookings)) return { upcoming: [], past: [] };
    const now = dayjs();
    const isUpcoming = (b) => b.startTime && dayjs(b.startTime).isAfter(now);

    return {
      upcoming: bookings
        .filter(isUpcoming)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
      past: bookings
        .filter((b) => !isUpcoming(b))
        .sort((a, b) => new Date(b.startTime || 0) - new Date(a.startTime || 0)),
    };
  }, [bookings]);

  const loading = hydrated && isAuthenticated && bookings === null && !loadError;
  const drawerOpen = step === "datetime";

  const confirmCancel = async () => {
    if (!pendingCancel) return;
    setCancellingId(pendingCancel.id);
    setActionError(null);
    try {
      await cancelBooking(pendingCancel.id);
      setPendingCancel(null);
    } catch (err) {
      console.error("Cancel booking failed:", err);
      setActionError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

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

          {hydrated && isAuthenticated && !loading && !loadError && bookings?.length > 0 && (
            <div className="space-y-12">
              {actionError && (
                <p role="alert" className={`${merriweather.className} text-center text-sm text-red-600`}>
                  {actionError}
                </p>
              )}

              <div className="space-y-5">
                <SectionHeading>
                  {upcoming.length > 0
                    ? `${upcoming.length} upcoming appointment${upcoming.length !== 1 ? "s" : ""}`
                    : "Upcoming"}
                </SectionHeading>
                {upcoming.length > 0 ? (
                  <ul className="space-y-5">
                    {upcoming.map((b) => (
                      <li key={b.id}>
                        <BookingCard
                          booking={b}
                          onCancel={setPendingCancel}
                          onReschedule={beginReschedule}
                          isBusy={cancellingId === b.id}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-xl border border-dashed border-stone-200 bg-white/60 p-8 text-center">
                    <p className="text-sm text-stone-500">Nothing booked yet.</p>
                    <Button className="mt-5" asChild>
                      <Link href="/services">Book a service</Link>
                    </Button>
                  </div>
                )}
              </div>

              {past.length > 0 && (
                <div className="space-y-5">
                  <SectionHeading>Past</SectionHeading>
                  <ul className="space-y-5">
                    {past.map((b) => (
                      <li key={b.id}>
                        <BookingCard
                          booking={b}
                          onCancel={setPendingCancel}
                          onReschedule={beginReschedule}
                          isBusy={false}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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

      {/* Cancelling emails the salon, so it is worth one confirmation step. */}
      <Dialog open={!!pendingCancel} onOpenChange={() => setPendingCancel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={`${merriweather.className} text-xl`}>
              Cancel this appointment?
            </DialogTitle>
            <DialogDescription>
              {pendingCancel?.startTime
                ? `${dayjs(pendingCancel.startTime).format("dddd, D MMMM")} at ${dayjs(
                    pendingCancel.startTime
                  ).format("HH:mm")} — ${pendingCancel.servicesText || "your appointment"}.`
                : "This cannot be undone."}
              {" "}We&apos;ll let the salon know. You can always book again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" type="button" onClick={() => setPendingCancel(null)}>
              Keep it
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmCancel}
              isLoading={cancellingId === pendingCancel?.id}
            >
              Cancel appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BookingDrawer open={drawerOpen} onClose={backToServices} />
    </>
  );
}
