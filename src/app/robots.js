import { SITE_URL } from "@/lib/site";

// `output: 'export'` has no server to generate this per request.
export const dynamic = "force-static";

/*
 * `/booking/manage` is reachable only with a signed token in the query
 * string — there is nothing there to index and the URL itself is a credential.
 * `/admin` and `/design-system` are ours, not the public's.
 *
 * The auth routes, `/settings` and `/bookings` are excluded for a
 * different reason:
 * there is nothing on them to rank for, and an indexed "Log in — Flourish Roots Hair" only ever
 * takes clicks from the pages that should have them. They each carry
 * `robots: noindex` in their own metadata too — this is the belt to that
 * braces, since a crawler that never fetches the page never reads the tag.
 */
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/booking/manage",
        "/design-system",
        "/login",
        "/signup",
        "/reset-password",
        "/settings",
        "/bookings",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
