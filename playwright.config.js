import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

/**
 * Two targets:
 *   dev    (default) — `next dev`, fast, what you use while working
 *   export           — the real `output: 'export'` static build, served by the
 *                      Firebase Hosting emulator so cleanUrls / trailingSlash
 *                      and the hosting rewrite behaviour match production
 *
 * The export target is slower but is the one that proves a change survives the
 * static build, so run it before deploying.
 */
const TARGET = process.env.E2E_TARGET === "export" ? "export" : "dev";

// 5050, not Firebase's default 5000 — macOS ControlCenter (AirPlay Receiver)
// listens on 5000 and the Hosting emulator refuses to start.
//
// The dev target runs on 3100, not 3000. Playwright reuses whatever already
// answers on the URL, and 3000 is where `npm run dev` — pointed at the live
// Firebase project — usually sits. Reusing that would run the suite against
// production. 3100 is only ever the emulator-backed server started below.
const E2E_DEV_PORT = 3100;
const DEFAULT_URL = TARGET === "export" ? "http://127.0.0.1:5050" : `http://127.0.0.1:${E2E_DEV_PORT}`;
const BASE_URL = process.env.E2E_BASE_URL || DEFAULT_URL;

const emulatorCommand =
  TARGET === "export"
    ? "npx firebase emulators:start --only auth,firestore,functions,hosting --project demo-flourish --config firebase.e2e.json"
    : "npx firebase emulators:start --only auth,firestore,functions --project demo-flourish";

// In export mode the Hosting emulator serves the app, so there is no dev server.
const appServer =
  TARGET === "export"
    ? []
    : [
        {
          // Own port and own build folder, so it never collides with (or is
          // mistaken for) a normal dev server on 3000.
          command: `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true NEXT_DIST_DIR=.next-e2e npx next dev --turbopack -p ${E2E_DEV_PORT}`,
          url: BASE_URL,
          reuseExistingServer: !isCI,
          timeout: 180_000,
          stdout: "pipe",
          stderr: "pipe",
        },
      ];

export default defineConfig({
  testDir: "./tests/e2e",
  // Each spec resets the shared emulator state, so specs must not overlap.
  // Tests inside a file still run in order; files run one at a time.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
      // @mobile specs assert phone-only behaviour; they belong to the other project.
      grepInvert: /@mobile/,
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 13"] },
      // Only the specs tagged @mobile are worth running twice.
      grep: /@mobile/,
    },
  ],

  webServer: [
    {
      // Functions are in the list because bookings are created, cancelled and
      // rescheduled by callables — nothing writes that collection directly.
      command: emulatorCommand,
      // Probe the Auth emulator: it comes up after Firestore, so waiting on it
      // covers both. resetEmulators() re-checks anyway.
      url: "http://127.0.0.1:9099/",
      reuseExistingServer: !isCI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    ...appServer,
  ],
});
