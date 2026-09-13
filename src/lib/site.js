/**
 * Where this site lives, for the things that need an absolute URL: Open Graph
 * images, canonicals, the sitemap.
 *
 * It has to be absolute and known at build time — the site is a static export,
 * so nothing can read the request host at runtime. The default matches
 * `SITE_BASE` in `functions/index.js`, which is what booking emails link to;
 * if the salon moves to its own domain, set `NEXT_PUBLIC_SITE_URL` here and
 * `SITE_BASE` there, and keep the two in step.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://flourish-roots.web.app"
).replace(/\/$/, "");

export const SITE_NAME = "Flourish Roots Hair Co.";
