"use client";

/**
 * BookingDrawer — the date and time picker.
 *
 * Shared by /services (creating a booking) and /bookings (moving one), which is
 * why it reads `mode` from BookingContext rather than taking a prop for it.
 */

import { useCallback } from "react";
import dayjs from "dayjs";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { CiCalendar, CiClock2 } from "react-icons/ci";
import { merriweather } from "@/app/layout";
import {
  useBooking,
  dayCapacityMinutes,
  MAX_APPOINTMENT_MINUTES,
} from "@/app/contexts/BookingContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import "swiper/css";
import "swiper/css/navigation";

const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h > 0 && `${h}h`, m > 0 && `${m}m`].filter(Boolean).join(" ");
};

export function BookingDrawer({ open, onClose }) {
  const {
    availableDays, filteredTimeSlots, unavailableReason,
    selectedTime, selectTime,
    activeServices, activePrice, activeDuration,
    mode, rescheduleTarget,
    isSubmitting, bookingError, bookingSuccess,
    submitBooking, submitReschedule, backToServices, reset,
  } = useBooking();

  const isReschedule = mode === "reschedule";

  /**
   * Why whole days are struck through, said out loud.
   *
   * The strike-through alone reads as "the salon is fully booked", when the
   * real answer is that the chosen services don't fit inside that day.
   */
  const scheduleNote = (() => {
    if (activeDuration > MAX_APPOINTMENT_MINUTES) {
      return `These services come to ${formatDuration(activeDuration)}, which is longer than a single day. Please book them as two appointments.`;
    }
    if (activeDuration > dayCapacityMinutes(0)) {
      return "Sundays run 1–7pm, which isn't long enough for these services — weekdays only.";
    }
    return null;
  })();

  // Derive the active date from the selected time slot
  const selectedDate = selectedTime?.startOf("day") ?? null;

  // Show slots for the selected date, falling back to today
  const activeKey    = selectedDate?.format("DD/MM/YYYY") ?? dayjs().format("DD/MM/YYYY");
  const currentSlots = filteredTimeSlots[activeKey] ?? [];

  const isDayUnavailable = useCallback(
    (day, isOffDay) => unavailableReason(day, isOffDay) !== null,
    [unavailableReason]
  );

  const handleDayClick = (day, isOffDay) => {
    if (isDayUnavailable(day, isOffDay)) return;
    const firstSlot = filteredTimeSlots[day.format("DD/MM/YYYY")]?.[0];
    if (firstSlot) selectTime(firstSlot);
  };

  // Find the next bookable day after the given day (skips off-days + days with no slots)
  const nextBookableDay = useCallback(
    (afterDay) => {
      for (const { day, isOffDay } of availableDays) {
        if (!day.isAfter(afterDay, "day")) continue;
        if (!isDayUnavailable(day, isOffDay)) return day;
      }
      return null;
    },
    [availableDays, isDayUnavailable]
  );

  const handleClose = () => { backToServices(); onClose(); };
  const handleDone  = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onOpenChange={bookingSuccess ? handleDone : handleClose}>
      {/*
        Three-zone layout:
          1. Pinned header  — title + summary strip
          2. Scrollable body — date carousel + time grid
          3. Pinned footer  — confirm button
        `overflow-hidden` on DialogContent prevents the whole modal from scrolling;
        only the middle zone scrolls.
      */}
      <DialogContent
        className="sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {bookingSuccess ? (
          // ── Success state ─────────────────────────────────────────────────
          <div className="flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="px-6 pt-8 pb-5 text-center">
              <div
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 shadow-sm"
                aria-hidden
              >
                <FontAwesomeIcon icon={faCheck} className="text-xl text-emerald-600" />
              </div>
              <DialogTitle
                className={`${merriweather.className} text-2xl font-bold tracking-tight text-stone-900`}
              >
                {isReschedule ? "Appointment moved" : "Booking confirmed"}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed text-stone-500">
                {isReschedule
                  ? "We've emailed you the new details."
                  : "We'll reach out shortly to confirm your appointment."}
              </DialogDescription>
            </div>

            <div className="space-y-4 px-6 pb-2">
              {selectedTime && (
                <div className="rounded-xl border border-stone-200/90 bg-stone-50/80 p-4 shadow-sm">
                  <p
                    className={`${merriweather.className} mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400`}
                  >
                    When
                  </p>
                  <div className="space-y-2.5 text-left text-sm text-stone-700">
                    <p className="flex items-start gap-3">
                      <CiCalendar className="mt-0.5 h-[1.1em] w-[1.1em] flex-shrink-0 text-stone-500" />
                      <span className="leading-snug">{selectedTime.format("dddd, D MMMM YYYY")}</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <CiClock2 className="mt-0.5 h-[1.1em] w-[1.1em] flex-shrink-0 text-stone-500" />
                      <span>
                        {selectedTime.format("HH:mm")} –{" "}
                        {selectedTime.add(activeDuration, "minute").format("HH:mm")}
                        <span className="ml-1.5 text-stone-400 tabular-nums">
                          ({formatDuration(activeDuration)})
                        </span>
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm">
                <p
                  className={`${merriweather.className} mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400`}
                >
                  Your services
                </p>
                <ul className="divide-y divide-stone-100">
                  {activeServices.map((s, i) => (
                    <li
                      key={`${s.title}-${i}`}
                      className="flex gap-4 py-3.5 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1 text-left">
                        <p className={`${merriweather.className} text-sm font-semibold leading-snug text-stone-900`}>
                          {s.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-stone-500">
                          {s.category && <span className="text-stone-400">{s.category}</span>}
                          {s.category && s.duration > 0 && (
                            <span className="text-stone-300" aria-hidden>
                              ·
                            </span>
                          )}
                          {s.duration > 0 && <span>{formatDuration(s.duration)}</span>}
                        </div>
                      </div>
                      <p
                        className={`${merriweather.className} flex-shrink-0 text-sm font-semibold tabular-nums text-[#120D07]`}
                      >
                        ₦{Number(s.price ?? 0).toLocaleString("en-US")}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-baseline justify-between border-t border-stone-200 pt-4">
                  <span
                    className={`${merriweather.className} text-xs font-bold uppercase tracking-wider text-stone-600`}
                  >
                    Total
                  </span>
                  <span className={`${merriweather.className} text-lg font-bold tabular-nums text-[#120D07]`}>
                    ₦{activePrice.toLocaleString("en-US")}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-4">
              <Button className="w-full" onClick={handleDone}>
                Done
              </Button>
            </div>
          </div>

        ) : (
          <>
            {/* ── Zone 1: Pinned header ─────────────────────────────────── */}
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-stone-100 flex-shrink-0 space-y-1 text-left">
              <DialogTitle className={`${merriweather.className} text-xl`}>
                {isReschedule ? "Pick a new time" : "Select Date & Time"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isReschedule && rescheduleTarget?.startTime ? (
                  <>
                    Currently {dayjs(rescheduleTarget.startTime).format("ddd, D MMM")} at{" "}
                    {dayjs(rescheduleTarget.startTime).format("HH:mm")}&ensp;·&ensp;
                    {formatDuration(activeDuration)}
                  </>
                ) : (
                  <>
                    {activeServices.length} service{activeServices.length !== 1 ? "s" : ""}&ensp;·&ensp;
                    {formatDuration(activeDuration)}&ensp;·&ensp;
                    ₦{activePrice.toLocaleString("en-US")}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {/* ── Zone 2: Scrollable body ───────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Date carousel */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className={`${merriweather.className} text-sm font-bold text-stone-800`}>
                    {(selectedDate ?? dayjs()).format("MMMM YYYY")}
                  </p>
                  <div className="flex gap-4 text-stone-400">
                    <button
                      type="button"
                      aria-label="Previous days"
                      className="swiper-prev-booking hover:text-stone-800 transition-colors"
                    >
                      <FontAwesomeIcon icon={faAngleLeft} />
                    </button>
                    <button
                      type="button"
                      aria-label="More days"
                      className="swiper-next-booking hover:text-stone-800 transition-colors"
                    >
                      <FontAwesomeIcon icon={faAngleRight} />
                    </button>
                  </div>
                </div>

                <Swiper
                  speed={500}
                  navigation={{ nextEl: ".swiper-next-booking", prevEl: ".swiper-prev-booking" }}
                  modules={[Navigation]}
                  breakpoints={{
                    0:   { slidesPerView: 5, slidesPerGroup: 5 },
                    480: { slidesPerView: 7, slidesPerGroup: 7 },
                  }}
                >
                  {availableDays.map(({ day, isOffDay }, i) => {
                    const isActive = selectedDate?.isSame(day, "day");
                    const reason   = unavailableReason(day, isOffDay);
                    return (
                      <SwiperSlide key={i} className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleDayClick(day, isOffDay)}
                          disabled={reason !== null}
                          aria-pressed={!!isActive}
                          // A struck-through "7" tells a screen reader nothing,
                          // so the date and the reason go in the label.
                          aria-label={
                            reason
                              ? `${day.format("dddd D MMMM")} — unavailable. ${reason}`
                              : day.format("dddd D MMMM")
                          }
                          title={reason ?? undefined}
                          className="flex flex-col items-center gap-1 w-full py-1"
                        >
                          <span
                            aria-hidden
                            className={`flex items-center justify-center h-10 w-10 rounded-full text-sm font-bold border transition-colors duration-150 ${
                              reason
                                ? "line-through text-stone-300 border-transparent cursor-not-allowed"
                                : isActive
                                ? "bg-[#120D07] text-white border-[#120D07]"
                                : "text-stone-800 border-stone-200 hover:border-stone-700"
                            }`}
                          >
                            {day.format("D")}
                          </span>
                          <span aria-hidden className="text-[10px] text-stone-400 uppercase">
                            {day.format("ddd")}
                          </span>
                        </button>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>

                {scheduleNote && (
                  <p className="mt-3 rounded-sm bg-amber-50/70 px-3 py-2 text-xs leading-relaxed text-amber-800">
                    {scheduleNote}
                  </p>
                )}
              </div>

              {/* Time slots */}
              <div>
                <p className={`${merriweather.className} text-[10px] tracking-widest uppercase text-stone-400 mb-3`}>
                  Available Times
                </p>
                {currentSlots.length === 0 ? (() => {
                  const activeDay = selectedDate ?? dayjs().startOf("day");
                  const reason = unavailableReason(
                    activeDay,
                    availableDays.find((d) => d.day.isSame(activeDay, "day"))?.isOffDay ?? false
                  );
                  const next = nextBookableDay(activeDay);
                  const nextLabel = next
                    ? next.isSame(dayjs().add(1, "day"), "day")
                      ? "tomorrow"
                      : next.format("dddd")
                    : null;
                  return (
                    <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-5 text-center">
                      <p className={`${merriweather.className} text-sm text-stone-600`}>
                        {reason ?? "No times available for this day."}
                      </p>
                      {next ? (
                        <p className="mt-1 text-xs text-stone-400">
                          Would you like to book for{" "}
                          <button
                            type="button"
                            onClick={() => handleDayClick(next, false)}
                            className="font-semibold text-[#120D07] underline underline-offset-2 hover:text-[#BD2E2E] transition-colors"
                          >
                            {nextLabel}
                          </button>
                          ?
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-stone-400">No upcoming availability found.</p>
                      )}
                    </div>
                  );
                })() : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {currentSlots.map((time, i) => {
                      const isActive = selectedTime?.isSame(time);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectTime(time)}
                          aria-pressed={!!isActive}
                          className={`text-xs py-2.5 border transition-colors duration-150 ${
                            isActive
                              ? "bg-[#120D07] text-white border-[#120D07]"
                              : "border-stone-200 text-stone-700 hover:border-stone-800 hover:bg-stone-50"
                          }`}
                        >
                          {time.format("HH:mm")}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selection summary */}
              {selectedTime && (
                <div className="flex items-center gap-5 text-sm text-stone-500 bg-stone-50 rounded-sm px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <CiCalendar className="flex-shrink-0 text-base" />
                    {selectedTime.format("ddd, D MMM")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CiClock2 className="flex-shrink-0 text-base" />
                    {selectedTime.format("HH:mm")} – {selectedTime.add(activeDuration, "minute").format("HH:mm")}
                  </span>
                </div>
              )}

              {bookingError && (
                <p role="alert" className="text-red-600 text-sm">{bookingError}</p>
              )}
            </div>

            {/* ── Zone 3: Pinned footer ─────────────────────────────────── */}
            <div className="px-6 pb-6 pt-4 border-t border-stone-100 flex-shrink-0">
              <Button
                className="w-full"
                disabled={!selectedTime}
                isLoading={isSubmitting}
                onClick={isReschedule ? submitReschedule : submitBooking}
              >
                {isReschedule ? "Move Appointment" : "Confirm Booking"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
