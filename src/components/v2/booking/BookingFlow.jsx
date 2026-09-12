"use client";

/**
 * The v2 booking page: Services → Time → Details → Confirm.
 *
 * No account is needed. At the Details step a guest gives a name and a phone
 * number (email optional); a client with an account can sign in instead. A
 * guest is signed in anonymously at the moment they confirm, so the booking
 * still has an owner. Either way the booking goes through the `createBooking`
 * callable, which prices the services and re-validates the slot server-side.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { AUTH_MODES, VALIDATION } from "@/lib/auth/constants";
import { ensureGuestSession } from "@/lib/firebase/authService";
import { createBooking, subscribeUserBookings } from "@/lib/firebase/bookingService";
import { updateMobileNumber } from "@/lib/firebase/userService";
import { SERVICE_BY_TITLE } from "@/lib/booking/catalogue";
import { track } from "@/lib/analytics";
import {
  MAX_APPOINTMENT_MINUTES,
  dayUnavailableReason,
  firstAvailable,
  formatDuration,
  fromInstant,
  naira,
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
import ServiceSheet from "./ServiceSheet";
import TimeStep from "./TimeStep";
import { AppointmentSlip, DetailsStep, MobileBar, ReviewStep, Stepper, SuccessView } from "./Steps";
import { HEADING, PillButton, Toast, useToast } from "./ui";

const CART_KEY = "frh:v2:booking";
const VIEW_KEY = "frh:v2:booking-view";
// A guest's own details, kept on their device so a return visit is prefilled.
const GUEST_KEY = "frh:v2:guest";
const NG_MOBILE = /^(?:\+234|0)[789]\d{9}$/;
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

const normaliseMobile = (value) => {
  const compact = value.replace(/[\s-]/g, "");
  return compact.startsWith("0") ? `+234${compact.slice(1)}` : compact;
};

/** Field errors for a guest's details; an empty object when they're fine. Mirrors functions/lib/guest.js. */
function guestErrorsFor(guest) {
  const errors = {};
  if (!guest.firstName.trim()) errors.firstName = "Please tell us your name.";
  if (!NG_MOBILE.test(guest.phone.replace(/[\s-]/g, ""))) {
    errors.phone = "Enter a full mobile number, e.g. 08031234567 or +2348031234567";
  }
  if (guest.email.trim() && !VALIDATION.EMAIL_REGEX.test(guest.email.trim())) {
    errors.email = "That email address doesn't look right.";
  }
  return errors;
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
  const [selected, setSelected] = useState([]); // exact service titles
  // Mirrors `selected` so the stable `toggle` callback can read it without
  // taking it as a dependency.
  const selectedRef = useRef(selected);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [month, setMonth] = useState(null);
  const [view, setView] = useState("grid");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sheetLook, setSheetLook] = useState(null);
  const [dismissedNudges, setDismissedNudges] = useState([]);
  const [policy, setPolicy] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(null);
  const [notes, setNotes] = useState("");
  const [guest, setGuest] = useState(EMPTY_GUEST);
  const [guestErrors, setGuestErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [snoozed, setSnoozed] = useState(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Read by the too-long guard below, for the same reason as selectedRef: it
  // keeps `toggle` and `applyFromSheet` stable rather than rebuilding them on
  // every change of total.
  const durationRef = useRef(0);

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
  const options = useMemo(() => selected.map((t) => SERVICE_BY_TITLE.get(t)).filter(Boolean), [selected]);
  const duration = options.reduce((sum, o) => sum + o.duration, 0);
  durationRef.current = duration;
  const total = options.reduce((sum, o) => sum + o.price, 0);

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
  /**
   * Refuses an addition that would run past a single day, and says why.
   *
   * The salon closes, so an appointment has a ceiling. Nothing is disabled up
   * front: a greyed-out card tells a customer they cannot have something
   * without telling them what to do about it. Instead the tap is accepted,
   * the service is not added, and the message names both numbers — what this
   * service needs and what is actually left — so the next move is obvious.
   */
  const refuseIfTooLong = useCallback(
    (option) => {
      const remaining = MAX_APPOINTMENT_MINUTES - durationRef.current;
      if (option.duration <= remaining) return false;

      track("service_too_long", {
        service: option.title,
        needs: option.duration,
        remaining,
      });
      showToast(
        remaining > 0
          ? `${option.name} needs ${formatDuration(option.duration)}, and only ${formatDuration(remaining)} is left in the day.`
          : `${option.name} needs ${formatDuration(option.duration)}, and the day is already full. Remove something first.`
      );
      return true;
    },
    [showToast]
  );

  const toggle = useCallback(
    (option, { announce = false } = {}) => {
      // Reported off a ref, not from inside the updater: React may run an
      // updater twice, which would double-count every add.
      const had = selectedRef.current.includes(option.title);
      // Removals always go through; only a new service can overrun the day.
      if (!had && refuseIfTooLong(option)) return;
      track(had ? "service_removed" : "service_added", {
        service: option.title,
        price: option.price,
        duration: option.duration,
      });
      setSelected((prev) => {
        const has = prev.includes(option.title);
        return has ? prev.filter((t) => t !== option.title) : [...prev, option.title];
      });
      setError(null);
      if (announce) {
        showToast(`Added ${option.name.toLowerCase()} · +${formatDuration(option.duration)} · ${naira(option.price)}`, () =>
          setSelected((prev) => prev.filter((t) => t !== option.title))
        );
      }
    },
    [showToast]
  );

  const addOption = useCallback(
    (option) => {
      if (!selected.includes(option.title)) toggle(option, { announce: true });
    },
    [selected, toggle]
  );

  /** From the sheet: `option` null removes the look, otherwise it replaces any other option of that look. */
  const applyFromSheet = useCallback(
    (look, option) => {
      const others = look.options.map((o) => o.title);
      /*
       * The sheet is where a longer variant gets chosen, so it needs the same
       * guard — but only when nothing of this look is swapped out for it.
       * Switching between two options of the same look frees the old one's time
       * first, so it cannot be judged against the current total.
       */
      const swapping = selectedRef.current.some((t) => others.includes(t));
      if (option && !swapping && refuseIfTooLong(option)) return;
      setSelected((prev) => [...prev.filter((t) => !others.includes(t)), ...(option ? [option.title] : [])]);
      setSheetLook(null);
      setError(null);
      if (option) {
        showToast(`Added ${option.name.toLowerCase()} · +${formatDuration(option.duration)} · ${naira(option.price)}`, () =>
          setSelected((prev) => prev.filter((t) => t !== option.title))
        );
      }
    },
    [showToast, refuseIfTooLong]
  );

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
    setPolicy(false);
    goTo(user?.mobileNumber || (!user && guestIsValid(guest)) ? 4 : 3);
  };

  const rebookPick = (kind, lookId) => {
    if (kind === "sheet") {
      setSheetLook(lookId);
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
      if (Object.keys(errors).length) return;
      writeStorage("localStorage", GUEST_KEY, {
        firstName: guest.firstName.trim(),
        phone: guest.phone.trim(),
        email: guest.email.trim(),
      });
      goTo(4);
      return;
    }
    if (user.mobileNumber) {
      goTo(4);
      return;
    }
    const value = phone.replace(/[\s-]/g, "");
    if (!NG_MOBILE.test(value)) {
      setPhoneError("Enter a full mobile number, e.g. 08031234567 or +2348031234567");
      return;
    }
    setPhoneError(null);
    setBusy(true);
    try {
      const normalised = value.startsWith("0") ? `+234${value.slice(1)}` : value;
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
        setError("Booking without an account isn't available right now. Please sign in or create an account to book.");
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
    setPolicy(false);
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
            (user
              ? Boolean(user.mobileNumber) || phone.trim().length > 0
              : guest.firstName.trim().length > 0 && guest.phone.trim().length > 0)
          : Boolean((user || guestIsValid(guest)) && policy && date && time);

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
          ? "Pick a day and a time"
          : step === 3 && !user
            ? "No account needed"
            : step === 4 && !policy
              ? "Tick the arrival note to confirm"
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
              onOpenSheet={setSheetLook}
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
              policy={policy}
              onPolicy={setPolicy}
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
        blocked={!canContinue}
        hint={hint}
      />

      <ServiceSheet
        lookId={sheetLook}
        selected={selected}
        onClose={() => setSheetLook(null)}
        onApply={applyFromSheet}
      />

      <Toast toast={toast} onHide={hideToast} />
    </main>
  );
}
