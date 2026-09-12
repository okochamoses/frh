# FRH 2025 — Todo

## Blockers (do before deploy)

- [ ] Commit all uncommitted changes
  - `functions/index.js`, `functions/package*.json`
  - `src/app/contexts/BookingContext.js`
  - `src/components/about.js`
  - `src/lib/mail/MailService.js`, `config.js`, `templates.js`
  - `public/ceo.png`, `public/no-scalp-issues.png`, `public/scalp-issues-1.webp`

- [x] Resolve `functions/lib/` — every module `functions/index.js` requires at runtime is
      now tracked, so `firebase deploy` ships a complete bundle.
  - The last two were `lib/guest.js` and `lib/notes.js` (required at index.js:30-31);
    the other six were already tracked.

- [ ] Set Firebase secrets before deploying
  ```
  firebase functions:secrets:set SMTP_USER
  firebase functions:secrets:set SMTP_PASS
  firebase functions:secrets:set BOOKING_SECRET
  ```
  `BOOKING_SECRET` is no longer optional: it signs the guest's manage link as
  well as the owner's "mark complete" link. Unset, the HMAC key is the empty
  string and anyone who knows a booking id can forge a link to it.

- [ ] **Deploy hosting — the whole `/v2` tree is not live.** `/v2`, `/v2/booking`
  and `/v2/booking/manage` all 404 on `flourish-roots.web.app`; only the v1 site
  is deployed. Any manage link generated against production is dead until
  `firebase deploy --only hosting` runs with a fresh `out/`.

- [ ] Set `SITE_BASE` on the functions if the site is not served from
  `https://flourish-roots.web.app` — it is the origin baked into the manage
  link that goes out in every confirmation email. Under the emulator it
  defaults to `http://localhost:3000`; set `SITE_PORT` if the dev server is on
  another port.

- [ ] Deploy functions
  ```
  firebase deploy --only functions
  ```

## Bugs

- [ ] `gallery/page.js` still references `/ceo.webp` — update to `/ceo.png` to match `about.js`

- [ ] `src/lib/mail/MailService.js` missing `sendNewsletterWelcome` — `functions/lib` version has it; low risk since newsletter welcome is Firestore-triggered (not called from Next.js), but keep in sync

## Nice to have

- [ ] Test booking flow end-to-end in staging (create booking → confirm Firestore write → confirm emails arrive)
- [ ] Verify newsletter subscribe → Firestore write → welcome email chain works
- [ ] Add `functions/lib/` to `.gitignore` if going with prebuild approach

## Booking flow audit (2026-09-12)

End-to-end review of `/v2/booking` → `createBooking` → `/bookings`. Grouped by
severity. The first four are places where the flow contradicts what the salon
already promises in public on `/v2/services` and `/v2/salon`.

### Blockers — the flow contradicts the stated terms

- [ ] **Deposits do not exist in the booking flow.** `BookingTerms.jsx` promises
      50% on mini twists / mini braids / natural hair braids / Bantu knots /
      loosening and 70% on micro twists + sister locs, paid to "the salon
      account shown at checkout", with the slot open to someone else until it
      lands. `FaqSection.jsx` promises "you will see the amount before you
      confirm". The flow says `"Pay at the salon. No card needed."`
      (`BookingFlow.jsx:507`). The word *deposit* appears nowhere in the booking
      code or in `services.json`.
      → add `depositPercent` per service, a deposit row on Review, account
      details + "send proof to the office line" on Success, and an
      `awaiting-deposit` status until the salon marks the slot held.

- [x] **No notes field, but the FAQ tells people to use one.** "Tell us when you
      book so we plan the gentler approach" (relaxed / transitioning hair) and
      "Mention it in your booking notes" (children's hair) both point at a field
      that did not exist. *Done: an optional note on the Details step, echoed on
      Review and Success, carried by `createBooking`, cleaned and capped by
      `functions/lib/notes.js`, and shown in the owner notification, the daily
      digest and the client's confirmation. The mail templates gained an `esc()`
      helper at the same time — they interpolated the client's own name raw.*

- [ ] **Late fee is hardcoded wrong.** `Steps.jsx:256` and `ServiceSheet.jsx:185`
      both say a flat ₦3,000. The terms say ₦5,000 on micro twists, sister locs
      and SAT with weaves — so the confirm checkbox has people agreeing to a
      number that is not theirs. Needs a per-service late fee.

- [ ] **Cancellation copy contradicts the terms.** `Steps.jsx:270` says "move or
      cancel from My bookings any time before your appointment"; the terms say
      cancelling or moving after paying forfeits 50%. Reconcile both.

### High — availability model

- [ ] **No capacity check at all.** `bookingRules.js` deliberately allows
      unlimited overlap because several stylists work in parallel, but nothing
      caps it at the number of stylists — any number of clients can take
      Saturday 09:00. `slotsFor()` never consults existing bookings.
      → chair/stylist count, enforced in a transaction in `createBooking`, and
      fed to the picker so full slots stop rendering.

- [ ] **No closures.** Only Mondays, hardcoded. No holidays, staff leave or
      one-off shutdowns — Christmas Day is bookable 90 days out. Needs a
      `closures` collection read by both `validateSlot` and the client picker.

- [x] **Guests are a dead end after booking**, and **no anonymous → account
      linking**: a guest who later signed up lost their history, their "booked
      before" tags and their rebook card. *Done: `/v2/booking/manage` opens one
      booking from an HMAC-signed link (returned by `createBooking` and carried
      in the confirmation email) and can move or cancel it with no account —
      `getBooking`, `cancelBooking` and `rescheduleBooking` now take a token in
      place of an owning uid. Signing up links the anonymous session in place so
      the uid survives; signing in to an account that already exists hands the
      anonymous ID token to the new `claimGuestBookings` callable, which
      verifies it and re-points the bookings.*

- [ ] **Phone-only guests get no reminder.** `schedulerMessages` filters to
      `b.userEmail` (`index.js:691`), so the cohort with no deposit, no card and
      no email is the only one receiving nothing. At minimum put one-tap
      WhatsApp links for them in the owner's daily digest.

### Medium — clarity

- [ ] **42 of 70 services have no photo**, in a grid that defaults to the
      photo-first "Looks" view. Backfill images, or default to List where a
      category is mostly photoless.

- [ ] **Hidden price extras.** 27 of 70 descriptions carry caveats like "styling
      your twists comes with extra 1,000". Descriptions only render inside the
      service sheet — never on a card, never on Review, which states the total
      as a firm number. Make extras structured and say "from" where they apply.

- [ ] **The server's total is thrown away.** `createBooking` returns
      `totalAmount`; `SuccessView` never shows a price. The catalogue is bundled
      at build time (static export), so a stale deployed price disagrees with
      the server's silently.

- [ ] **Timezone regression on `/bookings`.** The v2 flow is careful about WAT
      throughout (`schedule.js` exists for exactly this); `/bookings` formats
      with bare `dayjs(booking.startTime)` in browser-local time, so a client
      abroad sees the wrong hour.

- [ ] **`/bookings` is still v1.** Old styling, and every CTA points at
      `/services` rather than `/v2/booking`.

- [ ] **No deep link into the flow.** `ServiceMenu.jsx:124` sends every look to a
      bare `/v2/booking`, so tapping a named style lands on an empty step 1.
      `?again=<id>` is already implemented — add `?add=<title>` the same way.

- [ ] **"Confirmed" or "requested"?** Success says *Booked*, guest copy says *the
      salon will confirm*, `/bookings` maps status `pending` to a **Confirmed**
      badge, and the terms say the slot is open until the deposit lands. Four
      answers to one question.

### Stale test

- [ ] `v2-booking.spec.js:707` expects `₦18,000` for Barrel Twist + Finger
      Coils, but the uncommitted pricing change took Finger Coils from ₦8,000 to
      ₦10,000, so the pair is ₦20,000 and the mobile-safari case fails. Left
      alone because the price edit is still in the working tree — update the
      test when that pricing is settled.

### Small

- [ ] Long styles: a 600-minute service exactly equals the daily maximum, so it
      has one 09:00 slot, Tue–Sat. Adding anything else triggers "book them as
      two visits" with no help doing it.
- [ ] No waitlist when a day returns "No times left on this day".
- [ ] `LookRow` carries `role="checkbox"` + `aria-checked`, but for looks with
      variants activating it opens a dialog (`ServicesStep.jsx`).
- [ ] The mobile slip's CTA is wrapped in `Dialog.Close`, so the sheet closes
      even when validation fails and the error is left behind it.
- [ ] Nothing tells clients what to bring. The FAQ knows (clean, pre-stretched
      extensions; beads +₦500); the confirmation screen and email are the place
      to say it.
