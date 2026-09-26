"use client";

/**
 * The v2 booking page: Services → Time → Details → Confirm.
 *
 * No account is needed. At the Details step a guest gives a name and a phone
 * number (email optional); a client with an account can log in instead. A
 * guest is signed in anonymously at the moment they confirm, so the booking
 * still has an owner. Either way the booking goes through the `createBooking`
 * callable, which prices the services and re-validates the slot server-side.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { AUTH_MODES, VALIDATION } from "@/lib/auth/constants";
import { ensureGuestSession } from "@/lib/firebase/authService";
import { MOBILE_HINT, isValidMobile, normaliseMobile } from "@/lib/phone";
import { createBooking, subscribeUserBookings } from "@/lib/firebase/bookingService";
import { updateMobileNumber } from "@/lib/firebase/userService";
import { LOOK_BY_SLUG, SERVICE_BY_TITLE } from "@/lib/booking/catalogue";
import { track } from "@/lib/analytics";
import {
  MAX_APPOINTMENT_MINUTES,
  dayUnavailableReason,
  firstAvailable,
  fromInstant,
  nextOnWeekday,
  parseKey,
  slotsFor,
  toInstant,
  watToday,
} from "@/lib/booking/schedule";
import {
  bookingHistory,
  clearSnooze,
  isSnoozed,
  optionsForBooking,
  rebookSuggestion,
  snooze,
  splitBookings,
} from "@/lib/booking/rebook";
import ServicesStep from "./ServicesStep";
import { useServiceCart } from "./useServiceCart";
import ServiceSheet from "./ServiceSheet";
import TimeStep from "./TimeStep";
import { depositForOptions } from "@/lib/booking/deposits";
import { setBooked } from "@/lib/booking/focusMode";
import { SALON_WHATSAPP } from "@/lib/booking/calendarLinks";
import { AppointmentSlip, DetailsStep, MobileBar, ReviewStep, Stepper, SuccessView } from "./Steps";
import { HEADING, PillButton, Toast, useToast } from "./ui";

const CART_KEY = "frh:v2:booking";
const VIEW_KEY = "frh:v2:booking-view";
// A guest's own details, kept on their device so a return visit is prefilled.
const GUEST_KEY = "frh:v2:guest";
// Mirrors MAX_NOTES_LENGTH in functions/lib/notes.js.
const MAX_NOTES = 500;
const CLOCK_TICK_MS = 60_000;

const TITLES = {
  1: "Book a visit",
  2: "When suits you?",
  3: "Your details",
  4: "Check and confirm",
};

function readStorage(storage, key) {
  try {
    const raw = window[storage].getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(storage, key, value) {
  try {
    if (value === null) window[storage].removeItem(key);
    else window[storage].setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is a convenience; a blocked storage must not break booking.
  }
}

const EMPTY_GUEST = { firstName: "", phone: "", email: "" };

/** Field errors for a guest's details; an empty object when they're fine. Mirrors functions/lib/guest.js. */
function guestErrorsFor(guest) {
  const errors = {};
  if (!guest.firstName.trim()) errors.firstName = "Please tell us your name.";
  if (!isValidMobile(guest.phone)) {
    errors.phone = MOBILE_HINT;
  }
  if (guest.email.trim() && !VALIDATION.EMAIL_REGEX.test(guest.email.trim())) {
    errors.email = "That email address doesn't look right.";
  }
  return errors;
}

/** What the bar says on the details step: what's still missing, or that it's ready. */
function guestMissing(guest) {
  const name = guest.firstName.trim();
  const phone = guest.phone.trim();
  if (!name && !phone) return "Add name and phone";
  if (!name) return "Add your name";
  if (!phone) return "Add your phone";
  return "Ready to review";
}

const guestIsValid = (guest) => Object.keys(guestErrorsFor(guest)).length === 0;

/** Firebase refuses anonymous sign-in until it is switched on for the project. */
const GUEST_DISABLED_CODES = new Set(["auth/operation-not-allowed", "auth/admin-restricted-operation"]);

function monthOf(key) {
  const { year, month } = parseKey(key);
  return { year, month };
}

export default function BookingFlow() {
  const { user, guestUid, hydrated, openAuthModal, updateUser } = useAuth();
  const { toast, show: showToast, hide: hideToast } = useToast();

  // The page is a static export, so anything that depends on "now" waits for
  // the browser — otherwise the build machine's clock would be baked in.
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const [step, setStep] = useState(1);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [month, setMonth] = useState(null);
  const [view, setView] = useState("grid");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [dismissedNudges, setDismissedNudges] = useState([]);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(null);
  const [notes, setNotes] = useState("");
  const [guest, setGuest] = useState(EMPTY_GUEST);
  const [guestErrors, setGuestErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  // The site footer and nav come back once the booking is made.
  useEffect(() => {
    setBooked(Boolean(result));
    return () => setBooked(false);
  }, [result]);
  const [bookings, setBookings] = useState([]);
  const [snoozed, setSnoozed] = useState(false);
  const [restored, setRestored] = useState(false);

  /*
   * The cart — what is chosen, what it costs, and the rules for adding to it —
   * is shared with the admin dashboard's walk-in form, so it lives in its own
   * hook rather than here. `selectedRef` comes back out of it for the `?look=`
   * handler below, which must read the live value without re-running.
   */
  const clearError = useCallback(() => setError(null), []);
  const {
    selected,
    setSelected,
    selectedRef,
    options,
    duration,
    total,
    refuseIfTooLong,
    toggle,
    addOption,
    applyFromSheet,
    sheetLook,
    openSheet,
    closeSheet,
  } = useServiceCart({ showToast, onChange: clearError });

  // Funnel entry. Everything else is measured as a share of this.
  useEffect(() => {
    track("booking_open");
  }, []);

  // ── Restore the cart (and view) from this tab ──────────────────────────────
  useEffect(() => {
    const saved = readStorage("sessionStorage", CART_KEY);
    if (saved) {
      const titles = (saved.selected ?? []).filter((t) => SERVICE_BY_TITLE.has(t));
      setSelected(titles);
      if (saved.date && saved.time) {
        setDate(saved.date);
        setTime(saved.time);
      }
      if (typeof saved.notes === "string") setNotes(saved.notes);
      if (titles.length && saved.step >= 2 && saved.step <= 4) setStep(saved.step);
    }
    const savedGuest = readStorage("localStorage", GUEST_KEY);
    if (savedGuest && typeof savedGuest === "object") setGuest({ ...EMPTY_GUEST, ...savedGuest });
    const savedView = readStorage("localStorage", VIEW_KEY);
    if (savedView === "grid" || savedView === "list") setView(savedView);
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    writeStorage("sessionStorage", CART_KEY, result ? null : { selected, date, time, step, notes });
  }, [restored, selected, date, time, step, notes, result]);

  // ── The client's own bookings (for rebooking and "booked before") ─────────
  // A guest's bookings belong to their anonymous session, so a guest who booked
  // on this device gets the same "book the same again" as an account holder.
  const ownerUid = user?.uid ?? guestUid ?? null;
  useEffect(() => {
    if (!ownerUid) {
      setBookings([]);
      return undefined;
    }
    return subscribeUserBookings(
      ownerUid,
      (rows) => setBookings(rows),
      () => setBookings([])
    );
  }, [ownerUid]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const history = useMemo(() => (now ? bookingHistory(bookings, now) : new Map()), [bookings, now]);
  const { upcoming } = useMemo(() => (now ? splitBookings(bookings, now) : { upcoming: [] }), [bookings, now]);

  const suggestion = useMemo(() => {
    if (!now || !ownerUid) return null;
    const s = rebookSuggestion(bookings, now);
    return s && !isSnoozed(s.booking.id, now) ? s : null;
    // `snoozed` is a dependency so "Not yet" re-reads storage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, now, ownerUid, snoozed]);

  const rebookDuration = suggestion ? suggestion.options.reduce((s, o) => s + o.duration, 0) : 0;
  const rebookTarget = useMemo(() => {
    if (!suggestion || !now) return null;
    return nextOnWeekday(suggestion.usual.weekday, suggestion.usual.time, rebookDuration, now);
  }, [suggestion, now, rebookDuration]);

  // The client's usual slot, offered on the Time step when it fits.
  const usualSlot = useMemo(() => {
    if (!now || !ownerUid || duration === 0) return null;
    const { past } = splitBookings(bookings, now);
    if (!past.length) return null;
    const last = fromInstant(past[0].startTime);
    return nextOnWeekday(last.weekday, last.time, duration, now);
  }, [bookings, now, ownerUid, duration]);

  // A chosen slot can stop fitting when services change or the clock moves on.
  useEffect(() => {
    if (!now || !date) return;
    if (duration > 0 && dayUnavailableReason(date, duration, now)) {
      setDate(null);
      setTime(null);
    } else if (time && duration > 0 && !slotsFor(date, duration, now).includes(time)) {
      setTime(null);
    }
  }, [now, date, time, duration]);

  // A restored "Confirm" step needs someone to book for: an account, or a
  // guest's completed details.
  useEffect(() => {
    if (hydrated && !user && step === 4 && !guestIsValid(guest)) setStep(3);
  }, [hydrated, user, step, guest]);

  // Keep the calendar on the month of the chosen date.
  useEffect(() => {
    if (!now) return;
    if (date) setMonth(monthOf(date));
    else setMonth((m) => m ?? monthOf(watToday(now)));
  }, [now, date]);

  // `?again=<bookingId>` — the link a rebook reminder would carry.
  useEffect(() => {
    if (!now || !ownerUid || bookings.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("again");
    if (!id) return;
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      const again = optionsForBooking(booking).map((o) => o.title);
      if (again.length) {
        setSelected(again);
        setStep(2);
      }
    }
    params.delete("again");
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [now, ownerUid, bookings]);

  const scrollTop = () => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  /*
   * `?look=<slug>` — the link every row of the public services menu carries.
   *
   * Someone who has read the priced menu and tapped a style has already chosen
   * it; landing them on an empty step 1 to hunt for that same style again, in a
   * grid that looks nothing like the list they just read, throws the decision
   * away and makes the two pages feel like one job done twice.
   *
   * Waits for the cart restore above, because this tab may already hold a
   * half-built booking. The link then adds to that cart rather than replacing
   * it — a customer who picked two services and went back for a third would
   * otherwise lose the first two without being told.
   *
   * A look with sizes opens its sheet rather than guessing a size: the price on
   * the menu was a "from", so the size is still an open question. Either way the
   * step goes back to the services grid first, so the sheet is not left floating
   * over a restored calendar.
   *
   * Runs once, and strips the parameter either way, so a reload does not re-add
   * a service the customer has since removed.
   */
  const lookParamRead = useRef(false);
  useEffect(() => {
    if (!restored || lookParamRead.current) return;
    lookParamRead.current = true;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("look");
    if (!slug) return;

    params.delete("look");
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);

    // An unknown slug — a stale bookmark, or a style the salon has retired —
    // leaves them at step 1, which is where they would have been anyway.
    const look = LOOK_BY_SLUG.get(slug);
    if (!look) return;

    track("look_deeplink", { look: slug, variants: look.hasVariants });

    if (look.hasVariants) {
      setStep(1);
      openSheet(look.id);
      return;
    }

    const option = look.options[0];
    if (selectedRef.current.includes(option.title)) {
      setStep(1);
      return;
    }
    if (refuseIfTooLong(option)) {
      setStep(1);
      return;
    }
    setSelected((prev) => [...prev, option.title]);

    // A cart that was empty means they came straight from the menu with one
    // style in mind, so the calendar is the next question. A cart that already
    // had something stays on the grid, where the new card is visibly added
    // next to what they picked before.
    setStep(selectedRef.current.length === 0 ? 2 : 1);
  }, [restored, refuseIfTooLong]);

  const goTo = (n) => {
    // The whole point of the funnel: which step people leave from.
    if (n !== step) track("step_advance", { from: step, to: n, direction: n > step ? "forward" : "back" });
    setStep(n);
    setError(null);
    scrollTop();
  };

  const pick = (key, t) => {
    setDate(key);
    setTime(t);
    setMonth(monthOf(key));
    setError(null);
  };

  const pickDate = (key) => {
    setDate(key);
    const slots = slotsFor(key, duration, now);
    setTime((t) => (t && slots.includes(t) ? t : null));
  };

  const bookSame = () => {
    if (!suggestion) return;
    setSelected(suggestion.options.map((o) => o.title));
    const target = rebookTarget ?? firstAvailable(rebookDuration, now);
    if (target) pick(target.key, target.time);
    goTo(user?.mobileNumber || (!user && guestIsValid(guest)) ? 4 : 3);
  };

  const rebookPick = (kind, lookId) => {
    if (kind === "sheet") {
      openSheet(lookId);
      return;
    }
    if (!suggestion) return;
    setSelected(suggestion.options.map((o) => o.title));
    goTo(2);
  };

  const snoozeRebook = () => {
    if (!suggestion) return;
    const until = snooze(suggestion.booking.id, now);
    setSnoozed((s) => !s);
    showToast(`OK. We'll ask again after ${until.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}.`, () => {
      clearSnooze();
      setSnoozed((s) => !s);
    });
  };

  const signIn = (mode) => {
    openAuthModal({
      mode: mode === "signup" ? AUTH_MODES.SIGN_UP : AUTH_MODES.SIGN_IN,
      // Carry on where they were: straight to Confirm when the profile already
      // has the phone number the salon needs.
      onSuccess: (profile) => {
        if (profile?.mobileNumber) goTo(4);
      },
    });
  };

  const updateGuest = (patch) => {
    setGuest((g) => ({ ...g, ...patch }));
    setGuestErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(patch)) delete next[k];
      return next;
    });
  };

  const continueFromDetails = async () => {
    if (!user) {
      const errors = guestErrorsFor(guest);
      setGuestErrors(errors);
      const first = ["firstName", "phone", "email"].find((k) => errors[k]);
      if (first) {
        // The button stays tappable so a tap explains itself: it lands on the
        // first thing to fix instead of doing nothing.
        const id = { firstName: "guest-name", phone: "guest-phone", email: "guest-email" }[first];
        requestAnimationFrame(() => document.getElementById(id)?.focus());
        return;
      }
      writeStorage("localStorage", GUEST_KEY, {
        firstName: guest.firstName.trim(),
        phone: normaliseMobile(guest.phone),
        email: guest.email.trim(),
      });
      goTo(4);
      return;
    }
    if (user.mobileNumber) {
      goTo(4);
      return;
    }
    if (!isValidMobile(phone)) {
      setPhoneError(MOBILE_HINT);
      return;
    }
    setPhoneError(null);
    setBusy(true);
    try {
      const normalised = normaliseMobile(phone);
      await updateMobileNumber(user.uid, normalised);
      updateUser({ mobileNumber: normalised });
      goTo(4);
    } catch {
      setPhoneError("We couldn't save that number. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    if (!user && !guestIsValid(guest)) {
      goTo(3);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let guestDetails;
      if (!user) {
        await ensureGuestSession();
        guestDetails = {
          firstName: guest.firstName.trim(),
          mobileNumber: normaliseMobile(guest.phone),
          email: guest.email.trim() || null,
        };
      }
      const res = await createBooking({
        services: options.map((o) => ({ title: o.title })),
        startTime: toInstant(date, time),
        guest: guestDetails,
        notes,
        priceList: "v2",
      });
      track("booking_complete", {
        value: options.reduce((sum, o) => sum + o.price, 0),
        currency: "NGN",
        service_count: options.length,
        services: options.map((o) => o.title).join(", "),
        guest: String(!user),
      });
      setResult({ ...res, options, contact, notes: notes.trim() });
      clearSnooze();
      scrollTop();
    } catch (err) {
      track("booking_error", { reason: err?.code || "unknown", guest: String(!user) });
      if (GUEST_DISABLED_CODES.has(err?.code)) {
        setError("Booking without an account isn't available right now. Please log in or create an account to book.");
      } else {
        setError(err.message || "Booking failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const startOver = () => {
    setResult(null);
    setSelected([]);
    setDate(null);
    setTime(null);
    setNotes("");
    setDismissedNudges([]);
    setStep(1);
    scrollTop();
  };

  const changeView = (v) => {
    setView(v);
    writeStorage("localStorage", VIEW_KEY, v);
  };

  // Who the booking is for, as the review and success screens show it.
  const contact = user
    ? {
        guest: false,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
        phone: user.mobileNumber ?? "",
        email: user.email ?? null,
      }
    : {
        guest: true,
        name: guest.firstName.trim(),
        phone: guest.phone.trim() ? normaliseMobile(guest.phone) : "",
        email: guest.email.trim() || null,
      };

  // ── Step gate ──────────────────────────────────────────────────────────────
  const canContinue =
    step === 1
      ? options.length > 0 && duration <= MAX_APPOINTMENT_MINUTES
      : step === 2
        ? Boolean(date && time)
        : step === 3
          ? hydrated &&
            (user ? Boolean(user.mobileNumber) || phone.trim().length > 0 : true)
          : Boolean((user || guestIsValid(guest)) && date && time);

  const ctaLabel =
    step === 1
      ? "Choose a time"
      : step === 2
        ? "Continue"
        : step === 3
          ? "Review booking"
          : "Confirm booking";

  const hint =
    step === 1 && options.length === 0
      ? "Pick at least one service"
      : step === 1 && duration > MAX_APPOINTMENT_MINUTES
        ? "That's more than one day. Remove a service."
        : step === 2 && !(date && time)
          ? date ? "Pick a time" : "Pick a day and a time"
          : step === 3 && !user
            ? guestMissing(guest)
            : step === 4 && depositForOptions(options).amount
              ? "Deposit arranged on WhatsApp"
              : "Pay at the salon. No card needed.";

  const onContinue = () => {
    if (step === 1 || step === 2) goTo(step + 1);
    else if (step === 3) continueFromDetails();
    else confirm();
  };

  const cta = (extra = "") => (
    <PillButton className={extra} disabled={!canContinue || busy} onClick={onContinue} aria-busy={busy || undefined}>
      {busy ? (step === 4 ? "Booking…" : "Saving…") : ctaLabel}
    </PillButton>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!now || !restored || !month) {
    return (
      <main className="mx-auto max-w-[var(--v2-container)] px-4 pb-24 pt-10 md:px-8">
        <h1 className={`${HEADING} text-[clamp(2.25rem,3.8vw,3.25rem)]`}>Book a visit</h1>
        <p className="mt-4 text-sm text-ink-soft">Loading the menu…</p>
      </main>
    );
  }

  if (result) {
    return (
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-10 md:px-8">
        <SuccessView result={result} options={result.options} contact={result.contact} onAgain={startOver} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[var(--v2-container)] px-4 pb-32 pt-5 md:px-8 md:pt-8 lg:pb-24">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-4 md:mb-5">
            <h1 className={`${HEADING} text-[clamp(1.6rem,3.8vw,3.25rem)]`}>{TITLES[step]}</h1>
            {step > 1 && (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="text-[13px] font-semibold text-ink underline underline-offset-4"
              >
                Back
              </button>
            )}
          </div>

          <Stepper step={step} onGo={goTo} locked={busy} />

          {step === 1 && (
            <ServicesStep
              selected={selected}
              history={history}
              view={view}
              onView={changeView}
              category={category}
              onCategory={setCategory}
              query={query}
              onQuery={setQuery}
              dismissedNudges={dismissedNudges}
              onDismissNudge={(id) => setDismissedNudges((d) => [...d, id])}
              onToggle={(o) => toggle(o)}
              onAdd={addOption}
              onOpenSheet={openSheet}
              upcoming={upcoming[0] ?? null}
              rebook={
                suggestion
                  ? {
                      suggestion,
                      target: rebookTarget,
                      onBookSame: bookSame,
                      onPick: rebookPick,
                      onSnooze: snoozeRebook,
                    }
                  : null
              }
            />
          )}

          {step === 2 && (
            <TimeStep
              duration={duration}
              now={now}
              month={month}
              onMonth={setMonth}
              date={date}
              time={time}
              onDate={pickDate}
              onPick={pick}
              usual={usualSlot}
            />
          )}

          {step === 3 && (
            <DetailsStep
              hydrated={hydrated}
              user={user}
              phone={phone}
              onPhone={(v) => {
                setPhone(v);
                setPhoneError(null);
              }}
              phoneError={phoneError}
              guest={guest}
              onGuest={updateGuest}
              guestErrors={guestErrors}
              onSignIn={signIn}
              notes={notes}
              onNotes={setNotes}
              maxNotes={MAX_NOTES}
            />
          )}

          {step === 4 && date && time && (
            <ReviewStep
              options={options}
              date={date}
              time={time}
              duration={duration}
              total={total}
              contact={contact}
              notes={notes}
              onChangeServices={() => goTo(1)}
              error={error}
              onChangeTime={() => goTo(2)}
              onChangeDetails={() => goTo(3)}
            />
          )}
          {step === 4 && !(date && time) && (
            <div role="alert" className="rounded-v2-xl bg-cream-100 p-5 text-sm">
              That time is no longer available.{" "}
              <button type="button" onClick={() => goTo(2)} className="font-semibold underline underline-offset-4">
                Pick another time
              </button>
            </div>
          )}
          {/* The footer is hidden while booking, so the one thing from it
              someone mid-booking needs — a person to ask — lives here. */}
          <p className="mt-10 text-[13px] text-ink-soft">
            Stuck or have a question?{" "}
            <a
              href={`https://wa.me/${SALON_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline underline-offset-4"
            >
              WhatsApp us
            </a>{" "}
            or call{" "}
            <a href="tel:+2348110215014" className="whitespace-nowrap font-semibold text-ink underline underline-offset-4">
              +234 811 021 5014
            </a>
            .
          </p>
        </div>

        <AppointmentSlip
          options={options}
          date={date}
          time={time}
          duration={duration}
          total={total}
          onRemove={(o) => toggle(o)}
          cta={cta("w-full")}
          hint={hint}
          locked={busy || step === 4}
        />
      </div>

      <MobileBar
        options={options}
        date={date}
        time={time}
        duration={duration}
        total={total}
        onRemove={(o) => toggle(o)}
        locked={busy || step === 4}
        cta={cta()}
        sheetCta={cta("w-full")}
        // On the details step the button stays tappable, but the bar should
        // still say what's missing until the form is filled in.
        blocked={!canContinue || (step === 3 && !user && !guestIsValid(guest))}
        hint={hint}
      />

      <ServiceSheet
        lookId={sheetLook}
        selected={selected}
        onClose={closeSheet}
        onApply={applyFromSheet}
      />

      <Toast toast={toast} onHide={hideToast} />
    </main>
  );
}
