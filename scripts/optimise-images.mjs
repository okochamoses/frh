/**
 * Re-encodes the heavy images in `public/` to WebP at sensible dimensions.
 *
 * Why this exists: `next.config.mjs` sets `output: 'export'` with
 * `images.unoptimized`, so `next/image` does no work at all — whatever is in
 * `public/` is exactly what a visitor downloads. On Nigerian mobile data a
 * multi-megabyte PNG is not a slow page, it is a real cost to the person
 * looking at it, so the compression has to happen here, ahead of time.
 *
 * Originals are copied to `assets-src/` (gitignored) before anything is
 * written, and the job list reads from there on later runs, so this is safe to
 * run more than once.
 *
 *   npm run optimise:images
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const MASTERS = "assets-src";

/** [source, output, maxWidth | null, quality] */
const JOBS = [
  // The gallery is the portfolio, so it keeps a touch more quality: hair
  // texture and parting detail are the thing being sold.
  ["public/gallery/img_1.png", "public/gallery/img_1.webp", null, 82],
  ["public/gallery/img_2.png", "public/gallery/img_2.webp", null, 82],
  ["public/gallery/img_3.png", "public/gallery/img_3.webp", null, 82],
  ["public/gallery/salon.png", "public/gallery/salon.webp", null, 82],
  ["public/gallery/img.png", "public/gallery/img.webp", 1600, 82],
  // Note the distinct output name: `ceo.webp` is a different, smaller crop
  // already used by HeroSection, and must not be clobbered.
  ["public/ceo.png", "public/ceo-portrait.webp", 900, 80],
  // Already WebP, but encoded so loosely they were heavier than the PNGs they
  // replaced. intro-image is the v2 hero and carries `priority`, so it is the
  // homepage LCP — worth the most of any single file here.
  ["public/intro-image.webp", "public/intro-image.webp", null, 80],
  ["public/newsletter-large.webp", "public/newsletter-large.webp", null, 80],
];

/*
 * Which outputs this script produced. Without it there is no way to tell one of
 * our own files from a hand-made one that happens to share a name, and the
 * second run either refuses to do anything or silently destroys someone's work.
 */
const MANIFEST = path.join(MASTERS, "generated.json");
const generated = new Set(
  fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : []
);

const kb = (n) => (n / 1024).toFixed(0);
let before = 0;
let after = 0;
let skipped = 0;

fs.mkdirSync(MASTERS, { recursive: true });

for (const [src, out, maxW, quality] of JOBS) {
  const master = path.join(MASTERS, path.basename(src));

  // Prefer the original in public/; fall back to the master so a second run
  // still works once the source has been replaced.
  const input = fs.existsSync(src) ? src : fs.existsSync(master) ? master : null;
  if (!input) {
    console.log(`skip   ${src} — no source and no master`);
    skipped += 1;
    continue;
  }

  if (input === src && !fs.existsSync(master)) fs.copyFileSync(src, master);

  /*
   * Refuse to write over a file we did not create. Overwriting `ceo.webp` — a
   * different, smaller crop another page was already using — is exactly the
   * mistake this guard exists to stop. Our own outputs are fair game, so
   * re-running the script stays safe.
   */
  if (fs.existsSync(out) && out !== src && !generated.has(out)) {
    console.log(`SKIP   ${out} exists and was not produced by this script — choose another output name`);
    skipped += 1;
    continue;
  }

  const srcSize = fs.statSync(input).size;
  const meta = await sharp(master).metadata();

  let pipe = sharp(master);
  if (maxW && meta.width > maxW) pipe = pipe.resize({ width: maxW, withoutEnlargement: true });
  const buf = await pipe.webp({ quality, effort: 6 }).toBuffer();

  fs.writeFileSync(out, buf);
  generated.add(out);
  if (out !== src && fs.existsSync(src)) fs.unlinkSync(src);

  const outMeta = await sharp(buf).metadata();
  before += srcSize;
  after += buf.length;

  console.log(
    `${path.basename(src).padEnd(24)} ${meta.width}x${meta.height}`.padEnd(42) +
      `→ ${outMeta.width}x${outMeta.height}`.padEnd(16) +
      `${kb(srcSize).padStart(6)}KB → ${kb(buf.length).padStart(5)}KB` +
      `  (-${(100 - (buf.length / srcSize) * 100).toFixed(1)}%)`
  );
}

if (before > 0) {
  console.log(
    `\nTOTAL  ${kb(before)}KB → ${kb(after)}KB   ` +
      `saved ${kb(before - after)}KB (-${(100 - (after / before) * 100).toFixed(1)}%)`
  );
}
fs.writeFileSync(MANIFEST, `${JSON.stringify([...generated].sort(), null, 2)}\n`);

if (skipped) console.log(`${skipped} job(s) skipped.`);

/*
 * Responsive variants for the gallery.
 *
 * The masonry renders these at 50vw on phones and 33vw on wide screens — about
 * 190px and 420px CSS — but ships a single ~1086px file, so a phone downloads
 * roughly eight times the pixels it can show. `next/image` cannot help: the
 * export sets `images.unoptimized`, so it emits no srcset of its own and the
 * `sizes` attribute is inert. So the widths are produced here and the page
 * writes its own srcset.
 */
const RESPONSIVE_DIR = "public/gallery";
const RESPONSIVE_WIDTHS = [400, 800];
/** Matches the base images only, never the -400/-800 ones this produces. */
const isBase = (f) => f.endsWith(".webp") && !/-\d+\.webp$/.test(f);

let variantBefore = 0;
let variantAfter = 0;

for (const file of fs.readdirSync(RESPONSIVE_DIR).filter(isBase).sort()) {
  const src = path.join(RESPONSIVE_DIR, file);
  const meta = await sharp(src).metadata();
  const base = file.replace(/\.webp$/, "");
  const made = [];

  for (const w of RESPONSIVE_WIDTHS) {
    if (meta.width <= w) continue;
    const out = path.join(RESPONSIVE_DIR, `${base}-${w}.webp`);
    const buf = await sharp(src).resize({ width: w }).webp({ quality: 82, effort: 6 }).toBuffer();
    fs.writeFileSync(out, buf);
    made.push(`${w}w:${kb(buf.length)}KB`);
    variantAfter += buf.length;
  }

  if (made.length) {
    variantBefore += fs.statSync(src).size;
    console.log(`${file.padEnd(22)} ${String(meta.width).padStart(5)}px → ${made.join("  ")}`);
  }
}

if (variantBefore) {
  console.log(
    `\nRESPONSIVE  a phone now fetches the 400w set instead of the full size: ` +
      `${kb(variantBefore)}KB → ${kb(variantAfter / RESPONSIVE_WIDTHS.length)}KB per breakpoint (approx)`
  );
}
