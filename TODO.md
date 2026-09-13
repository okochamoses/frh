# FRH 2025 — Todo

## Blockers (do before deploy)

- [x] Commit all uncommitted changes
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

- [x] ~~`gallery/page.js` still references `/ceo.webp`~~ Stale: no file under `src/` references a missing image; checked every `/x.webp|png|jpg|svg` literal against `public/`. `/ceo.webp` exists and is used by `HeroSection.js` — update to `/ceo.png` to match `about.js`

- [x] ~~`src/lib/mail/MailService.js` missing `sendNewsletterWelcome`~~ Moot: `src/lib/mail/**` is deleted; the functions copy is the only one — `functions/lib` version has it; low risk since newsletter welcome is Firestore-triggered (not called from Next.js), but keep in sync

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

- [x] **One token authorises two different powers.** `bookingToken()`
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

- [x] **An unset `BOOKING_SECRET` silently downgrades to no security.** All five
      sites read `process.env.BOOKING_SECRET || ""` (`functions/index.js:162`,
      `:283`, `:383`, `:625`), so a deploy that forgets the secret still mints
      and accepts tokens — signed with a key anyone can reproduce, making every
      manage and complete link forgeable from the booking id alone.
      → fail closed in production (refuse to verify, omit the link rather than
      send a worthless one) and fall back to a fixed dev value only under
      `FUNCTIONS_EMULATOR`.

### Correctness

- [x] Reschedule offers slots that cannot fit. `getBooking` returns
      `totalDuration: … ?? null` (`functions/index.js:564`) and
      `ManageBooking.jsx:112` passes `duration={duration ?? 0}` to `TimeStep`
      (`:310`), so a booking predating `totalDuration` picks times as if the
      appointment took no time at all. The server does fall back to
      `endTime - startTime` (`functions/index.js:429`), so the slot the client
      chose is refused only after they press "Move my booking".
      → mirror the server's fallback client-side.

- [x] `countUpcomingBookings` (`functions/lib/adminBookingService.js:124`)
      compares `b.startTime > nowIso` as raw strings while the rest of the
      backend anchors through `watDate()`. For bookings stored in the older
      naive-WAT form the comparison is an hour out, so the guest cap can count a
      past booking as upcoming (or the reverse) near the boundary.

### Dead code hiding real problems

- [x] Delete the legacy Google-Sheets backend: `src/lib/services/sheetsImpl/**`
      and `src/lib/repositories/**` have no importers outside themselves — and
      they are where *all* of the TypeScript errors currently suppressed by
      `typescript.ignoreBuildErrors` (`next.config.mjs:31`) live. With the tree
      gone, that flag can probably come off, which means v2 code starts getting
      type-checked instead of silently not.

- [x] Delete `src/lib/mail/**`. `functions/index.js:11` imports
      `./lib/mail/MailService`; the `src/` copy is reachable only from the dead
      Sheets tree above. The two have diverged badly (different SMTP ports and
      TLS, four send methods missing, a whole pre-v2 template set), so the
      standing risk is someone editing the copy that never runs.

### Accessibility

- [x] Toast "Undo" vanishes on a fixed 4.5s timer that nothing pauses
      (`src/components/v2/booking/ui.jsx:69`). Undo is not focused when it
      appears, so reaching it by keyboard inside the window is a race.
      WCAG 2.2.1.
- [x] `LookRow` nests a real `<button>` inside a `role="checkbox"` div
      (`ServicesStep.jsx:108`) — invalid ARIA, two ambiguous tab stops per row.
      (Related to the existing `LookRow` note under "Small" above.)
- [x] Guest name and phone are mandatory but carry no `required` /
      `aria-required` and no visible cue (`Steps.jsx:165`); only the optional
      field is labelled. The requirement is discoverable only by failing.
- [x] `Field` always sets `aria-describedby="…-hint"` but only renders that
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

- [x] `/v2/design-system` is a shipped route and calls the business
      "Flourish Roots Studio, Ikoyi Lagos" (`page.js:358`). It is
      Flourish Roots Hair Co., in Isolo, everywhere else.
- [x] Mustard sections apply opacity to text, which `docs/design-v2/DESIGN.md`
      §18 rule 6 forbids outright: `ClosingCta.jsx:37` and `:83`,
      `CoachingClosingCta.jsx:22` — about 3.3:1, under AA.
- [x] `src/components/v2/ui/Card.jsx` has no importers; every card on the site
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

- [x] **No Open Graph or Twitter tags anywhere.** `src/app/v2/layout.js` sets a
      title and description and nothing else, so every link shared to WhatsApp
      or Instagram — which is how this salon is actually passed around — renders
      as a bare URL with no picture. Fixing it needs a share image (1200×630;
      none of the current assets is that shape, so one has to be made or
      cropped) and `metadataBase`, which needs the production domain settled —
      `SITE_BASE` still defaults to `flourish-roots.web.app` and TODO already
      notes the site may move.
- [x] No `sitemap.xml` and no `robots.txt`. Also blocked on the domain.
- [x] No `LocalBusiness` JSON-LD. For a salon competing on local search this is
      the single highest-value piece of structured data — address, opening
      hours and phone are all already centralised in
      `src/components/v2/salon.js`, so it is mostly a matter of deciding to.
- [x] The v2 homepage has no `metadata` of its own, so the most-shared page on
      the site inherits the layout's generic "Flourish Roots Hair" /
      "Hair that flourishes from root to tip."

### Still unaudited (round 2 never ran) — since audited, see below

- [x] The admin dashboard beyond the rules: both list pages subscribe to whole
      collections with no limit or pagination and sort in the browser.
- [x] The unattended paths — the 15-minute reminder cron, the daily digest
      claim, `completeBooking` — for double sends, missed windows, and WAT
      boundaries; plus whether customer-supplied names and notes are escaped
      everywhere they reach an email template.
- [x] Payload: fonts shipped as `.ttf`/`.otf` rather than woff2, which of
      framer-motion / gsap / swiper / react-fast-marquee each v2 route actually
      pulls in, and whether the `V1Shell` split still keeps v1 chrome out of v2.

### Round 2 findings (2026-09-13)

#### Done

- [x] Search and sharing. Open Graph and Twitter tags with a real 1200×630
      share image, `HairSalon` structured data derived from the booking
      constants, a sitemap and a robots.txt, and `src/lib/site.js` holding the
      one origin they all need.
- [x] **Every page's title and description were being shadowed.** The root
      layout declared `metadata` without exporting it and hand-wrote a literal
      `<title>` and description into `<head>`, so pages that set their own
      emitted two of each — and the generic pair came first. Fixing it meant
      moving the v1 fonts to `src/app/fonts.js`, because 23 client components
      imported them from the layout and dragged it into the client graph.

#### The reminder cron (done)

- [x] **Reminders fire about an hour early for every booking made since the
      UTC migration.** The window is built as naive-WAT digits
      (`functions/index.js:879`) and fed to a lexicographic Firestore range
      query, but post-migration `startTime` values are true UTC. Working it
      through, a UTC-stored booking only enters the window when it is
      1h45m–2h15m away — so the "your appointment is in one hour" email arrives
      roughly two hours ahead. Naive-WAT rows work by coincidence of format.
- [x] The send is awaited before `reminderSent` is written
      (`functions/index.js:911`), so a failed write or a timed-out invocation
      after the mail went out means the next tick sends it again. The digest
      already solves this with an atomic claim.
- [x] A failed reminder is logged by its index into the *filtered* array
      (`functions/index.js:930`), which does not identify the booking — so
      nobody can tell which customer went un-reminded.

#### The reminder cron (not yet)

- [ ] A booking made 20–40 minutes ahead is never reminded: the window floor is
      45 minutes out but `validateSlot` sets no minimum lead time.
- [ ] The digest tells the owner that each booking's own email carries a
      "mark complete" link (`templates.js:781`). When `BOOKING_SECRET` is
      unset those links do not exist, so the digest points at a control that
      is not there.

#### Admin dashboard

- [x] **Staff and customers are shown contradictory words for the same
      booking.** The admin badge prints the raw status — "PENDING" — while the
      customer was told "Confirmed" (`src/app/bookings/page.js:32` maps it) and
      the admin's own filter dropdown calls that value "Confirmed" too. Staff
      may well treat a confirmed booking as something still to chase.
- [~] Both admin pages subscribe to whole collections with no limit, filter or
      pagination (`adminService.js:63`, `:76`) and sort in the browser. At
      5,000 bookings and 3,000 customers that is ~8,000 document reads per
      dashboard open, per admin, per reload — several MB before the table
      renders at all, and nothing renders until every row has arrived. A
      bounded `orderBy("startTime","desc")` + `limit` with a cursor needs only
      the automatic single-field index.
- [x] Admin dates are rendered with a bare `dayjs(b.startTime)`
      (`admin/bookings/page.js:89`), with no equivalent of the backend's
      `watDate`. Any legacy zone-less booking shows in the viewer's own
      timezone rather than Lagos.
- [ ] Signing out of the admin dashboard signs the same person out of their
      customer session, because both use the one Firebase Auth instance. Worth
      at least saying so in the UI.
- [ ] A subscription error shows "Couldn't load bookings" whatever the cause,
      so a rules regression is indistinguishable from an outage. It does not
      masquerade as an empty list, which was the thing worth checking.

#### Payload — roughly 150–250 KB a page, ~400 KB on /v2/booking

- [ ] Seven font files (~123 KB) are preloaded on *every* v2 route, including
      text-only pages, competing with the hero image for first paint. Barlow is
      loaded at three weights and Barlow Condensed at two, none marked
      `preload: false` (`src/app/v2/fonts.js`).
- [ ] `/v2/booking` is 301 kB of first-load JS against 119–131 kB for every
      other v2 page, because the Firestore listener and callable SDK are pulled
      in at route load. It is the page with the highest intent and it is the
      heaviest.
- [ ] `AuthProvider` wraps every route from `src/app/structure.js`, so the
      Firebase Auth SDK sits in the shared baseline even for a static page like
      `/v2/about`.
- [ ] `/v2/gallery` hand-rolls a `srcSet` against a duplicate older set of
      files in `public/gallery/*-400|800.webp`, with the uncapped full-size
      original as the largest candidate (`img_1.webp` is 219 KB), instead of
      using the `_img` variant pipeline everything else uses.
- [ ] v1 still ships `Bagelan.otf` (182 KB) and `merriweather.otf` (29 KB) as
      OTF rather than woff2. No v2 route touches them, so this is v1's bill.
- [ ] `src/app/figtree.ttf` (63 KB) is imported by nothing.

Checked and clean, worth not re-checking: customer names, phone numbers and
notes are escaped everywhere they reach an email template; prices and durations
in emails are the snapshot taken when the booking was made; the `V1Shell` split
still keeps framer-motion, gsap, swiper and react-fast-marquee out of every v2
route; and no admin row crashes or prints NaN on missing fields.

### Round 3 (2026-09-13)

#### Done

- [x] The reminder cron now has a test — it had none, which is why the
      timezone bug shipped. It seeds the same appointment in both storage
      formats and requires both to be reminded at the same real moment;
      confirmed to fail against the old arithmetic before being kept.
      `playwright.config.js` supplies `SCHEDULER_SECRET` so it runs under a
      plain `npm run test:e2e` rather than a special invocation.
- [x] **The v1 suite was racing React hydration**, which is why a failure kept
      moving between tests and read as one flaky spec. `page.goto` resolves on
      the HTML; a click before hydration runs no handler, and a fill into a
      controlled input is discarded when hydration re-renders it empty — so
      "a day the services cannot fit says why" was clicking the featured
      service instead of the one it names, and passing for the wrong reason
      about a third of the time. `tests/support/hydration.js` now covers it.
      Five consecutive full runs: 111 passed, 1 skipped, none failed.

#### Deliberately not done

- [~] Bounding the admin queries. Tried and backed out: `startTime` holds two
      encodings, and Firestore orders a string field as text, so the naive-WAT
      rows sort as though they were an hour later than they are — `orderBy`
      plus `limit` does not return the newest bookings, it returns the
      newest-looking text and picks the wrong rows for the page. `createdAt`
      on `users` has a second problem: the rule admits a subset of fields, so
      a profile saved without it is legal and `orderBy` drops it silently.
      Both lists stay complete and sort in the browser with `watInstant`.
      **The precondition for paginating is normalising `startTime` to one
      encoding and backfilling `createdAt`** — worth doing, and it unlocks the
      performance fix rather than trading correctness for it.

#### Still open, in rough priority order

- [ ] The payload work: ~123 KB of fonts preloaded on every v2 route, the
      Firebase SDK sitting in `/v2/booking`'s 301 kB first load, Auth in the
      shared baseline for every page, and `/v2/gallery` on its own stale image
      pipeline with an uncapped original as the largest candidate.
- [ ] A booking made 20-40 minutes ahead is still never reminded — the window
      floor is 45 minutes and nothing enforces a minimum lead time.
- [ ] The digest still tells the owner about "mark complete" links that do not
      exist when `BOOKING_SECRET` is unset.
- [ ] The `admins` allowlist has no UI: adding one means a Firestore console
      visit. Fine for a handful of accounts, worth revisiting if it grows.
- [ ] Signing out of `/admin` signs the same person out of the customer site,
      because both share one Firebase Auth instance. At least say so in the UI.
- [ ] The parked `test.fixme` for "similar looks" in the photo sheet — decide
      whether to build the feature or drop the intent.
- [ ] Trailing spaces in `services.json` titles ("Gels on Nails ",
      "Sister Locs - Long Hair ") make exact-match lookups and test locators
      fragile.
