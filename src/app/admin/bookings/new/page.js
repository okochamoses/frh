"use client";

/*
 * The walk-in form, wrapped in `.v2-root`.
 *
 * It reuses the public booking page's services grid, and that grid's dialog
 * portals into `.v2-root` (`src/components/v2/ui/portal.js`) so v2's fonts and
 * type styles survive inside a sheet. Without this wrapper the sheet would
 * portal to <body>, `.type-eyebrow` would be undefined, and the section
 * headings would lose their face.
 *
 * A route rather than a modal on /admin/bookings, deliberately. A shadcn
 * Dialog holding a `.v2-root` would nest the sheet's Radix dialog inside
 * another Radix dialog: two focus traps and two scroll locks, one of them
 * fighting its own portal target. The grid wants the room anyway, and staff
 * open this on a phone at the desk.
 *
 * `v2.css` is scoped to `.v2-root` in every rule it declares, so importing it
 * here leaves the admin dashboard's own stone/shadcn chrome untouched.
 */

import "@/app/(site)/v2.css";
import { fontVariables } from "@/app/(site)/fonts";
import WalkInBookingForm from "@/components/admin/WalkInBookingForm";

export default function NewBookingPage() {
  return (
    <div className={`${fontVariables} v2-root -mx-6 -my-8 bg-sand font-body text-ink`}>
      <WalkInBookingForm />
    </div>
  );
}
