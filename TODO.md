# FRH 2025 — Todo

## Blockers (do before deploy)

- [ ] Commit all uncommitted changes
  - `functions/index.js`, `functions/package*.json`
  - `src/app/contexts/BookingContext.js`
  - `src/components/about.js`
  - `src/lib/mail/MailService.js`, `config.js`, `templates.js`
  - `public/ceo.png`, `public/no-scalp-issues.png`, `public/scalp-issues-1.webp`

- [ ] Resolve `functions/lib/` — commit it OR add a prebuild step so `firebase deploy` doesn't fail
  - `functions/index.js` requires `./lib/mail/MailService` at runtime
  - Currently untracked; deploy will break without it

- [ ] Set Firebase secrets before deploying
  ```
  firebase functions:secrets:set SMTP_USER
  firebase functions:secrets:set SMTP_PASS
  ```

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
