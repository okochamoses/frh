"use client";

/**
 * BookingContext
 *
 * Manages the entire booking flow:
 *   services → datetime → confirmation
 *
 * Derived values (totals, available slots) are computed with useMemo
 * so they never go out of sync with selectedServices.
 */

import { createContext, useContext, useState, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useAuth } from "@/app/contexts/AuthContext";
import { createBooking } from "@/lib/firebase/bookingService";

dayjs.extend(utc);

// ── Business rules ────────────────────────────────────────────────────────────
const OFF_DAYS       = new Set([1]); // Monday (0 = Sun … 6 = Sat)
const START_HOUR     = 9;            // 9 AM WAT
const END_HOUR       = 19;           // slots generated up to 7 PM WAT
const CUTOFF_MINUTES = 19 * 60;      // no appointment may finish after 7 PM (19:00)
const SLOT_MINUTES   = 15;
const LOOKAHEAD_DAYS = 30;

// ── Pure schedule helpers (no state, no side-effects) ─────────────────────────

function buildAvailableDays() {
  return Array.from({ length: LOOKAHEAD_DAYS }, (_, i) => {
    const day = dayjs().add(i, "day").startOf("day");
    return { day, isOffDay: OFF_DAYS.has(day.day()) };
  });
}

/**
 * Returns an object keyed by "DD/MM/YYYY" where each value is an
 * array of dayjs datetimes representing 15-minute appointment slots.
 */
function buildTimeSlots(days) {
  const workMinutes = (END_HOUR - START_HOUR) * 60;
  const slotsPerDay = Math.floor(workMinutes / SLOT_MINUTES) + 1;

  return days
    .filter((d) => !d.isOffDay)
    .reduce((acc, { day }) => {
      const key = day.format("DD/MM/YYYY");
      const dayStart = day.hour(START_HOUR).minute(0).second(0);
      acc[key] = Array.from({ length: slotsPerDay }, (_, i) =>
        dayStart.add(i * SLOT_MINUTES, "minute")
      );
      return acc;
    }, {});
}

// ── Context ───────────────────────────────────────────────────────────────────

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const { user } = useAuth();

  // Core booking state
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTime, setSelectedTime]         = useState(null); // a dayjs datetime
  const [step, setStep]                         = useState("services"); // "services" | "datetime"

  // Submission state
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [bookingError, setBookingError]     = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // ── Derived values (stable, recomputed only when inputs change) ────────────

  // These never change during a session so [] deps are intentional
  const availableDays = useMemo(() => buildAvailableDays(), []);
  const timeSlots     = useMemo(() => buildTimeSlots(availableDays), [availableDays]);

  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.price, 0),
    [selectedServices]
  );

  const totalDuration = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.duration, 0),
    [selectedServices]
  );

  // Removes past slots and slots where start + service duration would exceed 7 PM
  const filteredTimeSlots = useMemo(() => {
    const now = dayjs();
    return Object.fromEntries(
      Object.entries(timeSlots).map(([key, slots]) => [
        key,
        slots.filter(
          (slot) =>
            slot.isAfter(now) &&
            (totalDuration === 0 || slot.hour() * 60 + slot.minute() + totalDuration <= CUTOFF_MINUTES)
        ),
      ])
    );
  }, [timeSlots, totalDuration]);

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

  const goToDatetime    = useCallback(() => setStep("datetime"), []);
  const backToServices  = useCallback(() => { setStep("services"); setBookingError(null); }, []);

  /**
   * Saves the booking to Firestore.
   * Nigeria is UTC+1 (WAT), so we add 1 hour before storing the ISO string.
   */
  const submitBooking = useCallback(async () => {
    if (!selectedTime) {
      setBookingError("Please select a date and time.");
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const startTime = selectedTime.utc().add(1, "hour").format("YYYY-MM-DDTHH:mm:ss");
      const endTime   = selectedTime.utc().add(1, "hour").add(totalDuration, "minute")
                          .format("YYYY-MM-DDTHH:mm:ss");

      await createBooking({ user, services: selectedServices, startTime, endTime, totalAmount: totalPrice });

      setBookingSuccess(true);
    } catch (err) {
      console.error("[BookingContext] Booking error:", err);
      setBookingError("Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTime, selectedServices, totalDuration, totalPrice, user]);

  /** Resets all booking state back to the initial "browse services" view. */
  const reset = useCallback(() => {
    setSelectedServices([]);
    setSelectedTime(null);
    setStep("services");
    setBookingError(null);
    setBookingSuccess(false);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        // State
        selectedServices,
        selectedTime,
        step,
        isSubmitting,
        bookingError,
        bookingSuccess,
        // Derived
        availableDays,
        timeSlots,
        filteredTimeSlots,
        totalPrice,
        totalDuration,
        // Actions
        toggleService,
        selectTime,
        goToDatetime,
        backToServices,
        submitBooking,
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
