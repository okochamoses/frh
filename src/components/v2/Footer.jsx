import Link from "next/link";
import { FaInstagram, FaFacebook, FaWhatsapp, FaTiktok } from "react-icons/fa";

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
    ],
  },
  {
    title: "Resources",
    links: [{ label: "Free hair guide", href: "/v2/free-guide" }],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gold text-ink">
      <div className="mx-auto max-w-[var(--v2-container)] px-4 pt-16 md:px-8 md:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <p className="font-display text-v2-h2">Flourish Roots.</p>
            <p className="mt-3 text-v2-body text-ink/70">
              Roots. Ritual. Radiance.
            </p>
            <p className="mt-4 max-w-[34ch] text-v2-body-sm text-ink/60">
              Care for today. Growth for tomorrow. You&apos;re in good hands.
            </p>

            <ul className="mt-8 flex gap-3">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-colors duration-200 ease-out hover:border-ink hover:text-ink"
                  >
                    <Icon aria-hidden className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-v2-label font-semibold uppercase tracking-[0.14em] text-ink/50">
                {col.title}
              </h2>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-v2-body text-ink/80 transition-colors duration-200 ease-out hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ink/10 pt-8 text-v2-body-sm text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Flourish Roots Hair Co. All rights
            reserved.
          </p>
          <a
            href="mailto:flourishnaturalsinfo@gmail.com"
            className="transition-colors duration-200 ease-out hover:text-ink"
          >
            flourishnaturalsinfo@gmail.com
          </a>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mt-10 h-[10vw] max-h-40 overflow-hidden select-none"
      >
        <p className="translate-y-[18%] text-center font-display text-[16vw] font-bold leading-none tracking-tight text-ink/90 md:text-[13vw]">
          Flourish Roots
        </p>
      </div>
    </footer>
  );
}
