import "./v2.css";
import Header from "@/components/v2/Header";
import Footer from "@/components/v2/Footer";
import { fontVariables } from "./fonts";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import salonSchema from "./salonSchema";

/*
 * No `title.template` here on purpose: every page in this tree already writes
 * its own full title with the brand in it ("Our story — Flourish Roots Hair,
 * Isolo Lagos"), so a template would say the name twice. A plain string is the
 * fallback for anything that does not set one.
 *
 * `openGraph` deliberately carries no title or description either — those are
 * per-page, and Next fills them from each page's own metadata. What belongs
 * here is what never changes: the site name, the locale, and the share image.
 */
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Flourish Roots Hair",
  description: "Hair that flourishes from root to tip.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NG",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "A client with fresh braids, relaxed by a window at Flourish Roots Hair Co.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"],
  },
};

export default function V2Layout({ children }) {
  return (
    <div
      className={`${fontVariables} v2-root flex min-h-screen flex-col bg-sand font-body text-ink`}
    >
      {/* First tabbable on every page. The header carries the contact band, the
          logo, five nav groups and their dropdowns — 47 stops before the content
          begins — so without this a keyboard user re-tabs the whole chrome on
          every navigation. `tabIndex={-1}` on the target matters: without it the
          browser scrolls but leaves focus behind, and the next Tab returns to
          the header. */}
      <a href="#v2-main" className="v2-skip-link">
        Skip to content
      </a>
      <script
        type="application/ld+json"
        // Static, built from our own constants — no user input reaches it.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(salonSchema) }}
      />
      <Header />
      <div id="v2-main" tabIndex={-1} className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
