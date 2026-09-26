import { SITE_URL } from "@/lib/site";

// `output: 'export'` has no server to generate this per request.
export const dynamic = "force-static";

/*
 * `/v2/booking/manage` is reachable only with a signed token in the query
 * string — there is nothing there to index and the URL itself is a credential.
 * `/admin` and `/v2/design-system` are ours, not the public's.
 *
 * The auth routes, `/v2/settings` and `/v2/bookings` are excluded for a
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
        "/v2/booking/manage",
        "/v2/design-system",
        "/v2/login",
        "/v2/signup",
        "/v2/reset-password",
        "/v2/settings",
        "/v2/bookings",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
