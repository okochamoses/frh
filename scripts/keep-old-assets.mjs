#!/usr/bin/env node
/**
 * Carries stylesheets (and the fonts/images they point at) from earlier builds
 * into the one about to be deployed.
 *
 * Why: Clarity does not store a page's CSS with a recording. It fetches it from
 * the live site at replay time, by the hashed filename the page used. Every
 * build renames those files, so after a deploy every older recording replays
 * unstyled. Keeping the old files served fixes that; they are small and
 * nothing links to them except those recordings.
 *
 * How: .hosting-archive/ (gitignored) accumulates every build's
 * _next/static/{css,media}. Each run adds the new build to it, then copies the
 * whole archive back into out/. Files never collide: the names are hashes.
 *
 * Run after `next build`, before `firebase deploy --only hosting`.
 * Pass extra directories (e.g. an older out/) to seed the archive from them.
 */
import { cp, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "out", "_next", "static");
const ARCHIVE = path.join(ROOT, ".hosting-archive", "_next", "static");
const KINDS = ["css", "media"];

async function copyDir(from, to) {
  if (!existsSync(from)) return 0;
  await mkdir(to, { recursive: true });
  const names = await readdir(from);
  // force:false: a hashed name is its content, so an existing copy is identical.
  for (const name of names) await cp(path.join(from, name), path.join(to, name), { force: false, recursive: true });
  return names.length;
}

if (!existsSync(OUT)) {
  console.error("keep-old-assets: out/_next/static not found — run `next build` first.");
  process.exit(1);
}

const seeds = process.argv.slice(2).map((dir) => path.resolve(dir, "_next", "static"));
for (const kind of KINDS) {
  for (const seed of seeds) await copyDir(path.join(seed, kind), path.join(ARCHIVE, kind));
  await copyDir(path.join(OUT, kind), path.join(ARCHIVE, kind));
  const n = await copyDir(path.join(ARCHIVE, kind), path.join(OUT, kind));
  console.log(`keep-old-assets: ${kind}: ${n} file(s) now in out/`);
}
