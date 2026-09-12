import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  connectAuthEmulator,
} from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

/**
 * Set NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true to run against the local
 * Firebase Emulator Suite instead of the live project.
 *
 * When the flag is on we deliberately ignore the real NEXT_PUBLIC_FIREBASE_*
 * values and use a `demo-` project id. Firebase treats any project whose id
 * starts with `demo-` as emulator-only: it never contacts Google servers and
 * needs no credentials, so there is no way for a dev or test run to touch
 * production data even if a stray .env.local is present.
 */
export const USE_EMULATOR = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

export const EMULATOR_PROJECT_ID = "demo-flourish";

const EMULATOR_HOST = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "127.0.0.1";
const AUTH_EMULATOR_PORT = Number(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || 9099);
const FIRESTORE_EMULATOR_PORT = Number(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || 8080);
const FUNCTIONS_EMULATOR_PORT = Number(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT || 5001);

const emulatorConfig = {
  apiKey: "demo-api-key",
  authDomain: `${EMULATOR_PROJECT_ID}.firebaseapp.com`,
  projectId: EMULATOR_PROJECT_ID,
  storageBucket: `${EMULATOR_PROJECT_ID}.appspot.com`,
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000",
};

const liveConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Analytics is optional, so `measurementId` is deliberately kept out of
 * `liveConfig`: everything in there is treated as required below, and a site
 * with no GA4 property must still build and run.
 */
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

const firebaseConfig = USE_EMULATOR
  ? emulatorConfig
  : { ...liveConfig, ...(measurementId ? { measurementId } : {}) };

// Fail loudly at startup rather than surfacing a confusing auth error later.
if (!USE_EMULATOR) {
  const missing = Object.entries(liveConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    const message =
      `Firebase config is incomplete — missing: ${missing.join(", ")}. ` +
      `Check your .env.local (see .env.local.example), or run against the ` +
      `emulator with NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true.`;

    // Throwing during a production build would break the static export, so in
    // the browser we log loudly and let Firebase produce its own error.
    if (typeof window === "undefined") throw new Error(message);
    console.error(message);
  }
}

// getApps() guard keeps Next.js fast-refresh from re-initialising the app.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);

/**
 * Auth, initialised *without* a popup/redirect resolver.
 *
 * `getAuth()` hands Firebase the browser popup resolver up front, and
 * initialising that resolver loads `apis.google.com/js/api.js`, the
 * `<authDomain>/__/auth/iframe` frame and a `getProjectConfig` call — three
 * third-party origins, on every page, before anyone has asked to sign in. On a
 * throttled mobile connection that chain competes with the hero image for
 * bandwidth and pushes LCP out by seconds.
 *
 * `initializeAuth` lets us pick the persistence chain (the same one `getAuth`
 * would have used) and leave the resolver out. Sign-in with Google passes
 * `browserPopupRedirectResolver` explicitly at the call site instead, so the
 * gapi chain loads on the click that needs it and nowhere else — see
 * `authService.js`.
 */
function createAuth() {
  // No window during the static export: `initializeAuth` would reject the
  // browser persistences, and nothing signs in server-side anyway.
  if (typeof window === "undefined") return getAuth(app);

  try {
    return initializeAuth(app, {
      persistence: [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
      ],
    });
  } catch {
    // Fast refresh re-evaluates this module against an app that already has an
    // auth instance; `initializeAuth` throws `auth/already-initialized` there.
    return getAuth(app);
  }
}

export const auth = createAuth();

// us-central1 is the default region and matches where the booking callables
// and FUNCTION_BASE in functions/index.js are deployed.
export const functions = getFunctions(app);

// connect*Emulator throws if called twice on the same instance, which fast
// refresh would otherwise do. A module-scoped flag is not enough because the
// module itself is re-evaluated, so we tag the app instance.
if (USE_EMULATOR && !app.__emulatorsConnected) {
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`, {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
  connectFunctionsEmulator(functions, EMULATOR_HOST, FUNCTIONS_EMULATOR_PORT);
  app.__emulatorsConnected = true;

  if (typeof window !== "undefined") {
    console.info(
      `[firebase] Using emulators — project ${EMULATOR_PROJECT_ID}, ` +
        `auth :${AUTH_EMULATOR_PORT}, firestore :${FIRESTORE_EMULATOR_PORT}, ` +
        `functions :${FUNCTIONS_EMULATOR_PORT}`
    );
  }
}

export default app;
