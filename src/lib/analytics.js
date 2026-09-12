/**
 * One place to send product events, fanned out to Google Analytics 4 (through
 * Firebase) and Microsoft Clarity.
 *
 * Four rules hold everywhere in this file:
 *
 * 1. Analytics never breaks the page. Every call is wrapped; a failure to
 *    report a booking must never stop someone making one.
 * 2. Nothing loads unless it is configured. With no measurement id and no
 *    Clarity id — dev, preview, a fresh clone — `track` is a no-op and neither
 *    vendor script is fetched, so nobody pays for bytes we cannot use.
 * 3. Emulator runs never report. Local clicking would otherwise show up in the
 *    salon's real funnel.
 * 4. Neither do local hostnames, whatever is configured. See `reportingAllowed`:
 *    a fake measurement id is not a safeguard, because Firebase resolves the
 *    real one from the app id at runtime.
 *
 * The site is a static export, so all of this is client-only.
 */

// Read straight from the environment rather than importing firebase/config:
// that module initialises the Firebase app as a side effect, and this one is
// imported by the root layout, so the import would boot Firebase on every page
// including the ones that never use it.
const USE_EMULATOR = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || null;
export const MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || null;

/** Reporting is off in the emulator and wherever neither vendor is configured. */
export const ANALYTICS_ENABLED = !USE_EMULATOR && Boolean(CLARITY_ID || MEASUREMENT_ID);

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", ""]);

/** 192.168.x.x, 10.x.x.x and 172.16–31.x.x — a LAN address, i.e. testing on a phone. */
const PRIVATE_IP = /^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/;

export function isLocalHostname(host) {
  if (LOCAL_HOSTS.has(host)) return true;
  if (host.endsWith(".local") || host.endsWith(".localhost")) return true;
  return PRIVATE_IP.test(host);
}

/**
 * Whether this particular page load may report.
 *
 * Config alone is not enough: a local build with real ids in `.env.local` would
 * otherwise file dev clicks as real traffic. Note that Firebase resolves the
 * measurement id from the app id at runtime, so a placeholder id in the
 * environment is *not* a safeguard — it still reaches the live property. The
 * hostname is.
 */
function reportingAllowed() {
  if (!ANALYTICS_ENABLED || typeof window === "undefined") return false;
  return !isLocalHostname(window.location.hostname);
}

/**
 * Events fired before `initAnalytics` has finished wiring the vendors up.
 *
 * This is not an edge case: React runs a child's effects before those of a
 * later sibling, so the booking page emits `booking_open` before the `Analytics`
 * component at the end of the layout has booted anything. Dropping it would
 * understate the top of the funnel and flatter every step measured against it.
 */
const pending = [];
/** Stops a runaway page from growing the buffer without bound if init never runs. */
const MAX_PENDING = 50;
let ga = null;
let started = false;
let ready = false;

/** GA4 rejects the whole event if a param is over 100 chars. */
const clamp = (value) =>
  typeof value === "string" && value.length > 100 ? `${value.slice(0, 97)}...` : value;

function cleanParams(params) {
  const out = {};
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null) continue;
    out[key] = clamp(value);
  }
  return out;
}

/** Fans one event out to whichever vendors are actually present. */
function send(name, params) {
  try {
    ga?.log(name, params);
  } catch {
    /* reporting is best-effort */
  }
  try {
    // Clarity's snippet installs a queueing stub synchronously, so this is safe
    // as soon as the stub exists, even before its script has downloaded.
    window.clarity?.("event", name);
  } catch {
    /* reporting is best-effort */
  }
}

/**
 * Records one event. Safe to call from anywhere, at any time, including during
 * render on the server — it simply does nothing there.
 */
export function track(name, params = {}) {
  if (!reportingAllowed()) return;
  const payload = cleanParams(params);

  // Buffered until both vendors have had their chance, so an early event is not
  // half-reported to one of them.
  if (!ready) {
    if (pending.length < MAX_PENDING) pending.push([name, payload]);
    return;
  }
  send(name, payload);
}

/**
 * Tags the session with things we cannot infer later and that decide real
 * questions — above all how many people are on a slow connection, which is what
 * says whether page weight or layout is the thing worth working on.
 */
function sessionContext() {
  const c = navigator.connection || {};
  return {
    connection_type: c.effectiveType || "unknown",
    save_data: String(Boolean(c.saveData)),
    device_memory: String(navigator.deviceMemory ?? "unknown"),
    // Omitted rather than reported as 0 in contexts that have no layout yet.
    ...(window.innerWidth > 0 ? { viewport_width: String(window.innerWidth) } : {}),
  };
}

/**
 * Counts every tap on a WhatsApp link, anywhere on the site.
 *
 * Done as one delegated listener rather than an onClick per link because the
 * links are spread over the header, footer, gallery, shop, journal, contact and
 * booking pages, written through two different helpers and some hardcoded — and
 * because a WhatsApp tap is very likely the real conversion here, not a leak
 * from the form. Anything added later is covered without a code change.
 *
 * Add `data-wa-source="..."` to a link to name it; otherwise the path is used.
 */
function trackWhatsAppClicks() {
  document.addEventListener(
    "click",
    (event) => {
      const link = event.target?.closest?.('a[href*="wa.me"]');
      if (!link) return;
      track("whatsapp_click", {
        source: link.dataset.waSource || window.location.pathname,
        path: window.location.pathname,
      });
    },
    // Capture phase: the click still counts if something downstream stops it.
    true
  );
}

function loadClarity(id) {
  if (window.clarity) return;
  window.clarity = function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.clarity.ms/tag/${id}`;
  document.head.appendChild(s);
}

/**
 * Boots both vendors. Called once, from the client component in the root
 * layout. Idempotent, so fast refresh re-running it is harmless.
 */
export async function initAnalytics() {
  if (started || !reportingAllowed()) return;
  started = true;

  const context = (() => {
    try {
      return sessionContext();
    } catch {
      return {};
    }
  })();

  try {
    trackWhatsAppClicks();
  } catch {
    /* reporting is best-effort */
  }

  if (CLARITY_ID) {
    try {
      loadClarity(CLARITY_ID);
      for (const [key, value] of Object.entries(context)) window.clarity("set", key, value);
    } catch {
      /* reporting is best-effort */
    }
  }

  if (MEASUREMENT_ID) {
    try {
      // Imported lazily: the GA4 SDK is dead weight for anyone who never
      // reaches a page we measure, and this keeps it out of the main bundle.
      const [{ getAnalytics, isSupported, logEvent, setUserProperties }, { default: app }] =
        await Promise.all([import("firebase/analytics"), import("@/lib/firebase/config")]);

      // Returns false in unsupported browsers and in private modes that block
      // the storage GA4 needs. Calling getAnalytics anyway would throw.
      if (await isSupported()) {
        const instance = getAnalytics(app);
        setUserProperties(instance, context);
        ga = { log: (name, params) => logEvent(instance, name, params) };
      }
    } catch {
      /* reporting is best-effort */
    }
  }

  // Open the gate, then replay everything that happened while we were booting.
  ready = true;
  for (const [name, params] of pending.splice(0)) send(name, params);
}
