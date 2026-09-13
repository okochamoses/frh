import { expect } from "@playwright/test";
import { EMULATOR_PROJECT_ID } from "./emulator.js";

/**
 * Helpers for the race between Playwright and React hydration.
 *
 * These are server-rendered Next.js pages: `page.goto` resolves as soon as
 * the initial HTML arrives, but nothing on the page responds to input until
 * React has hydrated and attached its event handlers. A spec that navigates
 * and then immediately clicks or fills something can land that interaction
 * before hydration finishes. The failure mode differs by interaction, which
 * is why both helpers below exist:
 *   - a click on unhydrated DOM runs no handler at all, so whatever the test
 *     expects next never appears and it times out waiting for it;
 *   - a `fill` into a CONTROLLED input is worse — it is accepted, then
 *     silently discarded when hydration re-renders the input from React
 *     state (empty), so a filtered list quietly stays unfiltered instead of
 *     erroring.
 * Which test trips over this moves between runs, because it depends on how
 * much CPU contention there is between navigation and the next line of the
 * test — the signature of a race, not a broken assertion.
 */

/**
 * Navigates to `path` and waits for the client bundle to announce it is
 * talking to the emulators.
 *
 * This is a NECESSARY wait but not a SUFFICIENT one. The console line fires
 * as soon as the Firebase client module runs, which happens while the bundle
 * is still being evaluated — earlier than hydration finishing and attaching
 * handlers. Under a single spec in isolation the gap is usually too small to
 * notice; under a full-suite run (more workers' worth of CPU contention) it
 * widens enough to lose a click or keystroke sent right after this resolves.
 * So treat this as "the app's JS is on the page", not "the page is
 * interactive" — callers whose next step is a click or fill MUST still wrap
 * that first interaction in `retryInteraction` below.
 */
export async function gotoReady(page, path) {
  const hydrated = page.waitForEvent("console", {
    predicate: (m) => m.text().includes(`[firebase] Using emulators — project ${EMULATOR_PROJECT_ID}`),
    timeout: 20_000,
  });
  await page.goto(path);
  await hydrated;
}

/**
 * Retries `attempt` until it succeeds — for the first interaction after a
 * navigation, where the interaction itself (not just the assertion after it)
 * needs to be redone on every retry.
 *
 * A plain retried assertion is not enough here: if the click that was
 * supposed to trigger something landed before hydration, it already did
 * nothing and is not coming back — polling `expect(...).toBeVisible()` on
 * its own would just wait out the timeout on dead DOM. `toPass()` reruns the
 * whole callback, so the click (or fill) itself happens again on each
 * attempt until the app is actually listening and the expected consequence
 * shows up.
 *
 * The callback must be IDEMPOTENT, and that is on the caller. A pre-hydration
 * interaction is a no-op, but a post-hydration one is not, and the retry
 * cannot tell the two apart — it only sees that the expectation has not passed
 * yet, which also happens when the interaction worked and the UI was merely
 * slow. `/services` is the cautionary case: selecting a service relabels its
 * button from "Book" to "Added", so a blind retry does not re-click the same
 * card, it clicks the NEXT one and silently books a second service. Where the
 * action is not naturally repeatable, check for the consequence first and skip
 * the interaction when it is already there — see `selectFirstService` in
 * booking-gate.spec.js. Re-filling a text input is safe; re-clicking something
 * that mutates state usually is not.
 */
export async function retryInteraction(attempt, { timeout = 15_000 } = {}) {
  await expect(attempt).toPass({ timeout });
}
