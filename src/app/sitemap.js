import { SITE_URL } from "@/lib/site";
import { ARTICLES } from "@/content/journal";

// `output: 'export'` has no server to generate this per request.
export const dynamic = "force-static";

/*
 * The v2 tree only.
 *
 * v1 is still what answers at the root in production, so its routes belong
 * here too the day it is the site being indexed — but v1 is on its way out and
 * listing both would ask search engines to index two copies of the same salon.
 * When v2 takes over the root, change the paths here and drop the `/v2` prefix.
 *
 * Deliberately absent: `/v2/booking/manage`, which is only reachable with a
 * signed token, `/v2/design-system`, which is for us, and `/admin`. Those are
 * disallowed in robots.js as well.
 */
const PAGES = [
  { path: "/v2", priority: 1.0, changeFrequency: "monthly" },
  { path: "/v2/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/v2/booking", priority: 0.9, changeFrequency: "monthly" },
  { path: "/v2/salon", priority: 0.8, changeFrequency: "monthly" },
  { path: "/v2/about", priority: 0.7, changeFrequency: "yearly" },
  { path: "/v2/consultation", priority: 0.7, changeFrequency: "monthly" },
  { path: "/v2/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/v2/gallery", priority: 0.6, changeFrequency: "monthly" },
  { path: "/v2/journal", priority: 0.6, changeFrequency: "weekly" },
  { path: "/v2/free-guide", priority: 0.5, changeFrequency: "yearly" },
  { path: "/v2/shop", priority: 0.4, changeFrequency: "monthly" },
];

export default function sitemap() {
  const lastModified = new Date();

  const pages = PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  // An article's own publish date, not the build date — a sitemap that claims
  // everything changed the moment it was built teaches crawlers to ignore it.
  const posts = ARTICLES.map((article) => ({
    url: `${SITE_URL}/v2/journal/${article.slug}`,
    lastModified: new Date(article.published),
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...pages, ...posts];
}
