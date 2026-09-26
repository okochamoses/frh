"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

/*
 * While someone is booking, the site chrome steps back: no footer, no nav, no
 * menu — every link there was a way out halfway through. It comes back on the
 * confirmation screen, when leaving is fine.
 *
 * The route decides the default, so the server render already has the lean
 * chrome and nothing flashes in. The one thing the route can't know is that the
 * booking has been made, so BookingFlow reports that here.
 */
const BOOKING_PATH = "/v2/booking";

let booked = false;
const listeners = new Set();

export function setBooked(value) {
  if (booked === value) return;
  booked = value;
  listeners.forEach((l) => l());
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useBookingFocus() {
  const pathname = usePathname();
  const isBooked = useSyncExternalStore(subscribe, () => booked, () => false);
  return pathname === BOOKING_PATH && !isBooked;
}
