/**
 * Pre-renders the responsive widths that `next/image` asks for.
 *
 * Why this exists: `next.config.mjs` sets `output: 'export'`, so there is no
 * image optimisation server. We used to set `images.unoptimized`, which means
 * `next/image` emits a bare `src` and every phone downloads the desktop
 * original — Lighthouse measured 475 KiB of that on the V2 homepage alone, and
 * the hero strip (the LCP element) was the worst of it: 1827px wide, painted
 * into a 453px box.
 *
 * So the widths are baked ahead of time instead. This script writes
 * `public/_img/<path>-<width>.webp` for every image the site actually renders,
 * plus a manifest; `src/lib/imageLoader.js` reads the manifest and hands
 * `next/image` a real `srcSet`. Anything missing from the manifest falls
 * through to the original file, so a new image is never broken by not having
 * been processed yet — it just isn't responsive until this runs.
 *
 *   npm run images:variants
 *
 * Re-runnable: an output that is already newer than its source is skipped.
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const PUBLIC = "public";
const OUT_DIR = path.join(PUBLIC, "_img");
const MANIFEST = "src/lib/imageVariants.json";

/*
 * Must match `images.deviceSizes` / `images.imageSizes` in next.config.mjs —
 * those are the only widths `next/image` will ever request, so generating any
 * others is wasted work and missing one silently falls back to the original.
 */
const LADDER = [128, 256, 384, 640, 750, 828, 1080, 1920];

/** Quality per kind of image. The gallery is the portfolio, so it keeps more. */
const quality = (src) => (src.includes("/gallery/") ? 82 : 78);

const RASTER = /\.(webp|png|jpe?g)$/i;

/**
 * Which images to process: every path literal in the source tree — components
 * and the JSON the data-driven sections read — that resolves to a real file in
 * `public/`. Scanning the source rather than the whole of `public/` keeps this
 * to the images the site renders, instead of every asset anyone ever dropped
 * in there.
 */
function referencedImages() {
  const found = new Set();

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(jsx?|tsx?|mjs|json)$/.test(entry.name)) continue;
      const text = fs.readFileSync(full, "utf8");
      for (const [, ref] of text.matchAll(/["'`](\/[\w\-./]+\.(?:webp|png|jpe?g))["'`]/gi)) {
        found.add(ref);
      }
    }
  };

  walk("src");

  return [...found]
    .filter((ref) => fs.existsSync(path.join(PUBLIC, ref)))
    .sort();
}

const kb = (n) => (n / 1024).toFixed(0);

const manifest = {};
let written = 0;
let skipped = 0;
let bytes = 0;

for (const ref of referencedImages()) {
  const source = path.join(PUBLIC, ref);
  const { width: naturalWidth } = await sharp(source).metadata();
  if (!naturalWidth) continue;

  // Only widths the original can actually satisfy. A variant at or above the
  // natural width would be an upscale, and the loader serves the original
  // there instead.
  const widths = LADDER.filter((w) => w < naturalWidth);
  if (widths.length === 0) continue;

  manifest[ref] = widths;

  const stem = ref.replace(RASTER, "");
  const sourceMtime = fs.statSync(source).mtimeMs;

  for (const width of widths) {
    const out = path.join(OUT_DIR, `${stem}-${width}.webp`);
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= sourceMtime) {
      skipped += 1;
      bytes += fs.statSync(out).size;
      continue;
    }

    fs.mkdirSync(path.dirname(out), { recursive: true });
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: quality(ref) })
      .toFile(out);

    written += 1;
    bytes += fs.statSync(out).size;
    console.log(`  ${out}  ${kb(fs.statSync(out).size)} KB`);
  }
}

fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `\n${Object.keys(manifest).length} images → ${written} written, ${skipped} up to date ` +
    `(${kb(bytes)} KB of variants)\nManifest: ${MANIFEST}`
);
