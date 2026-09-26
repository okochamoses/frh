"use client";

/**
 * Recording a booking for someone at the front desk.
 *
 * Two things happen here that the customer-facing flow never does. Staff can
 * record a visit that has *already happened* — someone walked in, was served,
 * and is standing at the desk — which no schedule rule should be allowed to
 * refuse, because the chair was evidently free. And staff can take a future
 * appointment on someone's behalf, which is the ordinary booking with a
 * different typist and meets exactly the rules a customer would.
 *
 * The services grid, the sheet, the cart rules and the calendar are the same
 * components the public page uses — a walk-in priced by a different code path
 * than an online booking is a reconciliation problem waiting to happen. What
 * differs is the shape around them: one scrolling page, no wizard. A four-step
 * funnel exists to reduce a customer's anxiety about committing; at a desk with
 * someone waiting it is only friction.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MOBILE_HINT, isValidMobile, normaliseMobile } from "@/lib/phone";
import { VALIDATION } from "@/lib/auth/constants";
import { createWalkInBooking } from "@/lib/firebase/bookingService";
import { subscribeAllCustomers } from "@/lib/firebase/adminService";
import { customerName, findCustomerByMobile } from "@/lib/booking/customers";
import {
  MAX_APPOINTMENT_MINUTES,
  formatDuration,
  naira,
  parseKey,
  toInstant,
  watToday,
} from "@/lib/booking/schedule";
import ServicesStep from "@/components/v2/booking/ServicesStep";
import ServiceSheet from "@/components/v2/booking/ServiceSheet";
import TimeStep from "@/components/v2/booking/TimeStep";
import { Field, NotesField } from "@/components/v2/booking/Steps";
import { useServiceCart } from "@/components/v2/booking/useServiceCart";
import { HEADING, PillButton, Toast, useToast } from "@/components/v2/booking/ui";

// Mirrors MAX_NOTES_LENGTH in functions/lib/notes.js.
const MAX_NOTES = 500;
const EMPTY_CUSTOMER = { firstName: "", phone: "", email: "" };
// ServicesStep reads `history` with .get()/.has(), so it must be a real Map.
// Nobody's past visits are relevant at the desk, so it is permanently empty —
// hoisted rather than built inline so the grid isn't handed a new identity on
// every keystroke in the form below it.
const EMPTY_HISTORY = new Map();

/** Field errors for the person at the desk; an empty object when they're fine. */
function customerErrorsFor(customer) {
  const errors = {};
  if (!customer.firstName.trim()) errors.firstName = "Who is this booking for?";
  if (!isValidMobile(customer.phone)) errors.phone = MOBILE_HINT;
  if (customer.email.trim() && !VALIDATION.EMAIL_REGEX.test(customer.email.trim())) {
    errors.email = "That email address doesn't look right.";
  }
  return errors;
}

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className={`${HEADING} mb-3 text-xl`}>{title}</h2>
      {children}
    </section>
  );
}

export default function WalkInBookingForm() {
  const { toast, show: showToast, hide: hideToast } = useToast();

  // The admin dashboard is part of a static export, so anything that depends
  // on "now" waits for the browser rather than baking in the build clock.
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const [error, setError] = useState(null);
  const clearError = useCallback(() => setError(null), []);
  const {
    selected,
    setSelected,
    options,
    duration,
    total,
    toggle,
    addOption,
    applyFromSheet,
    sheetLook,
    openSheet,
    closeSheet,
  } = useServiceCart({ showToast, surface: "admin", onChange: clearError });

  const [view, setView] = useState("list");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [dismissedNudges, setDismissedNudges] = useState([]);

  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [customerErrors, setCustomerErrors] = useState({});
  const [notes, setNotes] = useState("");

  const [served, setServed] = useState(true);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [month, setMonth] = useState(null);

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  // ── Who is at the desk ─────────────────────────────────────────────────────
  const [customers, setCustomers] = useState([]);
  useEffect(() => subscribeAllCustomers(setCustomers, () => setCustomers([])), []);

  /*
   * Advisory only. The server matches a walk-in to an account on the email
   * address, because Auth can say whether anyone proved it — a typed phone
   * number proves nothing. But staff recognise a regular by their number, so
   * the lookup runs on the number and offers the account's email for them to
   * confirm. Nothing here is sent; the server does its own match.
   */
  const match = useMemo(
    () => findCustomerByMobile(customers, customer.phone),
    [customers, customer.phone]
  );
  const matchName = customerName(match);
  const emailAlreadyTheirs =
    match?.email && match.email.toLowerCase() === customer.email.trim().toLowerCase();

  const setField = (key) => (e) => {
    setCustomer((prev) => ({ ...prev, [key]: e.target.value }));
    setCustomerErrors((prev) => ({ ...prev, [key]: undefined }));
    setError(null);
  };

  const useMatchDetails = () => {
    if (!match) return;
    setCustomer((prev) => ({
      firstName: prev.firstName.trim() || match.firstName || "",
      phone: prev.phone,
      email: match.email || prev.email,
    }));
    setCustomerErrors({});
  };

  // ── When ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (served || month || !now) return;
    const { year, month: m } = parseKey(watToday(now));
    setMonth({ year, month: m });
  }, [served, month, now]);

  const pickDate = (key) => {
    setDate(key);
    setTime(null);
    setError(null);
  };
  const pick = (key, hhmm) => {
    setDate(key);
    setTime(hhmm);
    setError(null);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const tooLong = duration > MAX_APPOINTMENT_MINUTES;
  const timeReady = served || Boolean(date && time);
  const canSubmit = options.length > 0 && !tooLong && timeReady && !busy;

  const submit = async () => {
    const errors = customerErrorsFor(customer);
    setCustomerErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Check the client's details below.");
      return;
    }
    if (!canSubmit) return;

    setBusy(true);
    setError(null);
    try {
      const res = await createWalkInBooking({
        services: options,
        customer: {
          firstName: customer.firstName.trim(),
          mobileNumber: normaliseMobile(customer.phone),
          email: customer.email.trim() || null,
        },
        served,
        startTime: served ? undefined : toInstant(date, time),
        notes,
      });
      setResult({ ...res, options, customer: { ...customer }, served });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const recordAnother = () => {
    setResult(null);
    setSelected([]);
    setCustomer(EMPTY_CUSTOMER);
    setCustomerErrors({});
    setNotes("");
    setServed(true);
    setDate(null);
    setTime(null);
    setQuery("");
    setDismissedNudges([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Done ───────────────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className={`${HEADING} text-3xl`}>
          {result.served ? "Visit recorded" : "Booking taken"}
        </h1>
        <dl className="mt-6 space-y-2 rounded-v2-xl bg-cream-100 p-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Client</dt>
            <dd className="font-semibold">{result.customer.firstName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Services</dt>
            <dd className="text-right font-semibold">
              {result.options.map((o) => o.name).join(", ")}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Total</dt>
            <dd className="font-semibold tabular-nums">{naira(result.totalAmount)}</dd>
          </div>
        </dl>

        {/*
          Both of these are decisions the server made, not this form — whether
          a confirmation went out, and whether the visit landed on a real
          account. Staff can answer "will she see this in her app?" without
          anyone having to guess.
        */}
        <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">
          <li>
            {result.customer.email
              ? `Emailed ${result.customer.email}.`
              : "No email given, so nothing was sent — mention it to them."}
          </li>
          <li>
            {result.matchedUserId
              ? "Added to their account, so it shows in their bookings."
              : "Not linked to an account yet. It will attach itself if they sign up with that email and confirm it."}
          </li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <PillButton onClick={recordAnother}>Record another</PillButton>
          {/* A link, not a PillButton wrapping one — an anchor inside a button
              is invalid markup and the click target becomes ambiguous. */}
          <Link
            href="/admin/bookings"
            className="inline-flex h-12 items-center justify-center rounded-full border border-ink px-6 text-sm font-semibold transition-colors hover:bg-ink/5"
          >
            Back to bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className={`${HEADING} text-3xl`}>New booking</h1>
        <Link href="/admin/bookings" className="text-sm font-semibold underline">
          Cancel
        </Link>
      </div>

      {/*
        `flex-row-reverse` on a wide screen, so the client panel sits on the
        right while staying FIRST in the source — which is what a phone at the
        desk gets, and the point of the whole arrangement. The services list is
        the salon's full catalogue: seventy rows. Anything below it is, in
        practice, unreachable.
      */}
      <div className="flex flex-col gap-8 lg:flex-row-reverse lg:items-start">
        <aside className="lg:sticky lg:top-6 lg:w-[22rem] lg:shrink-0">
        <Section title="Client">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Field
              id="walkin-phone"
              label="Phone"
              required
              type="tel"
              inputMode="tel"
              autoComplete="off"
              value={customer.phone}
              onChange={setField("phone")}
              error={customerErrors.phone}
              hint={!customerErrors.phone && matchName ? `${matchName} has an account.` : undefined}
            />
            <Field
              id="walkin-name"
              label="First name"
              required
              autoComplete="off"
              value={customer.firstName}
              onChange={setField("firstName")}
              error={customerErrors.firstName}
            />
            <div className="sm:col-span-2 lg:col-span-1">
              <Field
                id="walkin-email"
                label="Email"
                optional
                type="email"
                autoComplete="off"
                value={customer.email}
                onChange={setField("email")}
                error={customerErrors.email}
                hint="Their confirmation goes here, and it is what puts the visit on their account."
              />
            </div>
          </div>

          {match && !emailAlreadyTheirs && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-v2-lg border border-dashed border-ash px-4 py-3 text-sm">
              <span>
                <b>{matchName}</b> has an account on this number
                {match.email ? ` — ${match.email}` : ""}.
              </span>
              {match.email && (
                <PillButton size="sm" variant="quiet" onClick={useMatchDetails}>
                  Use these details
                </PillButton>
              )}
            </div>
          )}

          <div className="mt-4">
            <NotesField value={notes} onChange={setNotes} max={MAX_NOTES} />
          </div>
        </Section>

        <Section title="When">
          <div className="flex flex-wrap gap-2">
            <PillButton
              size="sm"
              variant={served ? "primary" : "quiet"}
              aria-pressed={served}
              onClick={() => {
                setServed(true);
                setError(null);
              }}
            >
              Served now
            </PillButton>
            <PillButton
              size="sm"
              variant={served ? "quiet" : "primary"}
              aria-pressed={!served}
              onClick={() => {
                setServed(false);
                setError(null);
              }}
            >
              Booked for later
            </PillButton>
          </div>

          {served ? (
            <p className="mt-3 text-sm text-ink-soft">
              Recorded as finishing now, and marked complete. They get a thank-you email if you
              entered one.
            </p>
          ) : (
            now &&
            month && (
              <div className="mt-4">
                <TimeStep
                  duration={duration}
                  now={now}
                  month={month}
                  onMonth={setMonth}
                  date={date}
                  time={time}
                  onDate={pickDate}
                  onPick={pick}
                  usual={null}
                />
              </div>
            )
          )}
        </Section>
        </aside>

        <div className="min-w-0 flex-1">
        <Section title="Services">
          <ServicesStep
            selected={selected}
            history={EMPTY_HISTORY}
            view={view}
            onView={setView}
            category={category}
            onCategory={setCategory}
            query={query}
            onQuery={setQuery}
            dismissedNudges={dismissedNudges}
            onDismissNudge={(id) => setDismissedNudges((prev) => [...prev, id])}
            onToggle={(o) => toggle(o)}
            onAdd={addOption}
            onOpenSheet={openSheet}
            rebook={null}
            upcoming={null}
            showHelpCard={false}
            stickyTop="top-0"
            surface="admin"
          />
        </Section>
        </div>
      </div>


      <div className="sticky bottom-0 -mx-4 border-t border-latte bg-sand/95 px-4 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm">
            {options.length === 0 ? (
              <span className="text-ink-soft">No services picked yet.</span>
            ) : (
              <>
                <b className="tabular-nums">{naira(total)}</b>
                <span className="text-ink-soft"> · {formatDuration(duration)}</span>
              </>
            )}
          </p>
          <PillButton onClick={submit} disabled={!canSubmit}>
            {busy ? "Saving…" : served ? "Record visit" : "Take booking"}
          </PillButton>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <ServiceSheet
        lookId={sheetLook}
        selected={selected}
        onClose={closeSheet}
        onApply={applyFromSheet}
      />
      <Toast toast={toast} onHide={hideToast} />
    </div>
  );
}
