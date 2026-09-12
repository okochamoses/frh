import variants from "./imageVariants.json";

/**
 * The `next/image` loader for this site.
 *
 * `output: 'export'` means there is no image optimisation server, so the
 * widths are pre-rendered into `public/_img` by `npm run images:variants` and
 * this maps a requested width onto one of them. That is what turns the `sizes`
 * props already on every `<Image>` into a real `srcSet` — before this, a phone
 * downloaded the full-width desktop original of every picture on the page.
 *
 * Anything without variants — an SVG, a remote URL, an image added since the
 * script last ran — is returned untouched, so the worst case is the behaviour
 * we had before rather than a broken image.
 */
export default function imageLoader({ src, width }) {
  const widths = variants[src];

  // The variants are the widths `next/image` can ask for, so this normally
  // hits exactly. Above the largest one the original is already the right
  // answer: variants stop below the image's natural width.
  const match = widths?.find((candidate) => candidate >= width);
  if (!match) return withWidth(src, width);

  return `/_img${src.replace(/\.[^.]+$/, "")}-${match}.webp`;
}

/**
 * A loader must vary its URL by width or Next warns that the `srcSet` it is
 * about to emit is a list of identical entries. For the fall-through cases
 * that is exactly what we mean — there is one file and every width gets it —
 * so the width rides along as a query string: the browser sees distinct
 * candidates, static hosting ignores the query and serves the same file.
 */
function withWidth(src, width) {
  if (!src.startsWith("/")) return src; // remote URL — not ours to rewrite
  return `${src}?w=${width}`;
}
