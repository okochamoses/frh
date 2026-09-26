import { SITE_URL } from "@/lib/site";
import { ARTICLES } from "@/content/journal";

// `output: 'export'` has no server to generate this per request.
export const dynamic = "force-static";

/*
 * The public pages of the site.
 *
 * Deliberately absent: `/booking/manage`, which is only reachable with a
 * signed token, `/design-system`, which is for us, `/admin`, and the auth
 * routes (`/login`, `/signup`, `/reset-password`) and the two account
 * pages (`/settings`, `/bookings`), which are deep-link targets rather than pages anyone should arrive at from a
 * search. All are disallowed in robots.js as well.
 */
const PAGES = [
  { path: "/", priority: 1.0, changeFrequency: "monthly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/booking", priority: 0.9, changeFrequency: "monthly" },
  { path: "/salon", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "yearly" },
  { path: "/consultation", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/gallery", priority: 0.6, changeFrequency: "monthly" },
  { path: "/journal", priority: 0.6, changeFrequency: "weekly" },
  { path: "/free-guide", priority: 0.5, changeFrequency: "yearly" },
  { path: "/shop", priority: 0.4, changeFrequency: "monthly" },
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
    url: `${SITE_URL}/journal/${article.slug}`,
    lastModified: new Date(article.published),
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...pages, ...posts];
}
