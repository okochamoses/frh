import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

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

const firebaseConfig = USE_EMULATOR ? emulatorConfig : liveConfig;

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
export const auth = getAuth(app);

// connect*Emulator throws if called twice on the same instance, which fast
// refresh would otherwise do. A module-scoped flag is not enough because the
// module itself is re-evaluated, so we tag the app instance.
if (USE_EMULATOR && !app.__emulatorsConnected) {
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`, {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
  app.__emulatorsConnected = true;

  if (typeof window !== "undefined") {
    console.info(
      `[firebase] Using emulators — project ${EMULATOR_PROJECT_ID}, ` +
        `auth :${AUTH_EMULATOR_PORT}, firestore :${FIRESTORE_EMULATOR_PORT}`
    );
  }
}

export default app;
