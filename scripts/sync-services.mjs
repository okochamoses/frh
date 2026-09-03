#!/usr/bin/env node
/**
 * Copies the service catalogue into the Cloud Functions bundle.
 *
 * The client app owns `src/app/salon/services.json`, but a functions deploy
 * only uploads the `functions/` directory — so the server needs its own copy to
 * price and validate bookings without trusting the browser.
 *
 * Runs automatically from `firebase.json`'s functions predeploy hook; run it by
 * hand with `npm run sync:services` after editing the catalogue.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "src/app/salon/services.json");
const target = resolve(root, "functions/lib/services.json");

const raw = readFileSync(source, "utf8");

// Parse before writing so a malformed catalogue fails here rather than at
// runtime inside a function, where it would take every booking down with it.
const services = JSON.parse(raw);
if (!Array.isArray(services) || services.length === 0) {
  throw new Error(`${source} is not a non-empty array of services.`);
}

const bookable = services.filter((s) => !s.header && s.title);
const titles = new Set(bookable.map((s) => s.title));
if (titles.size !== bookable.length) {
  // `title` is the catalogue key — SKU and Service ID are unreliable — so a
  // duplicate would silently make one of the two services unbookable.
  throw new Error("Duplicate service titles in the catalogue; titles must be unique.");
}

const invalid = bookable.filter(
  (s) => !Number.isFinite(s.price) || !Number.isFinite(s.duration) || s.duration <= 0
);
if (invalid.length > 0) {
  throw new Error(
    `Services with a missing or invalid price/duration: ${invalid.map((s) => s.title).join(", ")}`
  );
}

writeFileSync(target, `${JSON.stringify(services, null, 2)}\n`);
console.log(`Synced ${bookable.length} services → functions/lib/services.json`);
