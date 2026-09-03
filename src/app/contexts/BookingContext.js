"use client";

/**
 * BookingContext
 *
 * Manages the entire booking flow:
 *   services → datetime → confirmation
 *
 * It also drives rescheduling: `beginReschedule(booking)` puts the same
 * date/time drawer into "move this appointment" mode, so there is only one
 * slot picker in the app.
 *
 * Derived values (totals, available slots) are computed with useMemo
 * so they never go out of sync with selectedServices.
 */

import { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  createBooking,
  rescheduleBooking as rescheduleBookingCall,
} from "@/lib/firebase/bookingService";

dayjs.extend(utc);

// ── Business rules ────────────────────────────────────────────────────────────
// Mirrored server-side in functions/lib/bookingRules.js, which has the final
// say — these constants decide what the picker offers, not what is allowed.
const OFF_DAYS       = new Set([1]); // Monday (0 = Sun … 6 = Sat)
const START_HOUR     = 9;            // 9 AM WAT (Tue–Sat)
const SUNDAY_START_HOUR = 13;        // 1 PM WAT (Sun)
const END_HOUR       = 19;           // slots generated up to 7 PM WAT
const CUTOFF_MINUTES = 19 * 60;      // no appointment may finish after 7 PM (19:00)
const SLOT_MINUTES   = 15;
const LOOKAHEAD_DAYS = 30;

// How often the clock is re-read, so a tab left open all afternoon stops
// offering slots that have since passed.
const CLOCK_TICK_MS = 60 * 1000;

const CART_STORAGE_KEY = "frh:booking:services";

// ── Pure schedule helpers (no state, no side-effects) ─────────────────────────

/** First bookable hour for a given weekday. */
function openingHour(weekday) {
  return weekday === 0 ? SUNDAY_START_HOUR : START_HOUR;
}

/** How many minutes of work a given weekday can hold (0 when closed). */
export function dayCapacityMinutes(weekday) {
  if (OFF_DAYS.has(weekday)) return 0;
  return CUTOFF_MINUTES - openingHour(weekday) * 60;
}

/** The longest appointment any single day can hold. */
export const MAX_APPOINTMENT_MINUTES = CUTOFF_MINUTES - START_HOUR * 60;

function buildAvailableDays(from) {
  return Array.from({ length: LOOKAHEAD_DAYS }, (_, i) => {
    const day = from.add(i, "day").startOf("day");
    return { day, isOffDay: OFF_DAYS.has(day.day()) };
  });
}

/**
 * Returns an object keyed by "DD/MM/YYYY" where each value is an
 * array of dayjs datetimes representing 15-minute appointment slots.
 */
function buildTimeSlots(days) {
  return days
    .filter((d) => !d.isOffDay)
    .reduce((acc, { day }) => {
      const startHour  = openingHour(day.day());
      const workMinutes = (END_HOUR - startHour) * 60;
      const slotsPerDay = Math.floor(workMinutes / SLOT_MINUTES) + 1;
      const key      = day.format("DD/MM/YYYY");
      const dayStart = day.hour(startHour).minute(0).second(0);
      acc[key] = Array.from({ length: slotsPerDay }, (_, i) =>
        dayStart.add(i * SLOT_MINUTES, "minute")
      );
      return acc;
    }, {});
}

/** Minutes a booking runs for, whether or not it stored `totalDuration`. */
function bookingDuration(booking) {
  if (Number.isFinite(booking?.totalDuration)) return booking.totalDuration;
  if (booking?.startTime && booking?.endTime) {
    return Math.max(0, dayjs(booking.endTime).diff(dayjs(booking.startTime), "minute"));
  }
  return (booking?.services ?? []).reduce((sum, s) => sum + (s.duration || 0), 0);
}

// ── Context ───────────────────────────────────────────────────────────────────

const BookingContext = createContext();

export function BookingProvider({ children }) {
  // Core booking state
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTime, setSelectedTime]         = useState(null); // a dayjs datetime
  const [step, setStep]                         = useState("services"); // "services" | "datetime"

  // Set while the drawer is moving an existing appointment rather than
  // creating a new one. Holds the booking being moved.
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const mode = rescheduleTarget ? "reschedule" : "create";

  // Submission state
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [bookingError, setBookingError]     = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // ── The clock ──────────────────────────────────────────────────────────────
  // `availableDays` and the past-slot filter both depend on "now". Without a
  // tick they freeze at mount: a tab left open shows slots that have passed,
  // and one left open overnight starts the carousel on yesterday.
  const [now, setNow] = useState(() => dayjs());

  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const todayKey = now.format("YYYY-MM-DD");
  const nowMs    = now.valueOf();

  // ── Cart persistence ───────────────────────────────────────────────────────
  // Restored in an effect rather than in useState so the server-rendered markup
  // and the first client render match.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setSelectedServices(parsed);
      }
    } catch {
      // A blocked or corrupt sessionStorage is not worth breaking the page for.
    }
  }, []);

  useEffect(() => {
    try {
      if (selectedServices.length === 0) window.sessionStorage.removeItem(CART_STORAGE_KEY);
      else window.sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(selectedServices));
    } catch {
      // Ignore — persistence is a convenience, not part of the flow.
    }
  }, [selectedServices]);

  // ── Derived values (stable, recomputed only when inputs change) ────────────

  // Rebuilt when the calendar date changes, not on every tick.
  const availableDays = useMemo(
    () => buildAvailableDays(dayjs(todayKey)),
    [todayKey]
  );
  const timeSlots = useMemo(() => buildTimeSlots(availableDays), [availableDays]);

  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.price, 0),
    [selectedServices]
  );

  const totalDuration = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.duration, 0),
    [selectedServices]
  );

  // What the drawer is working with — the cart when booking, the existing
  // appointment when rescheduling.
  const activeServices = rescheduleTarget?.services ?? selectedServices;
  const activePrice    = rescheduleTarget ? rescheduleTarget.totalAmount ?? 0 : totalPrice;
  const activeDuration = rescheduleTarget ? bookingDuration(rescheduleTarget) : totalDuration;

  // Removes past slots and slots where start + service duration would exceed 7 PM
  const filteredTimeSlots = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(timeSlots).map(([key, slots]) => [
          key,
          slots.filter(
            (slot) =>
              slot.valueOf() > nowMs &&
              (activeDuration === 0 ||
                slot.hour() * 60 + slot.minute() + activeDuration <= CUTOFF_MINUTES)
          ),
        ])
      ),
    [timeSlots, activeDuration, nowMs]
  );

  /**
   * Why a day can't be booked, or null when it can.
   *
   * A day with no slots used to be struck through exactly like a closed one,
   * so "these services don't fit here" read as "the salon is shut".
   */
  const unavailableReason = useCallback(
    (day, isOffDay) => {
      if (isOffDay) return "The salon is closed on Mondays.";

      const slots = filteredTimeSlots[day.format("DD/MM/YYYY")] ?? [];
      if (slots.length > 0) return null;

      if (activeDuration > MAX_APPOINTMENT_MINUTES) {
        return "These services add up to more than a single day. Please book them as two appointments.";
      }
      if (activeDuration > dayCapacityMinutes(day.day())) {
        return "Sunday runs 1–7pm, which isn't long enough for these services. Please pick a weekday.";
      }
      return "No times left on this day.";
    },
    [filteredTimeSlots, activeDuration]
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  const toggleService = useCallback((service) => {
    setSelectedServices((prev) =>
      prev.some((s) => s.title === service.title)
        ? prev.filter((s) => s.title !== service.title) // remove
        : [...prev, service]                             // add
    );
  }, []);

  const selectTime = useCallback((time) => {
    setSelectedTime(time);
    setBookingError(null);
  }, []);

  const goToDatetime = useCallback(() => setStep("datetime"), []);

  /** Leaves the drawer without touching the cart. */
  const backToServices = useCallback(() => {
    setStep("services");
    setBookingError(null);
    // Without this a confirmation dismissed with ESC stays "successful", and
    // the next Book Now reopens onto the receipt of a booking already made.
    setBookingSuccess(false);
    setRescheduleTarget(null);
  }, []);

  /** Opens the drawer to move an existing appointment. */
  const beginReschedule = useCallback((booking) => {
    setRescheduleTarget(booking);
    setSelectedTime(booking.startTime ? dayjs(booking.startTime) : null);
    setBookingError(null);
    setBookingSuccess(false);
    setStep("datetime");
  }, []);

  /**
   * Saves the booking.
   *
   * `selectedTime` is a browser-local dayjs; `.utc().toISOString()` stores the
   * true instant (with a `Z` marker) so downstream formatting in Africa/Lagos
   * renders the exact time the customer picked. The server re-validates the
   * slot and prices the services itself.
   */
  const submitBooking = useCallback(async () => {
    if (!selectedTime) {
      setBookingError("Please select a date and time.");
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      await createBooking({
        services: selectedServices,
        startTime: selectedTime.utc().toISOString(),
      });

      setBookingSuccess(true);
    } catch (err) {
      console.error("[BookingContext] Booking error:", err);
      setBookingError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTime, selectedServices]);

  /** Moves the appointment `beginReschedule` was called with. */
  const submitReschedule = useCallback(async () => {
    if (!rescheduleTarget) return;
    if (!selectedTime) {
      setBookingError("Please select a date and time.");
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      await rescheduleBookingCall(rescheduleTarget.id, selectedTime.utc().toISOString());
      setBookingSuccess(true);
    } catch (err) {
      console.error("[BookingContext] Reschedule error:", err);
      setBookingError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [rescheduleTarget, selectedTime]);

  /** Resets all booking state back to the initial "browse services" view. */
  const reset = useCallback(() => {
    setSelectedServices([]);
    setSelectedTime(null);
    setStep("services");
    setBookingError(null);
    setBookingSuccess(false);
    setRescheduleTarget(null);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        // State
        selectedServices,
        selectedTime,
        step,
        mode,
        rescheduleTarget,
        isSubmitting,
        bookingError,
        bookingSuccess,
        // Derived
        availableDays,
        timeSlots,
        filteredTimeSlots,
        totalPrice,
        totalDuration,
        activeServices,
        activePrice,
        activeDuration,
        unavailableReason,
        // Actions
        toggleService,
        selectTime,
        goToDatetime,
        backToServices,
        beginReschedule,
        submitBooking,
        submitReschedule,
        reset,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within a BookingProvider");
  return ctx;
}
