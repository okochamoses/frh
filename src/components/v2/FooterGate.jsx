"use client";

import { useBookingFocus } from "@/lib/booking/focusMode";

/** Hides the site footer while a booking is in progress. See `focusMode`. */
export default function FooterGate({ children }) {
  return useBookingFocus() ? null : children;
}
