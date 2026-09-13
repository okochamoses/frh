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

- [x] `v2-booking.spec.js` expected `₦18,000` for Barrel Twist + Finger Coils
      after Finger Coils moved to ₦10,000. *Done: prices in that file now come
      from named constants through one formatter. The other ₦18,000 a few tests
      up was correct — that booking seeds Barrel Twist and a wash.*

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

## Continuous-iteration round 1 (2026-09-13)

Findings from a parallel audit of the v2 build: booking flow, page/section
layer, accessibility, and cross-cutting code health. Items already listed
above are not repeated here.

### Security — booking links

- [ ] **One token authorises two different powers.** `bookingToken()`
      (`functions/index.js:53`) is `HMAC(secret, bookingId)` with no purpose in
      the input, and the same value is handed to the client as their manage
      link (`makeManageUrl`, `:71`) and to the salon as the "mark complete"
      link (`makeCompleteUrl`, `:57`). `verifyToken` (`:75`) is equally
      purpose-blind, so a client's own link will mark their appointment
      completed and fire the review request before the appointment happens, and
      anyone holding a forwarded owner link can cancel or move that client's
      booking.
      → put the purpose in the HMAC input (`${bookingId}:manage` vs
      `${bookingId}:complete`) and pass it at every mint and verify site.
      Nothing needs to keep working across the change: `BOOKING_SECRET` is
      still unset, so every token in existence is signed with the empty key.

- [ ] **An unset `BOOKING_SECRET` silently downgrades to no security.** All five
      sites read `process.env.BOOKING_SECRET || ""` (`functions/index.js:162`,
      `:283`, `:383`, `:625`), so a deploy that forgets the secret still mints
      and accepts tokens — signed with a key anyone can reproduce, making every
      manage and complete link forgeable from the booking id alone.
      → fail closed in production (refuse to verify, omit the link rather than
      send a worthless one) and fall back to a fixed dev value only under
      `FUNCTIONS_EMULATOR`.

### Correctness

- [ ] Reschedule offers slots that cannot fit. `getBooking` returns
      `totalDuration: … ?? null` (`functions/index.js:564`) and
      `ManageBooking.jsx:112` passes `duration={duration ?? 0}` to `TimeStep`
      (`:310`), so a booking predating `totalDuration` picks times as if the
      appointment took no time at all. The server does fall back to
      `endTime - startTime` (`functions/index.js:429`), so the slot the client
      chose is refused only after they press "Move my booking".
      → mirror the server's fallback client-side.

- [ ] `countUpcomingBookings` (`functions/lib/adminBookingService.js:124`)
      compares `b.startTime > nowIso` as raw strings while the rest of the
      backend anchors through `watDate()`. For bookings stored in the older
      naive-WAT form the comparison is an hour out, so the guest cap can count a
      past booking as upcoming (or the reverse) near the boundary.

### Dead code hiding real problems

- [ ] Delete the legacy Google-Sheets backend: `src/lib/services/sheetsImpl/**`
      and `src/lib/repositories/**` have no importers outside themselves — and
      they are where *all* of the TypeScript errors currently suppressed by
      `typescript.ignoreBuildErrors` (`next.config.mjs:31`) live. With the tree
      gone, that flag can probably come off, which means v2 code starts getting
      type-checked instead of silently not.

- [ ] Delete `src/lib/mail/**`. `functions/index.js:11` imports
      `./lib/mail/MailService`; the `src/` copy is reachable only from the dead
      Sheets tree above. The two have diverged badly (different SMTP ports and
      TLS, four send methods missing, a whole pre-v2 template set), so the
      standing risk is someone editing the copy that never runs.

### Accessibility

- [ ] Toast "Undo" vanishes on a fixed 4.5s timer that nothing pauses
      (`src/components/v2/booking/ui.jsx:69`). Undo is not focused when it
      appears, so reaching it by keyboard inside the window is a race.
      WCAG 2.2.1.
- [ ] `LookRow` nests a real `<button>` inside a `role="checkbox"` div
      (`ServicesStep.jsx:108`) — invalid ARIA, two ambiguous tab stops per row.
      (Related to the existing `LookRow` note under "Small" above.)
- [ ] Guest name and phone are mandatory but carry no `required` /
      `aria-required` and no visible cue (`Steps.jsx:165`); only the optional
      field is labelled. The requirement is discoverable only by failing.
- [ ] `Field` always sets `aria-describedby="…-hint"` but only renders that
      paragraph when there is a hint or error (`Steps.jsx:66`), so the
      reference usually points at nothing.

- [ ] **Needs a product decision:** the desktop mega-menu opens on focus, but
      each panel sits after every other nav control in the DOM
      (`Header.jsx:651`), so tabbing from the trigger moves to the next trigger
      and closes the panel — its links are visible but unreachable by keyboard.
      Fixing it means either moving each panel to directly after its own
      trigger, or switching to click-to-open with a focus trap and Escape. The
      second changes how the nav feels for everyone, so it is not a fix to make
      silently.

### Design system and content

- [ ] `/v2/design-system` is a shipped route and calls the business
      "Flourish Roots Studio, Ikoyi Lagos" (`page.js:358`). It is
      Flourish Roots Hair Co., in Isolo, everywhere else.
- [ ] Mustard sections apply opacity to text, which `docs/design-v2/DESIGN.md`
      §18 rule 6 forbids outright: `ClosingCta.jsx:37` and `:83`,
      `CoachingClosingCta.jsx:22` — about 3.3:1, under AA.
- [ ] `src/components/v2/ui/Card.jsx` has no importers; every card on the site
      goes through one of the five specific card components.
- [ ] The numbered index-card block is copy-pasted verbatim in four places
      (`BookingTerms.jsx`, `HowAVisitGoes.jsx`, `CoachingHowItWorks.jsx`, and
      inline in `src/app/v2/shop/page.js`).
- [ ] Unresolved: `!text-ink/45` on `bg-gold` (`NewsletterSection.jsx:66,82,89`,
      `CoachingWhatYouGet.jsx:36,59`). DESIGN.md tolerates `ink/55` on Glow at
      3.64:1 but says nothing about `ink/45`, which is lower still. Needs a call
      on what the floor actually is.

### Tooling

- [ ] There is no root ESLint config and no `eslint` dependency, so
      `npm run lint` drops into the interactive setup prompt and would hang a
      CI run. Either restore a config or drop the script.
- [ ] `/admin` has no UI test. The Firestore rule is covered
      (`tests/e2e/firestore-rules.spec.js`), but nothing asserts an admin can
      actually sign in and see bookings and customers.
- [ ] Unverified: a signed-in user whose profile has no `mobileNumber` may be
      able to reach an enabled "Confirm booking" on a session-restored step 4
      (`BookingFlow.jsx:252` guards only the guest path). No repro found —
      confirm before changing anything.

### Round 1 follow-ups (raised while fixing, not yet done)

- [ ] **Your call — the list row's photo moved.** Fixing the invalid ARIA meant
      the photo button had to stop being a child of the row's control, so it is
      now the row's first element where the checkbox used to be
      (`ServicesStep.jsx`, `LookRow`). Keeping the old order — checkbox, photo,
      name, price — with valid semantics needs either an absolutely-positioned
      row button behind the content or `display:contents`, which strips button
      semantics in some browsers. Say if the old order matters and it is worth
      the complexity.
- [ ] `LookCard` (the grid view) still flips its accessible name between
      "Add X" and "Remove X" while also setting `aria-pressed`
      (`ServicesStep.jsx:85`), so a screen reader announces "Remove X, pressed".
      `LookRow` was fixed to keep a stable name; the grid should match. It is
      left alone for now because `addBarrelTwistAndPickTime` and several tests
      locate that button by the "Add …" name.
- [ ] **Your call — what is the contrast floor on mustard?** DESIGN.md §18
      rule 6 says never apply opacity to text on mustard, full stop. The two
      values that actually failed AA are fixed (ink/60 at 3.74:1, ink/55 at
      3.29:1), but four `text-ink/70` paragraphs remain in `ClosingCta.jsx` and
      `CoachingClosingCta.jsx` and they measure 4.88:1, which passes. Either the
      rule should name a floor instead of forbidding opacity outright, or those
      four should go full-strength too.
- [ ] `"Gels on Nails "` carries a trailing space in `services.json`. Harmless
      where names are rendered, but it makes exact-match lookups and test
      locators fragile. Check the catalogue for others.
- [ ] Visual and layout checking cannot be delegated: a spawned agent has no
      permission to reach `localhost`, and viewport metrics read as zero
      whenever the browser pane is hidden, which silently turns every layout
      assertion into nonsense. Screenshot passes have to run in the foreground
      session with the pane visible.

## Continuous-iteration round 2 (2026-09-13)

Round 2 was cut short: the parallel audits (admin dashboard, the unattended
cron/email paths, payload and metadata) all died on a session rate limit before
reporting. Those three areas are still unaudited. What follows was found
working alone.

### Done

- [x] **The admin allowlist let an impostor in.** `isAdmin()` matched on
      `request.auth.token.email` without checking `email_verified`. An admin is
      allowlisted *before* their first sign-in, and Firebase will create an
      email/password account for any address nobody has claimed — so anyone who
      knew or guessed an allowlisted address could register it and read every
      customer's name, phone number and booking history. Reproduced against the
      emulator (200 plus customer rows), then fixed and re-checked (403, while
      a verified admin still gets 200).

### Search and sharing — needs two decisions from you

- [ ] **No Open Graph or Twitter tags anywhere.** `src/app/v2/layout.js` sets a
      title and description and nothing else, so every link shared to WhatsApp
      or Instagram — which is how this salon is actually passed around — renders
      as a bare URL with no picture. Fixing it needs a share image (1200×630;
      none of the current assets is that shape, so one has to be made or
      cropped) and `metadataBase`, which needs the production domain settled —
      `SITE_BASE` still defaults to `flourish-roots.web.app` and TODO already
      notes the site may move.
- [ ] No `sitemap.xml` and no `robots.txt`. Also blocked on the domain.
- [ ] No `LocalBusiness` JSON-LD. For a salon competing on local search this is
      the single highest-value piece of structured data — address, opening
      hours and phone are all already centralised in
      `src/components/v2/salon.js`, so it is mostly a matter of deciding to.
- [ ] The v2 homepage has no `metadata` of its own, so the most-shared page on
      the site inherits the layout's generic "Flourish Roots Hair" /
      "Hair that flourishes from root to tip."

### Still unaudited (round 2 never ran)

- [ ] The admin dashboard beyond the rules: both list pages subscribe to whole
      collections with no limit or pagination and sort in the browser.
- [ ] The unattended paths — the 15-minute reminder cron, the daily digest
      claim, `completeBooking` — for double sends, missed windows, and WAT
      boundaries; plus whether customer-supplied names and notes are escaped
      everywhere they reach an email template.
- [ ] Payload: fonts shipped as `.ttf`/`.otf` rather than woff2, which of
      framer-motion / gsap / swiper / react-fast-marquee each v2 route actually
      pulls in, and whether the `V1Shell` split still keeps v1 chrome out of v2.
