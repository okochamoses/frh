"use client";

/**
 * One booking, opened from the link in its confirmation email.
 *
 * This page exists for the guest. Booking needs no account, so most clients
 * finish the flow with no way to sign back in — and until now the only thing
 * the success screen could offer them was a WhatsApp message and a wait. The
 * link in their email carries a signed token, which the `getBooking`,
 * `rescheduleBooking` and `cancelBooking` callables accept in place of an
 * owning account, so the same two actions an account holder gets on
 * `/bookings` work here too.
 *
 * An account holder who follows their own link lands here as well; nothing
 * about it is guest-only.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { getBooking, cancelBooking, rescheduleBooking } from "@/lib/firebase/bookingService";
import {
  formatDuration,
  fromInstant,
  longDate,
  naira,
  parseKey,
  toInstant,
} from "@/lib/booking/schedule";
import { SALON_ADDRESS, SALON_MAPS_URL, whatsappUrl } from "@/lib/booking/calendarLinks";
import TimeStep from "./TimeStep";
import { HEADING, PillButton } from "./ui";

const CLOCK_TICK_MS = 60_000;

function monthOf(key) {
  const { year, month } = parseKey(key);
  return { year, month };
}

function Shell({ children }) {
  return <main className="mx-auto max-w-3xl px-4 pb-24 pt-10 md:px-8">{children}</main>;
}

/** The dead ends: a link that was mistyped, expired, or already acted on. */
function Problem({ title, message }) {
  return (
    <Shell>
      <p className="type-eyebrow">Your booking</p>
      <h1 className={`${HEADING} mt-2 text-[clamp(2rem,3.4vw,2.75rem)]`}>{title}</h1>
      <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">{message}</p>
      <div className="mt-7 flex flex-wrap gap-2.5">
        <PillButton
          onClick={() => {
            window.location.href = whatsappUrl("Hi! I'd like to change a booking.");
          }}
        >
          WhatsApp the salon
        </PillButton>
        <a
          href="/v2/booking"
          className="inline-flex h-12 items-center rounded-full border border-ink px-6 text-sm font-semibold hover:bg-ink/5"
        >
          Book a visit
        </a>
      </div>
    </Shell>
  );
}

export default function ManageBooking() {
  const [link, setLink] = useState(null); // { ref, token } once the URL is read
  const [booking, setBooking] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const [now, setNow] = useState(null);
  const [moving, setMoving] = useState(false);
  const [month, setMonth] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [done, setDone] = useState(null); // "cancelled" | "moved"

  // A static export has no server-side params, so the link is read in the
  // browser — and the clock is too, for the same reason as the booking page.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLink({ ref: params.get("ref") ?? "", token: params.get("t") ?? "" });
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!link) return;
    if (!link.ref || !link.token) {
      setLoadError("That link is incomplete. Please open it straight from your confirmation email.");
      return;
    }
    let live = true;
    getBooking(link.ref, link.token)
      .then((row) => live && setBooking(row))
      .catch((err) => live && setLoadError(err.message));
    return () => {
      live = false;
    };
  }, [link]);

  const start = useMemo(() => (booking ? fromInstant(booking.startTime) : null), [booking]);
  const end = useMemo(() => (booking ? fromInstant(booking.endTime) : null), [booking]);
  const duration = booking?.totalDuration ?? null;

  // Open the calendar on the month the appointment is currently in.
  useEffect(() => {
    if (!start || !now) return;
    setMonth((m) => m ?? monthOf(start.key));
  }, [start, now]);

  const pickDate = useCallback((key) => {
    setDate(key);
    setTime(null);
    setActionError(null);
  }, []);

  const pick = useCallback((key, t) => {
    setDate(key);
    setTime(t);
    setMonth(monthOf(key));
    setActionError(null);
  }, []);

  const doMove = async () => {
    if (!date || !time) return;
    setBusy(true);
    setActionError(null);
    try {
      const res = await rescheduleBooking(link.ref, toInstant(date, time), link.token);
      setBooking((b) => ({ ...b, startTime: res.startTime, endTime: res.endTime }));
      setMoving(false);
      setDate(null);
      setTime(null);
      setDone("moved");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const doCancel = async () => {
    setBusy(true);
    setActionError(null);
    try {
      await cancelBooking(link.ref, link.token);
      setDone("cancelled");
      setConfirmingCancel(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setActionError(err.message);
      setConfirmingCancel(false);
    } finally {
      setBusy(false);
    }
  };

  if (loadError) {
    return <Problem title="We couldn't open that booking" message={loadError} />;
  }

  if (!booking || !now || !month) {
    return (
      <Shell>
        <h1 className={`${HEADING} text-[clamp(2rem,3.4vw,2.75rem)]`}>Your booking</h1>
        <p className="mt-4 text-sm text-ink-soft">Finding your appointment…</p>
      </Shell>
    );
  }

  if (done === "cancelled") {
    return (
      <Shell>
        <p className="type-eyebrow">Cancelled</p>
        <h1 className={`${HEADING} mt-2 text-[clamp(2rem,3.4vw,2.75rem)]`}>That&apos;s taken care of</h1>
        <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">
          Your appointment on {longDate(start.key)} is cancelled and the salon has been told. Nothing
          else to do.
        </p>
        <div className="mt-7">
          <PillButton onClick={() => { window.location.href = "/v2/booking"; }}>
            Book another visit
          </PillButton>
        </div>
      </Shell>
    );
  }

  const services = booking.services?.length
    ? booking.services.map((s) => s.title).filter(Boolean).join(", ")
    : booking.servicesText || "Your appointment";

  return (
    <Shell>
      <p className="type-eyebrow">Your booking</p>
      <h1 className={`${HEADING} mt-2 text-[clamp(2rem,3.4vw,2.75rem)]`}>
        {booking.userFirstName ? `Hello ${booking.userFirstName}` : "Your appointment"}
      </h1>

      {done === "moved" && (
        <p role="status" className="mt-5 rounded-v2-xl bg-gold/40 px-5 py-4 text-sm">
          <b>Moved.</b> Your appointment is now {longDate(start.key)} at {start.time}. We&apos;ve let
          the salon know.
        </p>
      )}

      <div className="mt-6 grid gap-3 rounded-v2-2xl border border-latte p-5 text-[15px]">
        <p className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden />
          {longDate(start.key)}
        </p>
        <p className="flex items-center gap-3">
          <Clock className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden />
          <span>
            {start.time}–{end.time}
            {duration ? <span className="text-ink-soft"> ({formatDuration(duration)})</span> : null}
          </span>
        </p>
        <p className="flex items-center gap-3">
          <MapPin className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden />
          <a href={SALON_MAPS_URL} target="_blank" rel="noreferrer" className="underline underline-offset-4">
            {SALON_ADDRESS}
          </a>
        </p>
        <div className="mt-1 border-t border-latte pt-3.5 text-sm">
          <p className="text-ink-soft">Services</p>
          <p className="mt-1 font-semibold">{services}</p>
        </div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-ink-soft">Total</span>
          <b className="text-lg tabular-nums">{naira(booking.totalAmount)}</b>
        </div>
        {booking.notes && (
          <div className="border-t border-latte pt-3.5 text-sm">
            <p className="text-ink-soft">Your note</p>
            <p className="mt-1 whitespace-pre-line leading-relaxed">{booking.notes}</p>
          </div>
        )}
      </div>

      {actionError && (
        <div role="alert" className="mt-5 rounded-v2-xl bg-red-50 p-4 text-sm text-red-800">
          {actionError}
        </div>
      )}

      {!moving && !confirmingCancel && (
        <div className="mt-7 flex flex-wrap gap-2.5">
          <PillButton onClick={() => setMoving(true)}>Move this booking</PillButton>
          <PillButton variant="ghost" onClick={() => setConfirmingCancel(true)}>
            Cancel it
          </PillButton>
          <a
            href={whatsappUrl(`Hi! About my booking (reference ${booking.bookingId}):`)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center px-2 text-sm font-semibold text-ink underline underline-offset-4"
          >
            Ask a question
          </a>
        </div>
      )}

      {confirmingCancel && (
        <div className="mt-7 rounded-v2-2xl bg-cream-100 p-5">
          <h2 className="text-lg font-bold">Cancel this appointment?</h2>
          <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink-soft">
            {longDate(start.key)} at {start.time} — {services}. We&apos;ll tell the salon. You can
            always book again.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <PillButton variant="ghost" onClick={() => setConfirmingCancel(false)} disabled={busy}>
              Keep it
            </PillButton>
            <PillButton onClick={doCancel} disabled={busy} aria-busy={busy || undefined}>
              {busy ? "Cancelling…" : "Yes, cancel it"}
            </PillButton>
          </div>
        </div>
      )}

      {moving && (
        <div className="mt-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <h2 className={`${HEADING} text-2xl`}>Pick a new time</h2>
            <button
              type="button"
              onClick={() => {
                setMoving(false);
                setDate(null);
                setTime(null);
              }}
              className="text-[13px] font-semibold text-ink underline underline-offset-4"
            >
              Keep {start.time} on {longDate(start.key)}
            </button>
          </div>

          <TimeStep
            duration={duration ?? 0}
            now={now}
            month={month}
            onMonth={setMonth}
            date={date}
            time={time}
            onDate={pickDate}
            onPick={pick}
            usual={null}
          />

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <PillButton onClick={doMove} disabled={!date || !time || busy} aria-busy={busy || undefined}>
              {busy ? "Moving…" : "Move my booking"}
            </PillButton>
            <p className="text-xs text-ink-soft">
              {date && time
                ? `${longDate(date)} at ${time}. The same services, the same price.`
                : "Pick a day and a time."}
            </p>
          </div>
        </div>
      )}
    </Shell>
  );
}
