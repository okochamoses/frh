import Link from "next/link";
import { FaInstagram, FaFacebook, FaWhatsapp, FaTiktok } from "react-icons/fa";
import Button from "@/components/v2/ui/Button";
import { MAPS_URL } from "@/components/v2/location";
import { HOURS_SUMMARY } from "@/components/v2/salon";

const SOCIALS = [
  {
    icon: FaInstagram,
    label: "Instagram",
    href: "https://www.instagram.com/frh_naturals/",
  },
  {
    icon: FaFacebook,
    label: "Facebook",
    href: "https://www.facebook.com/people/FRH-Flourish-Roots-Hair-Co/61570171119138/#",
  },
  { icon: FaWhatsapp, label: "WhatsApp", href: "https://wa.me/2348110215014" },
  { icon: FaTiktok, label: "TikTok", href: "https://www.tiktok.com/@frhnaturals" },
];

const COLUMNS = [
  {
    title: "Visit",
    links: [
      { label: "Book an appointment", href: "/v2/booking" },
      { label: "Salon services", href: "/v2/services" },
      { label: "Hair coaching", href: "/v2/consultation" },
      { label: "The salon", href: "/v2/salon" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/v2/about" },
      { label: "Gallery", href: "/v2/gallery" },
      { label: "Contact", href: "/v2/contact" },
      { label: "Free hair guide", href: "/v2/free-guide" },
    ],
  },
];

const linkClass =
  "text-v2-body text-white/75 transition-colors duration-200 ease-out hover:text-white";

/**
 * The page's full stop.
 *
 * Obsidian, directly under the mustard closing band, so the page ends on the
 * strongest contrast it has. The brand name is set in the hero's own display
 * serif at the foot of the footer, in slat (the salon.s wood) — the page opens and
 * closes on the same word.
 *
 * The wordmark is sized from the viewport to fit the column on one line and is
 * never clipped: it used to sit in a fixed-height box with its lower third cut
 * away, which read as a rendering fault rather than a crop.
 */
export default function Footer() {
  return (
    <footer className="bg-obsidian text-white">
      <div className="mx-auto max-w-[var(--v2-container)] px-4 pt-20 md:px-8 md:pt-24">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            {/* A div, not a <p>: `.v2-root p` sets the paragraph face at a
                specificity `font-display` cannot reach. */}
            <div className="font-display text-[clamp(2rem,1.5rem+2vw,3rem)] font-bold uppercase leading-[0.95] text-white">
              Roots. Ritual.
              <br />
              Radiance.
            </div>
            <p className="mt-5 max-w-[34ch] text-v2-body text-white/60">
              Care for today. Growth for tomorrow. You&apos;re in good hands.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                variant="book"
                withArrow
                href="/v2/booking"
              >
                Book a salon visit
              </Button>
              <ul className="flex gap-2">
                {SOCIALS.map(({ icon: Icon, label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Flourish Roots on ${label}`}
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors duration-200 ease-out hover:border-white hover:bg-white hover:text-ink"
                    >
                      <Icon aria-hidden className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-7">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="type-eyebrow !text-white/55">{col.title}</h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div className="col-span-2 sm:col-span-1">
              <h2 className="type-eyebrow !text-white/55">Find us</h2>
              <ul className="mt-5 flex flex-col gap-3">
                <li>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className={linkClass}
                  >
                    <address className="not-italic">
                      Shop 303, Destiny Plaza
                      <br />
                      Ago Palace Way, Isolo, Lagos
                    </address>
                    <span className="sr-only"> (opens Google Maps)</span>
                  </a>
                </li>
                <li className="text-v2-body text-white/55">{HOURS_SUMMARY}</li>
                <li>
                  <a href="tel:+2348110215014" className={`${linkClass} tabular-nums`}>
                    0811 021 5014
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:flourishnaturalsinfo@gmail.com"
                    className={`${linkClass} break-all`}
                  >
                    flourishnaturalsinfo@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-8 text-v2-body-sm text-white/55 sm:flex-row sm:items-center sm:justify-between md:mt-20">
          <p>
            &copy; {new Date().getFullYear()} Flourish Roots Hair Co. All rights
            reserved.
          </p>
          <p>4C natural hair salon &middot; Isolo, Lagos</p>
        </div>

        {/* Presentational: the brand is already named in the legal line above
            and in the header. `whitespace-nowrap` plus a width-derived size
            keeps it on one line at every viewport without clipping. */}
        <p
          aria-hidden="true"
          className="type-display select-none whitespace-nowrap pb-6 pt-10 text-center text-[clamp(2rem,10.6vw,10.5rem)] uppercase leading-[1] text-slat md:pb-10 md:pt-14"
        >
          Flourish Roots
        </p>
      </div>
    </footer>
  );
}
