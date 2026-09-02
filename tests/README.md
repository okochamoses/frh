# Dev environment & UI tests

Everything here runs against the **Firebase Emulator Suite**, never the live
`flourish-roots` project. No test can read or write production data.

## Why it is safe

`src/lib/firebase/config.js` checks `NEXT_PUBLIC_USE_FIREBASE_EMULATOR`. When it
is `true` the real `NEXT_PUBLIC_FIREBASE_*` values are **ignored** and the app
uses a `demo-flourish` project id. Firebase treats any `demo-` prefixed project
as emulator-only: it never contacts Google servers and needs no credentials, so
a stray `.env.local` cannot leak a test run onto production.

## Prerequisites

Java 11+ (the Firestore emulator is a JAR) and, once per machine:

```bash
npm run test:install
```

## Day-to-day development

Run the app against local emulators:

```bash
npm run dev:local
```

That starts the Auth + Firestore emulators and the Next dev server together.
The app is on http://localhost:3000 and the Emulator UI — where you can inspect
accounts and Firestore documents by hand — is on http://127.0.0.1:4000.

To keep the data you created between runs:

```bash
npm run emulators:export
```

State is written to `./.emulator-data` on exit and re-imported on the next start.

To run the two halves in separate terminals instead:

```bash
npm run emulators
```

```bash
npm run dev:emulator
```

`npm run dev` is unchanged and still points at whatever `.env.local` holds — use
it only when you deliberately want the live project.

## Running the tests

```bash
npm run test:e2e
```

Playwright starts the emulators and the dev server itself, so this is the only
command you need. Other entry points:

| Command | What it does |
| --- | --- |
| `npm run test:e2e:baseline` | Skips the `@known-bug` specs — this should always be green |
| `npm run test:e2e:ui` | Playwright's interactive runner |
| `npm run test:e2e:headed` | Watch the browser drive the app |
| `npm run test:e2e:report` | Open the HTML report from the last run |

Run one file or one test:

```bash
npx playwright test signin
```

```bash
npx playwright test --grep "wrong password"
```

## How the suite is organised

```
tests/
  support/
    emulator.js     REST helpers: reset, seed users, read profiles back
    auth-modal.js   Page object for the sign-in / sign-up modal
  e2e/
    smoke.spec.js         Pages render and interact without uncaught errors
    signin.spec.js        Sign-in paths, validation, error messages
    signup.spec.js        Account creation, validation, duplicate handling
    session.spec.js       Persistence, sign-out, gated pages, accessibility
    booking-gate.spec.js  The /services booking flow's auth and phone gates
```

Every spec calls `resetEmulators()` in `beforeEach`, so tests never inherit each
other's state. Because that state is shared process-wide, the suite runs with
`workers: 1` — do not raise it without giving each worker its own project id.

### The `@known-bug` tag

Specs tagged `@known-bug` assert the behaviour we *want* and fail against the
current code. They are the executable version of the audit findings: each one
turns green when its bug is fixed, and none should be deleted or skipped.

`npm run test:e2e:baseline` excludes them, so it is the check for "did I break
something that used to work".

### `@mobile`

Runs only in the `mobile-safari` project, for behaviour that only exists at
phone widths.

## One thing worth knowing about the emulator

By default the Auth emulator still returns `auth/user-not-found` and
`auth/wrong-password` as separate codes. Live Firebase projects have email
enumeration protection switched on and collapse both into
`auth/invalid-credential`.

`resetEmulators()` therefore turns on `enableImprovedEmailPrivacy` so the
emulator matches production. Without it the emulator silently hides every bug in
how those codes are mapped to messages — including one this suite exists to
catch.

## Testing against the production build

`npm run test:e2e` runs against `next dev`. Production is a **static export**
(`output: 'export'`) served by Firebase Hosting — a different artifact. To run
the same suite against that artifact:

```bash
npm run test:e2e:prod
```

This builds the static export and serves it with the Firebase Hosting emulator
using `firebase.e2e.json`, so `cleanUrls`, `trailingSlash` and the hosting
rewrite behaviour match production. It is slower; run it before deploying.

The export lands in `out-e2e/`, never `out/`. That matters: the test build bakes
in `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`, and `out/` is what `firebase deploy`
publishes. Keeping them separate makes it impossible to accidentally ship a
build that points at localhost.

Hosting runs on **5050**, not Firebase's default 5000 — macOS ControlCenter
(AirPlay Receiver) occupies 5000 and the emulator refuses to start on it.

## Where this does NOT mirror production

The emulator is faithful for the auth and Firestore logic this suite covers, but
it is not production. Known divergences, highest risk first:

1. **Google sign-in is fake.** The emulator shows its own account picker, not
   Google's. Real OAuth, blocked popups (common on mobile Safari and in-app
   browsers), and `auth/account-exists-with-different-credential` cannot be
   exercised here. Verify Google paths manually against a real project.
2. **Email is never delivered.** Password-reset and verification mails are
   captured as `oobCodes` in the emulator, readable via `getOobCodes()`. The
   template, the sending domain and deliverability are all untested.
3. **No rate limiting.** The emulator never returns `auth/too-many-requests`,
   so that error path is unreachable in tests.
4. **No App Check / reCAPTCHA.** If enforcement is ever switched on in the
   console, real clients get a gate that the emulator does not apply.
5. **Composite indexes are not enforced.** The emulator answers queries that
   production would reject with "index required". Harmless today — the only
   query is a single-field `where("userId", "==", ...)` — but it stops being
   harmless the moment an `orderBy` is added.
6. **No network latency.** Races that need a slow connection (such as the
   profile-write vs `onAuthStateChanged` ordering) will not reproduce locally.
7. **Cloud Functions do not run.** The suite starts only auth, firestore and
   hosting, so any function triggers are absent.

### One assumption you should confirm

`resetEmulators()` turns on email enumeration protection so failed sign-ins
return `auth/invalid-credential`, matching a **default modern Firebase project**.
Projects created before that default, or with the setting switched off, still
return `auth/user-not-found` and `auth/wrong-password` separately.

Confirm which applies to `flourish-roots` in the Firebase console under
Authentication → Settings → User account protection. If enumeration protection
is *off* there, the error mapping needs to handle both shapes, not just one.
