import { Fragment } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Button from "@/components/v2/ui/Button";
import Reveal from "@/components/v2/ui/Reveal";
import SalonMap from "@/components/v2/ui/SalonMap";
import PageHero from "@/components/v2/sections/PageHero";
import SectionHeader from "@/components/v2/sections/SectionHeader";
import ClosingCta from "@/components/v2/sections/ClosingCta";
import { MAPS_URL } from "@/components/v2/location";
import {
  ADDRESS_LINES,
  ADDRESS_ONE_LINE,
  EMAIL,
  HOURS_SUMMARY,
  OPENING_HOURS,
  PHONE_DISPLAY,
  PHONE_TEL,
  whatsapp,
} from "@/components/v2/salon";

export const metadata = {
  title: "Contact — Flourish Roots Hair, Isolo Lagos",
  description:
    "Call, WhatsApp or email Flourish Roots Hair Co. at Shop 303, Destiny Plaza, Ago Palace Way, Isolo. Open Tuesday to Sunday, closed Mondays.",
};

/**
 * Three ways to reach a person, ranked by how fast each one actually answers,
 * and said out loud rather than left for the reader to guess.
 *
 * There is no contact form here on purpose. The salon answers on WhatsApp in
 * minutes and on email in a day; a form that lands in the same inbox as the
 * email, minus the client's own thread, would be the slowest route on the page
 * dressed up as the primary one.
 */
const CHANNELS = [
  {
    icon: FaWhatsapp,
    label: "WhatsApp",
    value: PHONE_DISPLAY,
    note: "Fastest. Booking questions, photographs of your hair, running late.",
    href: whatsapp("Hi Flourish Roots — I have a question about booking."),
    external: true,
    primary: true,
  },
  {
    icon: Phone,
    label: "Call the salon",
    value: PHONE_DISPLAY,
    note: "Open hours only. If we are on a head we will call you back.",
    href: `tel:${PHONE_TEL}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: EMAIL,
    note: "Press, collaborations, training enquiries and anything with an attachment.",
    href: `mailto:${EMAIL}`,
  },
];

export default function ContactPage() {
  return (
    <main className="mx-auto flex max-w-[var(--v2-container)] flex-col gap-20 px-4 md:gap-28 md:px-8">
      <PageHero
        eyebrow={ADDRESS_ONE_LINE}
        title="Talk to a person"
        lede="Booking is quickest online, but you never have to. Message us, call us, or come and find us — Shop 303 is on the third floor of Destiny Plaza."
        actions={
          <>
            <Button variant="book" withArrow href="/v2/booking">
              Book a salon visit
            </Button>
            <Button
              variant="secondary"
              href={whatsapp("Hi Flourish Roots — I have a question.")}
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp
            </Button>
          </>
        }
        meta={[HOURS_SUMMARY, "We reply within a day", "Closed Mondays"]}
      />

      <section aria-labelledby="channels-heading">
        <SectionHeader
          id="channels-heading"
          eyebrow="How to reach us"
          title="Three ways, in order of speed"
          lede="Sundays we open at 1pm. Mondays the salon is closed and so are the phones — a message sent then is answered Tuesday morning."
        />

        <ul className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
          {CHANNELS.map(({ icon: Icon, label, value, note, href, external, primary }, i) => (
            <li key={label}>
              <Reveal delay={i * 80} className="h-full">
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className={`group flex h-full flex-col rounded-v2-3xl p-7 transition-colors duration-300 ease-out md:p-8 ${
                    primary
                      ? "bg-ink text-white hover:bg-ink/90"
                      : "bg-cream-100 text-ink hover:bg-latte"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${
                      primary ? "bg-mustard text-ink" : "bg-sand text-ink"
                    }`}
                  >
                    <Icon className="h-[1.125rem] w-[1.125rem]" />
                  </span>

                  <p className={`mt-7 type-eyebrow ${primary ? "!text-white/55" : ""}`}>
                    {label}
                  </p>
                  <p className="mt-3 break-all font-display text-v2-h3 uppercase leading-[1.15]">
                    {value}
                  </p>
                  <p
                    className={`mt-auto pt-6 text-v2-body-sm leading-[1.55] ${
                      primary ? "text-white/65" : "text-ink-soft"
                    }`}
                  >
                    {note}
                  </p>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="find-us-heading">
        <SectionHeader
          id="find-us-heading"
          eyebrow="Where to find us"
          title="Shop 303, Destiny Plaza"
          lede="On Ago Palace Way in Isolo. Walk-ins are welcome when there is space, but clients who booked come first and the longer styles almost always need booking ahead."
        />

        <div className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="flex h-full flex-col rounded-v2-4xl bg-cream-100 p-8 md:p-10">
              <p className="type-eyebrow">The address</p>
              <address className="mt-3 not-italic font-display text-v2-h3 uppercase leading-[1.25] text-ink">
                {ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>

              <p className="mt-10 type-eyebrow">Opening hours</p>
              <dl className="mt-3 grid grid-cols-[1fr_auto] gap-y-2.5">
                {OPENING_HOURS.map(({ day, hours, closed }) => (
                  <Fragment key={day}>
                    <dt className={`text-v2-body ${closed ? "text-ash" : "text-ink"}`}>
                      {day}
                    </dt>
                    <dd
                      className={`text-right text-v2-body tabular-nums ${
                        closed ? "text-ash" : "text-ink-soft"
                      }`}
                    >
                      {hours}
                    </dd>
                  </Fragment>
                ))}
              </dl>

              <div className="mt-auto flex flex-wrap gap-3 border-t border-ink/10 pt-8">
                <Button variant="book" withArrow href="/v2/booking">
                  Book a visit
                </Button>
                <Button
                  variant="secondary"
                  href={MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get directions
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-7">
            <SalonMap className="h-[22rem] md:h-[28rem] lg:h-full lg:min-h-[32rem]" />
          </Reveal>
        </div>
      </section>

      <ClosingCta />
    </main>
  );
}
