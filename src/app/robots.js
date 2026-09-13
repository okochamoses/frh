import { SITE_URL } from "@/lib/site";

// `output: 'export'` has no server to generate this per request.
export const dynamic = "force-static";

/*
 * `/v2/booking/manage` is reachable only with a signed token in the query
 * string — there is nothing there to index and the URL itself is a credential.
 * `/admin` and `/v2/design-system` are ours, not the public's.
 */
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/v2/booking/manage", "/v2/design-system"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
