"use client";

import { useBooking } from "@/app/contexts/BookingContext";

/**
 * Reserves the height of the fixed booking bar at the very bottom of the page.
 *
 * Without it the bar sits on top of the footer (and the last row of service
 * cards) the moment a service is selected, with no way to scroll past it.
 */
export function BookingBarSpacer() {
  const { selectedServices } = useBooking();
  if (selectedServices.length === 0) return null;

  return (
    <div
      aria-hidden
      style={{ height: "calc(88px + env(safe-area-inset-bottom))" }}
    />
  );
}
